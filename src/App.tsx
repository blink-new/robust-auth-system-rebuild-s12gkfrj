import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { LoginForm } from './components/auth/LoginForm'
import { RegisterForm } from './components/auth/RegisterForm'
import { EmailVerification } from './components/auth/EmailVerification'
import { Dashboard } from './components/Dashboard'
import { Toaster } from 'react-hot-toast'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Public Routes */}
            <Route 
              path="/auth/login" 
              element={
                <ProtectedRoute requireAuth={false}>
                  <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                    <LoginForm />
                  </div>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/auth/register" 
              element={
                <ProtectedRoute requireAuth={false}>
                  <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                    <RegisterForm />
                  </div>
                </ProtectedRoute>
              } 
            />
            
            {/* Email Verification Route */}
            <Route 
              path="/auth/verify-email" 
              element={
                <ProtectedRoute requireAuth={true} requireEmailConfirmed={false}>
                  <EmailVerification />
                </ProtectedRoute>
              } 
            />
            
            {/* Protected Routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute 
                  requireAuth={true} 
                  requireEmailConfirmed={true}
                >
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Admin Only Routes */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute 
                  requireAuth={true} 
                  requireEmailConfirmed={true}
                  allowedRoles={['admin']}
                >
                  <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
                      <p className="text-gray-600">Welcome to the admin dashboard</p>
                    </div>
                  </div>
                </ProtectedRoute>
              } 
            />
            
            {/* Unauthorized Route */}
            <Route 
              path="/unauthorized" 
              element={
                <div className="min-h-screen flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <h1 className="text-3xl font-bold text-red-600">Access Denied</h1>
                    <p className="text-gray-600">You don't have permission to access this page.</p>
                  </div>
                </div>
              } 
            />
            
            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* Catch all route */}
            <Route 
              path="*" 
              element={
                <div className="min-h-screen flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <h1 className="text-3xl font-bold text-gray-900">Page Not Found</h1>
                    <p className="text-gray-600">The page you're looking for doesn't exist.</p>
                  </div>
                </div>
              } 
            />
          </Routes>
        </div>
      </Router>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#333',
            border: '1px solid #e5e7eb'
          }
        }}
      />
    </AuthProvider>
  )
}

export default App