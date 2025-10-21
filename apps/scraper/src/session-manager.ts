interface BingSession {
  cookies: string;
  userAgent: string;
  viewport: { width: number; height: number };
  timezone: string;
  language: string;
  platform: string;
  createdAt: number;
  lastUsed: number;
  sessionId: string;
  fingerprint: {
    screen: { width: number; height: number };
    colorDepth: number;
    pixelRatio: number;
    hardwareConcurrency: number;
    memory?: number;
  };
}

export class SessionManager {
  constructor(private kv: KVNamespace) {}

  async getRandomSession(): Promise<BingSession | null> {
    try {
      const list = await this.kv.list({ prefix: 'pool:' });
      
      if (list.keys.length === 0) {
        return null;
      }

      const randomKey = list.keys[Math.floor(Math.random() * list.keys.length)];
      const sessionId = await this.kv.get(randomKey.name);
      
      if (!sessionId) {
        return null;
      }

      const sessionData = await this.kv.get(`session:${sessionId}`);
      
      if (!sessionData) {
        await this.kv.delete(randomKey.name);
        return null;
      }

      const session: BingSession = JSON.parse(sessionData);
      
      session.lastUsed = Date.now();
      await this.kv.put(`session:${sessionId}`, JSON.stringify(session), {
        expirationTtl: 24 * 60 * 60,
      });

      return session;
    } catch (error) {
      console.error('Error getting random session:', error);
      return null;
    }
  }

  async updateSessionCookies(sessionId: string, newCookies: string): Promise<void> {
    try {
      const sessionData = await this.kv.get(`session:${sessionId}`);
      
      if (sessionData) {
        const session: BingSession = JSON.parse(sessionData);
        session.cookies = newCookies;
        session.lastUsed = Date.now();
        
        await this.kv.put(`session:${sessionId}`, JSON.stringify(session), {
          expirationTtl: 24 * 60 * 60,
        });
      }
    } catch (error) {
      console.error('Error updating session cookies:', error);
    }
  }

  generateFallbackSession(): BingSession {
    const userAgents = [
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0',
    ];

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
      'en-US', 'en-GB', 'en-CA', 'en-AU', 'fr-FR', 'de-DE', 'es-ES'
    ];

    const platforms = [
      'MacIntel', 'Win32', 'Linux x86_64'
    ];

    const screen = screens[Math.floor(Math.random() * screens.length)];
    const timezone = timezones[Math.floor(Math.random() * timezones.length)];
    const language = languages[Math.floor(Math.random() * languages.length)];
    const platform = platforms[Math.floor(Math.random() * platforms.length)];
    const userAgent = userAgents[Math.floor(Math.random() * userAgents.length)];

    return {
      cookies: '',
      userAgent,
      viewport: { width: screen.width - 100, height: screen.height - 100 },
      timezone,
      language,
      platform,
      createdAt: Date.now(),
      lastUsed: Date.now(),
      sessionId: `fallback_${crypto.randomUUID()}`,
      fingerprint: {
        screen,
        colorDepth: 24,
        pixelRatio: Math.random() > 0.5 ? 1 : 2,
        hardwareConcurrency: Math.floor(Math.random() * 8) + 4,
        memory: Math.floor(Math.random() * 4) + 4,
      },
    };
  }
}