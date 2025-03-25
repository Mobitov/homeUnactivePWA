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
  },
  {
    id: "4",
    title: "Perdre 5kg",
    description: "Objectif de perte de poids",
    targetDate: new Date(Date.now() + 86400000 * 60), // 60 days from now
    achieved: false,
    category: null,
    targetValue: 5,
    valueType: "weight_loss",
    progress: 20 // percentage
  },
  {
    id: "5",
    title: "Étirements quotidiens",
    description: "Faire 10 minutes d'étirements tous les jours",
    targetDate: null, // ongoing
    achieved: true,
    category: {
      name: "Mobilité",
      color: "#ed8936"
    },
    progress: 100 // percentage
  }
];

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // "all", "active", "completed"

  useEffect(() => {
    // In a real app, this would fetch from an API
    // For now, we'll just use our mock data
    const fetchGoals = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 600));
        setGoals(mockGoals);
      } catch (error) {
        console.error("Error fetching goals:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchGoals();
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
      month: 'short',
      year: 'numeric'
    }).format(date);
  };

  const filteredGoals = filter === "all" 
    ? goals 
    : filter === "active" 
      ? goals.filter(g => !g.achieved) 
      : goals.filter(g => g.achieved);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between py-4">
        <h1 className="text-2xl font-bold">Objectifs</h1>
        <Link 
          href="/goals/new" 
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors duration-200"
        >
          Nouveau
        </Link>
      </header>

      <div className="flex space-x-2 mb-4">
        <button 
          onClick={() => setFilter("all")}
          className={`px-3 py-1.5 rounded-lg text-sm ${
            filter === "all" 
              ? "bg-gray-200 dark:bg-gray-700 font-medium" 
              : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
          }`}
        >
          Tous
        </button>
        <button 
          onClick={() => setFilter("active")}
          className={`px-3 py-1.5 rounded-lg text-sm ${
            filter === "active" 
              ? "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 font-medium" 
              : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
          }`}
        >
          En cours
        </button>
        <button 
          onClick={() => setFilter("completed")}
          className={`px-3 py-1.5 rounded-lg text-sm ${
            filter === "completed" 
              ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 font-medium" 
              : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
          }`}
        >
          Complétés
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-full mt-4"></div>
            </div>
          ))}
        </div>
      ) : filteredGoals.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm text-center">
          <p className="text-gray-600 dark:text-gray-400">
            {filter === "all" 
              ? "Aucun objectif défini" 
              : filter === "active"
                ? "Aucun objectif en cours" 
                : "Aucun objectif complété"}
          </p>
          <Link 
            href="/goals/new" 
            className="text-blue-600 dark:text-blue-400 text-sm font-medium mt-2 inline-block"
          >
            Définir un objectif
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredGoals.map((goal) => (
            <Link 
              key={goal.id}
              href={`/goals/${goal.id}`}
              className="block bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-start">
                  <div className={`mt-1 mr-3 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                    goal.achieved 
                      ? "bg-green-500" 
                      : "border-2 border-gray-300 dark:border-gray-600"
                  }`}>
                    {goal.achieved && (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <h3 className={`font-medium ${goal.achieved ? "line-through text-gray-500 dark:text-gray-400" : ""}`}>
                      {goal.title}
                    </h3>
                    {goal.category && (
                      <div 
                        className="text-xs inline-flex items-center mt-1"
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
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                  {formatDate(goal.targetDate)}
                </div>
              </div>
              
              {!goal.achieved && (
                <>
                  <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mt-3">
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
                </>
              )}
              
              {goal.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                  {goal.description}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
