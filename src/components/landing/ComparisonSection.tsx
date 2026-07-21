'use client';

import { motion } from "framer-motion";
import Image from "next/image";
import { Card, Badge } from "@/components/common";

const STRUGGLE_IMG_SRC = "/images/struggle.webp";
const DASHBOARD_IMG_SRC = "/images/dashboard.webp";

export const ComparisonSection = () => {
  return (
    <motion.div
      className="my-24 md:my-36 xl:max-w-270 2xl:max-w-270 md:max-w-190 sm:max-w-150 max-w-90 m-auto px-4"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6 }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card variant="accent" animated={true} hoverable={false} className="p-6">
          <Badge variant="warning" className="text-xs">
            THE STRUGGLE
          </Badge>
          <div>
            <h3 className="font-bold text-2xl mt-4">Scattered DSA Effort</h3>
            <p className="text-content mt-4 mb-16 leading-relaxed">
              Students code across multiple platforms, but progress remains fragmented. It is difficult to track daily consistency or see class standings.
            </p>
          </div>
          <motion.div
            className=""
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Image
              className="w-full h-auto rounded-4xl grayscale transition-all duration-300"
              src={STRUGGLE_IMG_SRC}
              alt="A student juggling scattered, unsynced coding profiles across platforms"
              width={918}
              height={612}
              loading="lazy"
            />
          </motion.div>
        </Card>

        <Card variant="highlight" animated={true} hoverable={false} className="p-6 relative overflow-hidden border-[#35b9f1]">
          <motion.div
            className="group-hover:bg-primary transition ease-in-out duration-300 bg-[#35b9f1] size-35 absolute blur-3xl ml-103 -mt-14"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.5, 0.7, 0.5]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <Badge variant="success" className="text-xs">
            THE SOLUTION
          </Badge>
          <div>
            <h3 className="font-bold text-2xl text-white mt-4">
              One Clear DSA Dashboard
            </h3>
            <p className="mt-4 text-white mb-16 leading-relaxed">
              DSABuddy aggregates your coding profiles automatically. Track streaks, compare standings, and visualize your progress — without manual effort.
            </p>
          </div>
          <motion.div
            className=""
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Image
              className="w-full h-auto rounded-4xl transition-all duration-300"
              src={DASHBOARD_IMG_SRC}
              alt="DSABuddy's unified dashboard showing synced coding progress"
              width={1600}
              height={1005}
              loading="lazy"
            />
          </motion.div>
        </Card>
      </div>
    </motion.div>
  );
};
