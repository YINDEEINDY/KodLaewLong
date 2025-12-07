import { Router } from 'express';
import { verifyRecaptcha } from '../middleware/recaptcha.middleware.js';

const router = Router();

// Verify reCAPTCHA token endpoint
// Client calls this before performing auth actions
router.post('/verify-recaptcha', verifyRecaptcha, (_req, res) => {
  res.json({ success: true, message: 'reCAPTCHA verified' });
});

export default router;
