import React from 'react';

interface BadgeProps {
  variant?: 'cyan' | 'emerald' | 'amber' | 'rose';
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'cyan',
  icon,
  children,
  className = '',
}) => {
  return (
    <span className={`badge badge-${variant} ${className}`}>
      {icon && <span className="badge-icon flex-center">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
