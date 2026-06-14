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
  is_active: boolean;
  created_at: string;
  status?: string;
  type_of_contract?: string;
  ref_email?: string | null;
  quantity?: number | null;
  views_count?: number;
  clicks_count?: number;
  candidacies_count?: number;
  source?: "local" | "external";
}

export interface PaginatedJobsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Job[];
}

export async function fetchJobs(page: number = 1, search?: string, pageSize: number = 6): Promise<PaginatedJobsResponse> {
  let url = `${API_URL}/jobs/?page=${page}&page_size=${pageSize}`;
  if (search) {
    url += `&search=${encodeURIComponent(search)}`;
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

export interface CreateJobPayload {
  title: string;
  description: string;
  type_of_contract?: string;
  neighborhood?: string | null;
  salary?: string | null;
  ref_email?: string | null;
  quantity?: number | null;
  external_link?: string | null;
  is_active?: boolean;
  status?: string;
}

const getAuthHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("companyToken");
    if (token) {
      headers["Authorization"] = `Company ${token}`;
    }
  }
  return headers;
};

export async function loginCompany(cnpj: string, email: string, password: string): Promise<{ company: Company; token: string }> {
  const response = await fetch(`${API_URL}/companies/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cnpj, email, password }),
  });

  if (!response.ok) {
    const text = await response.text();
    let detail = "Erro de autenticação";
    try {
      const parsed = JSON.parse(text);
      detail = parsed.detail || parsed.message || detail;
    } catch {
      detail = text || detail;
    }
    throw new Error(detail);
  }

  return response.json() as Promise<{ company: Company; token: string }>;
}

export async function loginCompanyWithGoogle(email: string): Promise<{ company: Company; token: string }> {
  const response = await fetch(`${API_URL}/companies/google-auth/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const text = await response.text();
    let detail = "Erro de autenticação";
    try {
      const parsed = JSON.parse(text);
      if (parsed.need_registration) {
        throw new Error("NEED_REGISTRATION");
      }
      detail = parsed.detail || parsed.message || detail;
    } catch (e) {
      if ((e as Error).message === "NEED_REGISTRATION") throw e;
      detail = text || detail;
    }
    throw new Error(detail);
  }

  return response.json() as Promise<{ company: Company; token: string }>;
}


export async function fetchMyJobs(): Promise<Job[]> {
  const response = await fetch(`${API_URL}/jobs/my-jobs/`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Backend returned ${response.status}: ${text}`);
  }

  return response.json() as Promise<Job[]>;
}

export async function createJob(payload: CreateJobPayload): Promise<Job> {
  const response = await fetch(`${API_URL}/jobs/`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Backend returned ${response.status}: ${text}`);
  }

  return response.json() as Promise<Job>;
}

export async function updateJob(id: number | string, payload: Partial<CreateJobPayload>): Promise<Job> {
  const response = await fetch(`${API_URL}/jobs/${id}/`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Backend returned ${response.status}: ${text}`);
  }

  return response.json() as Promise<Job>;
}

export async function deleteJob(id: number | string): Promise<void> {
  const response = await fetch(`${API_URL}/jobs/${id}/`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Backend returned ${response.status}: ${text}`);
  }
}

export interface Company {
  id: number;
  name: string;
  description?: string | null;
  website?: string | null;
  city?: string | null;
  neighborhood?: string | null;
  phone?: string | null;
  email?: string | null;
  cnpj?: string;
  is_verified?: boolean;
  logo_url?: string | null;
  created_at?: string;
}

export interface CreateCompanyPayload {
  name: string;
  phone?: string;
  email: string;
  cnpj: string;
  address?: string;
  number?: string;
  complement?: string;
  cep?: string;
  neighborhood?: string;
  alternative_email?: string;
  description?: string;
}

export async function createCompany(payload: CreateCompanyPayload): Promise<Company> {
  const response = await fetch(`${API_URL}/companies/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Backend returned ${response.status}: ${text}`);
  }

  return response.json() as Promise<Company>;
}

export async function applyToJob(id: number | string, payload: FormData): Promise<unknown> {
  const response = await fetch(`${API_URL}/jobs/${id}/apply/`, {
    method: "POST",
    body: payload,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Backend returned ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

export interface Candidacy {
  id: number;
  job: number;
  full_name: string;
  email: string;
  phone: string;
  resume: string;
  created_at: string;
}

export async function fetchCandidaciesForJob(jobId: number | string): Promise<Candidacy[]> {
  const response = await fetch(`${API_URL}/jobs/${jobId}/candidacies/`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Erro ao carregar candidatos: ${response.statusText}`);
  }

  return response.json() as Promise<Candidacy[]>;
}
