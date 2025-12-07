const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

interface VerifyRecaptchaResponse {
  success: boolean;
  message: string;
}

interface ErrorResponse {
  error: string;
}

export async function verifyRecaptcha(token: string): Promise<VerifyRecaptchaResponse> {
  const response = await fetch(`${API_BASE}/auth/verify-recaptcha`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ recaptchaToken: token }),
  });

  if (!response.ok) {
    const errorData: ErrorResponse = await response.json().catch(() => ({
      error: `HTTP ${response.status}: ${response.statusText}`,
    }));
    throw new Error(errorData.error);
  }

  return response.json();
}
