import type { Application, ApplicationListResponse, ApplicationPayload, ApplicationStatus } from './types';

const headers = {
  'Content-Type': 'application/json'
};

async function parseResponse<T>(response: Response): Promise<T> {
  if (response.ok) {
    if (response.status === 204) {
      return undefined as T;
    }

    return response.json() as Promise<T>;
  }

  const body = (await response.json().catch(() => null)) as { message?: string } | null;
  throw new Error(body?.message ?? 'Request failed.');
}

export async function listApplications(params: {
  status?: ApplicationStatus | 'All';
  search?: string;
  page?: number;
}) {
  const query = new URLSearchParams();

  if (params.status && params.status !== 'All') {
    query.set('status', params.status);
  }

  if (params.search) {
    query.set('search', params.search);
  }

  query.set('page', String(params.page ?? 1));

  const response = await fetch(`/applications?${query.toString()}`);
  return parseResponse<ApplicationListResponse>(response);
}

export async function getApplication(id: string) {
  const response = await fetch(`/applications/${id}`);
  return parseResponse<Application>(response);
}

export async function createApplication(payload: ApplicationPayload) {
  const response = await fetch('/applications', {
    method: 'POST',
    headers,
    body: JSON.stringify(payload)
  });

  return parseResponse<Application>(response);
}

export async function updateApplication(id: string, payload: Partial<ApplicationPayload>) {
  const response = await fetch(`/applications/${id}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(payload)
  });

  return parseResponse<Application>(response);
}

export async function deleteApplication(id: string) {
  const response = await fetch(`/applications/${id}`, {
    method: 'DELETE'
  });

  return parseResponse<void>(response);
}
