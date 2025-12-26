'use client'

import { InputHTMLAttributes, forwardRef } from 'react'
import styles from './FormField.module.css'

export interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  success?: string
  touched?: boolean
}

const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, success, touched, className = '', id, ...props }, ref) => {
    const inputId = id || `field-${label}`
    const showError = touched && error
    const showSuccess = touched && success && !error

    return (
      <div className={styles.field}>
        <label htmlFor={inputId} className={styles.label}>
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          className={`${styles.input} ${
            showError ? styles.inputError : ''
          } ${
            showSuccess ? styles.inputSuccess : ''
          } ${className}`}
          {...props}
        />
        {showError && <p className={styles.error}>{error}</p>}
        {showSuccess && <p className={styles.success}>{success}</p>}
      </div>
    )
  }
)

FormField.displayName = 'FormField'

export default FormField

