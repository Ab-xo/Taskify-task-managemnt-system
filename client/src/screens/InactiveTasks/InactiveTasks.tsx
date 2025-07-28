import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { useTask } from '../../contexts/TaskContext';

export const InactiveTasks: React.FC = () => {
  const { tasks } = useTask();
  const navigate = useNavigate();
  
  const completedTasks = tasks.filter(task => task.status === 'completed');

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
            Completed Tasks ({completedTasks.length})
          </h1>
        </div>

        {/* Tasks List */}
        {completedTasks.length === 0 ? (
          <div className="text-center py-16">
            <h2 className="text-xl font-semibold text-black mb-4">No Completed Tasks</h2>
            <p className="text-gray-600 mb-6">
              You haven't completed any tasks yet. Start working on your active tasks!
            </p>
            <Button
              onClick={() => navigate('/active-tasks')}
              className="bg-[#ec4c7d] hover:bg-[#d43e6b] text-white px-6 py-2"
            >
              View Active Tasks
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {completedTasks.map((task) => (
              <div key={task.id} className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm opacity-75">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-black text-lg mb-2 line-through">
                      {task.title}
                    </h3>
                    {task.description && (
                      <p className="text-gray-600 text-sm mb-3 line-through">
                        {task.description}
                      </p>
                    )}
                    <div className="text-xs text-gray-500 space-y-1">
                      <p>Created: {task.createdAt.toLocaleDateString()}</p>
                      <p>Completed: {task.updatedAt.toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div className="ml-4">
                    <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-sm font-medium">
                      Completed
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