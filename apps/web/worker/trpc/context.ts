import { Db } from '@repo/data/database';
import { getAuth } from "@repo/data/auth";

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
  
  const authHeader = req.headers.get("Authorization");
  if (authHeader) {
    try {
      const auth = getAuth(db);
      const session = await auth.api.getSession({
        headers: new Headers({
          Authorization: authHeader,
        }),
      });
      
      if (session?.user) {
        userId = session.user.id;
      }
    } catch (error) {
      console.error("Failed to get session:", error);
    }
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
