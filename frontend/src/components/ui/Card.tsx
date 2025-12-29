import { HTMLAttributes, forwardRef } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', hover = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`${hover ? 'card-hover' : 'card'} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export const CardHeader = ({ className = '', children, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={`px-6 py-4 border-b border-gray-100 dark:border-gray-800 ${className}`} {...props}>
    {children}
  </div>
);

export const CardContent = ({ className = '', children, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={`px-6 py-4 ${className}`} {...props}>
    {children}
  </div>
);

export const CardFooter = ({ className = '', children, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={`px-6 py-4 border-t border-gray-100 dark:border-gray-800 ${className}`} {...props}>
    {children}
  </div>
);

export default Card;
