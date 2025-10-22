import { vi } from 'vitest';

export const createMockDb = () => {
  const createReturningMock = () => ({
    get: vi.fn().mockResolvedValue(null),
    all: vi.fn().mockResolvedValue([]),
  });

  const createQueryChainMock = () => {
    const chain: any = {
      limit: vi.fn().mockReturnThis(),
      offset: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      get: vi.fn().mockResolvedValue(null),
      all: vi.fn().mockResolvedValue([]),
    };
    chain.limit.mockReturnValue(chain);
    chain.offset.mockReturnValue(chain);
    chain.orderBy.mockReturnValue(chain);
    chain.where.mockReturnValue(chain);
    return chain;
  };

  const db = {
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockReturnValue(createReturningMock()),
      }),
    }),
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue(createQueryChainMock()),
    }),
    update: vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockReturnValue(createReturningMock()),
        }),
      }),
    }),
    delete: vi.fn().mockReturnValue({
      where: vi.fn().mockReturnValue({
        returning: vi.fn().mockReturnValue(createReturningMock()),
      }),
    }),
    query: {
      uploadedFiles: {
        findFirst: vi.fn().mockResolvedValue(null),
        findMany: vi.fn().mockResolvedValue([]),
      },
      searchQueries: {
        findFirst: vi.fn().mockResolvedValue(null),
        findMany: vi.fn().mockResolvedValue([]),
      },
      searchResults: {
        findFirst: vi.fn().mockResolvedValue(null),
        findMany: vi.fn().mockResolvedValue([]),
      },
      scrapingTasks: {
        findFirst: vi.fn().mockResolvedValue(null),
        findMany: vi.fn().mockResolvedValue([]),
      },
    },
  };

  const mockHelpers = {
    resetAllMocks: () => {
      vi.clearAllMocks();
    },
    mockInsertReturning: (returnValue: any) => {
      const returning = {
        get: vi.fn().mockResolvedValue(returnValue),
        all: vi.fn().mockResolvedValue([returnValue]),
        then: (resolve: any) => Promise.resolve([returnValue]).then(resolve),
        catch: (reject: any) => Promise.resolve([returnValue]).catch(reject),
        finally: (fn: any) => Promise.resolve([returnValue]).finally(fn),
        [Symbol.iterator]: function* () {
          yield returnValue;
        },
      };
      db.insert().values().returning.mockReturnValue(returning as any);
      return db;
    },
    mockInsertMany: (returnValue: any[]) => {
      const returning = {
        get: vi.fn().mockResolvedValue(returnValue[0]),
        all: vi.fn().mockResolvedValue(returnValue),
        then: (resolve: any) => Promise.resolve(returnValue).then(resolve),
        catch: (reject: any) => Promise.resolve(returnValue).catch(reject),
        finally: (fn: any) => Promise.resolve(returnValue).finally(fn),
        [Symbol.iterator]: function* () {
          for (const item of returnValue) {
            yield item;
          }
        },
      };
      db.insert().values().returning.mockReturnValue(returning as any);
      return db;
    },
    mockSelectOne: (returnValue: any) => {
      const chain = createQueryChainMock();
      chain.get.mockResolvedValue(returnValue);
      const result = Promise.resolve(returnValue ? [returnValue] : []);
      (result as any).get = chain.get;
      (result as any).all = chain.all;
      (result as any).limit = vi.fn().mockReturnValue(result);
      (result as any).offset = vi.fn().mockReturnValue(result);
      (result as any).orderBy = vi.fn().mockReturnValue(result);
      (result as any).where = vi.fn().mockReturnValue(result);
      db.select().from.mockReturnValue(result as any);
      return db;
    },
    mockSelectMany: (returnValue: any[]) => {
      const chain = createQueryChainMock();
      chain.all.mockResolvedValue(returnValue);
      const result = Promise.resolve(returnValue);
      (result as any).get = chain.get;
      (result as any).all = chain.all;
      (result as any).limit = vi.fn().mockReturnValue(result);
      (result as any).offset = vi.fn().mockReturnValue(result);
      (result as any).orderBy = vi.fn().mockReturnValue(result);
      (result as any).where = vi.fn().mockReturnValue(result);
      db.select().from.mockReturnValue(result as any);
      return db;
    },
    mockUpdateReturning: (returnValue: any) => {
      const returning = {
        get: vi.fn().mockResolvedValue(returnValue),
        all: vi.fn().mockResolvedValue([returnValue]),
        then: (resolve: any) => Promise.resolve([returnValue]).then(resolve),
        catch: (reject: any) => Promise.resolve([returnValue]).catch(reject),
        finally: (fn: any) => Promise.resolve([returnValue]).finally(fn),
        [Symbol.iterator]: function* () {
          yield returnValue;
        },
      };
      db.update().set().where().returning.mockReturnValue(returning as any);
      return db;
    },
    mockDeleteReturning: (returnValue: any) => {
      const returning = {
        get: vi.fn().mockResolvedValue(returnValue),
        all: vi.fn().mockResolvedValue([returnValue]),
        then: (resolve: any) => Promise.resolve([returnValue]).then(resolve),
        catch: (reject: any) => Promise.resolve([returnValue]).catch(reject),
        finally: (fn: any) => Promise.resolve([returnValue]).finally(fn),
        [Symbol.iterator]: function* () {
          yield returnValue;
        },
      };
      db.delete().where().returning.mockReturnValue(returning as any);
      return db;
    },
    mockQueryFirst: (table: string, returnValue: any) => {
      (db.query as any)[table].findFirst.mockResolvedValue(returnValue);
      return db;
    },
    mockQueryMany: (table: string, returnValue: any[]) => {
      (db.query as any)[table].findMany.mockResolvedValue(returnValue);
      return db;
    },
  };

  return { db, mockHelpers };
};

export type MockDb = ReturnType<typeof createMockDb>['db'];
export type MockHelpers = ReturnType<typeof createMockDb>['mockHelpers'];