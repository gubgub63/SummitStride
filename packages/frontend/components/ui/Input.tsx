import * as React from 'react';
import { type VariantProps, cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';

/**
 * Input Component - Alpine Tech Design System
 *
 * A versatile input component with validation states and icons,
 * designed for the SummitStride ultra-trail application.
 */

const inputVariants = cva(
  // Base styles
  'input flex h-12 w-full rounded-2xl border border-border/60 bg-background/80 px-4 py-3 text-sm transition-all duration-200 ease-out file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-200 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 backdrop-blur-sm',
  {
    variants: {
      variant: {
        default: 'border-border/60 focus-visible:ring-primary-200',
        error: 'border-error-500 focus-visible:ring-error-400 text-error-600',
        success: 'border-success-500 focus-visible:ring-success-400 text-success-600',
        warning: 'border-warning-500 focus-visible:ring-warning-400 text-warning-600',
      },
      inputSize: {
        sm: 'h-9 rounded-xl px-3 py-2 text-xs',
        default: 'h-12 rounded-2xl px-4 py-3 text-sm',
        lg: 'h-14 rounded-3xl px-5 py-3 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      inputSize: 'default',
    },
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  label?: string;
  helperText?: string;
  errorMessage?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isRequired?: boolean;
  isLoading?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({
    className,
    variant = 'default',
    inputSize = 'default',
    type = 'text',
    label,
    helperText,
    errorMessage,
    leftIcon,
    rightIcon,
    isRequired = false,
    isLoading = false,
    id,
    ...props
  }, ref) => {
    const inputId = id || React.useId();
    const helperTextId = `${inputId}-helper-text`;
    const errorId = `${inputId}-error`;

    // Determine the variant based on error state
    const effectiveVariant = errorMessage ? 'error' : variant;

    const hasLeftIcon = leftIcon || isLoading;
    const hasRightIcon = rightIcon;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-2 block text-sm font-semibold leading-none text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {label}
            {isRequired && (
              <span className="text-error-500 ml-1" aria-label="Required">
                *
              </span>
            )}
          </label>
        )}

        <div className="relative">
          {hasLeftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {isLoading ? (
                <svg
                  className="animate-spin h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : (
                leftIcon
              )}
            </div>
          )}

          <input
            type={type}
            className={cn(
              inputVariants({ variant: effectiveVariant, inputSize }),
              hasLeftIcon && 'pl-10',
              hasRightIcon && 'pr-10',
              className
            )}
            ref={ref}
            id={inputId}
            aria-invalid={errorMessage ? 'true' : 'false'}
            aria-describedby={cn(
              helperText && helperTextId,
              errorMessage && errorId
            )}
            {...props}
          />

          {hasRightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {rightIcon}
            </div>
          )}
        </div>

        {(helperText || errorMessage) && (
          <div className="mt-2">
            {errorMessage ? (
              <p
                id={errorId}
                className="text-sm text-error-600 flex items-center gap-1"
                role="alert"
              >
                <svg
                  className="h-4 w-4 flex-shrink-0"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
                    clipRule="evenodd"
                  />
                </svg>
                {errorMessage}
              </p>
            ) : helperText ? (
              <p
                id={helperTextId}
                className="text-sm text-muted-foreground"
              >
                {helperText}
              </p>
            ) : null}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input, inputVariants };
