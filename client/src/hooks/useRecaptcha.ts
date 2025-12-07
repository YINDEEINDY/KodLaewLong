import { useCallback, useEffect, useState } from 'react';

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

export function useRecaptcha() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Skip if no site key configured
    if (!RECAPTCHA_SITE_KEY) {
      console.warn('[reCAPTCHA] VITE_RECAPTCHA_SITE_KEY not configured, skipping reCAPTCHA');
      setIsLoaded(true); // Allow form submission without reCAPTCHA
      return;
    }

    // Check if script already exists
    if (document.querySelector(`script[src*="recaptcha"]`)) {
      if (window.grecaptcha) {
        setIsLoaded(true);
      }
      return;
    }

    // Load reCAPTCHA script
    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      window.grecaptcha.ready(() => {
        console.log('[reCAPTCHA] Loaded successfully');
        setIsLoaded(true);
      });
    };

    script.onerror = () => {
      console.error('[reCAPTCHA] Failed to load script');
      setIsLoaded(true); // Allow form submission even if reCAPTCHA fails
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup is optional since we want to keep the script loaded
    };
  }, []);

  const executeRecaptcha = useCallback(
    async (action: string): Promise<string | null> => {
      // Skip if no site key configured
      if (!RECAPTCHA_SITE_KEY) {
        console.log('[reCAPTCHA] No site key, skipping verification');
        return 'skip'; // Return special token to indicate skip
      }

      if (!window.grecaptcha) {
        console.warn('[reCAPTCHA] grecaptcha not available');
        return 'skip'; // Allow submission without reCAPTCHA
      }

      try {
        const token = await window.grecaptcha.execute(RECAPTCHA_SITE_KEY, { action });
        return token;
      } catch (error) {
        console.error('[reCAPTCHA] Execution failed:', error);
        return 'skip'; // Allow submission on error
      }
    },
    []
  );

  return { executeRecaptcha, isLoaded };
}
