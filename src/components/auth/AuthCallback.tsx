import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { toast } from '../ui/use-toast'

export function AuthCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth callback error:', error)
          setStatus('error')
          setMessage(error.message || 'Authentication failed')
          return
        }

        // Check if we have a session and user
        if (data.session && data.session.user) {
          const user = data.session.user
          
          // Check if email is confirmed
          if (user.email_confirmed_at) {
            setStatus('success')
            setMessage('Email verified successfully!')
            
            toast({
              title: "Success!",
              description: "Email verified! Welcome to the platform.",
              variant: "default"
            })
            
            // Redirect to dashboard after a short delay
            setTimeout(() => {
              navigate('/dashboard', { replace: true })
            }, 2000)
          } else {
            // Email not confirmed yet
            setStatus('error')
            setMessage('Email verification is still pending. Please check your email.')
            
            setTimeout(() => {
              navigate('/auth/verify-email', { replace: true })
            }, 3000)
          }
        } else {
          // No session found
          setStatus('error')
          setMessage('No authentication session found.')
          
          setTimeout(() => {
            navigate('/auth/login', { replace: true })
          }, 3000)
        }
      } catch (error) {
        console.error('Unexpected error in auth callback:', error)
        setStatus('error')
        setMessage('An unexpected error occurred during authentication.')
      }
    }

    handleAuthCallback()
  }, [navigate, searchParams])

  const handleRetry = () => {
    navigate('/auth/login', { replace: true })
  }

  const handleGoToDashboard = () => {
    navigate('/dashboard', { replace: true })
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {status === 'loading' && (
              <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
            )}
            {status === 'success' && (
              <CheckCircle className="h-12 w-12 text-green-600" />
            )}
            {status === 'error' && (
              <XCircle className="h-12 w-12 text-red-600" />
            )}
          </div>
          <CardTitle className="text-2xl font-semibold">
            {status === 'loading' && 'Verifying your email...'}
            {status === 'success' && 'Email Verified!'}
            {status === 'error' && 'Verification Failed'}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            {message}
          </p>
          
          {status === 'loading' && (
            <p className="text-sm text-gray-500">
              Please wait while we verify your email address...
            </p>
          )}
          
          {status === 'success' && (
            <div className="space-y-3">
              <p className="text-sm text-green-600">
                You will be redirected to the dashboard shortly.
              </p>
              <Button 
                onClick={handleGoToDashboard}
                className="w-full"
              >
                Go to Dashboard
              </Button>
            </div>
          )}
          
          {status === 'error' && (
            <div className="space-y-3">
              <p className="text-sm text-gray-500">
                You will be redirected to the login page shortly.
              </p>
              <Button 
                onClick={handleRetry}
                variant="outline"
                className="w-full"
              >
                Back to Login
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}