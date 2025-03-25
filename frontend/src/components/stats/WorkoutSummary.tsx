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
      <div className="bg-[var(--card-bg)] p-4 rounded-lg shadow-[var(--shadow-sm)] animate-pulse">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="h-16 bg-[var(--intensity-bg)] rounded"></div>
          <div className="h-16 bg-[var(--intensity-bg)] rounded"></div>
          <div className="h-16 bg-[var(--intensity-bg)] rounded"></div>
          <div className="h-16 bg-[var(--intensity-bg)] rounded"></div>
        </div>
        <div className="h-24 bg-[var(--intensity-bg)] rounded"></div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="bg-[var(--card-bg)] p-4 rounded-lg shadow-[var(--shadow-sm)] text-center">
        <p className="text-[var(--text-secondary)]">Aucune donnée disponible pour cette semaine</p>
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
    <div className="bg-[var(--card-bg)] p-4 rounded-lg shadow-[var(--shadow-sm)]">
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-[color:var(--primary)] bg-opacity-10 p-3 rounded-lg">
          <p className="text-sm text-[var(--text-secondary)]">Séances</p>
          <p className="text-xl font-bold text-[var(--text-primary)]">{summary.totalWorkouts}</p>
        </div>
        <div className="bg-[color:var(--success)] bg-opacity-10 p-3 rounded-lg">
          <p className="text-sm text-[var(--text-secondary)]">Durée totale</p>
          <p className="text-xl font-bold text-[var(--text-primary)]">{summary.totalDuration} min</p>
        </div>
        <div className="bg-[color:var(--warning)] bg-opacity-10 p-3 rounded-lg">
          <p className="text-sm text-[var(--text-secondary)]">Intensité moy.</p>
          <p className="text-xl font-bold text-[var(--text-primary)]">{summary.averageIntensity.toFixed(1)}/10</p>
        </div>
        <div className="bg-[color:var(--info)] bg-opacity-10 p-3 rounded-lg">
          <p className="text-sm text-[var(--text-secondary)]">Moy. par jour</p>
          <p className="text-xl font-bold text-[var(--text-primary)]">{Math.round(summary.totalDuration / summary.totalWorkouts)} min</p>
        </div>
      </div>

      <div>
        <p className="text-sm text-[var(--text-secondary)] mb-2">Répartition par catégorie</p>
        <div className="space-y-2">
          {categoriesWithPercentage.map((category: Category, index: number) => (
            <div key={index}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm" style={{ color: category.color }}>{category.name}</span>
                <span className="text-xs text-[var(--text-secondary)]">{category.percentage}%</span>
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
