import { Db } from '@repo/data/database';

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
  return {
    req,
    env,
    db,
    workerCtx,
    userInfo: {
      userId: "1234567890",
    },
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
