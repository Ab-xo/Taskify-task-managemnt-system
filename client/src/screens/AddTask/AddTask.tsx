import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, PlusIcon } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent } from '../../components/ui/card';
import { useTask } from '../../contexts/TaskContext';

export const AddTask: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const { addTask } = useTask();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      addTask(title.trim(), description.trim() || undefined, priority);
      navigate('/dashboard');
    }
  };

  const getPriorityColor = (priorityLevel: string) => {
    switch (priorityLevel) {
      case 'urgent':
        return 'bg-red-100 text-red-600 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-600 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-600 border-yellow-200';
      case 'low':
        return 'bg-gray-100 text-gray-600 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-4xl mx-auto px-4 lg:px-8 py-4 lg:py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6 lg:mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="p-2 hover:bg-gray-100"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </Button>
          <h1 className="text-xl lg:text-2xl font-bold text-black">Add New Task</h1>
        </div>

        {/* Add Task Form */}
        <Card className="max-w-2xl border border-gray-200 shadow-sm">
          <CardContent className="p-4 lg:p-8">
            <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium text-black">
                  Task Title *
                </label>
                <Input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter task title"
                  required
                  className="h-12 border-gray-300 focus:border-[#ec4c7d] focus:ring-[#ec4c7d] text-base"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium text-black">
                  Description (Optional)
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter task description"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ec4c7d] focus:border-[#ec4c7d] resize-none text-base"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="priority" className="text-sm font-medium text-black">
                  Priority
                </label>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                  {(['low', 'medium', 'high', 'urgent'] as const).map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setPriority(level)}
                      className={`px-3 py-2 rounded-lg border text-sm font-medium capitalize transition-all ${
                        priority === level
                          ? getPriorityColor(level)
                          : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500">
                  Selected: <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(priority)}`}>
                    {priority}
                  </span>
                </p>
              </div>

              <div className="flex flex-col lg:flex-row gap-3 lg:gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/dashboard')}
                  className="flex-1 h-12 border-gray-300 text-black hover:bg-gray-50 order-2 lg:order-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 h-12 bg-[#ec4c7d] hover:bg-[#d43e6b] text-white flex items-center justify-center gap-2 order-1 lg:order-2"
                >
                  <PlusIcon className="w-4 h-4" />
                  Add Task
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};