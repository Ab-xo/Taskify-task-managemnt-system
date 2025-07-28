import { Task, TaskFilters, ApiResponse, User, TaskOverview } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';


// Token management
const getAuthToken = (): string | null => {
  return localStorage.getItem('accessToken');
};

const getRefreshToken = (): string | null => {
  return localStorage.getItem('refreshToken');
};

const setTokens = (accessToken: string, refreshToken: string): void => {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
};

const removeTokens = (): void => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};

// API request helper with automatic token refresh
const apiRequest = async <T = any>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  const makeRequest = async (token?: string): Promise<Response> => {
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    return fetch(`${API_BASE_URL}${endpoint}`, config);
  };

  try {
    console.log(`🚀 API Request: ${options.method || 'GET'} ${API_BASE_URL}${endpoint}`);
    
    let response = await makeRequest(getAuthToken() || undefined);
    
    // If token expired, try to refresh
    if (response.status === 401 && getRefreshToken()) {
      console.log('🔄 Token expired, attempting refresh...');
      
      try {
        const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: getRefreshToken() })
        });

        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          setTokens(refreshData.data.accessToken, refreshData.data.refreshToken);
          
          // Retry original request with new token
          response = await makeRequest(refreshData.data.accessToken);
        } else {
          // Refresh failed, redirect to login
          removeTokens();
          window.location.href = '/login';
          throw new Error('Session expired. Please login again.');
        }
      } catch (refreshError) {
        console.error('❌ Token refresh failed:', refreshError);
        removeTokens();
        window.location.href = '/login';
        throw new Error('Session expired. Please login again.');
      }
    }
    
    console.log(`📊 Response Status: ${response.status}`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ 
        success: false, 
        message: `HTTP error! status: ${response.status}` 
      }));
      
      console.error('❌ API Error:', errorData);
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
  
    const data = await response.json();
    console.log('✅ API Success:', data.message || 'Request completed');
    return data;
  } catch (error) {
    console.error('💥 API request failed:', error);
    throw error;
  }
};

// Auth API
export const authAPI = {
  signup: async (name: string, email: string, password: string): Promise<ApiResponse<{
    accessToken: string;
    refreshToken: string;
    user: User;
  }>> => {
    console.log('📝 Attempting signup:', { name, email });
    const response = await apiRequest<{
      accessToken: string;
      refreshToken: string;
      user: User;
    }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    
    if (response.success && response.data) {
      setTokens(response.data.accessToken, response.data.refreshToken);
    }
    
    return response;
  },

  login: async (email: string, password: string): Promise<ApiResponse<{
    accessToken: string;
    refreshToken: string;
    user: User;
  }>> => {
    console.log('🔐 Attempting login:', { email });
    const response = await apiRequest<{
      accessToken: string;
      refreshToken: string;
      user: User;
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.success && response.data) {
      setTokens(response.data.accessToken, response.data.refreshToken);
    }
    
    return response;
  },

  logout: async (): Promise<void> => {
    try {
      await apiRequest('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refreshToken: getRefreshToken() }),
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      removeTokens();
    }
  },

  refreshToken: async (): Promise<ApiResponse<{
    accessToken: string;
    refreshToken: string;
  }>> => {
    const response = await apiRequest<{
      accessToken: string;
      refreshToken: string;
    }>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken: getRefreshToken() }),
    });
    
    if (response.success && response.data) {
      setTokens(response.data.accessToken, response.data.refreshToken);
    }
    
    return response;
  },

  forgotPassword: async (email: string): Promise<ApiResponse> => {
    return apiRequest('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }
};

// User API
export const userAPI = {
  getProfile: async (): Promise<ApiResponse<{ user: User }>> => {
    return apiRequest<{ user: User }>('/users/profile');
  },

  updateProfile: async (updates: Partial<User>): Promise<ApiResponse<{ user: User }>> => {
    return apiRequest<{ user: User }>('/users/profile', {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }
};

// Task API
export const taskAPI = {
  createTask: async (taskData: Partial<Task>): Promise<ApiResponse<{ task: Task }>> => {
    return apiRequest<{ task: Task }>('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  },

  getTasks: async (filters: TaskFilters = {}): Promise<ApiResponse<{
    tasks: Task[];
    pagination: any;
    stats: any;
    overdueCount: number;
  }>> => {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/tasks?${queryString}` : '/tasks';
    
    return apiRequest<{
      tasks: Task[];
      pagination: any;
      stats: any;
      overdueCount: number;
    }>(endpoint);
  },

  getTask: async (taskId: string): Promise<ApiResponse<{ task: Task }>> => {
    return apiRequest<{ task: Task }>(`/tasks/${taskId}`);
  },

  updateTask: async (taskId: string, updates: Partial<Task>): Promise<ApiResponse<{ task: Task }>> => {
    return apiRequest<{ task: Task }>(`/tasks/${taskId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  deleteTask: async (taskId: string): Promise<ApiResponse<{ task: Task }>> => {
    return apiRequest<{ task: Task }>(`/tasks/${taskId}`, {
      method: 'DELETE',
    });
  },

  archiveTask: async (taskId: string): Promise<ApiResponse<{ task: Task }>> => {
    return apiRequest<{ task: Task }>(`/tasks/${taskId}`, {
      method: 'DELETE',
    });
  },

  restoreTask: async (taskId: string): Promise<ApiResponse<{ task: Task }>> => {
    return apiRequest<{ task: Task }>(`/tasks/${taskId}/restore`, {
      method: 'POST',
    });
  },

  getTaskStats: async (): Promise<ApiResponse<TaskOverview>> => {
    return apiRequest<TaskOverview>('/tasks/stats/overview');
  }
};

// Export token management functions
export { 
  getAuthToken, 
  getRefreshToken, 
  setTokens, 
  removeTokens 
};

// Network status monitoring
export const networkMonitor = {
  isOnline: () => navigator.onLine,
  
  onStatusChange: (callback: (isOnline: boolean) => void) => {
    const handleOnline = () => callback(true);
    const handleOffline = () => callback(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }
};
