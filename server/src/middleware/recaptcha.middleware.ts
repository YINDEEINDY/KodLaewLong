import type { Request, Response, NextFunction } from 'express';

const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;
const RECAPTCHA_VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify';
const MIN_SCORE = 0.5; // Minimum score to pass (0.0 - 1.0)
const IS_DEVELOPMENT = process.env.NODE_ENV !== 'production';

interface RecaptchaResponse {
  success: boolean;
  score?: number;
  action?: string;
  challenge_ts?: string;
  hostname?: string;
  'error-codes'?: string[];
}

export async function verifyRecaptcha(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const token = req.body.recaptchaToken;

  // Skip verification in development mode or if no secret key configured
  if (IS_DEVELOPMENT || !RECAPTCHA_SECRET_KEY) {
    if (IS_DEVELOPMENT) {
      console.log('[reCAPTCHA] Skipping verification in development mode');
    } else {
      console.warn('[reCAPTCHA] Secret key not configured, skipping verification');
    }
    next();
    return;
  }

  if (!token) {
    res.status(400).json({ error: 'reCAPTCHA token is required' });
    return;
  }

  try {
    const params = new URLSearchParams({
      secret: RECAPTCHA_SECRET_KEY,
      response: token,
    });

    const response = await fetch(RECAPTCHA_VERIFY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const data = await response.json() as RecaptchaResponse;

    if (!data.success) {
      console.error('reCAPTCHA verification failed:', data['error-codes']);
      res.status(400).json({ error: 'reCAPTCHA verification failed' });
      return;
    }

    if (data.score !== undefined && data.score < MIN_SCORE) {
      console.warn(`reCAPTCHA score too low: ${data.score}`);
      res.status(400).json({ error: 'Request blocked due to suspicious activity' });
      return;
    }

    // Attach score to request for logging purposes
    (req as Request & { recaptchaScore?: number }).recaptchaScore = data.score;

    next();
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    res.status(500).json({ error: 'Failed to verify reCAPTCHA' });
  }
}
