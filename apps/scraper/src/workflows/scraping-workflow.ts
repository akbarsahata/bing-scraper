import { getDb, initDatabase } from '@repo/data/database';
import { scrapingTasksRepo } from '@repo/data/repos/scraping-tasks.repo';
import { searchQueriesRepo } from '@repo/data/repos/search-queries.repo';
import { searchResultsRepo } from '@repo/data/repos/search-results.repo';
import type { ScrapingQueueMessage } from '@repo/data/zod-schema/queue';
import { WorkflowEntrypoint, WorkflowEvent, WorkflowStep } from 'cloudflare:workers';
import { SessionManager } from '../session-manager';

interface ScrapingResult {
	success: boolean;
	totalResults: number;
	items: Array<{
		position: number;
		title: string;
		url: string;
		displayUrl?: string;
		snippet?: string;
		type: string;
		domain?: string;
		isAd: boolean;
	}>;
	pageTitle?: string;
	searchUrl: string;
	screenshotKey?: string;
	htmlKey?: string;
	error?: string;
}

export class ScrapingWorkflow extends WorkflowEntrypoint<Env, ScrapingQueueMessage['data']> {
	async run(event: WorkflowEvent<ScrapingQueueMessage['data']>, step: WorkflowStep) {
		const { queryId, uploadedFileId, userId, queryText, retryCount } = event.payload;

		initDatabase(this.env.DATABASE);
		const db = getDb();

		const task = await step.do('create-task', async () => {
			const taskId = `task_${crypto.randomUUID()}`;
			const task = await scrapingTasksRepo.create(db, {
				id: taskId,
				searchQueryId: queryId,
				uploadedFileId,
				userId,
				status: 'pending',
				retryCount,
				createdAt: new Date(),
				updatedAt: new Date(),
			});

			return {
				...task,
				metadata: JSON.stringify(task.metadata),
			};
		});

		await step.do('mark-started', async () => {
			await scrapingTasksRepo.markAsStarted(db, task.id, event.instanceId);
			await searchQueriesRepo.updateStatus(db, queryId, 'scraping');
		});

		const scrapingResult = await step.do('scrape-bing', async () => {
			try {
				const result = await this.scrapeBing(queryText, queryId, userId);

				console.log(JSON.stringify(result, null, 2));

				return result;
			} catch (error) {
				console.error(`Scraping failed for query ${queryId}:`, error);
				return {
					success: false,
					totalResults: 0,
					items: [],
					searchUrl: `https://www.bing.com/search?q=${encodeURIComponent(queryText)}`,
					error: error instanceof Error ? error.message : 'Unknown error',
				};
			}
		});

		await step.do('save-results', async () => {
			const duration = Date.now() - task.createdAt.getTime();

			if (scrapingResult.success) {
				const resultId = `result_${crypto.randomUUID()}`;
				await searchResultsRepo.create(
					db,
					{
						id: resultId,
						taskId: task.id,
						queryId,
						userId,
						queryText,
						totalResults: scrapingResult.totalResults,
						pageTitle: scrapingResult.pageTitle,
						searchUrl: scrapingResult.searchUrl,
						r2ScreenshotKey: scrapingResult.screenshotKey || null,
						r2HtmlKey: scrapingResult.htmlKey || null,
						scrapedAt: new Date(),
						createdAt: new Date(),
						updatedAt: new Date(),
					},
					scrapingResult.items.map((item, index) => ({
						id: `item_${crypto.randomUUID()}`,
						searchResultId: resultId,
						queryId,
						position: item.position || index + 1,
						title: item.title,
						url: item.url,
						displayUrl: item.displayUrl || null,
						snippet: item.snippet || null,
						type: (item.type === 'image' ? 'organic' : item.type) as 'organic' | 'ad' | 'news' | 'video' | 'featured',
						domain: item.domain || null,
						isAd: item.isAd,
						createdAt: new Date(),
					}))
				);

				await scrapingTasksRepo.markAsCompleted(db, task.id, duration);
				await searchQueriesRepo.updateStatus(db, queryId, 'completed');
			} else {
				await scrapingTasksRepo.markAsFailed(db, task.id, scrapingResult.error || 'Scraping failed');
				await searchQueriesRepo.updateStatus(db, queryId, 'failed', scrapingResult.error);
			}
		});

		return {
			taskId: task.id,
			queryId,
			success: scrapingResult.success,
			totalResults: scrapingResult.totalResults,
		};
	}

	private async scrapeBing(queryText: string, queryId: string, userId: string): Promise<ScrapingResult> {
		const searchUrl = `https://www.bing.com/search?q=${encodeURIComponent(queryText)}`;

		try {
			const { default: puppeteer } = await import('@cloudflare/puppeteer');
			const sessionManager = new SessionManager(this.env.SESSIONS);

			const browser = await puppeteer.launch(this.env.VIRTUAL_BROWSER);
			const page = await browser.newPage();

			let session = await sessionManager.getRandomSession();
			if (!session) {
				console.log('No stored sessions available, generating fallback session');
				session = sessionManager.generateFallbackSession();
			} else {
				console.log(`Using stored session: ${session.sessionId} (created: ${new Date(session.createdAt).toISOString()})`);
			}

			await page.setViewport(session.viewport);
			await page.setUserAgent(session.userAgent);

			const headers: Record<string, string> = {
				Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
				'Accept-Language': session.language + ',en;q=0.9',
				'Accept-Encoding': 'gzip, deflate, br',
				DNT: '1',
				Connection: 'keep-alive',
				'Upgrade-Insecure-Requests': '1',
			};

			if (session.cookies) {
				headers['Cookie'] = session.cookies;
			}

			await page.setExtraHTTPHeaders(headers);

			// Simulate human browsing patterns
			if (Math.random() > 0.7) {
				console.log('Simulating pre-search browsing...');
				
				// Sometimes visit Bing homepage first
				await page.goto('https://www.bing.com/', {
					waitUntil: 'domcontentloaded',
					timeout: 15000,
				});
				
				// Random scroll and interaction
				await page.evaluate(() => {
					// @ts-ignore - Browser DOM available in evaluate context
					window.scrollTo(0, Math.random() * 500);
				});
				
				// Short delay as if user is looking around
				const browsingDelay = Math.floor(Math.random() * 3000) + 1000;
				await new Promise((resolve) => setTimeout(resolve, browsingDelay));
			}

			const humanDelay = Math.floor(Math.random() * 3000) + 2000;
			console.log(`Human delay: ${humanDelay}ms`);
			await new Promise((resolve) => setTimeout(resolve, humanDelay));

			await page.goto(searchUrl, {
				waitUntil: 'domcontentloaded',
				timeout: 30000,
			});

			const pageLoadDelay = Math.floor(Math.random() * 4000) + 4000;
			console.log(`Page load delay: ${pageLoadDelay}ms`);
			await new Promise((resolve) => setTimeout(resolve, pageLoadDelay));

			const updatedCookies = await page.evaluate(() => {
				// @ts-ignore - Browser DOM available in evaluate context
				return document.cookie;
			});
			if (updatedCookies && session.sessionId.startsWith('session_')) {
				console.log('Updating session cookies with fresh data');
				await sessionManager.updateSessionCookies(session.sessionId, updatedCookies);
			}

			const isCaptcha = await page.evaluate(() => {
				// @ts-ignore - Browser DOM available in evaluate context
				const captchaText = document.body?.textContent || '';
				return (
					captchaText.includes('One last step') ||
					captchaText.includes('Verify you are human') ||
					captchaText.includes('Please solve the challenge') ||
					// @ts-ignore - Browser DOM available in evaluate context
					document.querySelector('[data-challenge]') !== null ||
					// @ts-ignore - Browser DOM available in evaluate context
					document.querySelector('.challenge') !== null
				);
			});

			if (isCaptcha) {
				console.log('CAPTCHA detected, trying alternative approach...');

				await page.reload({ waitUntil: 'domcontentloaded', timeout: 30000 });
				await new Promise((resolve) => setTimeout(resolve, 2000));

				const stillCaptcha = await page.evaluate(() => {
					// @ts-ignore - Browser DOM available in evaluate context
					const captchaText = document.body?.textContent || '';
					return captchaText.includes('One last step') || captchaText.includes('Verify you are human');
				});

				if (stillCaptcha) {
					console.log('Still getting CAPTCHA after reload, capturing current state');
				}
			}

			try {
				await page.waitForSelector('#b_results', { timeout: 5000 });
				
				// Simulate human reading behavior
				await page.evaluate(() => {
					// @ts-ignore - Browser DOM available in evaluate context
					const results = document.querySelectorAll('#b_results li');
					if (results.length > 0) {
						// @ts-ignore - Browser DOM available in evaluate context
						const randomResult = results[Math.floor(Math.random() * Math.min(3, results.length))];
						randomResult.scrollIntoView({ behavior: 'smooth' });
					}
				});
				
				// Brief pause as if reading
				const readingDelay = Math.floor(Math.random() * 2000) + 1000;
				await new Promise((resolve) => setTimeout(resolve, readingDelay));
			} catch (error) {
				console.log('Search results container not found, continuing anyway');
			}

			const screenshot = await page.screenshot({
				fullPage: true,
				type: 'png',
			});

			const timestamp = Date.now();
			const screenshotKey = `screenshots/${userId}/${queryId}_${timestamp}.png`;
			await this.env.STORAGE.put(screenshotKey, screenshot, {
				httpMetadata: {
					contentType: 'image/png',
				},
				customMetadata: {
					userId,
					queryId,
					queryText,
					uploadedAt: new Date().toISOString(),
					sessionId: session.sessionId,
					userAgent: session.userAgent,
					viewport: JSON.stringify(session.viewport),
					renderMethod: 'browser-session-aware',
				},
			});

			const htmlContent = await page.content();
			const htmlKey = `html/${userId}/${queryId}_${timestamp}.html`;
			await this.env.STORAGE.put(htmlKey, htmlContent, {
				httpMetadata: {
					contentType: 'text/html',
				},
				customMetadata: {
					userId,
					queryId,
					queryText,
					uploadedAt: new Date().toISOString(),
					sessionId: session.sessionId,
					userAgent: session.userAgent,
					viewport: JSON.stringify(session.viewport),
					timezone: session.timezone,
					language: session.language,
					platform: session.platform,
					fingerprint: JSON.stringify(session.fingerprint),
					renderMethod: 'browser-session-aware',
					hasCookies: (session.cookies.length > 0).toString(),
				},
			});

			const scrapedData = await page.evaluate(() => {
				const results: Array<{
					position: number;
					title: string;
					url: string;
					displayUrl?: string;
					snippet?: string;
					type: string;
					domain?: string;
					isAd: boolean;
				}> = [];

				// @ts-ignore - Browser DOM available in evaluate context
				const bodyText = document.body?.textContent || '';
				const isCaptchaPage =
					bodyText.includes('One last step') ||
					bodyText.includes('Verify you are human') ||
					bodyText.includes('Please solve the challenge');

				if (isCaptchaPage) {
					console.log('CAPTCHA page detected during extraction');
					return {
						results: [],
						// @ts-ignore - Browser DOM available in evaluate context
						pageTitle: document.title || 'Bing Search - CAPTCHA Challenge',
						isCaptcha: true,
					};
				}

				try {
					// @ts-ignore - Browser DOM available in evaluate context
					let organicResults = document.querySelectorAll('#b_results > li.b_algo');

					if (organicResults.length === 0) {
						// @ts-ignore - Browser DOM available in evaluate context
						organicResults = document.querySelectorAll('.b_algo, [data-tag="organic"]');
					}

					organicResults.forEach((result: any, index: number) => {
						try {
							const titleElement = result.querySelector('h2 a, h3 a, .b_title a') as HTMLAnchorElement;
							const snippetElement = result.querySelector('.b_caption p, .b_algoSlug, .b_snippetText');
							const citeElement = result.querySelector('cite, .b_attribution cite');

							if (titleElement && (titleElement as any).href) {
								const url = (titleElement as any).href;
								const title = (titleElement as any).textContent?.trim() || '';
								const snippet = snippetElement?.textContent?.trim() || '';
								const displayUrl = citeElement?.textContent?.trim() || '';

								let domain = '';
								try {
									domain = new URL(url).hostname;
								} catch (e) {
								}

								results.push({
									position: index + 1,
									title,
									url,
									displayUrl,
									snippet,
									type: 'organic',
									domain,
									isAd: false,
								});
							}
						} catch (e) {
							console.log('Error processing organic result:', e);
						}
					});

					// @ts-ignore - Browser DOM available in evaluate context
					let adResults = document.querySelectorAll('#b_results > li.b_ad, #b_results li[data-ad]');

					if (adResults.length === 0) {
						// @ts-ignore - Browser DOM available in evaluate context
						adResults = document.querySelectorAll('.b_ad, [data-tag="ad"], .sb_add');
					}

					adResults.forEach((result: any) => {
						try {
							const titleElement = result.querySelector('h2 a, .b_adlabel + div a, h3 a') as HTMLAnchorElement;
							const snippetElement = result.querySelector('.b_caption p, .b_adSlug, .b_snippetText');
							const citeElement = result.querySelector('cite, .b_attribution cite');

							if (titleElement && (titleElement as any).href) {
								const url = (titleElement as any).href;
								const title = (titleElement as any).textContent?.trim() || '';
								const snippet = snippetElement?.textContent?.trim() || '';
								const displayUrl = citeElement?.textContent?.trim() || '';

								let domain = '';
								try {
									domain = new URL(url).hostname;
								} catch (e) {
								}

								results.push({
									position: results.length + 1,
									title,
									url,
									displayUrl,
									snippet,
									type: 'ad',
									domain,
									isAd: true,
								});
							}
						} catch (e) {
							console.log('Error processing ad result:', e);
						}
					});
				} catch (e) {
					console.log('Error during data extraction:', e);
				}

				return {
					results,
					// @ts-ignore - Browser DOM available in evaluate context
					pageTitle: document.title || 'Bing Search',
					isCaptcha: false,
				};
			});

			await browser.close();

			return {
				success: true,
				totalResults: scrapedData.results.length,
				items: scrapedData.results,
				pageTitle: scrapedData.pageTitle,
				searchUrl,
				screenshotKey,
				htmlKey,
			};
		} catch (error) {
			console.error('Browser rendering failed:', error);
			
			return {
				success: false,
				totalResults: 0,
				items: [],
				pageTitle: 'Bing Search - Error',
				searchUrl,
				error: error instanceof Error ? error.message : 'Unknown error occurred during scraping',
			};
		}
	}
}
