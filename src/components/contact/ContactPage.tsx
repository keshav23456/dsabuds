'use client';

import { motion } from "framer-motion";
import { Navbar, Footer } from "@/components/layout";
import { useEffect, useRef, useState } from "react";
import Lenis from "@studio-freight/lenis";
import apiClient from "@/lib/apiClient";
import { getErrorMessage } from "@/utils";

const BackgroundGrid = () => (
  <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-black">
    <div
      className="absolute inset-0 opacity-[0.04]"
      style={{
        backgroundImage:
          "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
        backgroundSize: "80px 80px",
      }}
    />
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000000_100%)]" />
    <motion.div
      className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[#35b9f1]/8 blur-[150px]"
      animate={{ x: [0, -80, 0], y: [0, 80, 0] }}
      transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
    />
  </div>
);

const contactLinks = [
  {
    label: "Email",
    value: "info@dsabuddy.xyz",
    href: "mailto:info@dsabuddy.xyz",
  },
  {
    label: "LinkedIn",
    value: "The Debugging Society NSUT",
    href: "https://www.linkedin.com/company/the-debugging-society-nsut/",
  },
  {
    label: "Instagram",
    value: "@thedebuggingsocietynsut",
    href: "https://www.instagram.com/thedebuggingsocietynsut",
  },
];

export function ContactPage() {
  const lenisRef = useRef<Lenis | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  useEffect(() => {
    lenisRef.current = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
    const raf = (time: number) => {
      lenisRef.current?.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
    return () => lenisRef.current?.destroy();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await apiClient.post("/contact", form);
      setSubmitted(true);
    } catch (err) {
      setError(getErrorMessage(err) || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-black text-white overflow-x-hidden">
      <BackgroundGrid />
      <div className="relative z-10">
        <Navbar />

        <main className="pt-36 pb-24 mx-auto xl:max-w-270 2xl:max-w-270 md:max-w-190 sm:max-w-150 max-w-90 px-4">
          <motion.div
            className="mb-16 md:mb-20"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-[11px] font-mono text-[#35b9f1]/60 tracking-[0.2em] uppercase mb-4">
              Get in touch
            </p>
            <h1 className="font-serif font-normal italic text-5xl sm:text-6xl md:text-7xl text-white leading-tight">
              Let&apos;s{" "}
              <span className="bg-linear-to-r from-white to-[#35b9f1] bg-clip-text text-transparent">
                talk.
              </span>
            </h1>
            <p className="mt-5 text-gray-400 text-lg leading-relaxed max-w-xl">
              Have a question, bug report, or just want to say hi? Fill out the form or reach out directly — we&apos;re a student team and we reply fast.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-16">
            <motion.div
              className="lg:col-span-3"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
            >
              {submitted ? (
                <motion.div
                  className="h-full flex flex-col items-center justify-center text-center py-20 bg-[#0D1117] border border-[#1F2937] rounded-2xl"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="text-4xl mb-4 font-mono text-[#10B981]">✓</div>
                  <h3 className="text-xl font-bold text-white mb-2">Message sent!</h3>
                  <p className="text-gray-400 text-sm max-w-xs">
                    Thanks for reaching out. We&apos;ll get back to you at <span className="text-white">{form.email}</span> soon.
                  </p>
                  <button
                    onClick={() => { setSubmitted(false); setError(null); setForm({ name: "", email: "", message: "" }); }}
                    className="mt-6 text-[#35b9f1] text-sm font-mono hover:underline"
                  >
                    Send another
                  </button>
                </motion.div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="bg-[#0D1117] border border-[#1F2937] rounded-2xl p-6 sm:p-8 space-y-5"
                >
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono text-gray-500 tracking-widest uppercase">Name</label>
                    <input
                      required
                      type="text"
                      placeholder="Your name"
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      className="w-full bg-[#080C10] border border-[#1F2937] focus:border-[#35b9f1]/60 focus:outline-none rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono text-gray-500 tracking-widest uppercase">Email</label>
                    <input
                      required
                      type="email"
                      placeholder="you@college.edu"
                      value={form.email}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                      className="w-full bg-[#080C10] border border-[#1F2937] focus:border-[#35b9f1]/60 focus:outline-none rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono text-gray-500 tracking-widest uppercase">Message</label>
                    <textarea
                      required
                      rows={5}
                      placeholder="What's on your mind?"
                      value={form.message}
                      onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                      className="w-full bg-[#080C10] border border-[#1F2937] focus:border-[#35b9f1]/60 focus:outline-none rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 transition-colors resize-none"
                    />
                  </div>

                  {error && (
                    <p className="text-red-400 text-xs font-mono">{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#35b9f1] hover:bg-[#35b9f1]/90 disabled:opacity-60 disabled:cursor-not-allowed text-black font-bold py-3 rounded-xl transition-colors text-sm"
                  >
                    {loading ? "Sending…" : "Send Message"}
                  </button>
                </form>
              )}
            </motion.div>

            <motion.div
              className="lg:col-span-2 space-y-8"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
            >
              <div>
                <p className="text-[11px] font-mono text-gray-600 tracking-[0.15em] uppercase mb-4">Direct channels</p>
                <div className="space-y-3">
                  {contactLinks.map(({ label, value, href }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between bg-[#0D1117] border border-[#1F2937] hover:border-[#35b9f1]/30 rounded-xl p-4 group transition-all duration-200"
                    >
                      <div>
                        <p className="text-[10px] font-mono text-gray-600 tracking-widest uppercase mb-0.5">{label}</p>
                        <p className="text-sm text-white group-hover:text-[#35b9f1] transition-colors">{value}</p>
                      </div>
                      <span className="text-gray-600 group-hover:text-[#35b9f1] text-lg transition-colors">↗</span>
                    </a>
                  ))}
                </div>
              </div>

              <div className="bg-[#0D1117] border border-[#1F2937] rounded-xl p-5 space-y-2">
                <p className="text-[10px] font-mono text-gray-600 tracking-widest uppercase">Response time</p>
                <p className="text-white font-semibold">Usually within 24 hours</p>
                <p className="text-gray-500 text-sm leading-relaxed">
                  We&apos;re a student team at NSUT. Best time to reach us is weekdays.
                </p>
              </div>
            </motion.div>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}

export default ContactPage;
