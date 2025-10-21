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
					searchUrl: `https://www.bing.com/search?q=${encodeURIComponent(queryText)}&form=QBLH&sp=-1&ghc=2&lq=0&pq=${encodeURIComponent(queryText)}&sc=${queryText.length}-${queryText.length}&qs=n&sk=&cvid=${crypto.randomUUID().replace(/-/g, '').substring(0, 32).toUpperCase()}`,
					error: error instanceof Error ? error.message : 'Unknown error',
				};
			}
		});

		await step.do('save-results', async () => {
			const duration = Date.now() - task.createdAt.getTime();

			if (scrapingResult.success) {
				const resultId = `result_${crypto.randomUUID()}`;
				const now = new Date();
				
				console.log('Creating search result with data:', {
					resultId,
					taskId: task.id,
					queryId,
					userId,
					queryText,
					totalResults: scrapingResult.totalResults,
					pageTitle: scrapingResult.pageTitle,
					scrapedAt: now.toISOString(),
					screenshotKey: scrapingResult.screenshotKey,
					htmlKey: scrapingResult.htmlKey,
				});
				
				try {
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
							scrapedAt: now,
							createdAt: now,
							updatedAt: now,
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
							createdAt: now, // Use same Date object
						}))
					);
					console.log('Successfully inserted search result and items');
				} catch (dbError) {
					console.error('Database insert failed:', dbError);
					console.error('Failed data structure:', {
						searchResult: {
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
							scrapedAt: now.toISOString(),
							createdAt: now.toISOString(),
							updatedAt: now.toISOString(),
						},
						itemsCount: scrapingResult.items.length,
						sampleItem: scrapingResult.items[0] ? {
							id: 'item_sample',
							searchResultId: resultId,
							queryId,
							position: scrapingResult.items[0].position || 1,
							title: scrapingResult.items[0].title,
							url: scrapingResult.items[0].url,
							type: scrapingResult.items[0].type,
							createdAt: now.toISOString(),
						} : null
					});
					throw dbError;
				}

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
		// Generate realistic Bing search URL with proper parameters
		const generateBingSearchUrl = (query: string) => {
			const encodedQuery = encodeURIComponent(query);
			const cvid = crypto.randomUUID().replace(/-/g, '').substring(0, 32).toUpperCase();
			const queryLength = query.length;
			
			// Parameters based on real Bing search URLs:
			// q = search query
			// form = QBLH (Bing search form identifier)
			// sp = -1 (spelling parameter)
			// ghc = 2 (geographical hint code)
			// lq = 0 (language query parameter)
			// pq = previous query (same as current for direct search)
			// sc = character count range (queryLength-queryLength)
			// qs = n (query suggestion parameter)
			// sk = (search key - empty for direct search)
			// cvid = unique conversation/session identifier
			return `https://www.bing.com/search?q=${encodedQuery}&form=QBLH&sp=-1&ghc=2&lq=0&pq=${encodedQuery}&sc=${queryLength}-${queryLength}&qs=n&sk=&cvid=${cvid}`;
		};

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

			// First visit Bing homepage like a real user
			console.log('Visiting Bing homepage first...');
			await page.goto('https://www.bing.com/', {
				waitUntil: 'domcontentloaded',
				timeout: 30000,
			});

			// Wait for the page to load completely
			const homepageDelay = Math.floor(Math.random() * 3000) + 2000;
			console.log(`Homepage load delay: ${homepageDelay}ms`);
			await new Promise((resolve) => setTimeout(resolve, homepageDelay));

			// Look for the search input field and type the query
			try {
				await page.waitForSelector('#sb_form_q', { timeout: 10000 });
				
				// Click on the search box to focus it (human-like behavior)
				await page.click('#sb_form_q');
				
				// Small delay after clicking
				await new Promise((resolve) => setTimeout(resolve, Math.random() * 500 + 200));
				
				// Sometimes clear existing text first (10% chance - simulates correcting previous search)
				if (Math.random() < 0.1) {
					await page.keyboard.down('Control');
					await page.keyboard.press('KeyA');
					await page.keyboard.up('Control');
					await new Promise((resolve) => setTimeout(resolve, Math.random() * 300 + 100));
				}
				
				// Type the query with human-like typing speed
				await page.type('#sb_form_q', queryText, {
					delay: Math.random() * 100 + 50, // Random typing speed between 50-150ms per character
				});
				
				// Occasionally make a "typo" and correct it (5% chance)
				if (Math.random() < 0.05) {
					console.log('Simulating typo correction...');
					await new Promise((resolve) => setTimeout(resolve, Math.random() * 500 + 200));
					
					// Add an extra character
					await page.type('#sb_form_q', 'x', { delay: 100 });
					await new Promise((resolve) => setTimeout(resolve, Math.random() * 800 + 300));
					
					// Delete it
					await page.keyboard.press('Backspace');
					await new Promise((resolve) => setTimeout(resolve, Math.random() * 300 + 100));
				}
				
				// Brief pause before submitting (like a human would)
				const thinkingDelay = Math.floor(Math.random() * 2000) + 500;
				console.log(`Thinking delay before search: ${thinkingDelay}ms`);
				await new Promise((resolve) => setTimeout(resolve, thinkingDelay));
				
				// Submit the search form
				await page.keyboard.press('Enter');
				
				// Wait for search results to load
				await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 30000 });
				console.log(`Successfully searched for: "${queryText}"`);
				
			} catch (error) {
				console.log('Failed to use search box, falling back to direct URL navigation');
				// Fallback to direct navigation with realistic search URL
				const fallbackUrl = generateBingSearchUrl(queryText);
				console.log(`Using fallback URL: ${fallbackUrl}`);
				await page.goto(fallbackUrl, {
					waitUntil: 'domcontentloaded',
					timeout: 30000,
				});
			}

			const pageLoadDelay = Math.floor(Math.random() * 4000) + 4000;
			console.log(`Page load delay: ${pageLoadDelay}ms`);
			await new Promise((resolve) => setTimeout(resolve, pageLoadDelay));

			// Sometimes scroll down to see more results (30% chance)
			if (Math.random() < 0.3) {
				console.log('Simulating page scroll to see more results...');
				await page.evaluate(() => {
					// @ts-ignore - Browser DOM available in evaluate context
					window.scrollTo({
						// @ts-ignore - Browser DOM available in evaluate context
						top: window.innerHeight * 0.7,
						behavior: 'smooth'
					});
				});
				
				// Wait a bit after scrolling
				await new Promise((resolve) => setTimeout(resolve, Math.random() * 1500 + 500));
				
				// Scroll back up sometimes
				if (Math.random() < 0.5) {
					await page.evaluate(() => {
						// @ts-ignore - Browser DOM available in evaluate context
						window.scrollTo({
							top: 0,
							behavior: 'smooth'
						});
					});
					await new Promise((resolve) => setTimeout(resolve, Math.random() * 1000 + 500));
				}
			}

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
				
				// Simulate human reading and browsing behavior
				await page.evaluate(() => {
					// @ts-ignore - Browser DOM available in evaluate context
					const results = document.querySelectorAll('#b_results li');
					if (results.length > 0) {
						// @ts-ignore - Browser DOM available in evaluate context
						const randomResult = results[Math.floor(Math.random() * Math.min(3, results.length))];
						randomResult.scrollIntoView({ behavior: 'smooth' });
					}
				});
				
				// Simulate some mouse movement over results (human-like cursor behavior)
				const resultElements = await page.$$('#b_results li.b_algo');
				if (resultElements.length > 0) {
					for (let i = 0; i < Math.min(3, resultElements.length); i++) {
						const element = resultElements[i];
						try {
							// Get element bounding box
							const box = await element.boundingBox();
							if (box) {
								// Move mouse to element with slight randomness
								const x = box.x + box.width * (0.2 + Math.random() * 0.6);
								const y = box.y + box.height * (0.3 + Math.random() * 0.4);
								await page.mouse.move(x, y, { steps: Math.floor(Math.random() * 5) + 3 });
								
								// Small pause as if reading
								await new Promise(resolve => setTimeout(resolve, Math.random() * 800 + 200));
							}
						} catch (e) {
							// Continue if mouse movement fails
						}
					}
				}
				
				// Brief pause as if reading the results
				const readingDelay = Math.floor(Math.random() * 2000) + 1000;
				await new Promise((resolve) => setTimeout(resolve, readingDelay));
				
				console.log('Completed human-like browsing simulation');
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
				searchUrl: generateBingSearchUrl(queryText),
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
				searchUrl: generateBingSearchUrl(queryText),
				error: error instanceof Error ? error.message : 'Unknown error occurred during scraping',
			};
		}
	}
}
