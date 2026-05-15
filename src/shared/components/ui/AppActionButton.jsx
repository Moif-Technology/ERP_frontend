import { colors } from '../../constants/theme';

const primary = colors.primary?.main || '#790728';

export default function AppActionButton({
  icon = null,
  children,
  onClick,
  disabled = false,
  type = 'button',
  variant = 'light',
  className = '',
  title,
  ariaLabel,
  fullWidth = false,
  ...buttonProps
}) {
  const variantClass =
    variant === 'primary'
      ? 'border-[#790728] bg-[#790728] text-white shadow-[0_8px_20px_rgba(121,7,40,0.20)] hover:bg-[#650520]'
      : variant === 'danger'
      ? 'border-slate-200 bg-white text-slate-700 hover:border-red-200 hover:bg-red-50 hover:text-red-700'
      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={ariaLabel || title}
      {...buttonProps}
      className={`inline-flex min-h-10 shrink-0 items-center justify-center gap-1.5 border px-3 text-sm font-bold uppercase tracking-[0.04em] transition disabled:cursor-not-allowed disabled:opacity-55 ${
        fullWidth ? 'w-full' : ''
      } ${variantClass} ${className}`}
    >
      {icon ? <span className="inline-flex shrink-0 items-center justify-center">{icon}</span> : null}
      {children ? <span>{children}</span> : null}
    </button>
  );
}
