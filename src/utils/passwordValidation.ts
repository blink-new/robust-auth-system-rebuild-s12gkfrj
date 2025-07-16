export interface PasswordRequirement {
  id: string
  label: string
  test: (password: string) => boolean
  met: boolean
}

export interface PasswordValidation {
  isValid: boolean
  score: number
  requirements: PasswordRequirement[]
  strength: 'weak' | 'fair' | 'good' | 'strong'
}

const PASSWORD_REQUIREMENTS = [
  {
    id: 'length',
    label: 'At least 8 characters',
    test: (password: string) => password.length >= 8
  },
  {
    id: 'uppercase',
    label: 'One uppercase letter',
    test: (password: string) => /[A-Z]/.test(password)
  },
  {
    id: 'lowercase',
    label: 'One lowercase letter',
    test: (password: string) => /[a-z]/.test(password)
  },
  {
    id: 'number',
    label: 'One number',
    test: (password: string) => /\d/.test(password)
  },
  {
    id: 'special',
    label: 'One special character (!@#$%^&*)',
    test: (password: string) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)
  }
]

export function validatePassword(password: string): PasswordValidation {
  const requirements = PASSWORD_REQUIREMENTS.map(req => ({
    ...req,
    met: req.test(password)
  }))

  const metRequirements = requirements.filter(req => req.met).length
  const isValid = metRequirements >= 4 && password.length >= 8
  
  // Calculate score (0-100)
  const score = Math.min(100, (metRequirements / PASSWORD_REQUIREMENTS.length) * 100)
  
  // Determine strength
  let strength: 'weak' | 'fair' | 'good' | 'strong'
  if (score < 40) {
    strength = 'weak'
  } else if (score < 60) {
    strength = 'fair'
  } else if (score < 80) {
    strength = 'good'
  } else {
    strength = 'strong'
  }

  return {
    isValid,
    score,
    requirements,
    strength
  }
}

export function getPasswordStrengthColor(strength: string): string {
  switch (strength) {
    case 'weak':
      return 'bg-red-500'
    case 'fair':
      return 'bg-orange-500'
    case 'good':
      return 'bg-yellow-500'
    case 'strong':
      return 'bg-green-500'
    default:
      return 'bg-gray-300'
  }
}

export function getPasswordStrengthText(strength: string): string {
  switch (strength) {
    case 'weak':
      return 'Weak'
    case 'fair':
      return 'Fair'
    case 'good':
      return 'Good'
    case 'strong':
      return 'Strong'
    default:
      return 'Enter password'
  }
}