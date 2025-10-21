import { TRPCError } from "@trpc/server";
import { z } from "zod/v4";
import { t } from "../trpc-instance";
import { SessionManager } from "../../session-manager";

export const sessionsRouter = t.router({
  captureSession: t.procedure
    .input(
      z.object({
        userAgent: z.string(),
        viewport: z.object({
          width: z.number(),
          height: z.number(),
        }),
        timezone: z.string(),
        language: z.string(),
        platform: z.string(),
        fingerprint: z.object({
          screen: z.object({
            width: z.number(),
            height: z.number(),
          }),
          colorDepth: z.number(),
          pixelRatio: z.number(),
          hardwareConcurrency: z.number(),
          memory: z.number().optional(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { env, userId } = ctx;

      if (!userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to capture session",
        });
      }

      const sessionManager = new SessionManager(env.SESSIONS);

      // For now, we'll create a basic session without actual cookies
      // In a real implementation, you'd need to proxy a request to Bing
      // and capture the Set-Cookie headers
      const sessionId = await sessionManager.captureClientSession({
        ...input,
        cookies: "", // We'll populate this with actual Bing cookies in a more sophisticated setup
      });

      return {
        sessionId,
        message: "Session captured successfully",
      };
    }),

  getBingCookies: t.procedure
    .query(async () => {
      try {
        const response = await fetch('https://www.bing.com/', {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            'DNT': '1',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
          },
        });

        const setCookieHeaders = response.headers.get('set-cookie');
        
        return {
          cookies: setCookieHeaders || '',
          status: response.status,
        };
      } catch (error) {
        console.error('Error fetching Bing cookies:', error);
        return {
          cookies: '',
          status: 0,
        };
      }
    }),
});