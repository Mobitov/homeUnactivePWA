"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

// Define interfaces for type safety
interface Category {
  name: string;
  color: string;
}

interface Goal {
  id: string;
  title: string;
  description: string;
  targetDate: Date | null;
  achieved: boolean;
  category: Category | null;
  targetValue?: number;
  valueType?: string;
  progress: number;
}

// This would typically come from an API or database
const mockGoals: Goal[] = [
  {
    id: "1",
    title: "Courir 10km",
    description: "Atteindre une distance de 10km en course à pied",
    targetDate: new Date(Date.now() + 86400000 * 14), // 14 days from now
    achieved: false,
    category: {
      name: "Cardio",
      color: "#48bb78"
    },
    targetValue: 10,
    valueType: "distance",
    progress: 60 // percentage
  },
  {
    id: "2",
    title: "Développé couché 80kg",
    description: "Atteindre 80kg au développé couché",
    targetDate: new Date(Date.now() + 86400000 * 30), // 30 days from now
    achieved: false,
    category: {
      name: "Musculation",
      color: "#4299e1"
    },
    targetValue: 80,
    valueType: "weight",
    progress: 75 // percentage
  },
  {
    id: "3",
    title: "5 séances par semaine",
    description: "Maintenir un rythme de 5 séances d'entraînement par semaine",
    targetDate: null, // ongoing
    achieved: false,
    category: null,
    progress: 40 // percentage
  }
];

export function UpcomingGoals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, this would fetch from an API
    // For now, we'll just use our mock data
    setGoals(mockGoals);
    setLoading(false);
  }, []);

  const formatDate = (date: Date | null) => {
    if (!date) return "En cours";
    
    const now = new Date();
    const diffTime = Math.abs(date.getTime() - now.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 7) {
      return `Dans ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    }
    
    return new Intl.DateTimeFormat('fr-FR', { 
      day: 'numeric', 
      month: 'short' 
    }).format(date);
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-full mt-4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (goals.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm text-center">
        <p className="text-gray-600 dark:text-gray-400">Aucun objectif défini</p>
        <Link 
          href="/goals/new" 
          className="text-blue-600 dark:text-blue-400 text-sm font-medium mt-2 inline-block"
        >
          Définir votre premier objectif
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {goals.map((goal) => (
        <Link 
          key={goal.id}
          href={`/goals/${goal.id}`}
          className="block bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
        >
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-medium">{goal.title}</h3>
              {goal.category && (
                <div 
                  className="text-xs inline-flex items-center"
                  style={{ color: goal.category.color }}
                >
                  <span 
                    className="w-1.5 h-1.5 rounded-full mr-1" 
                    style={{ backgroundColor: goal.category.color }}
                  ></span>
                  {goal.category.name}
                </div>
              )}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
              {formatDate(goal.targetDate)}
            </div>
          </div>
          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full" 
              style={{ 
                width: `${goal.progress}%`,
                backgroundColor: goal.category ? goal.category.color : "#9f7aea" 
              }}
            ></div>
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs text-gray-500 dark:text-gray-400">Progression</span>
            <span className="text-xs font-medium">{goal.progress}%</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
