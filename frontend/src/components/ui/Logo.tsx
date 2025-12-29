interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

const Logo = ({ size = 'md', showText = true, className = '' }: LogoProps) => {
  const sizes = {
    sm: { icon: 'w-7 h-7', text: 'text-base' },
    md: { icon: 'w-8 h-8', text: 'text-lg' },
    lg: { icon: 'w-12 h-12', text: 'text-2xl' },
  };

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Logo Mark */}
      <div className={`${sizes[size].icon} relative`}>
        <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          {/* Background */}
          <rect width="32" height="32" rx="8" className="fill-gray-900 dark:fill-white" />

          {/* Stylized E - Three horizontal bars */}
          <rect x="8" y="7" width="16" height="3.5" rx="1" className="fill-white dark:fill-gray-900" />
          <rect x="8" y="14.25" width="11" height="3.5" rx="1" className="fill-white dark:fill-gray-900" />
          <rect x="8" y="21.5" width="16" height="3.5" rx="1" className="fill-white dark:fill-gray-900" />

          {/* Left vertical bar */}
          <rect x="8" y="7" width="3.5" height="18" rx="1" className="fill-white dark:fill-gray-900" />

          {/* Accent dot - event indicator */}
          <circle cx="21.5" cy="16" r="2.5" className="fill-emerald-500" />
        </svg>
      </div>

      {/* Text */}
      {showText && (
        <span className={`font-semibold text-gray-900 dark:text-white ${sizes[size].text}`}>
          ERMS
        </span>
      )}
    </div>
  );
};

export default Logo;
