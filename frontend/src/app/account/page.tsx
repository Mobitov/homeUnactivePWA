"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { MotivationalQuote } from "../../components/MotivationalQuote";
import { RecentWorkouts } from "../../components/workouts/RecentWorkouts";
import { WorkoutSummary } from "../../components/stats/WorkoutSummary";
import { UpcomingGoals } from "../../components/goals/UpcomingGoals";

export default function AccountPage() {
  const { isAuthenticated, user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="text-lg">Chargement...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="space-y-6">
      <MotivationalQuote />
      
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Entraînements récents</h2>
          <Link 
            href="/workouts" 
            className="text-blue-600 dark:text-blue-400 text-sm font-medium"
          >
            Voir tout
          </Link>
        </div>
        <RecentWorkouts />
        
        <Link 
          href="/workouts/new" 
          className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg text-center transition-colors duration-200"
        >
          Nouvel entraînement
        </Link>
      </section>
      
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Résumé de la semaine</h2>
        <WorkoutSummary />
      </section>
      
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Objectifs à venir</h2>
          <Link 
            href="/goals" 
            className="text-blue-600 dark:text-blue-400 text-sm font-medium"
          >
            Voir tout
          </Link>
        </div>
        <UpcomingGoals />
      </section>
    </div>
  );
}
