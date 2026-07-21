'use client';

import { motion } from "framer-motion";
import { Button } from "@/components/common";

interface CTASectionProps {
  onGetStarted?: () => void;
}

export const CTASection = ({ onGetStarted = () => {} }: CTASectionProps) => {
  return (
    <motion.div
      className="my-24 md:my-36 xl:max-w-270 2xl:max-w-270 md:max-w-190 sm:max-w-150 max-w-90 m-auto px-4"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6 }}
    >
      <motion.div
        className="w-full text-center bg-[#0a0a0a] bg-[radial-gradient(ellipse_at_center,_rgba(53,185,241,0.08)_0%,_transparent_70%)] border border-[#1F2937] hover:border-[#35b9f1]/30 transition-all duration-300 rounded-3xl p-8 sm:p-16 md:p-20"
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        whileInView={{ opacity: 1, scale: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6 }}
      >
        <motion.h2
          className="text-4xl sm:text-5xl md:text-6xl font-serif font-normal italic text-white leading-tight"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Ready to get{" "}
          <span className="bg-linear-to-r from-white to-[#35b9f1] bg-clip-text text-transparent">
            consistent?
          </span>
        </motion.h2>

        <motion.p
          className="text-base sm:text-lg mt-4 text-[#a1a1aa] max-w-lg mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          Sync your profiles, track your progress, and level up with your classmates.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Button variant="primary" className="mt-8" onClick={onGetStarted}>
            Start Tracking DSA
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};
