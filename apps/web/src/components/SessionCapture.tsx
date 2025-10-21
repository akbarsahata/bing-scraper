import { useEffect } from 'react';
import { trpcReact } from '@/utils/trpc-types';

export function SessionCapture() {
  const captureSessionMutation = trpcReact.sessions.captureSession.useMutation();

  useEffect(() => {
    const captureSession = async () => {
      try {
        // Get browser fingerprint
        const fingerprint = {
          screen: {
            width: window.screen.width,
            height: window.screen.height,
          },
          colorDepth: window.screen.colorDepth,
          pixelRatio: window.devicePixelRatio,
          hardwareConcurrency: navigator.hardwareConcurrency,
          memory: (navigator as any).deviceMemory,
        };

        // Get fresh cookies from our proxy endpoint
        await fetch('https://www.bing.com/', {
          credentials: 'include',
          mode: 'no-cors',
        });

        await captureSessionMutation.mutateAsync({
          userAgent: navigator.userAgent,
          viewport: {
            width: window.innerWidth,
            height: window.innerHeight,
          },
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          language: navigator.language,
          platform: navigator.platform,
          fingerprint,
        });

        console.log('Session captured successfully');
      } catch (error) {
        console.log('Session capture failed (this is optional):', error);
      }
    };

    // Capture session on component mount
    captureSession();

    // Recapture every 30 minutes to keep sessions fresh
    const interval = setInterval(captureSession, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, [captureSessionMutation]);

  return null; // This component doesn't render anything
}