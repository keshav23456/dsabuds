'use client';

import { motion, HTMLMotionProps } from "framer-motion";

interface CardProps extends Omit<HTMLMotionProps<"div">, "ref"> {
  children: React.ReactNode;
  variant?: "default" | "dark" | "accent" | "highlight";
  className?: string;
  animated?: boolean;
  delay?: number;
  hoverable?: boolean;
}

export const Card = ({
  children,
  variant = "default",
  className = "",
  animated = true,
  delay = 0,
  hoverable = true,
  ...props
}: CardProps) => {
  const baseVariants = {
    default: "bg-[#161B22] text-white border border-[#1F2937]",
    dark: "bg-[#161B22] border border-[#1F2937] text-white",
    accent: "bg-[#0D1117] text-white border border-[#1F2937]",
    highlight: "bg-black text-white border border-[#1F2937]",
  };

  const hoverVariants = {
    default: "hover:border-[var(--primary-color)] hover:drop-shadow-lg",
    dark: "",
    accent: "hover:border-[var(--primary-color)]",
    highlight: "hover:border-[var(--primary-color)]",
  };

  const Component: any = animated ? motion.div : "div";
  const animationProps = animated ? {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-50px" },
    transition: { duration: 0.5, delay },
    ...(hoverable ? { whileHover: { y: -5 } } : {}),
  } : {};

  const variantClass = `${baseVariants[variant]} ${hoverable ? hoverVariants[variant] : ""}`;

  return (
    <Component
      className={`w-full h-full p-6 rounded-4xl group transition-all duration-300 ${variantClass} ${className}`}
      {...animationProps}
      {...props}
    >
      {children}
    </Component>
  );
};
