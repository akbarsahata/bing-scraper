import type { ScrapingQueueMessage } from '@repo/data/zod-schema/queue';
import { ScrapingQueueMessageSchema } from '@repo/data/zod-schema/queue';
import { WorkerEntrypoint } from 'cloudflare:workers';
import { ScrapingWorkflow } from './workflows/scraping-workflow';
import { initDatabase } from '../../../packages/data/dist/src/db/database';

export default class Worker extends WorkerEntrypoint {
	constructor(ctx: ExecutionContext, env: Env) {
		super(ctx, env);

		initDatabase(env.DATABASE);
	}

	async queue(batch: MessageBatch<ScrapingQueueMessage>): Promise<void> {
		for (const message of batch.messages) {
			try {
				const parsed = ScrapingQueueMessageSchema.parse(message.body);

				const workflowInstance = await this.env.SCRAPING_WORKFLOW.create({
					id: `workflow-${parsed.data.queryId}-${Date.now()}`,
					params: parsed.data,
				});

				console.log(`Workflow created for query ${parsed.data.queryId}:`, workflowInstance.id);

				message.ack();
			} catch (error) {
				console.error('Failed to process queue message:', error);
				message.retry();
			}
		}
	}
}

export { ScrapingWorkflow };
