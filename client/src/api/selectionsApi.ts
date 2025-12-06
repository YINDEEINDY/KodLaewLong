const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api/selections`
  : '/api/selections';

interface SelectionsResponse {
  appIds: string[];
}

interface SuccessResponse {
  success: boolean;
  message: string;
}

async function fetchWithAuth<T>(
  endpoint: string,
  token: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      error: `HTTP ${response.status}: ${response.statusText}`,
    }));
    throw new Error(errorData.error);
  }

  return response.json();
}

// Get user's saved selections
export async function getSelections(token: string): Promise<string[]> {
  const data = await fetchWithAuth<SelectionsResponse>('/', token);
  return data.appIds;
}

// Save all selections (replace)
export async function saveSelections(token: string, appIds: string[]): Promise<void> {
  await fetchWithAuth<SuccessResponse>('/', token, {
    method: 'PUT',
    body: JSON.stringify({ appIds }),
  });
}

// Add single selection
export async function addSelection(token: string, appId: string): Promise<void> {
  await fetchWithAuth<SuccessResponse>(`/${appId}`, token, {
    method: 'POST',
  });
}

// Remove single selection
export async function removeSelection(token: string, appId: string): Promise<void> {
  await fetchWithAuth<SuccessResponse>(`/${appId}`, token, {
    method: 'DELETE',
  });
}

// Clear all selections
export async function clearSelections(token: string): Promise<void> {
  await fetchWithAuth<SuccessResponse>('/', token, {
    method: 'DELETE',
  });
}
