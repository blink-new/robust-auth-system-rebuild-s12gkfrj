import React, { useState } from 'react'
import { Mail, RefreshCw, CheckCircle } from 'lucide-react'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { AuthService } from '../../services/authService'
import { useAuthErrors } from '../../hooks/useAuthErrors'
import { useAuth } from '../../hooks/useAuth'
import { toast } from 'react-hot-toast'

export function EmailVerification() {
  const [isResending, setIsResending] = useState(false)
  const [lastSentAt, setLastSentAt] = useState<Date | null>(null)
  const { user } = useAuth()
  const { handleAuthError } = useAuthErrors()

  const handleResendEmail = async () => {
    if (!user?.email) {
      toast.error('No email address found')
      return
    }

    // Prevent spam - only allow resend every 60 seconds
    if (lastSentAt && Date.now() - lastSentAt.getTime() < 60000) {
      const remainingTime = Math.ceil((60000 - (Date.now() - lastSentAt.getTime())) / 1000)
      toast.error(`Please wait ${remainingTime} seconds before resending`)
      return
    }

    setIsResending(true)

    try {
      const { error } = await AuthService.resendConfirmation(user.email)
      
      if (error) {
        handleAuthError(error, 'Failed to resend verification email')
      } else {
        setLastSentAt(new Date())
        toast.success('Verification email sent! Please check your inbox.', {
          duration: 5000,
          style: {
            background: '#dcfce7',
            color: '#166534',
            border: '1px solid #bbf7d0'
          }
        })
      }
    } catch (error) {
      console.error('Resend email error:', error)
      toast.error('An unexpected error occurred. Please try again.')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <Mail className="w-8 h-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-semibold">
            Verify your email
          </CardTitle>
          <CardDescription className="text-center">
            We've sent a verification link to{' '}
            <span className="font-medium text-gray-900">{user?.email}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium">Check your email</p>
                  <p className="mt-1">
                    Click the verification link in the email we sent you. 
                    If you don't see it, check your spam folder.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-sm text-gray-600">
              <p>Didn't receive the email?</p>
            </div>

            <Button 
              onClick={handleResendEmail}
              disabled={isResending}
              variant="outline"
              className="w-full"
            >
              {isResending ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Resend verification email
                </>
              )}
            </Button>

            {lastSentAt && (
              <p className="text-xs text-green-600">
                Email sent at {lastSentAt.toLocaleTimeString()}
              </p>
            )}
          </div>

          <div className="border-t pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Need help?{' '}
                <a 
                  href="mailto:support@example.com" 
                  className="text-primary hover:underline font-medium"
                >
                  Contact support
                </a>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}