import React from 'react'
import { Check, X } from 'lucide-react'
import { validatePassword, getPasswordStrengthColor, getPasswordStrengthText } from '../../utils/passwordValidation'

interface PasswordStrengthIndicatorProps {
  password: string
  showRequirements?: boolean
}

export function PasswordStrengthIndicator({ 
  password, 
  showRequirements = true 
}: PasswordStrengthIndicatorProps) {
  const validation = validatePassword(password)
  
  if (!password) {
    return null
  }

  return (
    <div className="mt-2 space-y-2">
      {/* Strength Bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-gray-600">Password strength</span>
          <span className={`font-medium ${
            validation.strength === 'weak' ? 'text-red-600' :
            validation.strength === 'fair' ? 'text-orange-600' :
            validation.strength === 'good' ? 'text-yellow-600' :
            'text-green-600'
          }`}>
            {getPasswordStrengthText(validation.strength)}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              getPasswordStrengthColor(validation.strength)
            }`}
            style={{ width: `${validation.score}%` }}
          />
        </div>
      </div>

      {/* Requirements List */}
      {showRequirements && (
        <div className="space-y-1">
          <p className="text-xs text-gray-600 font-medium">Password requirements:</p>
          <div className="space-y-1">
            {validation.requirements.map((req) => (
              <div key={req.id} className="flex items-center gap-2 text-xs">
                {req.met ? (
                  <Check className="w-3 h-3 text-green-600" />
                ) : (
                  <X className="w-3 h-3 text-gray-400" />
                )}
                <span className={req.met ? 'text-green-600' : 'text-gray-500'}>
                  {req.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}