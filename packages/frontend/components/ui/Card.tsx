import * as React from 'react';
import { type VariantProps, cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';

/**
 * Card Components - Alpine Tech Design System
 *
 * A set of card components for displaying content in containers,
 * designed for the SummitStride ultra-trail application.
 */

const cardVariants = cva(
  'card rounded-lg border bg-surface text-foreground shadow-sm',
  {
    variants: {
      variant: {
        default: 'border-border',
        outline: 'border-2 border-border',
        elevated: 'border-border shadow-md',
        ghost: 'border-transparent shadow-none bg-transparent',
        gradient: 'border-border bg-gradient-alpine text-white',
      },
      padding: {
        none: 'p-0',
        sm: 'p-4',
        default: 'p-6',
        lg: 'p-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'default',
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(cardVariants({ variant, padding }), className)}
        {...props}
      />
    );
  }
);

Card.displayName = 'Card';

// Card Header Component
export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  bordered?: boolean;
}

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, bordered = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col space-y-1.5 p-6',
          bordered && 'border-b border-border',
          className
        )}
        {...props}
      />
    );
  }
);

CardHeader.displayName = 'CardHeader';

// Card Title Component
export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

const CardTitle = React.forwardRef<HTMLParagraphElement, CardTitleProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <h3
        ref={ref}
        className={cn(
          'text-2xl font-semibold leading-none tracking-tight',
          className
        )}
        {...props}
      >
        {children}
      </h3>
    );
  }
);

CardTitle.displayName = 'CardTitle';

// Card Description Component
export interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

const CardDescription = React.forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={cn('text-sm text-muted-foreground', className)}
        {...props}
      />
    );
  }
);

CardDescription.displayName = 'CardDescription';

// Card Content Component
export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  noPadding?: boolean;
}

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, noPadding = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          noPadding ? 'p-0' : 'p-6 pt-0',
          className
        )}
        {...props}
      />
    );
  }
);

CardContent.displayName = 'CardContent';

// Card Footer Component
export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  bordered?: boolean;
}

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, bordered = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center p-6 pt-0',
          bordered && 'border-t border-border pt-6',
          className
        )}
        {...props}
      />
    );
  }
);

CardFooter.displayName = 'CardFooter';

// Specialized Card Components for Trail Running

// Stats Card Component
export interface StatsCardProps extends Omit<CardProps, 'children'> {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const StatsCard = React.forwardRef<HTMLDivElement, StatsCardProps>(
  ({ className, title, value, subtitle, icon, trend, ...props }, ref) => {
    return (
      <Card
        ref={ref}
        className={cn('relative overflow-hidden', className)}
        {...props}
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                {title}
              </p>
              <p className="text-2xl font-bold">
                {value}
              </p>
              {subtitle && (
                <p className="text-xs text-muted-foreground">
                  {subtitle}
                </p>
              )}
            </div>
            {icon && (
              <div className="text-muted-foreground">
                {icon}
              </div>
            )}
          </div>
          {trend && (
            <div className="mt-4 flex items-center space-x-1 text-sm">
              <span
                className={cn(
                  'flex items-center',
                  trend.isPositive ? 'text-success-600' : 'text-error-600'
                )}
              >
                {trend.isPositive ? (
                  <svg
                    className="h-4 w-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 17l9.2-9.2M17 17V7H7"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-4 w-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 7l-9.2 9.2M7 7v10h10"
                    />
                  </svg>
                )}
                {Math.abs(trend.value)}%
              </span>
              <span className="text-muted-foreground">
                vs. période précédente
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }
);

StatsCard.displayName = 'StatsCard';

// Course Card Component
export interface CourseCardProps extends Omit<CardProps, 'children'> {
  course: {
    id: string;
    name: string;
    location: string;
    distance: number;
    elevationGain: number;
    difficulty: string;
    description?: string;
  };
  onSelect?: (courseId: string) => void;
  isSelected?: boolean;
}

const CourseCard = React.forwardRef<HTMLDivElement, CourseCardProps>(
  ({ className, course, onSelect, isSelected = false, ...props }, ref) => {
    const difficultyColors = {
      EASY: 'text-success-600 bg-success-50',
      MODERATE: 'text-warning-600 bg-warning-50',
      HARD: 'text-error-600 bg-error-50',
      EXTREME: 'text-error-700 bg-error-100',
    } as const;

    return (
      <Card
        ref={ref}
        className={cn(
          'cursor-pointer transition-all hover:shadow-md',
          isSelected && 'ring-2 ring-primary-600',
          className
        )}
        onClick={() => onSelect?.(course.id)}
        {...props}
      >
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1 flex-1">
              <CardTitle className="text-lg">{course.name}</CardTitle>
              <CardDescription>{course.location}</CardDescription>
            </div>
            <span
              className={cn(
                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                difficultyColors[course.difficulty as keyof typeof difficultyColors] ||
                  'text-neutral-600 bg-neutral-50'
              )}
            >
              {course.difficulty}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center">
              <svg
                className="h-4 w-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
              {course.distance}km
            </div>
            <div className="flex items-center">
              <svg
                className="h-4 w-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 11l5-5m0 0l5 5m-5-5v12"
                />
              </svg>
              {course.elevationGain}m D+
            </div>
          </div>
          {course.description && (
            <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
              {course.description}
            </p>
          )}
        </CardContent>
      </Card>
    );
  }
);

CourseCard.displayName = 'CourseCard';

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  StatsCard,
  CourseCard,
  cardVariants,
};
