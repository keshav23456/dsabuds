interface SocialButtonProps {
  icon: string;
  text?: string;
  onClick?: () => void;
  className?: string;
}

export const SocialButton = ({
  icon,
  text = "Continue with Google",
  onClick,
  className = ""
}: SocialButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={`bg-[#0D1117] cursor-pointer flex justify-center gap-2 sm:gap-3 p-2 sm:p-3 w-full rounded-lg border border-gray-600 hover:border-[#35b9f1] items-center transition-colors ${className}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="size-4 sm:size-5" src={icon} alt="Social login" />
      <p className="text-white font-bold text-xs sm:text-sm md:text-base">
        {text}
      </p>
    </button>
  );
};
