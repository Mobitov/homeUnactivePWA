"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "../../app/providers";

// Define interfaces for type safety
interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  onClick?: () => void;
}

export function BottomNavigation() {
  const pathname = usePathname();
  const { isDarkMode, toggleDarkMode } = useTheme();

  const navItems: NavItem[] = [
    {
      name: "Accueil",
      path: "/",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      name: "Entraînements",
      path: "/workouts",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
    },
    {
      name: "Statistiques",
      path: "/stats",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      name: "Objectifs",
      path: "/goals",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
    },
  ];

  return (
    <nav className="bottom-nav fixed bottom-0 left-0 right-0 bg-[var(--nav-bg)] shadow-lg border-t border-[var(--nav-border)] transition-colors duration-200">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = item.path !== "#" && pathname === item.path;
          
          const content = (
            <div className={`nav-link flex flex-col items-center justify-center w-full h-full ${isActive ? "active text-[var(--nav-text-active)]" : "text-[var(--nav-text)]"}`}>
              {item.icon}
              <span className="text-xs mt-1">{item.name}</span>
            </div>
          );

          return item.onClick ? (
            <button 
              key={item.name}
              onClick={item.onClick}
              className="flex-1 h-full focus:outline-none"
              aria-label={item.name}
            >
              {content}
            </button>
          ) : (
            <Link 
              key={item.name}
              href={item.path}
              className="flex-1 h-full"
              aria-label={item.name}
            >
              {content}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
