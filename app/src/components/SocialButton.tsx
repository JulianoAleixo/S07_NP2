const SocialButton = ({
    href,
    children,
    className = "",
    ariaLabel,
}: {
    href: string;
    children: React.ReactNode;
    className?: string;
    ariaLabel?: string;
}) => (
    <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={ariaLabel}
        aria-hidden="true"
        className={`flex items-center justify-center w-11 h-11 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm text-white/60 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-200 ${className}`}
    >
        {children}
    </a>
);

export default SocialButton;
