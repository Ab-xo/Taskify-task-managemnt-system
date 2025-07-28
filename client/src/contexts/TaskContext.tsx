import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Task, TaskContextType, TaskFilters, TaskStats } from '../types';
import { taskAPI } from '../services/api';
import { useAuth } from './AuthContext';

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const useTask = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTask must be used within a TaskProvider');
  }
  return context;
};

interface TaskProviderProps {
  children: ReactNode;
}

export const TaskProvider: React.FC<TaskProviderProps> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<TaskStats>({});
  const [overdueCount, setOverdueCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuth();

  // Fetch tasks when user changes or component mounts
  useEffect(() => {
    if (isAuthenticated && user) {
      // Fetch tasks immediately when user is authenticated
      fetchTasks();
      fetchTaskStats();
    } else {
      setTasks([]);
      setStats({});
      setOverdueCount(0);
    }
  }, [user, isAuthenticated]);

  // Preload tasks on auth context initialization
  useEffect(() => {
    if (isAuthenticated && user && tasks.length === 0) {
      fetchTasks();
    }
  }, [isAuthenticated, user]);

  const fetchTasks = async (filters: TaskFilters = {}): Promise<void> => {
    if (!isAuthenticated) return;
    
    // Only show loading for initial fetch or when filters change
    if (tasks.length === 0) {
      setIsLoading(true);
    }
    setError(null);
    
    try {
      console.log('📋 Fetching tasks with filters:', filters);
      const response = await taskAPI.getTasks({
        limit: 100,
        ...filters
      });
      
      if (response.success && response.data) {
        const formattedTasks = response.data.tasks.map((task: any) => ({
          id: task._id,
          title: task.name, // Keep using title for frontend compatibility
          name: task.name,
          description: task.description,
          status: task.status,
          priority: task.priority || 'medium',
          dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
          completedAt: task.completedAt ? new Date(task.completedAt) : undefined,
          tags: task.tags || [],
          estimatedHours: task.estimatedHours,
          actualHours: task.actualHours,
          isArchived: task.isArchived || false,
          isOverdue: task.isOverdue,
          daysUntilDue: task.daysUntilDue,
          attachments: task.attachments || [],
          createdAt: new Date(task.createdAt),
          updatedAt: new Date(task.updatedAt)
        }));
        
        setTasks(formattedTasks);
        setStats(response.data.stats || {});
        setOverdueCount(response.data.overdueCount || 0);
        
        console.log('✅ Tasks fetched successfully:', formattedTasks.length);
      }
    } catch (error) {
      console.error('❌ Failed to fetch tasks:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch tasks');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTaskStats = async (): Promise<void> => {
    if (!isAuthenticated) return;
    
    try {
      console.log('📊 Fetching task statistics...');
      const response = await taskAPI.getTaskStats();
      
      if (response.success && response.data) {
        setStats(response.data.taskStats || {});
        setOverdueCount(response.data.overdueCount || 0);
        console.log('✅ Task stats fetched successfully');
      }
    } catch (error) {
      console.error('❌ Failed to fetch task stats:', error);
    }
  };

  // Simple addTask function that works with the original UI
  const addTask = async (title: string, description?: string, priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium'): Promise<void> => {
    try {
      console.log('➕ Creating new task:', { title, description });
      
      const newTask: Task = {
        id: Date.now().toString(), // Temporary ID
        title,
        name: title,
        description: description || '',
        status: 'pending',
        priority: priority,
        tags: [],
        isArchived: false,
        attachments: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Optimistic update
      setTasks(prev => [newTask, ...prev]);

      // Try to save to backend
      try {
        const response = await taskAPI.createTask({
          name: title,
          description: description,
          priority: priority,
          status: 'pending'
        });
        
        if (response.success && response.data) {
          // Update with real data from server
          const serverTask: Task = {
            id: response.data.task._id,
            title: response.data.task.name,
            name: response.data.task.name,
            description: response.data.task.description || '',
            status: response.data.task.status,
            priority: response.data.task.priority || 'medium',
            dueDate: response.data.task.dueDate ? new Date(response.data.task.dueDate) : undefined,
            completedAt: response.data.task.completedAt ? new Date(response.data.task.completedAt) : undefined,
            tags: response.data.task.tags || [],
            estimatedHours: response.data.task.estimatedHours,
            actualHours: response.data.task.actualHours,
            isArchived: response.data.task.isArchived || false,
            attachments: response.data.task.attachments || [],
            createdAt: new Date(response.data.task.createdAt),
            updatedAt: new Date(response.data.task.updatedAt)
          };
          
          setTasks(prev => prev.map(task => 
            task.id === newTask.id ? serverTask : task
          ));
          
          await fetchTaskStats();
          console.log('✅ Task created successfully');
        }
      } catch (apiError) {
        console.error('❌ Failed to save to server, keeping local copy:', apiError);
        // Keep the optimistic update even if server fails
      }
    } catch (error) {
      console.error('❌ Failed to create task:', error);
      throw error;
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>): Promise<void> => {
    try {
      console.log('📝 Updating task:', id, updates);
      
      // Optimistic update
      setTasks(prev => prev.map(task => 
        task.id === id 
          ? { ...task, ...updates, updatedAt: new Date() }
          : task
      ));

      try {
        const response = await taskAPI.updateTask(id, updates);
        
        if (response.success && response.data) {
          const updatedTask: Task = {
            id: response.data.task._id,
            title: response.data.task.name,
            name: response.data.task.name,
            description: response.data.task.description || '',
            status: response.data.task.status,
            priority: response.data.task.priority || 'medium',
            dueDate: response.data.task.dueDate ? new Date(response.data.task.dueDate) : undefined,
            completedAt: response.data.task.completedAt ? new Date(response.data.task.completedAt) : undefined,
            tags: response.data.task.tags || [],
            estimatedHours: response.data.task.estimatedHours,
            actualHours: response.data.task.actualHours,
            isArchived: response.data.task.isArchived || false,
            attachments: response.data.task.attachments || [],
            createdAt: new Date(response.data.task.createdAt),
            updatedAt: new Date(response.data.task.updatedAt)
          };
          
          setTasks(prev => prev.map(task => 
            task.id === id ? updatedTask : task
          ));
          
          await fetchTaskStats();
          console.log('✅ Task updated successfully');
        }
      } catch (apiError) {
        console.error('❌ Failed to update on server:', apiError);
        // Keep optimistic update
      }
    } catch (error) {
      console.error('❌ Failed to update task:', error);
      await fetchTasks(); // Revert on error
      throw error;
    }
  };

  const deleteTask = async (id: string): Promise<void> => {
    try {
      console.log('🗑️ Deleting task:', id);
      
      // Optimistic update
      setTasks(prev => prev.filter(task => task.id !== id));
      
      try {
        await taskAPI.deleteTask(id);
        await fetchTaskStats();
        console.log('✅ Task deleted successfully');
      } catch (apiError) {
        console.error('❌ Failed to delete on server:', apiError);
        // Keep optimistic update
      }
    } catch (error) {
      console.error('❌ Failed to delete task:', error);
      await fetchTasks(); // Revert on error
      throw error;
    }
  };

  const archiveTask = async (id: string): Promise<void> => {
    try {
      console.log('📦 Archiving task:', id);
      await updateTask(id, { isArchived: true });
    } catch (error) {
      console.error('❌ Failed to archive task:', error);
      throw error;
    }
  };

  const restoreTask = async (id: string): Promise<void> => {
    try {
      console.log('📤 Restoring task:', id);
      await updateTask(id, { isArchived: false });
    } catch (error) {
      console.error('❌ Failed to restore task:', error);
      throw error;
    }
  };

  const updateTaskStatus = async (id: string, status: Task['status']): Promise<void> => {
    try {
      console.log('🔄 Updating task status:', id, status);
      await updateTask(id, { status });
    } catch (error) {
      console.error('❌ Failed to update task status:', error);
      throw error;
    }
  };

  const value: TaskContextType = {
    tasks,
    stats,
    overdueCount,
    addTask,
    updateTask,
    deleteTask,
    archiveTask,
    restoreTask,
    updateTaskStatus,
    fetchTasks,
    fetchTaskStats,
    isLoading,
    error
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
};