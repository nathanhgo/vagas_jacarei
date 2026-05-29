const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

export interface PingResponse {
  message: string;
  status: string;
  django_version: string;
}

export async function fetchPing(): Promise<PingResponse> {
  const response = await fetch(`${API_URL}/ping/`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    next: { revalidate: 30 },
  });

  if (!response.ok) {
    throw new Error(`Backend returned ${response.status}: ${response.statusText}`);
  }

  return response.json() as Promise<PingResponse>;
}

export interface Job {
  id: number;
  title: string;
  description: string;
  company: string;
  location: string;
  neighborhood: string | null;
  salary: string | null;
  external_link: string | null;
  source: "local" | "indeed" | "vagas" | "adzuna";
  is_active: boolean;
  created_at: string;
}

export interface PaginatedJobsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Job[];
}

export async function fetchJobs(page: number = 1, search?: string, source?: string, pageSize: number = 6): Promise<PaginatedJobsResponse> {
  let url = `${API_URL}/jobs/?page=${page}&page_size=${pageSize}`;
  if (search) {
    url += `&search=${encodeURIComponent(search)}`;
  }
  if (source && source !== "all") {
    url += `&source=${encodeURIComponent(source)}`;
  }
  const response = await fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Backend returned ${response.status}: ${response.statusText}`);
  }

  return response.json() as Promise<PaginatedJobsResponse>;
}

export async function fetchJobById(id: number | string): Promise<Job> {
  const response = await fetch(`${API_URL}/jobs/${id}/`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Backend returned ${response.status}: ${response.statusText}`);
  }

  return response.json() as Promise<Job>;
}
