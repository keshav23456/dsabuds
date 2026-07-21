'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import Lenis from '@studio-freight/lenis';
import { useNavigation } from '@/hooks';
import { Navbar, Footer } from '@/components/layout';
import { HeroSection } from './HeroSection';
import { FeaturesSection } from './FeaturesSection';
import { ComparisonSection } from './ComparisonSection';
import { CTASection } from './CTASection';

export const LandingPage = () => {
  const { goToRegister } = useNavigation();

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <div className="bg-[#030303] text-white min-h-screen relative w-full overflow-hidden">
      {/* Background radial highlight */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-[radial-gradient(circle_at_center,_rgba(53,185,241,0.07)_0%,_transparent_65%)] pointer-events-none z-0" />

      <div className="fixed top-0 w-full z-50 pointer-events-none">
        <div className="pointer-events-auto">
          <Navbar />
        </div>
      </div>

      <main className="relative z-10 w-full">
        <HeroSection onStartTracking={goToRegister} />
        <FeaturesSection />
        <ComparisonSection />
        <CTASection onGetStarted={goToRegister} />
      </main>

      <Footer />
    </div>
  );
};
