import { initDatabase } from '@repo/data/database';
import { WorkerEntrypoint } from 'cloudflare:workers';

export default class Worker extends WorkerEntrypoint {
	constructor(ctx: ExecutionContext, env: Env) {
		super(ctx, env);

		initDatabase(env.DATABASE);
	}
}
