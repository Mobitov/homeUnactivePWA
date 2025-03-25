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
        <h1 className="text-2xl font-bold">Entraînements</h1>
        <Link 
          href="/workouts/new" 
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors duration-200"
        >
          Nouveau
        </Link>
      </header>

      <div className="flex overflow-x-auto pb-2 -mx-4 px-4 space-x-2">
        <button 
          onClick={() => setFilter("all")}
          className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${
            filter === "all" 
              ? "bg-gray-200 dark:bg-gray-700 font-medium" 
              : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
          }`}
        >
          Tous
        </button>
        <button 
          onClick={() => setFilter("musculation")}
          className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${
            filter === "musculation" 
              ? "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 font-medium" 
              : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
          }`}
        >
          Musculation
        </button>
        <button 
          onClick={() => setFilter("cardio")}
          className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${
            filter === "cardio" 
              ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 font-medium" 
              : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
          }`}
        >
          Cardio
        </button>
        <button 
          onClick={() => setFilter("mobilité")}
          className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${
            filter === "mobilité" 
              ? "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 font-medium" 
              : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
          }`}
        >
          Mobilité
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : filteredWorkouts.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm text-center">
          <p className="text-gray-600 dark:text-gray-400">
            {filter === "all" 
              ? "Aucun entraînement enregistré" 
              : `Aucun entraînement de type ${filter}`}
          </p>
          <Link 
            href="/workouts/new" 
            className="text-blue-600 dark:text-blue-400 text-sm font-medium mt-2 inline-block"
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
              className="block bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
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
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{formatDate(workout.date)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{workout.duration} min</p>
                  <div className="flex items-center mt-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400 mr-1">Intensité:</span>
                    <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
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
