"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// Define interfaces for type safety
interface Category {
  name: string;
  color: string;
}

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps?: number;
  weight?: number;
  distance?: number;
  duration?: number;
}

interface Workout {
  id: string;
  date: Date;
  category: Category;
  duration: number;
  intensity: number;
  notes: string;
  exercises: Exercise[];
  shared: boolean;
}

interface WorkoutsMap {
  [key: string]: Workout;
}

// This would typically come from an API or database
const mockWorkouts: WorkoutsMap = {
  "1": {
    id: "1",
    date: new Date(Date.now() - 86400000), // yesterday
    category: {
      name: "Musculation",
      color: "#4299e1"
    },
    duration: 60,
    intensity: 8,
    notes: "Bonne séance aujourd'hui. J'ai augmenté les charges sur le développé couché et les squats. À continuer la semaine prochaine.",
    exercises: [
      {
        id: "1-1",
        name: "Développé couché",
        sets: 4,
        reps: 8,
        weight: 80
      },
      {
        id: "1-2",
        name: "Squat",
        sets: 4,
        reps: 10,
        weight: 100
      },
      {
        id: "1-3",
        name: "Rowing barre",
        sets: 3,
        reps: 12,
        weight: 60
      }
    ],
    shared: false
  },
  "2": {
    id: "2",
    date: new Date(Date.now() - 86400000 * 3), // 3 days ago
    category: {
      name: "Cardio",
      color: "#48bb78"
    },
    duration: 45,
    intensity: 7,
    notes: "Course à pied en extérieur. Bonne sensation malgré la chaleur.",
    exercises: [
      {
        id: "2-1",
        name: "Course à pied",
        sets: 1,
        distance: 8,
        duration: 45 * 60
      }
    ],
    shared: false
  }
};

export default function WorkoutDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    // In a real app, this would fetch from an API
    // For now, we'll just use our mock data
    const fetchWorkout = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const workoutData = mockWorkouts[params.id];
        if (workoutData) {
          setWorkout(workoutData);
        }
      } catch (error) {
        console.error("Error fetching workout:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchWorkout();
  }, [params.id]);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  const handleDelete = async () => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet entraînement ?")) {
      setIsDeleting(true);
      
      try {
        // In a real app, this would call an API
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Success - redirect to workouts page
        router.push("/workouts");
      } catch (error) {
        console.error("Error deleting workout:", error);
        setIsDeleting(false);
      }
    }
  };

  const handleShare = async () => {
    setIsSharing(true);
    
    try {
      // In a real app, this would call an API to generate a share link
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate a fake share URL
      const url = `https://traintrack.app/shared/${params.id}`;
      setShareUrl(url);
      
      // Use Web Share API if available
      if (navigator.share && workout) {
        await navigator.share({
          title: `Entraînement de ${workout.category.name}`,
          text: `J'ai terminé un entraînement de ${workout.category.name} de ${workout.duration} minutes !`,
          url: url
        });
      } else {
        // Fallback for browsers that don't support the Web Share API
        // Copy to clipboard
        await navigator.clipboard.writeText(url);
        alert("Lien de partage copié dans le presse-papier !");
      }
    } catch (error) {
      console.error("Error sharing workout:", error);
    } finally {
      setIsSharing(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-6"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (!workout) {
    return (
      <div className="text-center py-12">
        <h1 className="text-xl font-medium mb-4">Entraînement non trouvé</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">L'entraînement que vous recherchez n'existe pas ou a été supprimé.</p>
        <Link 
          href="/workouts" 
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
        >
          Retour aux entraînements
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between py-4">
        <Link 
          href="/workouts" 
          className="text-gray-600 dark:text-gray-400 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Retour
        </Link>
        <div className="flex space-x-2">
          <button
            onClick={handleShare}
            disabled={isSharing}
            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors duration-200"
          >
            {isSharing ? (
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            )}
          </button>
          <Link
            href={`/workouts/${params.id}/edit`}
            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </Link>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full transition-colors duration-200"
          >
            {isDeleting ? (
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            )}
          </button>
        </div>
      </header>

      <div className="space-y-6">
        <div>
          <div 
            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-2"
            style={{ 
              backgroundColor: `${workout.category.color}20`, 
              color: workout.category.color 
            }}
          >
            {workout.category.name}
          </div>
          <h1 className="text-2xl font-bold">{formatDate(workout.date)}</h1>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
            <p className="text-sm text-gray-600 dark:text-gray-400">Durée</p>
            <p className="text-xl font-bold">{workout.duration} min</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
            <p className="text-sm text-gray-600 dark:text-gray-400">Intensité</p>
            <div className="flex items-center">
              <p className="text-xl font-bold mr-2">{workout.intensity}/10</p>
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
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

        {workout.notes && (
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
            <h2 className="font-medium mb-2">Notes</h2>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{workout.notes}</p>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
          <h2 className="font-medium mb-4">Exercices</h2>
          {workout.exercises.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400">Aucun exercice enregistré</p>
          ) : (
            <div className="space-y-4">
              {workout.exercises.map((exercise) => (
                <div key={exercise.id} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0 last:pb-0">
                  <h3 className="font-medium">{exercise.name}</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <div className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm">
                      {exercise.sets} {exercise.sets > 1 ? 'séries' : 'série'}
                    </div>
                    {exercise.reps && (
                      <div className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm">
                        {exercise.reps} {exercise.reps > 1 ? 'répétitions' : 'répétition'}
                      </div>
                    )}
                    {exercise.weight && (
                      <div className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm">
                        {exercise.weight} kg
                      </div>
                    )}
                    {exercise.duration && (
                      <div className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm">
                        {exercise.duration / 60 < 1 
                          ? `${exercise.duration} sec` 
                          : `${Math.floor(exercise.duration / 60)} min`}
                      </div>
                    )}
                    {exercise.distance && (
                      <div className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm">
                        {exercise.distance} km
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
