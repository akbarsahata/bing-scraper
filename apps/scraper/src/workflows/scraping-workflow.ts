import { getDb, initDatabase } from '@repo/data/database';
import { scrapingTasksRepo } from '@repo/data/repos/scraping-tasks.repo';
import { searchQueriesRepo } from '@repo/data/repos/search-queries.repo';
import { searchResultsRepo } from '@repo/data/repos/search-results.repo';
import type { ScrapingQueueMessage } from '@repo/data/zod-schema/queue';
import { WorkflowEntrypoint, WorkflowEvent, WorkflowStep } from 'cloudflare:workers';

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

		// Step 1: Create scraping task
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

		// Step 2: Mark task as started
		await step.do('mark-started', async () => {
			await scrapingTasksRepo.markAsStarted(db, task.id, event.instanceId);
			await searchQueriesRepo.updateStatus(db, queryId, 'scraping');
		});

		// Step 3: Perform scraping
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

		// Step 4: Save results or handle failure
		await step.do('save-results', async () => {
			const duration = Date.now() - task.createdAt.getTime();

			if (scrapingResult.success) {
				// Save search results
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

				// Mark task and query as completed
				await scrapingTasksRepo.markAsCompleted(db, task.id, duration);
				await searchQueriesRepo.updateStatus(db, queryId, 'completed');
			} else {
				// Mark as failed
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
			// Use Cloudflare Browser Rendering API with Puppeteer
			const { default: puppeteer } = await import('@cloudflare/puppeteer');

			const browser = await puppeteer.launch(this.env.VIRTUAL_BROWSER);
			const page = await browser.newPage();

			// Set viewport for consistent rendering
			await page.setViewport({ width: 1920, height: 1080 });

			// Set user agent to appear more like a real browser with some randomization
			const userAgents = [
				'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
				'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
				'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
				'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0',
			];
			const randomUserAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
			await page.setUserAgent(randomUserAgent);

			// Set additional headers to appear more legitimate
			await page.setExtraHTTPHeaders({
				Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
				'Accept-Language': 'en-US,en;q=0.9',
				'Accept-Encoding': 'gzip, deflate, br',
				DNT: '1',
				Connection: 'keep-alive',
				'Upgrade-Insecure-Requests': '1',
			});

			// Add random delay before navigation (1-3 seconds)
			const randomDelay = Math.floor(Math.random() * 2000) + 1000;
			await new Promise((resolve) => setTimeout(resolve, randomDelay));

			// Navigate to Bing search with timeout
			await page.goto(searchUrl, {
				waitUntil: 'domcontentloaded',
				timeout: 30000,
			});

			// Wait a reasonable time for initial content to load with some randomization
			const loadDelay = Math.floor(Math.random() * 2000) + 3000; // 3-5 seconds
			await new Promise((resolve) => setTimeout(resolve, loadDelay));

			// Check for CAPTCHA or challenge page
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

				// Try refreshing the page once
				await page.reload({ waitUntil: 'domcontentloaded', timeout: 30000 });
				await new Promise((resolve) => setTimeout(resolve, 2000));

				// Check again after reload
				const stillCaptcha = await page.evaluate(() => {
					// @ts-ignore - Browser DOM available in evaluate context
					const captchaText = document.body?.textContent || '';
					return captchaText.includes('One last step') || captchaText.includes('Verify you are human');
				});

				if (stillCaptcha) {
					console.log('Still getting CAPTCHA after reload, capturing current state');
					// We'll still capture the HTML and screenshot for debugging
					// but return limited results
				}
			}

			// Try to wait for search results, but don't fail if not found
			try {
				await page.waitForSelector('#b_results', { timeout: 5000 });
			} catch (error) {
				console.log('Search results container not found, continuing anyway');
			} // Take screenshot and save to R2
			const screenshot = await page.screenshot({
				fullPage: true,
				type: 'png',
			});

			// Save screenshot to R2
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
				},
			});

			// Get HTML content and save to R2
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
				},
			});

			// Extract search results using page.evaluate
			// Note: Code inside evaluate() runs in browser context, so DOM APIs are available
			// TypeScript errors about 'document' are expected and can be ignored
			// @ts-ignore - Browser context code
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

				// Check if this is a CAPTCHA/challenge page
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
					// Get organic search results - try multiple selectors
					// @ts-ignore - Browser DOM available in evaluate context
					let organicResults = document.querySelectorAll('#b_results > li.b_algo');

					// If no results found, try alternative selectors
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
									// Invalid URL
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

					// Get sponsored/ad results
					// @ts-ignore - Browser DOM available in evaluate context
					let adResults = document.querySelectorAll('#b_results > li.b_ad, #b_results li[data-ad]');

					// Try alternative ad selectors
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
									// Invalid URL
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

			// Close browser
			await browser.close();

			// Handle CAPTCHA case
			if (scrapedData.isCaptcha) {
				console.log('CAPTCHA encountered, returning partial results');
				return {
					success: false,
					totalResults: 0,
					items: [],
					pageTitle: scrapedData.pageTitle,
					searchUrl,
					screenshotKey,
					htmlKey,
					error: 'CAPTCHA challenge encountered - please try again later or use different query patterns',
				};
			}

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
			throw error;
		}
	}

	private extractTitle(html: string): string {
		const match = html.match(/<title>(.*?)<\/title>/i);
		return match ? match[1] : 'Bing Search';
	}

	private parseSearchResults(html: string): Array<{
		position: number;
		title: string;
		url: string;
		displayUrl?: string;
		snippet?: string;
		type: string;
		domain?: string;
		isAd: boolean;
	}> {
		const items: Array<{
			position: number;
			title: string;
			url: string;
			displayUrl?: string;
			snippet?: string;
			type: string;
			domain?: string;
			isAd: boolean;
		}> = [];

		// This is a simplified regex-based parser
		// In production, use proper HTML parsing with Browser Rendering

		// Extract organic search results
		// Pattern matches typical Bing organic result structure
		const organicPattern = /<li class="b_algo"[\s\S]*?<h2><a href="(.*?)"[\s\S]*?>(.*?)<\/a>[\s\S]*?<\/li>/gi;
		let match;
		let position = 1;

		while ((match = organicPattern.exec(html)) !== null) {
			const url = match[1];
			const title = match[2].replace(/<[^>]*>/g, '').trim();

			let domain = '';
			try {
				domain = new URL(url).hostname;
			} catch (e) {
				// Invalid URL
			}

			items.push({
				position: position++,
				title,
				url,
				type: 'organic',
				domain,
				isAd: false,
			});

			// Limit to first 10 results
			if (items.length >= 10) break;
		}

		return items;
	}
}
