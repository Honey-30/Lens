/**
 * Premium Card Component
 * Glassmorphism and sophisticated shadows
 */

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { DesignSystem } from '../../styles/designSystem';

interface CardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  glass?: boolean;
  elevated?: boolean;
  padding?: keyof typeof DesignSystem.spacing;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  glass = false,
  elevated = true,
  padding = '6',
  onClick,
  style,
  ...props
}) => {
  const isInteractive = !!onClick;

  const baseStyle: React.CSSProperties = {
    position: 'relative',
    padding: DesignSystem.spacing[padding as keyof typeof DesignSystem.spacing],
    borderRadius: DesignSystem.borderRadius['2xl'],
    transition: `all ${DesignSystem.transitions.base}`,
    cursor: isInteractive ? 'pointer' : 'default',
  };

  const glassStyle: React.CSSProperties = glass ? {
    background: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(24px)',
    border: `1px solid ${DesignSystem.colors.glass.border}`,
    boxShadow: elevated ? DesignSystem.shadows.lg : 'none',
  } : {
    background: DesignSystem.colors.neutral[0],
    border: `1px solid ${DesignSystem.colors.neutral[200]}`,
    boxShadow: elevated ? DesignSystem.shadows.lg : DesignSystem.shadows.sm,
  };

  return (
    <motion.div
      whileHover={isInteractive ? { 
        y: -4,
        boxShadow: DesignSystem.shadows.xl,
      } : undefined}
      whileTap={isInteractive ? { scale: 0.98 } : undefined}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      onClick={onClick}
      style={{
        ...baseStyle,
        ...glassStyle,
        ...style,
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default Card;
