import { getAuth } from "@repo/data/auth";
import { Db } from "@repo/data/database";

export async function createContext({
  req,
  env,
  db,
  workerCtx,
}: {
  req: Request;
  env: Env;
  db: Db;
  workerCtx: ExecutionContext;
}) {
  let userId: string | null = null;

  try {
    const auth = getAuth(db);
    // Better Auth automatically reads cookies from the request
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (session?.user) {
      userId = session.user.id;
    }
  } catch (error) {
    console.error("Failed to get session:", error);
  }

  return {
    req,
    env,
    db,
    workerCtx,
    userId,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
