# Auth Quick Reference

## Client-Side

### Sign Up
```tsx
import { trpcReact } from "@/utils/trpc-types";

const mutation = trpcReact.auth.signUp.useMutation();
mutation.mutate({ name, email, password });
```

### Sign In
```tsx
const mutation = trpcReact.auth.signIn.useMutation({
  onSuccess: (data) => {
    localStorage.setItem("auth_token", data.token);
    navigate({ to: "/app" });
  },
});
mutation.mutate({ email, password });
```

### Sign Out
```tsx
import { useLogout } from "@/hooks";

const handleLogout = useLogout();
// Call when needed
handleLogout();
```

### Check Session
```tsx
const { data } = trpcReact.auth.getSession.useQuery();
// data.user - current user or null
// data.session - current session or null
```

## Server-Side

### Protect Endpoints
```typescript
.query(async ({ ctx }) => {
  const { db, userId } = ctx;
  
  if (!userId) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in",
    });
  }
  
  // Your logic here
});
```

### Use Auth Instance
```typescript
import { getAuth } from "@repo/data/auth";

const auth = getAuth();
await auth.api.signInEmail({ body: { email, password }, headers });
```

## Token Management

### Store Token
```typescript
localStorage.setItem("auth_token", token);
```

### Get Token
```typescript
const token = localStorage.getItem("auth_token");
```

### Clear Token
```typescript
localStorage.removeItem("auth_token");
```

### Auto-Include in Requests
Already configured in `main.tsx` and `trpc-types.ts`:
```typescript
headers: () => {
  const token = localStorage.getItem("auth_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}
```

## Protected Routes

Routes under `/app/_authed/` automatically check auth:
- Validates token exists
- Verifies session is valid
- Redirects to `/sign-in` if not authenticated
- Preserves original URL for redirect after login

## Common Patterns

### Conditional Rendering
```tsx
const { data: session } = trpcReact.auth.getSession.useQuery();

{session?.user ? (
  <AuthenticatedContent />
) : (
  <GuestContent />
)}
```

### Loading States
```tsx
const mutation = trpcReact.auth.signIn.useMutation();

<button disabled={mutation.isPending}>
  {mutation.isPending ? "Signing in..." : "Sign In"}
</button>
```

### Error Handling
```tsx
const [error, setError] = useState("");

const mutation = trpcReact.auth.signIn.useMutation({
  onError: (error) => setError(error.message),
});

{error && <div className="error">{error}</div>}
```

## Status Codes

- `200` - Success
- `400` - Bad Request (invalid input)
- `401` - Unauthorized (no/invalid token)
- `404` - Not Found
- `500` - Internal Server Error
