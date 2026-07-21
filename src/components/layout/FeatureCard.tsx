'use client';

import { memo } from 'react';
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  iconVariant?: "primary" | "info" | "warning" | "success";
  delay?: number;
  link?: string;
}

export const FeatureCard = memo(({
  icon: Icon,
  title,
  description,
  iconVariant = "primary",
  delay = 0,
  link
}: FeatureCardProps) => {
  // Define themes based on the iconVariant for borders, glows, and text colors
  const themes = {
    primary: {
      borderHover: "hover:border-[#35b9f1]/60",
      shadowHover: "hover:shadow-[0_0_40px_rgba(53,185,241,0.08)]",
      glowBg: "bg-[#35b9f1]/5",
      arrowColor: "text-[#35b9f1]",
      iconColor: "text-[#35b9f1]"
    },
    info: {
      borderHover: "hover:border-[#3B82F6]/60",
      shadowHover: "hover:shadow-[0_0_40px_rgba(59,130,246,0.08)]",
      glowBg: "bg-[#3B82F6]/5",
      arrowColor: "text-[#60A5FA]",
      iconColor: "text-[#60A5FA]"
    },
    warning: {
      borderHover: "hover:border-[#F59E0B]/60",
      shadowHover: "hover:shadow-[0_0_40px_rgba(245,158,11,0.08)]",
      glowBg: "bg-[#F59E0B]/5",
      arrowColor: "text-[#FBBF24]",
      iconColor: "text-[#FBBF24]"
    },
    success: {
      borderHover: "hover:border-[#10B981]/60",
      shadowHover: "hover:shadow-[0_0_40px_rgba(16,185,129,0.08)]",
      glowBg: "bg-[#10B981]/5",
      arrowColor: "text-[#34D399]",
      iconColor: "text-[#34D399]"
    }
  };

  const currentTheme = themes[iconVariant] || themes.primary;

  const content = (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -6, scale: 1.01 }}
      className={`relative overflow-hidden w-full h-full p-6 rounded-3xl group bg-gradient-to-br from-[#161B22]/90 to-[#0D1117]/95 border border-[#1F2937] transition-all duration-300 ${currentTheme.borderHover} ${currentTheme.shadowHover} ${link ? "cursor-pointer" : ""}`}
    >
      {/* Background Radial Glow Effect */}
      <div className={`absolute -right-12 -top-12 w-28 h-28 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none ${currentTheme.glowBg}`} />

      <div className="flex flex-col h-full justify-between">
        <div>
          {/* iOS-like Rounded Icon Container */}
          <div className="w-fit rounded-2xl p-3 bg-neutral-800/40 border border-neutral-700/20 group-hover:scale-105 group-hover:border-neutral-700/50 transition-all duration-300">
            <Icon className={`h-6 w-6 transition-colors duration-300 ${currentTheme.iconColor}`} />
          </div>

          <h3 className="font-bold mt-5 text-lg flex items-center gap-2 text-white transition-colors">
            {title}
            {link && (
              <span className={`inline-block transition-transform duration-300 group-hover:translate-x-1 ${currentTheme.arrowColor}`}>
                &rarr;
              </span>
            )}
          </h3>

          <p className="text-[#8B949E] text-sm mt-3 leading-relaxed group-hover:text-[#a1a1aa] transition-colors">
            {description}
          </p>
        </div>
      </div>
    </motion.div>
  );

  if (link) {
    return (
      <a href={link} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
        {content}
      </a>
    );
  }

  return content;
});

FeatureCard.displayName = 'FeatureCard';
