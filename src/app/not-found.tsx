'use client';

import Link from "next/link";
import { motion } from "framer-motion";
import { Navbar, Footer } from "@/components/layout";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0A0E14] flex flex-col">
      <Navbar />

      <div className="flex-1 flex items-center justify-center px-4 pt-32 pb-24">
        <motion.div
          className="text-center max-w-lg"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <p className="text-[11px] font-mono text-[#35b9f1]/60 tracking-[0.2em] uppercase mb-4">
            Error 404
          </p>
          <h1 className="text-7xl sm:text-8xl font-serif italic text-white leading-none">
            Lost<span className="text-primary not-italic font-bold">?</span>
          </h1>
          <p className="mt-6 text-gray-400 text-lg leading-relaxed">
            This page doesn&apos;t exist — maybe it was moved, or the link&apos;s just wrong.
          </p>

          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              href="/"
              className="px-6 py-3 rounded-full bg-[#35b9f1] text-black font-semibold text-sm hover:bg-[#35b9f1]/90 transition-colors"
            >
              Back to Home
            </Link>
            <Link
              href="/dashboard"
              className="px-6 py-3 rounded-full border border-[#1F2937] text-gray-300 font-semibold text-sm hover:border-[#35b9f1]/40 hover:text-white transition-colors"
            >
              Go to Dashboard
            </Link>
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}
