import React, { useState } from 'react'
import { LogOut, User, Settings, Shield, CheckCircle, Clock } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { AuthService } from '../services/authService'
import { useAuth } from '../hooks/useAuth'
import { useAuthErrors } from '../hooks/useAuthErrors'
import { toast } from 'react-hot-toast'

export function Dashboard() {
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const { user, profile, role, isEmailConfirmed, isOnboardingCompleted } = useAuth()
  const { handleAuthError } = useAuthErrors()

  const handleLogout = async () => {
    setIsLoggingOut(true)

    try {
      const { error } = await AuthService.signOut()
      
      if (error) {
        handleAuthError(error, 'Sign out failed')
      } else {
        toast.success('Signed out successfully', {
          duration: 3000,
          style: {
            background: '#dcfce7',
            color: '#166534',
            border: '1px solid #bbf7d0'
          }
        })
      }
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('An unexpected error occurred during sign out')
    } finally {
      setIsLoggingOut(false)
    }
  }

  const getStatusBadge = () => {
    if (!isEmailConfirmed) {
      return <Badge variant="destructive">Email not verified</Badge>
    }
    if (!isOnboardingCompleted) {
      return <Badge variant="secondary">Setup incomplete</Badge>
    }
    return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>
  }

  const getRoleBadge = () => {
    if (role === 'admin') {
      return <Badge variant="default" className="bg-purple-100 text-purple-800">Admin</Badge>
    }
    return <Badge variant="outline">User</Badge>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">
                Professional Auth System
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">{user?.email}</span>
                {getRoleBadge()}
              </div>
              <Button 
                onClick={handleLogout}
                disabled={isLoggingOut}
                variant="outline"
                size="sm"
              >
                {isLoggingOut ? (
                  <>
                    <Clock className="mr-2 h-4 w-4 animate-spin" />
                    Signing out...
                  </>
                ) : (
                  <>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Welcome Section */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Welcome back!
                </h2>
                <p className="text-gray-600 mt-1">
                  You're successfully signed in to your account.
                </p>
              </div>
              <div className="text-right">
                {getStatusBadge()}
              </div>
            </div>
          </div>

          {/* Account Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Email Verification Status */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Email Verification
                </CardTitle>
                {isEmailConfirmed ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <Clock className="h-4 w-4 text-orange-500" />
                )}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isEmailConfirmed ? 'Verified' : 'Pending'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {isEmailConfirmed 
                    ? 'Your email address has been verified'
                    : 'Please check your email to verify your account'
                  }
                </p>
              </CardContent>
            </Card>

            {/* Onboarding Status */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Account Setup
                </CardTitle>
                {isOnboardingCompleted ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <Settings className="h-4 w-4 text-blue-600" />
                )}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isOnboardingCompleted ? 'Complete' : 'In Progress'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {isOnboardingCompleted 
                    ? 'Your account setup is complete'
                    : 'Complete your profile setup'
                  }
                </p>
              </CardContent>
            </Card>

            {/* Role & Permissions */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Account Role
                </CardTitle>
                <Shield className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold capitalize">
                  {role || 'User'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {role === 'admin' 
                    ? 'Full system access and management'
                    : 'Standard user permissions'
                  }
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>
                Your account details and current status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Email Address</label>
                  <p className="text-sm text-gray-900">{user?.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Account Created</label>
                  <p className="text-sm text-gray-900">
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Display Name</label>
                  <p className="text-sm text-gray-900">
                    {profile?.display_name || 'Not set'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">User ID</label>
                  <p className="text-sm text-gray-900 font-mono">{user?.id}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Admin Section */}
          {role === 'admin' && (
            <Card className="border-purple-200 bg-purple-50">
              <CardHeader>
                <CardTitle className="text-purple-900">Admin Panel</CardTitle>
                <CardDescription className="text-purple-700">
                  Administrative functions and system management
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <Shield className="w-8 h-8 text-purple-600" />
                  <div>
                    <p className="font-medium text-purple-900">
                      Administrator Access
                    </p>
                    <p className="text-sm text-purple-700">
                      You have full access to system administration features.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}