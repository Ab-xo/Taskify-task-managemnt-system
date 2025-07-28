import { SearchIcon, LogOutIcon, TrashIcon, ChevronDownIcon } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { useAuth } from "../../contexts/AuthContext";
import { useTask } from "../../contexts/TaskContext";
import { DeleteTaskModal } from "../../components/DeleteTaskModal";

export const DashboardWelcome = (): JSX.Element => {
  const { user, logout } = useAuth();
  const { tasks, updateTaskStatus, deleteTask, updateTask } = useTask();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [hoveredTask, setHoveredTask] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const TASKS_PER_PAGE = 6;
  
  // Filter tasks based on search and filters
  const filterTasks = (taskList: typeof tasks) => {
    return taskList.filter(task => {
      // Search filter
      const matchesSearch = searchQuery === '' || 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // Priority filter
      const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
      
      // Status filter (for pending tab)
      const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
      
      return matchesSearch && matchesPriority && matchesStatus;
    });
  };
  
  const allPendingTasks = tasks.filter(task => task.status === 'pending' || task.status === 'in-progress');
  const allCompletedTasks = tasks.filter(task => task.status === 'completed');
  
  const pendingTasks = filterTasks(allPendingTasks);
  const completedTasks = filterTasks(allCompletedTasks);
  
  // Get current tasks based on active tab
  const currentTasks = activeTab === 'pending' ? pendingTasks : completedTasks;
  
  // Calculate pagination
  const totalPages = Math.ceil(currentTasks.length / TASKS_PER_PAGE);
  const startIndex = (currentPage - 1) * TASKS_PER_PAGE;
  const endIndex = startIndex + TASKS_PER_PAGE;
  const currentPageTasks = currentTasks.slice(startIndex, endIndex);
  
  // Reset to page 1 when switching tabs
  const handleTabChange = (tab: 'pending' | 'completed') => {
    setActiveTab(tab);
    setCurrentPage(1);
    setStatusFilter('all'); // Reset status filter when switching tabs
  };
  
  // Reset page when search or filters change
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };
  
  const handlePriorityFilterChange = (value: string) => {
    setPriorityFilter(value);
    setCurrentPage(1);
  };
  
  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };
  
  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setPriorityFilter('all');
    setStatusFilter('all');
    setCurrentPage(1);
  };
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleDeleteClick = (taskId: string) => {
    setTaskToDelete(taskId);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (taskToDelete) {
      deleteTask(taskToDelete);
      setTaskToDelete(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-pink-100 text-[#ec4c7d] border-pink-200';
      case 'in-progress':
        return 'bg-blue-100 text-blue-600 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-600 border-green-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'in-progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      default:
        return status;
    }
  };

  return (
    <>
      <div className="bg-white min-h-screen">
        <div className="max-w-6xl mx-auto px-4 lg:px-8 py-4 lg:py-8">
          {/* Header */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-6 lg:mb-8 gap-4">
            {/* Search bar */}
            <div className="flex items-center gap-4 px-4 lg:px-6 py-3 border border-gray-300 rounded-full w-full lg:w-96">
              <SearchIcon className="w-4 h-4 text-gray-400" />
              <Input
                className="border-0 shadow-none focus-visible:ring-0 p-0 h-auto placeholder:text-gray-400"
                type="text"
                placeholder="Search for tasks"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>

            {/* User profile section */}
            <div className="flex items-center gap-4 lg:gap-6 w-full lg:w-auto justify-between lg:justify-end">
              <span className="font-semibold text-black text-sm lg:text-base">
                {user?.name || 'Selam Girma'}
              </span>
              <Button
                onClick={handleLogout}
                variant="ghost"
                size="sm"
                className="p-2 hover:bg-gray-100"
              >
                <LogOutIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Filters Section */}
          {tasks.length > 0 && (
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-3 lg:gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700 lg:block hidden">Filters:</span>
              
              {/* Priority Filter */}
              <div className="flex items-center gap-2 w-full lg:w-auto">
                <label className="text-sm text-gray-600 min-w-fit">Priority:</label>
                <select
                  value={priorityFilter}
                  onChange={(e) => handlePriorityFilterChange(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#ec4c7d] flex-1 lg:flex-none"
                >
                  <option value="all">All</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              
              {/* Status Filter (only for pending tab) */}
              {activeTab === 'pending' && (
                <div className="flex items-center gap-2 w-full lg:w-auto">
                  <label className="text-sm text-gray-600 min-w-fit">Status:</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => handleStatusFilterChange(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#ec4c7d] flex-1 lg:flex-none"
                  >
                    <option value="all">All</option>
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                  </select>
                </div>
              )}
              
              <div className="flex items-center justify-between w-full lg:w-auto lg:ml-auto gap-3">
                {/* Clear Filters Button */}
                {(searchQuery || priorityFilter !== 'all' || statusFilter !== 'all') && (
                  <Button
                    onClick={clearFilters}
                    variant="outline"
                    size="sm"
                    className="text-sm"
                  >
                    Clear Filters
                  </Button>
                )}
                
                {/* Results Count */}
                <span className="text-sm text-gray-500">
                  {currentTasks.length} of {activeTab === 'pending' ? allPendingTasks.length : allCompletedTasks.length} tasks
                </span>
              </div>
            </div>
          )}

          {/* Show empty state if no tasks exist */}
          {tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
              <h2 className="text-xl lg:text-2xl font-bold text-black mb-4">No Task Yet</h2>
              <p className="text-gray-600 mb-8 max-w-md px-4">
                No tasks created yet, You can start by clicking the add new button below to create one
              </p>
              <Button
                onClick={() => navigate('/add-task')}
                className="bg-[#ec4c7d] hover:bg-[#d43e6b] text-white px-6 lg:px-8 py-3 rounded-lg flex items-center gap-2"
              >
                <span className="text-lg">+</span>
                Add New
              </Button>
            </div>
          ) : (
            <>
              {/* Tabs */}
              <div className="flex gap-0 mb-6 lg:mb-8">
                <button
                  onClick={() => handleTabChange('pending')}
                  className={`px-4 lg:px-6 py-3 font-medium rounded-l-lg border text-sm lg:text-base ${
                    activeTab === 'pending'
                      ? 'bg-[#ec4c7d] text-white border-[#ec4c7d]'
                      : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Pending
                </button>
                <button
                  onClick={() => handleTabChange('completed')}
                  className={`px-4 lg:px-6 py-3 font-medium rounded-r-lg border-t border-r border-b text-sm lg:text-base ${
                    activeTab === 'completed'
                      ? 'bg-[#ec4c7d] text-white border-[#ec4c7d]'
                      : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Completed
                </button>
              </div>

              {/* Content based on active tab */}
              {activeTab === 'pending' ? (
                <div>
                  {/* Header with task count and Add New button */}
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-6 gap-4">
                    <div>
                      <h2 className="text-xl lg:text-2xl font-bold text-black mb-2">
                        You've got <span className="text-[#ec4c7d]">{pendingTasks.length} task</span> today
                      </h2>
                      <h3 className="text-lg lg:text-xl font-semibold text-black">On Hold</h3>
                    </div>
                    <Button
                      onClick={() => navigate('/add-task')}
                      className="bg-[#ec4c7d] hover:bg-[#d43e6b] text-white px-4 lg:px-6 py-3 rounded-lg flex items-center gap-2 w-full lg:w-auto justify-center"
                    >
                      <span className="text-lg">+</span>
                      Add New
                    </Button>
                  </div>

                  {/* Tasks list */}
                  {currentPageTasks.length === 0 ? (
                    <div className="text-center py-16">
                      <p className="text-gray-500 text-base lg:text-lg">
                        {(searchQuery || priorityFilter !== 'all' || statusFilter !== 'all') 
                          ? 'No tasks match your filters' 
                          : 'No pending tasks'
                        }
                      </p>
                      {(searchQuery || priorityFilter !== 'all' || statusFilter !== 'all') && (
                        <Button
                          onClick={clearFilters}
                          variant="outline"
                          className="mt-4"
                        >
                          Clear Filters
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {currentPageTasks.map((task) => (
                        <div key={task.id} className="flex flex-col lg:flex-row items-start lg:items-center justify-between p-4 bg-white border border-gray-200 rounded-lg gap-4">
                          <div className="flex items-center gap-4 flex-1 min-w-0">
                            <div className="w-2 h-2 bg-[#ec4c7d] rounded-full"></div>
                            <div className="relative">
                              <div className="flex items-center gap-2">
                                <span 
                                  className="text-black font-medium cursor-pointer hover:text-[#ec4c7d] transition-colors text-sm lg:text-base break-words"
                                  onMouseEnter={() => setHoveredTask(task.id)}
                                  onMouseLeave={() => setHoveredTask(null)}
                                >
                                  {task.title}
                                </span>
                                {/* Priority Badge */}
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  task.priority === 'urgent' ? 'bg-red-100 text-red-600' :
                                  task.priority === 'high' ? 'bg-orange-100 text-orange-600' :
                                  task.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                                  'bg-gray-100 text-gray-600'
                                }`}>
                                  {task.priority || 'medium'}
                                </span>
                              </div>
                              {hoveredTask === task.id && task.description && (
                                <div className="absolute left-0 top-full mt-2 bg-gray-800 text-white text-sm rounded-lg px-3 py-2 shadow-lg z-10 max-w-xs whitespace-normal lg:block hidden">
                                  {task.description}
                                  <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-800 rotate-45"></div>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 lg:gap-4 flex-wrap lg:flex-nowrap w-full lg:w-auto">
                            <div className="relative">
                              <select
                                value={task.status}
                                onChange={(e) => updateTaskStatus(task.id, e.target.value as any)}
                                className={`appearance-none px-3 lg:px-4 py-2 rounded-lg border text-xs lg:text-sm font-medium pr-6 lg:pr-8 ${getStatusColor(task.status)}`}
                              >
                                <option value="pending">Pending</option>
                                <option value="in-progress">In Progress</option>
                                <option value="completed">Completed</option>
                              </select>
                              <ChevronDownIcon className="w-3 lg:w-4 h-3 lg:h-4 absolute right-1 lg:right-2 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                            </div>
                            <div className="relative">
                              <select
                                value={task.priority}
                                onChange={(e) => updateTask(task.id, { priority: e.target.value as any })}
                                className={`appearance-none px-2 lg:px-3 py-1 rounded-lg border text-xs font-medium pr-5 lg:pr-6 ${
                                  task.priority === 'urgent' ? 'bg-red-100 text-red-600 border-red-200' :
                                  task.priority === 'high' ? 'bg-orange-100 text-orange-600 border-orange-200' :
                                  task.priority === 'medium' ? 'bg-yellow-100 text-yellow-600 border-yellow-200' :
                                  'bg-gray-100 text-gray-600 border-gray-200'
                                }`}
                              >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="urgent">Urgent</option>
                              </select>
                              <ChevronDownIcon className="w-3 h-3 absolute right-1 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                            </div>
                            <Button
                              onClick={() => handleDeleteClick(task.id)}
                              variant="ghost"
                              size="sm"
                              className="p-2 text-red-500 hover:bg-red-50"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Pagination */}
                  {pendingTasks.length > TASKS_PER_PAGE && (
                    <div className="flex flex-col lg:flex-row items-center justify-between mt-8 gap-4">
                      <span className="text-sm text-gray-600 order-2 lg:order-1">
                        Showing {startIndex + 1} to {Math.min(endIndex, pendingTasks.length)} of {pendingTasks.length} entries
                      </span>
                      <div className="flex items-center gap-2 order-1 lg:order-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-[#ec4c7d] disabled:opacity-50 text-sm" 
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage(currentPage - 1)}
                        >
                          Previous
                        </Button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <Button
                            key={page}
                            variant="ghost"
                            size="sm"
                            className={`text-sm ${page === currentPage ? "bg-[#ec4c7d] text-white" : ""}`}
                            onClick={() => setCurrentPage(page)}
                          >
                            {page}
                          </Button>
                        ))}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-[#ec4c7d] disabled:opacity-50 text-sm" 
                          disabled={currentPage === totalPages}
                          onClick={() => setCurrentPage(currentPage + 1)}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  {/* Completed tab content */}
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-6 gap-4">
                    <div>
                      <h2 className="text-xl lg:text-2xl font-bold text-black mb-2">Completed</h2>
                      <span className="inline-block px-3 py-1 bg-pink-100 text-[#ec4c7d] rounded-full text-sm">
                        Inactive
                      </span>
                    </div>
                  </div>

                  {/* Completed tasks list */}
                  {currentPageTasks.length === 0 ? (
                    <div className="text-center py-16">
                      <p className="text-gray-500 text-base lg:text-lg">
                        {(searchQuery || priorityFilter !== 'all') 
                          ? 'No completed tasks match your filters' 
                          : 'No completed tasks'
                        }
                      </p>
                      {(searchQuery || priorityFilter !== 'all') && (
                        <Button
                          onClick={clearFilters}
                          variant="outline"
                          className="mt-4"
                        >
                          Clear Filters
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {currentPageTasks.map((task) => (
                        <div key={task.id} className="flex flex-col lg:flex-row items-start lg:items-center justify-between p-4 bg-white border border-gray-200 rounded-lg gap-4">
                          <div className="flex items-center gap-4 flex-1 min-w-0">
                            <div className="w-2 h-2 bg-[#ec4c7d] rounded-full"></div>
                            <div className="relative">
                              <div className="flex items-center gap-2">
                                <span 
                                  className="text-gray-500 font-medium cursor-pointer hover:text-[#ec4c7d] transition-colors text-sm lg:text-base break-words"
                                  onMouseEnter={() => setHoveredTask(task.id)}
                                  onMouseLeave={() => setHoveredTask(null)}
                                >
                                  {task.title}
                                </span>
                                {/* Priority Badge */}
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  task.priority === 'urgent' ? 'bg-red-100 text-red-600' :
                                  task.priority === 'high' ? 'bg-orange-100 text-orange-600' :
                                  task.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                                  'bg-gray-100 text-gray-600'
                                }`}>
                                  {task.priority || 'medium'}
                                </span>
                              </div>
                              {hoveredTask === task.id && task.description && (
                                <div className="absolute left-0 top-full mt-2 bg-gray-800 text-white text-sm rounded-lg px-3 py-2 shadow-lg z-10 max-w-xs whitespace-normal lg:block hidden">
                                  {task.description}
                                  <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-800 rotate-45"></div>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 lg:gap-4 flex-wrap lg:flex-nowrap w-full lg:w-auto">
                            <div className="relative">
                              <select
                                value={task.status}
                                onChange={(e) => updateTaskStatus(task.id, e.target.value as any)}
                                className={`appearance-none px-3 lg:px-4 py-2 rounded-lg border text-xs lg:text-sm font-medium pr-6 lg:pr-8 ${getStatusColor(task.status)}`}
                              >
                                <option value="pending">Pending</option>
                                <option value="in-progress">In Progress</option>
                                <option value="completed">Completed</option>
                              </select>
                              <ChevronDownIcon className="w-3 lg:w-4 h-3 lg:h-4 absolute right-1 lg:right-2 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                            </div>
                            <div className="relative">
                              <select
                                value={task.priority}
                                onChange={(e) => updateTask(task.id, { priority: e.target.value as any })}
                                className={`appearance-none px-2 lg:px-3 py-1 rounded-lg border text-xs font-medium pr-5 lg:pr-6 ${
                                  task.priority === 'urgent' ? 'bg-red-100 text-red-600 border-red-200' :
                                  task.priority === 'high' ? 'bg-orange-100 text-orange-600 border-orange-200' :
                                  task.priority === 'medium' ? 'bg-yellow-100 text-yellow-600 border-yellow-200' :
                                  'bg-gray-100 text-gray-600 border-gray-200'
                                }`}
                              >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="urgent">Urgent</option>
                              </select>
                              <ChevronDownIcon className="w-3 h-3 absolute right-1 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                            </div>
                            <Button
                              onClick={() => handleDeleteClick(task.id)}
                              variant="ghost"
                              size="sm"
                              className="p-2 text-red-500 hover:bg-red-50"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Pagination for completed */}
                  {completedTasks.length > TASKS_PER_PAGE && (
                    <div className="flex flex-col lg:flex-row items-center justify-between mt-8 gap-4">
                      <span className="text-sm text-gray-600 order-2 lg:order-1">
                        Showing {startIndex + 1} to {Math.min(endIndex, completedTasks.length)} of {completedTasks.length} entries
                      </span>
                      <div className="flex items-center gap-2 order-1 lg:order-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-[#ec4c7d] disabled:opacity-50 text-sm" 
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage(currentPage - 1)}
                        >
                          Previous
                        </Button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <Button
                            key={page}
                            variant="ghost"
                            size="sm"
                            className={`text-sm ${page === currentPage ? "bg-[#ec4c7d] text-white" : ""}`}
                            onClick={() => setCurrentPage(page)}
                          >
                            {page}
                          </Button>
                        ))}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-[#ec4c7d] disabled:opacity-50 text-sm" 
                          disabled={currentPage === totalPages}
                          onClick={() => setCurrentPage(currentPage + 1)}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <DeleteTaskModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        taskTitle={taskToDelete ? tasks.find(t => t.id === taskToDelete)?.title || '' : ''}
      />
    </>
  );
};