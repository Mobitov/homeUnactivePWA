"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

// Define interfaces for type safety
interface Category {
  id: string;
  name: string;
  color: string;
}

interface Workout {
  id: string;
  date: string; // API returns date as string
  category: Category;
  duration: number;
  intensity: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Option 1: Pas de props, récupération automatique du user connecté
export function RecentWorkouts() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/workouts/1', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Utilisateur non trouvé');
          }
          throw new Error(`Erreur ${response.status}: ${response.statusText}`);
        }

        const data: Workout[] = await response.json();
        
        // Sort workouts by date (most recent first)
        const sortedWorkouts = data.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        
        // Take only the 5 most recent workouts
        setWorkouts(sortedWorkouts.slice(0, 5));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
        console.error('Error fetching workouts:', err);
      } finally {
        setLoading(false);
      }
    };

    if (true) { // Always fetch since we don't need userId prop
      fetchWorkouts();
    }
  }, []); // Remove userId dependency

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short' 
    }).format(date);
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-[var(--card-bg)] p-4 rounded-lg shadow-[var(--shadow-sm)] animate-pulse">
            <div className="h-4 bg-[var(--intensity-bg)] rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-[var(--intensity-bg)] rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[var(--card-bg)] p-4 rounded-lg shadow-[var(--shadow-sm)] text-center">
        <p className="text-red-500 text-sm mb-2">Erreur: {error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="text-[var(--link-color)] text-sm font-medium"
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (workouts.length === 0) {
    return (
      <div className="bg-[var(--card-bg)] p-4 rounded-lg shadow-[var(--shadow-sm)] text-center">
        <p className="text-[var(--text-secondary)]">Aucun entraînement récent</p>
        <Link 
          href="/workouts/new" 
          className="text-[var(--link-color)] text-sm font-medium mt-2 inline-block"
        >
          Commencer votre premier entraînement
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {workouts.map((workout) => (
        <Link 
          key={workout.id}
          href={`/workouts/${workout.id}`}
          className="block bg-[var(--card-bg)] p-4 rounded-lg shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-shadow duration-200"
        >
          <div className="flex justify-between items-start">
            <div>
              <div 
                className="text-sm font-medium mb-1 inline-flex items-center"
                style={{ color: workout.category.color }}
              >
                <span 
                  className="w-2 h-2 rounded-full mr-2" 
                  style={{ backgroundColor: workout.category.color }}
                ></span>
                {workout.category.name}
              </div>
              <p className="text-[var(--text-secondary)] text-sm">{formatDate(workout.date)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">{workout.duration} min</p>
              <div className="flex items-center mt-1">
                <span className="text-xs text-[var(--text-tertiary)] mr-1">Intensité:</span>
                <div className="w-16 h-2 bg-[var(--intensity-bg)] rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full" 
                    style={{ 
                      width: `${(workout.intensity / 10) * 100}%`,
                      backgroundColor: workout.category.color 
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}