'use client';

import { motion } from "framer-motion";

interface StatItemProps {
  label: string;
  description: string;
  delay?: number;
}

export const StatItem = ({ label, description, delay = 0 }: StatItemProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay }}
    >
      <h2 className="font-bold xl:text-2xl 2xl:text-2xl md:text-2xl text-lg text-white">
        {label}
      </h2>
      <p className="text-neutral-400 text-sm mt-1">{description}</p>
    </motion.div>
  );
};
