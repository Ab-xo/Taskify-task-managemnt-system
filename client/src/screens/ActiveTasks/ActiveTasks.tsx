import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { useTask } from '../../contexts/TaskContext';

export const ActiveTasks: React.FC = () => {
  const { tasks } = useTask();
  const navigate = useNavigate();
  
  const activeTasks = tasks.filter(task => task.status !== 'completed');

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-6xl mx-auto px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="p-2 hover:bg-gray-100"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold text-black">
            Active Tasks ({activeTasks.length})
          </h1>
        </div>

        {/* Tasks List */}
        {activeTasks.length === 0 ? (
          <div className="text-center py-16">
            <h2 className="text-xl font-semibold text-black mb-4">No Active Tasks</h2>
            <p className="text-gray-600 mb-6">
              All your tasks are completed! Great job on staying productive.
            </p>
            <Button
              onClick={() => navigate('/add-task')}
              className="bg-[#ec4c7d] hover:bg-[#d43e6b] text-white px-6 py-2"
            >
              Add New Task
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {activeTasks.map((task) => (
              <div key={task.id} className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-black text-lg mb-2">
                      {task.title}
                    </h3>
                    {task.description && (
                      <p className="text-gray-600 text-sm mb-3">
                        {task.description}
                      </p>
                    )}
                    <p className="text-xs text-gray-500">
                      Created: {task.createdAt.toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="ml-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      task.status === 'pending' 
                        ? 'bg-pink-100 text-[#ec4c7d]'
                        : 'bg-blue-100 text-blue-600'
                    }`}>
                      {task.status === 'pending' ? 'Pending' : 'In Progress'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};