# Better Auth Implementation Guide

## Overview
Complete authentication system implemented using Better Auth with tRPC backend and TanStack Router frontend.

## Architecture

### Backend (tRPC)
- **Auth Router**: `/apps/web/worker/trpc/routers/auth.ts`
- **Context**: `/apps/web/worker/trpc/context.ts` - Validates sessions and provides userId
- **Auth Instance**: `/packages/data/src/auth.ts` - Exports Better Auth instance

### Frontend (React + TanStack Router)
- **Sign In**: `/apps/web/src/routes/sign-in.tsx`
- **Sign Up**: `/apps/web/src/routes/sign-up.tsx`
- **Protected Routes**: `/apps/web/src/routes/app/_authed.tsx`
- **Logout Hook**: `/apps/web/src/hooks/useLogout.ts`

## Implementation Details

### 1. Auth Router (Backend)

The auth router provides 4 main endpoints:

#### `auth.signUp`
- **Input**: `{ email, password, name }`
- **Output**: `{ success, user }`
- **Function**: Creates new user account with email/password

#### `auth.signIn`
- **Input**: `{ email, password }`
- **Output**: `{ success, user, token }`
- **Function**: Authenticates user and returns session token

#### `auth.signOut`
- **Input**: None (uses Authorization header)
- **Output**: `{ success }`
- **Function**: Invalidates current session

#### `auth.getSession`
- **Input**: None (uses Authorization header)
- **Output**: `{ user, session }`
- **Function**: Validates token and returns current user/session

### 2. Authentication Flow

```
┌─────────────┐
│   Sign Up   │
└──────┬──────┘
       │
       ▼
┌─────────────┐       ┌──────────────┐
│   Sign In   │──────>│ Store Token  │
└─────────────┘       │  localStorage │
       │              └──────────────┘
       │
       ▼
┌─────────────┐       ┌──────────────┐
│  Protected  │<──────│ Check Token  │
│   Routes    │       │  beforeLoad  │
└─────────────┘       └──────────────┘
       │
       │
       ▼
┌─────────────┐       ┌──────────────┐
│   Logout    │──────>│ Clear Token  │
└─────────────┘       │  & Redirect  │
                      └──────────────┘
```

### 3. Token Management

**Storage**: `localStorage.setItem("auth_token", token)`

**Usage**: Automatically included in all tRPC requests via headers:
```typescript
headers: () => {
  const token = localStorage.getItem("auth_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}
```

**Validation**: 
- On protected route access (beforeLoad)
- On each tRPC request (context)

### 4. Protected Routes

All routes under `/app/_authed/` are protected:

```typescript
beforeLoad: async () => {
  const token = localStorage.getItem("auth_token");
  if (!token) throw redirect({ to: "/sign-in" });
  
  const session = await trpc.auth.getSession.query();
  if (!session.user) {
    localStorage.removeItem("auth_token");
    throw redirect({ to: "/sign-in" });
  }
}
```

### 5. Context-Based Authorization

All protected endpoints check `userId` from context:

```typescript
const { db, userId } = ctx;

if (!userId) {
  throw new TRPCError({
    code: "UNAUTHORIZED",
    message: "You must be logged in",
  });
}
```

## API Endpoints

### Auth Endpoints

| Endpoint | Method | Auth Required | Description |
|----------|--------|---------------|-------------|
| `auth.signUp` | Mutation | ❌ | Create new account |
| `auth.signIn` | Mutation | ❌ | Login to account |
| `auth.signOut` | Mutation | ✅ | Logout from account |
| `auth.getSession` | Query | ✅ | Get current session |

### Protected Endpoints

| Endpoint | Method | Auth Required | Description |
|----------|--------|---------------|-------------|
| `files.upload` | Mutation | ✅ | Upload CSV file |
| `files.getRecent` | Query | ✅ | Get recent files |
| `files.getAll` | Query | ✅ | Get all files |
| `files.getById` | Query | ✅ | Get file by ID |
| `queries.getByQueryId` | Query | ✅ | Get query results |

## Usage Examples

### Sign Up
```tsx
const signUpMutation = trpcReact.auth.signUp.useMutation({
  onSuccess: () => navigate({ to: "/sign-in" }),
  onError: (error) => setError(error.message),
});

signUpMutation.mutate({
  name: "John Doe",
  email: "john@example.com",
  password: "password123",
});
```

### Sign In
```tsx
const signInMutation = trpcReact.auth.signIn.useMutation({
  onSuccess: (data) => {
    localStorage.setItem("auth_token", data.token);
    navigate({ to: "/app" });
  },
  onError: (error) => setError(error.message),
});

signInMutation.mutate({
  email: "john@example.com",
  password: "password123",
});
```

### Sign Out
```tsx
const handleLogout = useLogout();
// Automatically clears token and redirects
handleLogout();
```

### Using Protected Endpoints
```tsx
// Token is automatically included in headers
const { data, isLoading } = trpcReact.files.getAll.useQuery();
```

## Security Features

1. **Password Hashing**: Better Auth handles bcrypt hashing automatically
2. **Session Tokens**: Cryptographically secure tokens
3. **Token Validation**: Every request validates token against database
4. **HTTPS Required**: In production, always use HTTPS
5. **Authorization Checks**: Every protected endpoint validates userId

## Database Schema

### Users Table
```sql
users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  email_verified BOOLEAN DEFAULT FALSE,
  image TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
)
```

### Sessions Table
```sql
sessions (
  id TEXT PRIMARY KEY,
  expires_at INTEGER NOT NULL,
  token TEXT UNIQUE NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  user_id TEXT NOT NULL REFERENCES users(id),
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
)
```

### Accounts Table
```sql
accounts (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL,
  provider_id TEXT NOT NULL,
  user_id TEXT NOT NULL REFERENCES users(id),
  password TEXT,  -- Hashed password for email/password auth
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
)
```

## Error Handling

### Client Errors
- Display user-friendly error messages
- Clear invalid tokens automatically
- Redirect to sign-in on auth failures

### Server Errors
- `UNAUTHORIZED (401)`: No valid token provided
- `BAD_REQUEST (400)`: Invalid input data
- `NOT_FOUND (404)`: Resource doesn't exist
- `INTERNAL_SERVER_ERROR (500)`: Server error

## Configuration

### Better Auth Config (`/packages/data/auth-gen/auth.ts`)
```typescript
export const auth = betterAuth({
  database: drizzleAdapter(getDb(), { 
    provider: "sqlite", 
    usePlural: true 
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
});
```

## Testing

### Manual Testing Steps

1. **Sign Up**:
   - Navigate to `/sign-up`
   - Enter name, email, password
   - Submit form
   - Should redirect to `/sign-in`

2. **Sign In**:
   - Navigate to `/sign-in`
   - Enter email, password
   - Submit form
   - Should redirect to `/app`
   - Token should be in localStorage

3. **Protected Routes**:
   - Without token: Should redirect to `/sign-in`
   - With valid token: Should access pages
   - With invalid token: Should clear token and redirect

4. **Sign Out**:
   - Click logout button
   - Should clear token
   - Should redirect to `/sign-in`
   - Should not access protected routes

## Troubleshooting

### "Cannot find module '@repo/data/auth'"
- Run `pnpm run build` in `/packages/data`

### "Unauthorized" errors
- Check token exists in localStorage
- Verify token format: `Bearer <token>`
- Check session hasn't expired

### Protected routes not working
- Ensure `beforeLoad` is implemented in `_authed.tsx`
- Check tRPC client has headers configured
- Verify context extracts userId correctly

## Future Enhancements

1. **Email Verification**: Enable `requireEmailVerification: true`
2. **OAuth Providers**: Add Google, GitHub auth
3. **Password Reset**: Implement forgot password flow
4. **Remember Me**: Long-lived sessions option
5. **Session Management**: View/revoke active sessions
6. **Rate Limiting**: Prevent brute force attacks
7. **2FA**: Two-factor authentication support

## Migration Notes

### Before (Mock Auth)
```typescript
userInfo: {
  userId: "1234567890"  // Hardcoded
}
```

### After (Real Auth)
```typescript
userId: session?.user?.id || null  // From Better Auth
```

All endpoints now require valid authentication!
