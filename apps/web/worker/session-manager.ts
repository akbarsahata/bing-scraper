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

  async captureClientSession(sessionData: {
    userAgent: string;
    cookies: string;
    viewport: { width: number; height: number };
    timezone: string;
    language: string;
    platform: string;
    fingerprint: BingSession['fingerprint'];
  }): Promise<string> {
    const sessionId = `session_${crypto.randomUUID()}`;
    const now = Date.now();

    const session: BingSession = {
      ...sessionData,
      createdAt: now,
      lastUsed: now,
      sessionId,
    };

    // Store session with 24-hour TTL
    await this.kv.put(`session:${sessionId}`, JSON.stringify(session), {
      expirationTtl: 24 * 60 * 60, // 24 hours
    });

    // Also store in a pool for random selection
    await this.kv.put(`pool:${sessionId}`, sessionId, {
      expirationTtl: 24 * 60 * 60,
    });

    return sessionId;
  }

  async getRandomSession(): Promise<BingSession | null> {
    try {
      // List all sessions in the pool
      const list = await this.kv.list({ prefix: 'pool:' });
      
      if (list.keys.length === 0) {
        return null;
      }

      // Pick a random session
      const randomKey = list.keys[Math.floor(Math.random() * list.keys.length)];
      const sessionId = await this.kv.get(randomKey.name);
      
      if (!sessionId) {
        return null;
      }

      // Get the actual session data
      const sessionData = await this.kv.get(`session:${sessionId}`);
      
      if (!sessionData) {
        // Clean up stale pool entry
        await this.kv.delete(randomKey.name);
        return null;
      }

      const session: BingSession = JSON.parse(sessionData);
      
      // Update last used timestamp
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
}