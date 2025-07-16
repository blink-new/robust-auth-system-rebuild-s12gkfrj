import { useState, useCallback } from 'react'
import { UserService } from '../services/userService'
import { useAuth } from './useAuth'
import { toast } from 'react-hot-toast'

export interface OnboardingStep {
  id: string
  title: string
  description: string
  completed: boolean
}

export interface OnboardingState {
  currentStep: number
  steps: OnboardingStep[]
  isCompleting: boolean
  canSkip: boolean
}

const DEFAULT_STEPS: Omit<OnboardingStep, 'completed'>[] = [
  {
    id: 'welcome',
    title: 'Welcome!',
    description: 'Welcome to our platform. Let\'s get you set up.'
  },
  {
    id: 'profile',
    title: 'Complete Your Profile',
    description: 'Add your display name and other profile information.'
  },
  {
    id: 'preferences',
    title: 'Set Your Preferences',
    description: 'Customize your experience with your preferences.'
  },
  {
    id: 'complete',
    title: 'You\'re All Set!',
    description: 'Your account is ready to use.'
  }
]

export function useOnboarding() {
  const { user, isOnboardingCompleted, refreshProfile } = useAuth()
  
  const [state, setState] = useState<OnboardingState>({
    currentStep: 0,
    steps: DEFAULT_STEPS.map(step => ({ ...step, completed: false })),
    isCompleting: false,
    canSkip: true
  })

  const nextStep = useCallback(() => {
    setState(prev => {
      const newStep = Math.min(prev.currentStep + 1, prev.steps.length - 1)
      const newSteps = [...prev.steps]
      if (prev.currentStep < newSteps.length) {
        newSteps[prev.currentStep].completed = true
      }
      
      return {
        ...prev,
        currentStep: newStep,
        steps: newSteps
      }
    })
  }, [])

  const previousStep = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentStep: Math.max(prev.currentStep - 1, 0)
    }))
  }, [])

  const goToStep = useCallback((stepIndex: number) => {
    setState(prev => ({
      ...prev,
      currentStep: Math.max(0, Math.min(stepIndex, prev.steps.length - 1))
    }))
  }, [])

  const completeOnboarding = useCallback(async () => {
    if (!user) {
      toast.error('User not found')
      return false
    }

    setState(prev => ({ ...prev, isCompleting: true }))

    try {
      const success = await UserService.completeOnboarding(user.id)
      
      if (success) {
        // Mark all steps as completed
        setState(prev => ({
          ...prev,
          steps: prev.steps.map(step => ({ ...step, completed: true })),
          currentStep: prev.steps.length - 1,
          isCompleting: false
        }))
        
        // Refresh the auth profile to update the onboarding status
        await refreshProfile()
        
        toast.success('Onboarding completed successfully!', {
          duration: 3000,
          style: {
            background: '#dcfce7',
            color: '#166534',
            border: '1px solid #bbf7d0'
          }
        })
        
        return true
      } else {
        toast.error('Failed to complete onboarding. Please try again.')
        return false
      }
    } catch (error) {
      console.error('Error completing onboarding:', error)
      toast.error('An error occurred while completing onboarding')
      return false
    } finally {
      setState(prev => ({ ...prev, isCompleting: false }))
    }
  }, [user, refreshProfile])

  const skipOnboarding = useCallback(async () => {
    if (!state.canSkip) return false
    return await completeOnboarding()
  }, [state.canSkip, completeOnboarding])

  const resetOnboarding = useCallback(() => {
    setState({
      currentStep: 0,
      steps: DEFAULT_STEPS.map(step => ({ ...step, completed: false })),
      isCompleting: false,
      canSkip: true
    })
  }, [])

  return {
    ...state,
    isOnboardingCompleted,
    nextStep,
    previousStep,
    goToStep,
    completeOnboarding,
    skipOnboarding,
    resetOnboarding,
    currentStepData: state.steps[state.currentStep],
    progress: ((state.currentStep + 1) / state.steps.length) * 100,
    isLastStep: state.currentStep === state.steps.length - 1,
    isFirstStep: state.currentStep === 0
  }
}