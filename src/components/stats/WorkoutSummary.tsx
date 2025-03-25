"use client";

import { useState, useEffect } from "react";

// Define interfaces for type safety
interface Category {
  name: string;
  count: number;
  color: string;
  percentage?: number;
}

interface WorkoutSummary {
  totalWorkouts: number;
  totalDuration: number;
  averageIntensity: number;
  categories: Category[];
}

// This would typically come from an API or database
const mockSummary: WorkoutSummary = {
  totalWorkouts: 4,
  totalDuration: 195, // minutes
  averageIntensity: 7.2,
  categories: [
    { name: "Musculation", count: 2, color: "#4299e1" },
    { name: "Cardio", count: 1, color: "#48bb78" },
    { name: "Mobilité", count: 1, color: "#ed8936" }
  ]
};

export function WorkoutSummary() {
  const [summary, setSummary] = useState<WorkoutSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, this would fetch from an API
    // For now, we'll just use our mock data
    setSummary(mockSummary);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm animate-pulse">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
        <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm text-center">
        <p className="text-gray-600 dark:text-gray-400">Aucune donnée disponible pour cette semaine</p>
      </div>
    );
  }

  // Calculate percentage for each category
  const totalCount = summary.categories.reduce((acc: number, cat: Category) => acc + cat.count, 0);
  const categoriesWithPercentage = summary.categories.map((cat: Category) => ({
    ...cat,
    percentage: Math.round((cat.count / totalCount) * 100)
  }));

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">Séances</p>
          <p className="text-xl font-bold">{summary.totalWorkouts}</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">Durée totale</p>
          <p className="text-xl font-bold">{summary.totalDuration} min</p>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">Intensité moy.</p>
          <p className="text-xl font-bold">{summary.averageIntensity.toFixed(1)}/10</p>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">Moy. par jour</p>
          <p className="text-xl font-bold">{Math.round(summary.totalDuration / summary.totalWorkouts)} min</p>
        </div>
      </div>

      <div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Répartition par catégorie</p>
        <div className="space-y-2">
          {categoriesWithPercentage.map((category: Category, index: number) => (
            <div key={index}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm" style={{ color: category.color }}>{category.name}</span>
                <span className="text-xs text-gray-600 dark:text-gray-400">{category.percentage}%</span>
              </div>
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full" 
                  style={{ 
                    width: `${category.percentage}%`,
                    backgroundColor: category.color 
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
