'use client';

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button, Divider } from "@/components/common";
import { StatItem } from "@/components/layout";

const DASHBOARD_IMG_SRC = "/images/dashboard.webp";

interface HeroSectionProps {
  onStartTracking?: () => void;
}

export const HeroSection = ({ onStartTracking = () => {} }: HeroSectionProps) => {
  const router = useRouter();
  return (
    <motion.div
      className="mt-32 md:mt-40 mb-24 md:mb-36 m-auto xl:max-w-270 2xl:max-w-270 md:max-w-190 sm:max-w-150 max-w-90 px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="mx-auto xl:w-166 2xl:w-166 text-center"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <h1 className="font-serif font-normal italic xl:text-8xl 2xl:text-8xl md:text-7xl text-5xl leading-tight">
          Master Algorithms.<br /> Crush{" "}
          <span className="bg-linear-to-r from-white to-[#35b9f1] bg-clip-text text-transparent">
            Interviews.
          </span>
        </h1>
      </motion.div>

      <motion.div
        className="mt-8 w-full m-auto text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <p className="text-primary text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
          Sync your profiles from LeetCode, Codeforces, and CodeChef. Track daily streaks and climb your college leaderboard.
        </p>
      </motion.div>

      <motion.div
        className="mt-10 xl:flex 2xl:flex md:flex xl:flex-row 2xl:flex-row md:flex-row xl:justify-center xl:items-center mx-auto xl:gap-7 2xl:justify-center 2xl:items-center 2xl:gap-7 lg:justify-center lg:items-center lg:gap-7 md:justify-center md:items-center md:gap-7 flex flex-col gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <Button variant="primary" onClick={onStartTracking}>
          Start Tracking DSA
        </Button>
        <Button variant="secondary" onClick={() => router.push('/leaderboard')}>
          View Leaderboard
        </Button>
      </motion.div>

      <motion.div
        className="mt-16 md:p-4 mx-auto"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.8 }}
      >
        <Image
          className="w-full h-auto rounded-4xl border border-[#35b9f1]/20 shadow-[0_0_40px_rgba(53,185,241,0.12)]"
          src={DASHBOARD_IMG_SRC}
          alt="DSABuddy dashboard showing tracked DSA practice stats and streaks"
          width={1600}
          height={1005}
          priority
        />
      </motion.div>

      <motion.div
        className="mt-16 pt-8 pb-8 flex flex-row border-t border-b border-t-[#1F2937] border-b-[#1F2937] justify-evenly items-center md:gap-4 xl:gap-4 2xl:gap-4 gap-2 text-center bg-[#0a0a0a]"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <StatItem label="Track" description="daily streaks" delay={0.3} />
        <Divider orientation="vertical" className="h-10" />
        <StatItem label="Compete" description="within your college" delay={0.4} />
        <Divider orientation="vertical" className="h-10" />
        <StatItem label="Improve" description="with visualizations" delay={0.5} />
      </motion.div>
    </motion.div>
  );
};
