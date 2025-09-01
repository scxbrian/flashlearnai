interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: any;
  headers?: Record<string, string>;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const apiCall = async (endpoint: string, options: ApiOptions = {}) => {
  const { method = 'GET', data, headers = {} } = options;
  
  console.log(`🌐 API Call: ${method} ${API_BASE_URL}${endpoint}`);
  
  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    method,
    credentials: 'include',
  };

  // Only set Content-Type for non-FormData requests
  if (!(data instanceof FormData)) {
    config.headers = {
      'Content-Type': 'application/json',
      ...headers,
    };
  } else {
    config.headers = headers;
  }

  if (data && method !== 'GET') {
    config.body = data instanceof FormData ? data : JSON.stringify(data);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    console.log(`✅ API Response: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ API Error Response:`, errorText);
      let error;
      try {
        error = JSON.parse(errorText);
      } catch {
        error = { message: errorText || 'Network error' };
      }
      throw new Error(error.message || 'Something went wrong');
    }
  
    return response.json();
  } catch (error) {
    console.error(`❌ API Call Failed:`, error);
    throw error;
  }
};