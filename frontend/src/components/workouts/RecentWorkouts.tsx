"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

// Define interfaces for type safety
interface Category {
  name: string;
  color: string;
}

interface Workout {
  id: string;
  date: Date;
  category: Category;
  duration: number;
  intensity: number;
}

// This would typically come from an API or database
const mockWorkouts: Workout[] = [
  {
    id: "1",
    date: new Date(Date.now() - 86400000), // yesterday
    category: {
      name: "Musculation",
      color: "#4299e1"
    },
    duration: 60,
    intensity: 8
  },
  {
    id: "2",
    date: new Date(Date.now() - 86400000 * 3), // 3 days ago
    category: {
      name: "Cardio",
      color: "#48bb78"
    },
    duration: 45,
    intensity: 7
  },
  {
    id: "3",
    date: new Date(Date.now() - 86400000 * 5), // 5 days ago
    category: {
      name: "Mobilité",
      color: "#ed8936"
    },
    duration: 30,
    intensity: 5
  }
];

export function RecentWorkouts() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, this would fetch from an API
    // For now, we'll just use our mock data
    setWorkouts(mockWorkouts);
    setLoading(false);
  }, []);

  const formatDate = (date: Date) => {
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
