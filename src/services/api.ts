// Thin fetch wrapper around the json-server backend (see `npm run server`).
// Every persisted resource (users, items) lives in db.json and is served over
// a plain REST API by json-server, so all reads/writes for the app go through here.

const API_URL: string = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface ApiUser {
  id: string;
  name: string;
  surname: string;
  email: string;
  cellNumber?: string;
  passwordHash: string;
}

export interface ApiShoppingItem {
  id: string;
  userId: string;
  name: string;
  category?: string;
  quantity?: string;
  notes?: string;
  imageUrl?: string;
  dateAdded: string;
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
  } catch {
    // The most common cause is that `npm run server` isn't running.
    throw new ApiError(
      'Could not reach the server. Make sure the json-server backend is running (npm run server).',
      0
    );
  }

  if (!response.ok) {
    throw new ApiError(`Request to ${path} failed with status ${response.status}`, response.status);
  }

  // DELETE requests from json-server return an empty body.
  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

// ----- Users -----

export const findUserByEmail = async (email: string): Promise<ApiUser | undefined> => {
  const users = await request<ApiUser[]>(`/users?email=${encodeURIComponent(email.toLowerCase())}`);
  return users[0];
};

export const findUserById = async (id: string): Promise<ApiUser | undefined> => {
  try {
    return await request<ApiUser>(`/users/${id}`);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return undefined;
    throw err;
  }
};

export const createUser = (user: Omit<ApiUser, 'id'>): Promise<ApiUser> =>
  request<ApiUser>('/users', {
    method: 'POST',
    body: JSON.stringify(user),
  });

export const updateUser = (id: string, updates: Partial<Omit<ApiUser, 'id'>>): Promise<ApiUser> =>
  request<ApiUser>(`/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });

// ----- Shopping list items -----

export const getItemsForUser = (userId: string): Promise<ApiShoppingItem[]> =>
  request<ApiShoppingItem[]>(`/items?userId=${encodeURIComponent(userId)}`);

export const createItem = (item: Omit<ApiShoppingItem, 'id'>): Promise<ApiShoppingItem> =>
  request<ApiShoppingItem>('/items', {
    method: 'POST',
    body: JSON.stringify(item),
  });

export const updateItem = (id: string, item: Partial<ApiShoppingItem>): Promise<ApiShoppingItem> =>
  request<ApiShoppingItem>(`/items/${id}`, {
    method: 'PUT',
    body: JSON.stringify(item),
  });

export const deleteItem = (id: string): Promise<void> =>
  request<void>(`/items/${id}`, { method: 'DELETE' });
