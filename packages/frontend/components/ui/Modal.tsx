'use client';

import * as React from 'react';
import { type VariantProps, cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';

/**
 * Modal Components - Alpine Tech Design System
 *
 * A set of modal components for overlays and dialogs,
 * designed for the Coach IA Hugo ultra-trail application.
 */

const modalVariants = cva(
  'fixed inset-0 z-modal flex items-center justify-center p-4',
  {
    variants: {
      variant: {
        default: '',
        center: 'items-center',
        top: 'items-start pt-16',
        bottom: 'items-end pb-16',
      },
    },
    defaultVariants: {
      variant: 'center',
    },
  }
);

const modalContentVariants = cva(
  'relative bg-surface border border-border rounded-lg shadow-xl max-h-[90vh] overflow-hidden',
  {
    variants: {
      size: {
        sm: 'max-w-sm',
        default: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        '2xl': 'max-w-2xl',
        '3xl': 'max-w-3xl',
        '4xl': 'max-w-4xl',
        '5xl': 'max-w-5xl',
        '6xl': 'max-w-6xl',
        '7xl': 'max-w-7xl',
        full: 'max-w-full mx-4',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
);

// Modal Context
interface ModalContextValue {
  isOpen: boolean;
  onClose: () => void;
}

const ModalContext = React.createContext<ModalContextValue | undefined>(undefined);

const useModal = () => {
  const context = React.useContext(ModalContext);
  if (context === undefined) {
    throw new Error('useModal must be used within a Modal');
  }
  return context;
};

// Portal Component
const Portal: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) {
    return null;
  }

  return typeof window !== 'undefined'
    ? require('react-dom').createPortal(children, document.body)
    : null;
};

// Modal Root Component
export interface ModalProps extends VariantProps<typeof modalVariants> {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  closeOnBackdropClick?: boolean;
  closeOnEsc?: boolean;
  preventScroll?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  variant,
  closeOnBackdropClick = true,
  closeOnEsc = true,
  preventScroll = true,
}) => {
  const contextValue = React.useMemo(
    () => ({ isOpen, onClose }),
    [isOpen, onClose]
  );

  // Handle escape key
  React.useEffect(() => {
    if (!isOpen || !closeOnEsc) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEsc, onClose]);

  // Prevent scroll when modal is open
  React.useEffect(() => {
    if (!isOpen || !preventScroll) return;

    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, [isOpen, preventScroll]);

  if (!isOpen) {
    return null;
  }

  return (
    <Portal>
      <ModalContext.Provider value={contextValue}>
        <div
          className={cn(modalVariants({ variant }))}
          onClick={closeOnBackdropClick ? onClose : undefined}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          aria-describedby="modal-description"
        >
          {children}
        </div>
      </ModalContext.Provider>
    </Portal>
  );
};

// Modal Backdrop Component
export interface ModalBackdropProps extends React.HTMLAttributes<HTMLDivElement> {}

const ModalBackdrop = React.forwardRef<HTMLDivElement, ModalBackdropProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'fixed inset-0 z-modal-backdrop bg-black/50 backdrop-blur-sm',
          'animate-fade-in',
          className
        )}
        {...props}
      />
    );
  }
);

ModalBackdrop.displayName = 'ModalBackdrop';

// Modal Content Component
export interface ModalContentProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof modalContentVariants> {}

const ModalContent = React.forwardRef<HTMLDivElement, ModalContentProps>(
  ({ className, size, onClick, ...props }, ref) => {
    return (
      <>
        <ModalBackdrop />
        <div
          ref={ref}
          className={cn(
            modalContentVariants({ size }),
            'animate-scale-in w-full',
            className
          )}
          onClick={(e) => {
            e.stopPropagation();
            onClick?.(e);
          }}
          {...props}
        />
      </>
    );
  }
);

ModalContent.displayName = 'ModalContent';

// Modal Header Component
export interface ModalHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  showCloseButton?: boolean;
  closeButtonAriaLabel?: string;
}

const ModalHeader = React.forwardRef<HTMLDivElement, ModalHeaderProps>(
  ({
    className,
    showCloseButton = true,
    closeButtonAriaLabel = 'Fermer',
    children,
    ...props
  }, ref) => {
    const { onClose } = useModal();

    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center justify-between p-6 border-b border-border',
          className
        )}
        {...props}
      >
        <div className="flex-1">
          {children}
        </div>
        {showCloseButton && (
          <button
            type="button"
            className="ml-4 text-muted-foreground hover:text-foreground focus-ring rounded-sm p-1"
            onClick={onClose}
            aria-label={closeButtonAriaLabel}
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    );
  }
);

ModalHeader.displayName = 'ModalHeader';

// Modal Title Component
export interface ModalTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

const ModalTitle = React.forwardRef<HTMLHeadingElement, ModalTitleProps>(
  ({ className, ...props }, ref) => {
    return (
      <h2
        ref={ref}
        id="modal-title"
        className={cn(
          'text-lg font-semibold leading-none tracking-tight',
          className
        )}
        {...props}
      />
    );
  }
);

ModalTitle.displayName = 'ModalTitle';

// Modal Description Component
export interface ModalDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

const ModalDescription = React.forwardRef<HTMLParagraphElement, ModalDescriptionProps>(
  ({ className, ...props }, ref) => {
    return (
      <p
        ref={ref}
        id="modal-description"
        className={cn('text-sm text-muted-foreground mt-1', className)}
        {...props}
      />
    );
  }
);

ModalDescription.displayName = 'ModalDescription';

// Modal Body Component
export interface ModalBodyProps extends React.HTMLAttributes<HTMLDivElement> {}

const ModalBody = React.forwardRef<HTMLDivElement, ModalBodyProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('p-6 overflow-y-auto', className)}
        {...props}
      />
    );
  }
);

ModalBody.displayName = 'ModalBody';

// Modal Footer Component
export interface ModalFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  bordered?: boolean;
}

const ModalFooter = React.forwardRef<HTMLDivElement, ModalFooterProps>(
  ({ className, bordered = true, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center justify-end gap-3 p-6',
          bordered && 'border-t border-border',
          className
        )}
        {...props}
      />
    );
  }
);

ModalFooter.displayName = 'ModalFooter';

// Confirmation Modal Component
export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'danger';
  isLoading?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  variant = 'default',
  isLoading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent size="sm">
        <ModalHeader>
          <ModalTitle>{title}</ModalTitle>
          {description && (
            <ModalDescription>{description}</ModalDescription>
          )}
        </ModalHeader>
        <ModalFooter>
          <button
            type="button"
            className="btn border border-border bg-transparent hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring px-4 py-2 text-sm"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={cn(
              'btn px-4 py-2 text-sm',
              variant === 'danger'
                ? 'bg-destructive text-destructive-foreground hover:bg-error-700'
                : 'bg-primary-600 text-white hover:bg-primary-700'
            )}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4"
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
                Chargement...
              </>
            ) : (
              confirmText
            )}
          </button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalBody,
  ModalFooter,
  ModalBackdrop,
  ConfirmationModal,
  useModal,
};
