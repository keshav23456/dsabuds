'use client';

import Link from "next/link";
import { useState, useEffect } from "react";
import { useUserStore } from "@/store/useUserStore";

const LOGO_SRC = "/logo.svg";

export const Navbar = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const user = useUserStore((state) => state.user);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <div className={`w-[90%] sm:w-[85%] md:w-[80%] lg:w-[70%] xl:w-[60%] max-w-7xl mx-auto mt-3 sm:mt-4 rounded-2xl sm:rounded-full fixed top-0 left-1/2 px-4 sm:px-6 bg-white shadow-md z-50 transition-all duration-500 ease-in-out ${isVisible ? '-translate-x-1/2 translate-y-0 opacity-100' : '-translate-x-1/2 -translate-y-full opacity-0'}`}>
      <div className="flex text-black justify-between items-center py-1.5 px-2 sm:py-2.5 sm:px-3">
        <div>
          <Link href="/" className="flex items-center gap-2">
            <img src={LOGO_SRC} alt="DSABuddy Logo" className="w-8 h-8 object-contain" />
            <h1 className="text-xl sm:text-2xl font-bold text-black">
              DSABuddy
            </h1>
          </Link>
        </div>
        <div className="hidden md:block">
          <ul className="flex gap-4 lg:gap-7 font-mono cursor-pointer text-sm lg:text-base">
            <Link href="/about">
              <li className="hover:text-gray-600 transition-colors">About</li>
            </Link>
            <Link href="/leaderboard">
              <li className="hover:text-gray-600 transition-colors">Leaderboard</li>
            </Link>
            <Link href="/contact">
              <li className="hover:text-gray-600 transition-colors">Contact</li>
            </Link>
          </ul>
        </div>
        <div className="bg-primary p-1 rounded-full font-bold border-b-2 sm:border-b-4 border-black active:border-b-0 active:translate-y-0.5 sm:active:translate-y-1 transition-all">
          <Link href={user ? "/dashboard" : "/register"}>
            <button className="cursor-pointer rounded-full px-3 py-1.5 sm:px-6 sm:py-2 text-sm sm:text-base hover:opacity-90 transition-opacity">
              {user ? "Dashboard" : "Start Coding"}
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};
