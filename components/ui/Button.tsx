/**
 * Premium Button Component
 * Apple/Google-inspired with haptic feedback and smooth animations
 */

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { DesignSystem, ComponentTokens } from '../../styles/designSystem';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const sizeStyles = {
  sm: {
    padding: `${DesignSystem.spacing[2]} ${DesignSystem.spacing[4]}`,
    fontSize: DesignSystem.typography.fontSize.sm,
    iconSize: 16,
  },
  md: {
    padding: `${DesignSystem.spacing[3]} ${DesignSystem.spacing[6]}`,
    fontSize: DesignSystem.typography.fontSize.base,
    iconSize: 20,
  },
  lg: {
    padding: `${DesignSystem.spacing[4]} ${DesignSystem.spacing[8]}`,
    fontSize: DesignSystem.typography.fontSize.lg,
    iconSize: 24,
  },
  xl: {
    padding: `${DesignSystem.spacing[5]} ${DesignSystem.spacing[10]}`,
    fontSize: DesignSystem.typography.fontSize.xl,
    iconSize: 28,
  },
};

const variantStyles = {
  primary: {
    bg: DesignSystem.colors.primary[500],
    hover: DesignSystem.colors.primary[600],
    active: DesignSystem.colors.primary[700],
    text: DesignSystem.colors.neutral[0],
    shadow: DesignSystem.shadows.md,
  },
  secondary: {
    bg: DesignSystem.colors.neutral[100],
    hover: DesignSystem.colors.neutral[200],
    active: DesignSystem.colors.neutral[300],
    text: DesignSystem.colors.neutral[900],
    shadow: DesignSystem.shadows.sm,
  },
  ghost: {
    bg: 'transparent',
    hover: DesignSystem.colors.neutral[100],
    active: DesignSystem.colors.neutral[200],
    text: DesignSystem.colors.neutral[700],
    shadow: 'none',
  },
  danger: {
    bg: DesignSystem.colors.error,
    hover: '#E63629',
    active: '#CC3126',
    text: DesignSystem.colors.neutral[0],
    shadow: DesignSystem.shadows.md,
  },
  success: {
    bg: DesignSystem.colors.success,
    hover: '#2FB350',
    active: '#29A047',
    text: DesignSystem.colors.neutral[0],
    shadow: DesignSystem.shadows.md,
  },
};

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled,
  ...props
}) => {
  const sizeStyle = sizeStyles[size];
  const variantStyle = variantStyles[variant];

  return (
    <motion.button
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      disabled={disabled || loading}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: DesignSystem.spacing[2],
        padding: sizeStyle.padding,
        fontSize: sizeStyle.fontSize,
        fontWeight: DesignSystem.typography.fontWeight.semibold,
        fontFamily: DesignSystem.typography.fontFamily.text,
        color: variantStyle.text,
        backgroundColor: variantStyle.bg,
        border: 'none',
        borderRadius: DesignSystem.borderRadius.xl,
        boxShadow: variantStyle.shadow,
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled || loading ? 0.5 : 1,
        width: fullWidth ? '100%' : 'auto',
        transition: `all ${DesignSystem.transitions.base}`,
        overflow: 'hidden',
      }}
      {...props}
    >
      {/* Hover overlay effect */}
      <motion.div
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: variantStyle.hover,
          pointerEvents: 'none',
        }}
      />

      {/* Content */}
      <span style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: DesignSystem.spacing[2] }}>
        {loading ? (
          <Loader2 size={sizeStyle.iconSize} className="animate-spin" />
        ) : (
          leftIcon && <span style={{ display: 'flex' }}>{leftIcon}</span>
        )}
        
        <span>{children}</span>
        
        {!loading && rightIcon && <span style={{ display: 'flex' }}>{rightIcon}</span>}
      </span>
    </motion.button>
  );
};

export default Button;
