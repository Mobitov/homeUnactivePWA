"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

// Define interfaces for type safety
interface Category {
  name: string;
  count: number;
  color: string;
  totalDuration: number;
  percentage?: number;
}

interface WeeklyData {
  week: string;
  workouts: number;
  duration: number;
  heightPercentage?: number;
}

interface ExerciseProgress {
  exercise: string;
  values: number[];
}

interface ProgressData {
  musculation: ExerciseProgress[];
  cardio: ExerciseProgress[];
}

interface Stats {
  totalWorkouts: number;
  totalDuration: number;
  averageIntensity: number;
  categories: Category[];
  weeklyData: WeeklyData[];
  progressData: ProgressData;
}

// This would typically come from an API or database
const mockStats: Stats = {
  totalWorkouts: 15,
  totalDuration: 720, // minutes
  averageIntensity: 7.4,
  categories: [
    { name: "Musculation", count: 8, color: "#4299e1", totalDuration: 480 },
    { name: "Cardio", count: 5, color: "#48bb78", totalDuration: 180 },
    { name: "Mobilité", count: 2, color: "#ed8936", totalDuration: 60 }
  ],
  weeklyData: [
    { week: "Sem 1", workouts: 2, duration: 90 },
    { week: "Sem 2", workouts: 3, duration: 150 },
    { week: "Sem 3", workouts: 4, duration: 210 },
    { week: "Sem 4", workouts: 3, duration: 135 },
    { week: "Sem 5", workouts: 3, duration: 135 }
  ],
  progressData: {
    musculation: [
      { exercise: "Développé couché", values: [70, 72.5, 75, 77.5, 80] },
      { exercise: "Squat", values: [90, 95, 100, 105, 110] }
    ],
    cardio: [
      { exercise: "Course à pied", values: [5, 5.5, 6, 6.5, 7] } // km
    ]
  }
};

export default function StatsPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("month"); // "week", "month", "year", "all"
  const [progressExercise, setProgressExercise] = useState("Développé couché");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (isAuthenticated) {
      // In a real app, this would fetch from an API
      // For now, we'll just use our mock data
      const fetchStats = async () => {
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 800));
          setStats(mockStats);
        } catch (error) {
          console.error("Error fetching stats:", error);
        } finally {
          setLoading(false);
        }
      };
      
      fetchStats();
    }
  }, [timeRange, isAuthenticated, authLoading, router]);

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between py-4">
          <div className="h-8 w-32 bg-[var(--intensity-bg)] rounded animate-pulse"></div>
          <div className="h-10 w-24 bg-[var(--intensity-bg)] rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-[var(--card-bg)] p-6 rounded-lg shadow-[var(--shadow-sm)]">
              <div className="h-4 bg-[var(--intensity-bg)] rounded w-1/2 mb-2 animate-pulse"></div>
              <div className="h-8 bg-[var(--intensity-bg)] rounded w-3/4 animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Don't render the page if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-[var(--intensity-bg)] rounded w-1/2 mb-4"></div>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="h-24 bg-[var(--intensity-bg)] rounded"></div>
          <div className="h-24 bg-[var(--intensity-bg)] rounded"></div>
          <div className="h-24 bg-[var(--intensity-bg)] rounded"></div>
          <div className="h-24 bg-[var(--intensity-bg)] rounded"></div>
        </div>
        <div className="h-64 bg-[var(--intensity-bg)] rounded mb-6"></div>
        <div className="h-64 bg-[var(--intensity-bg)] rounded"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <h1 className="text-xl font-medium mb-4 text-[var(--text-primary)]">Aucune statistique disponible</h1>
        <p className="text-[var(--text-secondary)] mb-6">Commencez à enregistrer vos entraînements pour voir vos statistiques.</p>
        <Link 
          href="/workouts/new" 
          className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
        >
          Créer un entraînement
        </Link>
      </div>
    );
  }

  // Calculate percentage for each category
  const totalCount = stats.categories.reduce((acc: number, cat: Category) => acc + cat.count, 0);
  const categoriesWithPercentage = stats.categories.map((cat: Category) => ({
    ...cat,
    percentage: Math.round((cat.count / totalCount) * 100)
  }));

  // Create chart data for weekly workouts
  const weeklyChartData = stats.weeklyData.map((week: WeeklyData, index: number) => ({
    ...week,
    heightPercentage: Math.round((week.duration / Math.max(...stats.weeklyData.map(w => w.duration))) * 100)
  }));

  // Create chart data for progress
  const progressChartData = stats.progressData.musculation
    .find(ex => ex.exercise === progressExercise)?.values || [];
  
  const maxProgressValue = Math.max(...progressChartData);
  const progressChartHeight = 150; // pixels
  
  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between py-4">
        <h1 className="text-2xl font-bold">Statistiques</h1>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="bg-[var(--card-bg)] border border-[var(--nav-border)] rounded-md shadow-[var(--shadow-sm)] py-1 px-3 focus:outline-none focus:ring-[var(--primary)] focus:border-[var(--primary)] text-sm text-[var(--text-primary)]"
        >
          <option value="week">Cette semaine</option>
          <option value="month">Ce mois</option>
          <option value="year">Cette année</option>
          <option value="all">Tout</option>
        </select>
      </header>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[var(--card-bg)] p-4 rounded-lg shadow-[var(--shadow-sm)]">
          <p className="text-sm text-[var(--text-secondary)]">Entraînements</p>
          <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.totalWorkouts}</p>
        </div>
        <div className="bg-[var(--card-bg)] p-4 rounded-lg shadow-[var(--shadow-sm)]">
          <p className="text-sm text-[var(--text-secondary)]">Durée totale</p>
          <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.totalDuration} min</p>
        </div>
        <div className="bg-[var(--card-bg)] p-4 rounded-lg shadow-[var(--shadow-sm)]">
          <p className="text-sm text-[var(--text-secondary)]">Intensité moy.</p>
          <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.averageIntensity.toFixed(1)}/10</p>
        </div>
        <div className="bg-[var(--card-bg)] p-4 rounded-lg shadow-[var(--shadow-sm)]">
          <p className="text-sm text-[var(--text-secondary)]">Moy. par séance</p>
          <p className="text-2xl font-bold text-[var(--text-primary)]">{Math.round(stats.totalDuration / stats.totalWorkouts)} min</p>
        </div>
      </div>

      <div className="bg-[var(--card-bg)] p-4 rounded-lg shadow-[var(--shadow-sm)]">
        <h2 className="font-medium mb-4 text-[var(--text-primary)]">Répartition par catégorie</h2>
        <div className="space-y-4">
          {categoriesWithPercentage.map((category, index) => (
            <div key={index}>
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium" style={{ color: category.color }}>{category.name}</span>
                <span className="text-sm text-[var(--text-secondary)]">{category.count} séances ({category.percentage}%)</span>
              </div>
              <div className="w-full h-4 bg-[var(--intensity-bg)] rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full" 
                  style={{ 
                    width: `${category.percentage}%`,
                    backgroundColor: category.color 
                  }}
                ></div>
              </div>
              <p className="text-sm text-[var(--text-secondary)] mt-1">Durée totale: {category.totalDuration} min</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[var(--card-bg)] p-4 rounded-lg shadow-[var(--shadow-sm)]">
        <h2 className="font-medium mb-4 text-[var(--text-primary)]">Activité hebdomadaire</h2>
        <div className="h-48">
          <div className="flex items-end justify-between h-40 mb-2">
            {weeklyChartData.map((week, index) => (
              <div key={index} className="flex flex-col items-center w-full">
                <div 
                  className="w-8 rounded-t-md transition-all duration-500"
                  style={{ 
                    height: `${week.heightPercentage}%`,
                    backgroundColor: week.workouts >= 3 ? "var(--success)" : "var(--primary)"
                  }}
                ></div>
              </div>
            ))}
          </div>
          <div className="flex justify-between">
            {weeklyChartData.map((week, index) => (
              <div key={index} className="text-xs text-center w-full">
                <p className="font-medium text-[var(--text-primary)]">{week.week}</p>
                <p className="text-[var(--text-secondary)]">{week.workouts} séances</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-[var(--card-bg)] p-4 rounded-lg shadow-[var(--shadow-sm)]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-medium text-[var(--text-primary)]">Progression</h2>
          <select
            value={progressExercise}
            onChange={(e) => setProgressExercise(e.target.value)}
            className="bg-[var(--card-bg)] border border-[var(--nav-border)] rounded-md py-1 px-3 text-sm focus:outline-none focus:ring-[var(--primary)] focus:border-[var(--primary)] text-[var(--text-primary)]"
          >
            {stats.progressData.musculation.map((ex) => (
              <option key={ex.exercise} value={ex.exercise}>{ex.exercise}</option>
            ))}
            {stats.progressData.cardio.map((ex) => (
              <option key={ex.exercise} value={ex.exercise}>{ex.exercise}</option>
            ))}
          </select>
        </div>
        
        <div className="h-48">
          <div className="relative h-40 mb-2">
            {/* Chart lines */}
            <div className="absolute top-0 left-0 w-full h-full flex flex-col justify-between">
              {[0, 1, 2, 3].map((_, i) => (
                <div key={i} className="w-full h-px bg-[var(--intensity-bg)]"></div>
              ))}
            </div>
            
            {/* Data points and lines */}
            <div className="absolute top-0 left-0 w-full h-full flex items-end">
              <svg className="w-full h-full" viewBox={`0 0 ${progressChartData.length * 50} ${progressChartHeight}`} preserveAspectRatio="none">
                <polyline
                  points={progressChartData.map((value, index) => 
                    `${index * 50 + 25},${progressChartHeight - (value / maxProgressValue) * progressChartHeight}`
                  ).join(' ')}
                  fill="none"
                  stroke="var(--primary)"
                  strokeWidth="2"
                />
                {progressChartData.map((value, index) => (
                  <circle
                    key={index}
                    cx={index * 50 + 25}
                    cy={progressChartHeight - (value / maxProgressValue) * progressChartHeight}
                    r="4"
                    fill="var(--primary)"
                  />
                ))}
              </svg>
            </div>
          </div>
          
          <div className="flex justify-between">
            {progressChartData.map((value, index) => (
              <div key={index} className="text-xs text-center">
                <p className="font-medium text-[var(--text-primary)]">{`#${index + 1}`}</p>
                <p className="text-[var(--text-secondary)]">
                  {progressExercise.includes("Course") ? `${value} km` : `${value} kg`}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
