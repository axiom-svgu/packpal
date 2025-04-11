interface HttpResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
}

const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

const handleResponse = async <T>(response: Response): Promise<HttpResponse<T>> => {
  const status = response.status;

  try {
    const data = await response.json();

    if (!response.ok) {
      return {
        data: null,
        error: data.message || "An error occurred",
        status,
      };
    }

    return {
      data: data as T,
      error: null,
      status,
    };
  } catch (error) {
    return {
      data: null,
      error: "Failed to parse response",
      status,
    };
  }
};

const getHeaders = () => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const token = localStorage.getItem("token");
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

export const get = async <T>(endpoint: string): Promise<HttpResponse<T>> => {
  try {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: "GET",
      headers: getHeaders(),
      credentials: "include",
    });
    return handleResponse<T>(response);
  } catch (error) {
    return {
      data: null,
      error: "Network error",
      status: 0,
    };
  }
};

export const post = async <T>(endpoint: string, body: unknown): Promise<HttpResponse<T>> => {
  try {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: "POST",
      headers: getHeaders(),
      credentials: "include",
      body: JSON.stringify(body),
    });
    return handleResponse<T>(response);
  } catch (error) {
    return {
      data: null,
      error: "Network error",
      status: 0,
    };
  }
};

export const put = async <T>(endpoint: string, body: unknown): Promise<HttpResponse<T>> => {
  try {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: "PUT",
      headers: getHeaders(),
      credentials: "include",
      body: JSON.stringify(body),
    });
    return handleResponse<T>(response);
  } catch (error) {
    return {
      data: null,
      error: "Network error",
      status: 0,
    };
  }
};

export const del = async <T>(endpoint: string): Promise<HttpResponse<T>> => {
  try {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: "DELETE",
      headers: getHeaders(),
      credentials: "include",
    });
    return handleResponse<T>(response);
  } catch (error) {
    return {
      data: null,
      error: "Network error",
      status: 0,
    };
  }
};
