export interface User {
  id: string;
  name: string;
  email: string;
  isEmailVerified?: boolean;
  role?: 'user' | 'admin';
  avatar?: string;
  preferences?: {
    theme: 'light' | 'dark' | 'auto';
    notifications: {
      email: boolean;
      push: boolean;
      taskReminders: boolean;
    };
    timezone: string;
    language: string;
  };
  lastLogin?: Date;
}

export interface Task {
  id: string;
  title: string; // Keep for frontend compatibility
  name: string;
  description?: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: Date;
  completedAt?: Date;
  tags: string[];
  estimatedHours?: number;
  actualHours?: number;
  isArchived: boolean;
  isOverdue?: boolean;
  daysUntilDue?: number;
  attachments?: Array<{
    filename: string;
    originalName: string;
    mimetype: string;
    size: number;
    url: string;
    uploadedAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskStats {
  pending?: number;
  'in-progress'?: number;
  completed?: number;
  cancelled?: number;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface TaskContextType {
  tasks: Task[];
  stats: TaskStats;
  overdueCount: number;
  addTask: (title: string, description?: string, priority?: 'low' | 'medium' | 'high' | 'urgent') => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  archiveTask: (id: string) => Promise<void>;
  restoreTask: (id: string) => Promise<void>;
  updateTaskStatus: (id: string, status: Task['status']) => Promise<void>;
  fetchTasks: (params?: TaskFilters) => Promise<void>;
  fetchTaskStats: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export interface TaskFilters {
  search?: string;
  status?: Task['status'];
  priority?: Task['priority'];
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  includeArchived?: boolean;
  dueBefore?: Date;
  dueAfter?: Date;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Array<{
    field: string;
    message: string;
    value?: any;
  }>;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalTasks: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  limit: number;
}

export interface ProductivityData {
  _id: string;
  count: number;
}

export interface TaskOverview {
  taskStats: TaskStats;
  overdueCount: number;
  completionRate: number;
  productivityTrend: ProductivityData[];
  totalTasks: number;
}

// Notification types
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

// Theme types
export type Theme = 'light' | 'dark' | 'auto';

// Form validation types
export interface ValidationError {
  field: string;
  message: string;
}

export interface FormState {
  isSubmitting: boolean;
  errors: ValidationError[];
  touched: Record<string, boolean>;
}