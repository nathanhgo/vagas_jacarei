/**
 * API client utilities.
 * All backend communication goes through these functions.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

export interface PingResponse {
  message: string;
  status: string;
  django_version: string;
}

/**
 * Calls the /api/ping/ backend endpoint.
 * Returns the parsed response or throws on network/HTTP error.
 */
export async function fetchPing(): Promise<PingResponse> {
  const response = await fetch(`${API_URL}/ping/`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    // Revalidate every 30 seconds in Next.js cache
    next: { revalidate: 30 },
  });

  if (!response.ok) {
    throw new Error(`Backend returned ${response.status}: ${response.statusText}`);
  }

  return response.json() as Promise<PingResponse>;
}
