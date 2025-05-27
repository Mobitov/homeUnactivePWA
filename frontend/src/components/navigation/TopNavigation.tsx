"use client";

import React from "react";
import Link from "next/link";
import { useTheme } from "../../app/providers";
import { useAuth } from "@/context/AuthContext";

export function TopNavigation() {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { isAuthenticated, loading, logout } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 bg-[var(--nav-bg)] border-b border-[var(--nav-border)] z-50">
      <div className="h-14 flex justify-between items-center px-4">
        <div className="flex items-center">
          <Link href="/" className="flex items-center text-[var(--nav-text)] font-medium hover:text-[var(--primary)] transition-colors duration-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            HomeUnactive
          </Link>
        </div>
        
        <div className="flex items-center space-x-4">
          {!loading && (
            <>
              {isAuthenticated ? (
                <>
                  <Link 
                    href="/account" 
                    className="text-[var(--nav-text)] hover:text-[var(--primary)] transition-colors duration-200"
                  >
                    Mon Compte
                  </Link>
                  <button
                    onClick={logout}
                    className="text-[var(--nav-text)] hover:text-[var(--primary)] transition-colors duration-200"
                  >
                    Déconnexion
                  </button>
                </>
              ) : (
                <Link 
                  href="/login" 
                  className="text-[var(--nav-text)] hover:text-[var(--primary)] transition-colors duration-200"
                >
                  Connexion
                </Link>
              )}
            </>
          )}
          
          {/* Theme Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg text-[var(--nav-text)] hover:text-[var(--primary)] transition-colors duration-200"
            aria-label={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDarkMode ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}
