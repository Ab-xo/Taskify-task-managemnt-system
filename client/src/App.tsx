import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { TaskProvider } from './contexts/TaskContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './screens/Login';
import { Signup } from './screens/Signup';
import { DashboardWelcome } from './screens/DashboardWelcome';
import { AddTask } from './screens/AddTask';
import { ActiveTasks } from './screens/ActiveTasks';
import { InactiveTasks } from './screens/InactiveTasks';

function App() {
  return (
    <AuthProvider>
      <TaskProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardWelcome />
              </ProtectedRoute>
            } />
            <Route path="/add-task" element={
              <ProtectedRoute>
                <AddTask />
              </ProtectedRoute>
            } />
            <Route path="/active-tasks" element={
              <ProtectedRoute>
                <ActiveTasks />
              </ProtectedRoute>
            } />
            <Route path="/inactive-tasks" element={
              <ProtectedRoute>
                <InactiveTasks />
              </ProtectedRoute>
            } />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </TaskProvider>
    </AuthProvider>
  );
}

export default App;