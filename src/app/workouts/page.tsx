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
  },
  {
    id: "4",
    date: new Date(Date.now() - 86400000 * 7), // 7 days ago
    category: {
      name: "Musculation",
      color: "#4299e1"
    },
    duration: 55,
    intensity: 9
  },
  {
    id: "5",
    date: new Date(Date.now() - 86400000 * 10), // 10 days ago
    category: {
      name: "Cardio",
      color: "#48bb78"
    },
    duration: 40,
    intensity: 6
  }
];

export default function WorkoutsPage() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

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

  const filteredWorkouts = filter === "all" 
    ? workouts 
    : workouts.filter(w => w.category.name.toLowerCase() === filter);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between py-4">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Entraînements</h1>
        <Link 
          href="/workouts/new" 
          className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors duration-200"
        >
          Nouveau
        </Link>
      </header>

      <div className="flex overflow-x-auto pb-2 -mx-4 px-4 space-x-2">
        <button 
          onClick={() => setFilter("all")}
          className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${
            filter === "all" 
              ? "bg-[var(--intensity-bg)] font-medium text-[var(--text-primary)]" 
              : "bg-[var(--card-bg)] text-[var(--text-secondary)]"
          }`}
        >
          Tous
        </button>
        <button 
          onClick={() => setFilter("musculation")}
          className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${
            filter === "musculation" 
              ? "bg-[color:var(--primary)] bg-opacity-10 text-[var(--primary)] font-medium" 
              : "bg-[var(--card-bg)] text-[var(--text-secondary)]"
          }`}
        >
          Musculation
        </button>
        <button 
          onClick={() => setFilter("cardio")}
          className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${
            filter === "cardio" 
              ? "bg-[color:var(--success)] bg-opacity-10 text-[var(--success)] font-medium" 
              : "bg-[var(--card-bg)] text-[var(--text-secondary)]"
          }`}
        >
          Cardio
        </button>
        <button 
          onClick={() => setFilter("mobilité")}
          className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${
            filter === "mobilité" 
              ? "bg-[color:var(--warning)] bg-opacity-10 text-[var(--warning)] font-medium" 
              : "bg-[var(--card-bg)] text-[var(--text-secondary)]"
          }`}
        >
          Mobilité
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-[var(--card-bg)] p-4 rounded-lg shadow-[var(--shadow-sm)] animate-pulse">
              <div className="h-4 bg-[var(--intensity-bg)] rounded w-1/4 mb-2"></div>
              <div className="h-4 bg-[var(--intensity-bg)] rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : filteredWorkouts.length === 0 ? (
        <div className="bg-[var(--card-bg)] p-4 rounded-lg shadow-[var(--shadow-sm)] text-center">
          <p className="text-[var(--text-secondary)]">
            {filter === "all" 
              ? "Aucun entraînement enregistré" 
              : `Aucun entraînement de type ${filter}`}
          </p>
          <Link 
            href="/workouts/new" 
            className="text-[var(--primary)] text-sm font-medium mt-2 inline-block hover:text-[var(--primary-hover)] transition-colors duration-200"
          >
            Créer un entraînement
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredWorkouts.map((workout) => (
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
                    <span className="text-xs text-[var(--text-secondary)] mr-1">Intensité:</span>
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
      )}
    </div>
  );
}
