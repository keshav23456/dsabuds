interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "primary" | "warning" | "success" | "info";
  className?: string;
}

export const Badge = ({
  children,
  variant = "default",
  className = "",
}: BadgeProps) => {
  const variants = {
    default: "bg-white/10 text-[#E5E7EB]",
    primary: "bg-light-primary text-[#35b9f1]",
    warning: "bg-[#cbb4b5]/20 text-[#F87171]",
    success: "bg-[#0e2730] text-primary",
    info: "bg-[#1e3a5f] text-[#60A5FA]",
  };

  return (
    <div className={`w-fit px-3 py-2 rounded-4xl font-bold text-xs ${variants[variant]} ${className}`}>
      {children}
    </div>
  );
};
