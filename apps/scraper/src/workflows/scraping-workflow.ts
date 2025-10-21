import { getDb, initDatabase } from '@repo/data/database';
import { scrapingTasksRepo } from '@repo/data/repos/scraping-tasks.repo';
import { searchQueriesRepo } from '@repo/data/repos/search-queries.repo';
import { searchResultsRepo } from '@repo/data/repos/search-results.repo';
import type { ScrapingQueueMessage } from '@repo/data/zod-schema/queue';
import { WorkflowEntrypoint, WorkflowEvent, WorkflowStep } from 'cloudflare:workers';

// Simulated bash-like command interface
interface CommandResult {
	success: boolean;
	stdout: string;
	stderr: string;
	exitCode: number;
	metadata: Record<string, any>;
}

interface CommandOptions {
	timeout?: number;
	userAgent?: string;
	headers?: Record<string, string>;
	verbose?: boolean;
}

// Bash-like command simulator for Cloudflare Workers
class BashSimulator {
	private verbose: boolean = false;

	constructor(verbose = false) {
		this.verbose = verbose;
	}

	// Generate realistic browser fingerprint
	private generateBrowserFingerprint() {
		const screens = [
			{ width: 1920, height: 1080 },
			{ width: 1366, height: 768 },
			{ width: 1440, height: 900 },
			{ width: 1536, height: 864 },
			{ width: 1600, height: 900 },
			{ width: 2560, height: 1440 },
		];
		
		const timezones = [
			'America/New_York', 'America/Los_Angeles', 'America/Chicago',
			'Europe/London', 'Europe/Paris', 'Europe/Berlin',
			'Asia/Tokyo', 'Asia/Shanghai', 'Australia/Sydney'
		];

		const languages = [
			'en-US,en;q=0.9',
			'en-GB,en;q=0.9',
			'en-US,en;q=0.9,es;q=0.8',
			'en-US,en;q=0.9,fr;q=0.8',
			'en-US,en;q=0.9,de;q=0.8'
		];

		const screen = screens[Math.floor(Math.random() * screens.length)];
		const timezone = timezones[Math.floor(Math.random() * timezones.length)];
		const language = languages[Math.floor(Math.random() * languages.length)];

		return { screen, timezone, language };
	}

	// Generate realistic user agent with proper versioning
	private generateRealisticUserAgent() {
		const browsers = [
			{
				name: 'Chrome',
				versions: ['120.0.0.0', '119.0.0.0', '118.0.0.0', '121.0.0.0'],
				template: (version: string, os: string) => 
					`Mozilla/5.0 (${os}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${version} Safari/537.36`
			},
			{
				name: 'Firefox',
				versions: ['121.0', '120.0', '119.0', '122.0'],
				template: (version: string, os: string) => 
					`Mozilla/5.0 (${os}; rv:${version}) Gecko/20100101 Firefox/${version}`
			},
			{
				name: 'Safari',
				versions: ['17.0', '16.6', '17.1'],
				template: (version: string, os: string) => 
					`Mozilla/5.0 (${os}) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/${version} Safari/605.1.15`
			},
			{
				name: 'Edge',
				versions: ['120.0.0.0', '119.0.0.0', '121.0.0.0'],
				template: (version: string, os: string) => 
					`Mozilla/5.0 (${os}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${version} Safari/537.36 Edg/${version}`
			}
		];

		const operatingSystems = [
			'Windows NT 10.0; Win64; x64',
			'Macintosh; Intel Mac OS X 10_15_7',
			'X11; Linux x86_64',
			'Macintosh; Intel Mac OS X 10_14_6',
			'Windows NT 10.0; WOW64'
		];

		const browser = browsers[Math.floor(Math.random() * browsers.length)];
		const version = browser.versions[Math.floor(Math.random() * browser.versions.length)];
		const os = operatingSystems[Math.floor(Math.random() * operatingSystems.length)];

		return browser.template(version, os);
	}

	// Simulate human-like delays with realistic patterns
	private async humanDelay(baseMs: number = 1000, varianceMs: number = 500) {
		// Add some realistic delay patterns:
		// - Short burst delays (network latency simulation)
		// - Longer thinking delays (human reading time)
		const patterns = [
			{ min: baseMs * 0.5, max: baseMs * 1.5 }, // Normal variance
			{ min: baseMs * 2, max: baseMs * 4 },     // Thinking pause
			{ min: baseMs * 0.1, max: baseMs * 0.3 }, // Quick action
		];

		const pattern = patterns[Math.floor(Math.random() * patterns.length)];
		const delay = Math.random() * (pattern.max - pattern.min) + pattern.min;
		
		if (this.verbose) {
			console.log(`[HUMAN] Simulating human delay: ${Math.round(delay)}ms`);
		}
		
		await new Promise(resolve => setTimeout(resolve, delay));
	}

	// Simulate: curl -s -L -H "User-Agent: ..." -H "Accept: ..." url
	async curl(url: string, options: CommandOptions = {}): Promise<CommandResult> {
		const startTime = Date.now();
		let stdout = '';
		let stderr = '';
		let metadata: Record<string, any> = {};

		try {
			// Generate realistic browser fingerprint
			const fingerprint = this.generateBrowserFingerprint();
			const userAgent = options.userAgent || this.generateRealisticUserAgent();

			if (this.verbose || options.verbose) {
				stderr += `* Generated fingerprint: ${fingerprint.screen.width}x${fingerprint.screen.height}, ${fingerprint.language}\n`;
				stderr += `* Using User-Agent: ${userAgent}\n`;
				stderr += `* Trying to connect to ${url}\n`;
			}

			// Human-like delay before making request
			await this.humanDelay(800, 400);

			// Advanced headers that mimic real browser behavior
			const headers: Record<string, string> = {
				'User-Agent': userAgent,
				'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
				'Accept-Language': fingerprint.language,
				'Accept-Encoding': 'gzip, deflate, br, zstd',
				'DNT': '1',
				'Connection': 'keep-alive',
				'Upgrade-Insecure-Requests': '1',
				'Sec-Fetch-Dest': 'document',
				'Sec-Fetch-Mode': 'navigate',
				'Sec-Fetch-Site': 'none',
				'Sec-Fetch-User': '?1',
				'Cache-Control': 'max-age=0',
				'Pragma': 'no-cache',
				// Additional realistic headers
				'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
				'sec-ch-ua-mobile': '?0',
				'sec-ch-ua-platform': '"macOS"',
				'sec-ch-ua-platform-version': '"13.0.0"',
				...options.headers
			};

			// Add randomized order of headers (browsers send headers in different orders)
			const headerEntries = Object.entries(headers);
			const shuffledHeaders: Record<string, string> = {};
			
			// Randomize header order while keeping some critical ones first
			const criticalHeaders = ['User-Agent', 'Accept', 'Accept-Language'];
			criticalHeaders.forEach(key => {
				if (headers[key]) shuffledHeaders[key] = headers[key];
			});
			
			headerEntries.forEach(([key, value]) => {
				if (!criticalHeaders.includes(key)) {
					shuffledHeaders[key] = value;
				}
			});

			if (this.verbose || options.verbose) {
				stderr += `> GET ${new URL(url).pathname}${new URL(url).search} HTTP/1.1\n`;
				stderr += `> Host: ${new URL(url).hostname}\n`;
				Object.entries(shuffledHeaders).forEach(([key, value]) => {
					stderr += `> ${key}: ${value}\n`;
				});
				stderr += `>\n`;
			}

			// Use realistic timeout with some variance
			const baseTimeout = options.timeout || 30000;
			const timeoutVariance = Math.random() * 5000; // ±5 seconds
			const actualTimeout = baseTimeout + timeoutVariance;

			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), actualTimeout);

			// Add some network simulation delays
			const networkJitter = Math.random() * 200; // 0-200ms network jitter
			await new Promise(resolve => setTimeout(resolve, networkJitter));

			const response = await fetch(url, {
				method: 'GET',
				headers: shuffledHeaders,
				signal: controller.signal,
				// Additional fetch options that mimic browser behavior
			});

			clearTimeout(timeoutId);

			if (this.verbose || options.verbose) {
				stderr += `< HTTP/1.1 ${response.status} ${response.statusText}\n`;
				response.headers.forEach((value, key) => {
					stderr += `< ${key}: ${value}\n`;
				});
				stderr += `<\n`;
			}

			// Simulate realistic download progress
			const arrayBuffer = await response.arrayBuffer();
			const contentLength = arrayBuffer.byteLength;

			// Add download simulation delay based on content size (realistic bandwidth)
			const simulatedBandwidth = 1000000; // 1MB/s average
			const downloadTime = (contentLength / simulatedBandwidth) * 1000;
			const downloadDelay = Math.min(downloadTime, 2000); // Max 2 seconds
			
			if (downloadDelay > 100) {
				await new Promise(resolve => setTimeout(resolve, downloadDelay));
			}

			// Try to decode as text with multiple encoding fallbacks
			let textContent = '';
			let encoding = 'utf-8';
			
			try {
				const decoder = new TextDecoder('utf-8');
				textContent = decoder.decode(arrayBuffer);
			} catch (e) {
				try {
					const decoder = new TextDecoder('iso-8859-1');
					textContent = decoder.decode(arrayBuffer);
					encoding = 'iso-8859-1';
				} catch (e2) {
					const decoder = new TextDecoder('windows-1252');
					textContent = decoder.decode(arrayBuffer);
					encoding = 'windows-1252';
				}
			}

			stdout = textContent;

			metadata = {
				statusCode: response.status,
				statusText: response.statusText,
				contentLength,
				contentType: response.headers.get('content-type'),
				responseTime: Date.now() - startTime,
				encoding,
				fingerprint,
				userAgent,
				actualTimeout,
				downloadTime: downloadDelay,
				headers: Object.fromEntries(response.headers.entries())
			};

			if (this.verbose || options.verbose) {
				stderr += `* Downloaded ${contentLength} bytes in ${metadata.responseTime}ms\n`;
				stderr += `* Content decoded as ${encoding}\n`;
				stderr += `* Simulated download time: ${downloadDelay}ms\n`;
			}

			return {
				success: response.ok,
				stdout,
				stderr,
				exitCode: response.ok ? 0 : response.status,
				metadata
			};

		} catch (error) {
			stderr += `curl: ${error instanceof Error ? error.message : 'Unknown error'}\n`;
			metadata.error = error instanceof Error ? error.message : 'Unknown error';
			metadata.responseTime = Date.now() - startTime;

			return {
				success: false,
				stdout: '',
				stderr,
				exitCode: 1,
				metadata
			};
		}
	}

	// Simulate: echo "text" | grep "pattern"
	grep(text: string, pattern: string, flags?: string): CommandResult {
		try {
			const lines = text.split('\n');
			const isGlobal = flags?.includes('g') ?? true;
			const isCaseInsensitive = flags?.includes('i') ?? false;
			
			const regex = new RegExp(pattern, (isGlobal ? 'g' : '') + (isCaseInsensitive ? 'i' : ''));
			const matchingLines = lines.filter(line => regex.test(line));

			return {
				success: matchingLines.length > 0,
				stdout: matchingLines.join('\n'),
				stderr: '',
				exitCode: matchingLines.length > 0 ? 0 : 1,
				metadata: { matchCount: matchingLines.length, pattern, flags }
			};
		} catch (error) {
			return {
				success: false,
				stdout: '',
				stderr: `grep: ${error instanceof Error ? error.message : 'Unknown error'}\n`,
				exitCode: 2,
				metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
			};
		}
	}

	// Simulate: wc -l
	wc(text: string, option: 'l' | 'w' | 'c' = 'l'): CommandResult {
		try {
			let count: number;
			let description: string;

			switch (option) {
				case 'l': // lines
					count = text.split('\n').length;
					description = 'lines';
					break;
				case 'w': // words
					count = text.split(/\s+/).filter(word => word.length > 0).length;
					description = 'words';
					break;
				case 'c': // characters
					count = text.length;
					description = 'characters';
					break;
				default:
					throw new Error(`Unknown wc option: ${option}`);
			}

			return {
				success: true,
				stdout: `${count}`,
				stderr: '',
				exitCode: 0,
				metadata: { count, option, description }
			};
		} catch (error) {
			return {
				success: false,
				stdout: '',
				stderr: `wc: ${error instanceof Error ? error.message : 'Unknown error'}\n`,
				exitCode: 1,
				metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
			};
		}
	}

	// Simulate: head -n N
	head(text: string, lines: number = 10): CommandResult {
		try {
			const allLines = text.split('\n');
			const selectedLines = allLines.slice(0, lines);

			return {
				success: true,
				stdout: selectedLines.join('\n'),
				stderr: '',
				exitCode: 0,
				metadata: { requestedLines: lines, actualLines: selectedLines.length, totalLines: allLines.length }
			};
		} catch (error) {
			return {
				success: false,
				stdout: '',
				stderr: `head: ${error instanceof Error ? error.message : 'Unknown error'}\n`,
				exitCode: 1,
				metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
			};
		}
	}

	// Simulate: tail -n N
	tail(text: string, lines: number = 10): CommandResult {
		try {
			const allLines = text.split('\n');
			const selectedLines = allLines.slice(-lines);

			return {
				success: true,
				stdout: selectedLines.join('\n'),
				stderr: '',
				exitCode: 0,
				metadata: { requestedLines: lines, actualLines: selectedLines.length, totalLines: allLines.length }
			};
		} catch (error) {
			return {
				success: false,
				stdout: '',
				stderr: `tail: ${error instanceof Error ? error.message : 'Unknown error'}\n`,
				exitCode: 1,
				metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
			};
		}
	}
}

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

		// Handle CAPTCHA case - fallback to HTTP scraping
		if (scrapedData.isCaptcha) {
			console.log('CAPTCHA encountered, trying fallback bash-like scraping method...');
			
			try {
				const fallbackResult = await this.scrapeBingWithBash(queryText, queryId, userId);
				console.log('Fallback bash-like scraping successful');
				return fallbackResult;
			} catch (fallbackError) {
				console.log('Fallback HTTP scraping also failed:', fallbackError);
				return {
					success: false,
					totalResults: 0,
					items: [],
					pageTitle: scrapedData.pageTitle,
					searchUrl,
					screenshotKey,
					htmlKey,
					error: 'CAPTCHA challenge encountered and fallback HTTP scraping failed - please try again later',
				};
			}
		}			return {
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

		try {
			// Enhanced regex-based parser with multiple patterns for better coverage
			
			// Pattern 1: Standard Bing organic results
			const organicPattern1 = /<li class="b_algo"[\s\S]*?<h2[^>]*><a[^>]+href="([^"]*)"[^>]*>([\s\S]*?)<\/a>[\s\S]*?(?:<p[^>]*class="[^"]*b_lineclamp[^"]*"[^>]*>([\s\S]*?)<\/p>)?[\s\S]*?<\/li>/gi;
			
			// Pattern 2: Alternative Bing structure
			const organicPattern2 = /<div[^>]*class="[^"]*b_algoheader[^"]*"[\s\S]*?<a[^>]+href="([^"]*)"[^>]*>([\s\S]*?)<\/a>[\s\S]*?(?:<div[^>]*class="[^"]*b_caption[^"]*"[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>)?/gi;
			
			// Pattern 3: Simplified fallback
			const organicPattern3 = /<a[^>]+href="(https?:\/\/[^"]*)"[^>]*[^>]*class="[^"]*"[^>]*>(.*?)<\/a>/gi;

			let position = 1;

			// Try pattern 1
			let match;
			while ((match = organicPattern1.exec(html)) !== null && items.length < 15) {
				const url = this.cleanUrl(match[1]);
				const title = this.cleanText(match[2]);
				const snippet = match[3] ? this.cleanText(match[3]) : '';

				if (url && title && this.isValidSearchResult(url)) {
					const domain = this.extractDomain(url);
					
					items.push({
						position: position++,
						title,
						url,
						displayUrl: domain,
						snippet,
						type: 'organic',
						domain,
						isAd: false,
					});
				}
			}

			// Try pattern 2 if we didn't get many results
			if (items.length < 5) {
				organicPattern2.lastIndex = 0; // Reset regex
				while ((match = organicPattern2.exec(html)) !== null && items.length < 15) {
					const url = this.cleanUrl(match[1]);
					const title = this.cleanText(match[2]);
					const snippet = match[3] ? this.cleanText(match[3]) : '';

					if (url && title && this.isValidSearchResult(url) && !this.isDuplicateResult(items, url)) {
						const domain = this.extractDomain(url);
						
						items.push({
							position: position++,
							title,
							url,
							displayUrl: domain,
							snippet,
							type: 'organic',
							domain,
							isAd: false,
						});
					}
				}
			}

			// Try simplified pattern as last resort
			if (items.length < 3) {
				organicPattern3.lastIndex = 0; // Reset regex
				while ((match = organicPattern3.exec(html)) !== null && items.length < 10) {
					const url = this.cleanUrl(match[1]);
					const title = this.cleanText(match[2]);

					if (url && title && this.isValidSearchResult(url) && !this.isDuplicateResult(items, url)) {
						const domain = this.extractDomain(url);
						
						items.push({
							position: position++,
							title,
							url,
							displayUrl: domain,
							snippet: '',
							type: 'organic',
							domain,
							isAd: false,
						});
					}
				}
			}

		} catch (error) {
			console.error('Error parsing search results:', error);
		}

		return items;
	}

	private cleanUrl(url: string): string {
		if (!url) return '';
		// Remove Bing redirect wrappers and decode URL
		const cleaned = url.replace(/^.*?&u=a1aHR0cHM6Ly8/, 'https://').replace(/&[^&]*$/, '');
		try {
			return decodeURIComponent(cleaned);
		} catch (e) {
			return cleaned;
		}
	}

	private cleanText(text: string): string {
		if (!text) return '';
		return text.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
	}

	private extractDomain(url: string): string {
		try {
			return new URL(url).hostname;
		} catch (e) {
			return '';
		}
	}

	private isValidSearchResult(url: string): boolean {
		if (!url) return false;
		// Filter out Bing internal URLs and invalid results
		const invalidPatterns = [
			'bing.com',
			'microsoft.com/bing',
			'javascript:',
			'#',
			'mailto:',
		];
		return !invalidPatterns.some(pattern => url.includes(pattern));
	}

	private isDuplicateResult(items: Array<{url: string}>, newUrl: string): boolean {
		return items.some(item => item.url === newUrl);
	}

	private async scrapeBingWithBash(queryText: string, queryId: string, userId: string): Promise<ScrapingResult> {
		const searchUrl = `https://www.bing.com/search?q=${encodeURIComponent(queryText)}`;

		try {
			// Initialize our advanced bash simulator
			const bash = new BashSimulator(true); // verbose mode for debugging

			console.log(`[BASH] Starting advanced bot evasion for query: "${queryText}"`);

			// Step 1: Pre-request reconnaissance
			console.log(`[BASH] Phase 1: Reconnaissance`);
			
			// Add session-like delay (simulate user browsing other pages first)
			const sessionDelay = Math.random() * 10000 + 5000; // 5-15 seconds
			console.log(`[BASH] Simulating session activity: waiting ${Math.round(sessionDelay/1000)}s`);
			await new Promise(resolve => setTimeout(resolve, sessionDelay));

			// Step 2: Execute main request with advanced evasion
			console.log(`[BASH] Phase 2: Main request execution`);
			console.log(`[BASH] Executing: curl -s -L --max-time 30 "${searchUrl}"`);

			const curlResult = await bash.curl(searchUrl, {
				timeout: 30000,
				headers: {
					// Additional anti-detection headers
					'Referer': 'https://www.bing.com/', // Simulate coming from Bing homepage
					'Origin': 'https://www.bing.com',
					'X-Requested-With': '', // Remove this header as it indicates AJAX
					'Accept-Charset': 'utf-8, iso-8859-1;q=0.5',
					'Accept-Datetime': new Date().toUTCString(),
					// Simulate browser caching
					'If-Modified-Since': new Date(Date.now() - 86400000).toUTCString(), // 24h ago
					'If-None-Match': '"' + Math.random().toString(36).substr(2, 9) + '"',
				},
				verbose: true
			});

			console.log(`[BASH] curl exit code: ${curlResult.exitCode}`);
			console.log(`[BASH] Response time: ${curlResult.metadata.responseTime}ms`);
			console.log(`[BASH] Content length: ${curlResult.metadata.contentLength} bytes`);
			console.log(`[BASH] User-Agent used: ${curlResult.metadata.userAgent}`);
			console.log(`[BASH] Fingerprint: ${JSON.stringify(curlResult.metadata.fingerprint)}`);

			if (!curlResult.success) {
				throw new Error(`curl command failed with exit code ${curlResult.exitCode}: ${curlResult.stderr}`);
			}

			const html = curlResult.stdout;

			// Step 3: Content analysis with multiple validation layers
			console.log(`[BASH] Phase 3: Content analysis and validation`);

			// Simulate: echo "$html" | wc -l
			const wcResult = bash.wc(html, 'l');
			console.log(`[BASH] HTML line count: ${wcResult.stdout} lines`);

			// Simulate: echo "$html" | wc -c
			const charCount = bash.wc(html, 'c');
			console.log(`[BASH] HTML character count: ${charCount.stdout} characters`);

			// Enhanced bot detection checks
			const botDetectionPatterns = [
				'one last step', 'verify you are human', 'please solve the challenge',
				'captcha', 'recaptcha', 'hcaptcha', 'cloudflare', 'access denied',
				'blocked', 'suspicious activity', 'rate limit', 'too many requests',
				'security check', 'verify your browser', 'enable javascript',
				'robot', 'automation', 'scrapers', 'unusual traffic'
			];

			// Check each pattern individually for detailed reporting
			let botDetectionFound = false;
			const detectedPatterns: string[] = [];

			for (const pattern of botDetectionPatterns) {
				const checkResult = bash.grep(html, pattern, 'i');
				if (checkResult.success) {
					botDetectionFound = true;
					detectedPatterns.push(pattern);
					console.log(`[BASH] ⚠️  Bot detection pattern found: "${pattern}" (${checkResult.metadata.matchCount} matches)`);
				}
			}

			if (botDetectionFound) {
				console.log(`[BASH] 🚨 Total bot detection patterns: ${detectedPatterns.length}`);
				throw new Error(`Bot detection page encountered. Patterns: ${detectedPatterns.join(', ')}`);
			}

			// Validate we got legitimate search results
			const searchResultPatterns = ['b_algo', 'b_result', 'organic', 'searchresult'];
			let searchResultsFound = false;

			for (const pattern of searchResultPatterns) {
				const checkResult = bash.grep(html, pattern, 'i');
				if (checkResult.success) {
					searchResultsFound = true;
					console.log(`[BASH] ✅ Search result pattern found: "${pattern}" (${checkResult.metadata.matchCount} matches)`);
					break;
				}
			}

			if (!searchResultsFound) {
				console.log('[BASH] ⚠️  Warning: No obvious search result patterns found');
				
				// Additional validation - check for common page elements
				const pageElements = ['<!DOCTYPE', '<html', '<body', '<title'];
				let validPage = false;
				
				for (const element of pageElements) {
					const elementCheck = bash.grep(html, element, 'i');
					if (elementCheck.success) {
						validPage = true;
						break;
					}
				}
				
				if (!validPage) {
					throw new Error('Invalid HTML content received - possibly blocked or redirected');
				}
			}

			// Step 4: Post-request delay (simulate user reading time)
			const readingTime = Math.random() * 3000 + 2000; // 2-5 seconds
			console.log(`[BASH] Phase 4: Simulating reading time (${Math.round(readingTime/1000)}s)`);
			await new Promise(resolve => setTimeout(resolve, readingTime));

			// Store the HTML with comprehensive metadata
			const timestamp = Date.now();
			const htmlKey = `html/${userId}/${queryId}_${timestamp}.html`;
			
			await this.env.STORAGE.put(htmlKey, html, {
				httpMetadata: {
					contentType: 'text/html; charset=utf-8',
				},
				customMetadata: {
					userId,
					queryId,
					queryText,
					uploadedAt: new Date().toISOString(),
					method: 'advanced-bash-evasion',
					contentLength: curlResult.metadata.contentLength?.toString() || '0',
					responseTime: curlResult.metadata.responseTime?.toString() || '0',
					statusCode: curlResult.metadata.statusCode?.toString() || '0',
					userAgent: curlResult.metadata.userAgent || 'unknown',
					encoding: curlResult.metadata.encoding || 'utf-8',
					fingerprint: JSON.stringify(curlResult.metadata.fingerprint),
					botDetectionPassed: 'true',
					searchResultsFound: searchResultsFound.toString(),
					sessionDelay: sessionDelay.toString(),
					readingTime: readingTime.toString(),
					evasionTechniques: JSON.stringify([
						'realistic-user-agent',
						'browser-fingerprinting',
						'human-timing',
						'session-simulation',
						'header-randomization',
						'network-jitter',
						'download-simulation',
						'encoding-detection'
					])
				},
			});

			console.log(`[BASH] ✅ Saved HTML to R2: ${htmlKey}`);

			// Parse HTML using our enhanced parser
			console.log('[BASH] Phase 5: Parsing extracted content');
			const results = this.parseSearchResults(html);
			const pageTitle = this.extractTitle(html);

			console.log(`[BASH] ✅ Successfully extracted ${results.length} search results`);
			console.log(`[BASH] ✅ Page title: "${pageTitle}"`);

			// Final validation
			const resultValidation = bash.wc(results.map(r => r.title).join('\n'), 'l');
			console.log(`[BASH] ✅ Result validation: ${resultValidation.stdout} results processed`);

			return {
				success: true,
				totalResults: results.length,
				items: results,
				pageTitle,
				searchUrl,
				htmlKey,
				// No screenshot for bash method
				screenshotKey: undefined,
			};

		} catch (error) {
			console.error('[BASH] 🚨 Advanced evasion failed:', error);
			if (error instanceof Error) {
				console.error('[BASH] Error details:', {
					name: error.name,
					message: error.message,
					stack: error.stack
				});
			}
			throw error;
		}
	}
}
