"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

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

<<<<<<< Updated upstream
const mockWorkouts: Workout[] = [
  {
    id: "1",
    date: new Date(Date.now() - 86400000),
    category: { name: "Musculation", color: "#4299e1" },
    duration: 60,
    intensity: 8,
  },
  {
    id: "2",
    date: new Date(Date.now() - 86400000 * 3),
    category: { name: "Cardio", color: "#48bb78" },
    duration: 45,
    intensity: 7,
  },
  {
    id: "3",
    date: new Date(Date.now() - 86400000 * 5),
    category: { name: "Mobilité", color: "#ed8936" },
    duration: 30,
    intensity: 5,
  },
  {
    id: "4",
    date: new Date(Date.now() - 86400000 * 7),
    category: { name: "Musculation", color: "#4299e1" },
    duration: 55,
    intensity: 9,
  },
  {
    id: "5",
    date: new Date(Date.now() - 86400000 * 10),
    category: { name: "Cardio", color: "#48bb78" },
    duration: 40,
    intensity: 6,
  },
];

=======
>>>>>>> Stashed changes
export default function WorkoutsPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  // Pour la caméra
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
<<<<<<< Updated upstream
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (isAuthenticated) {
      // In a real app, this would fetch from an API
      // For now, we'll just use our mock data
      setWorkouts(mockWorkouts);
      setLoading(false);
    }
  }, [isAuthenticated, authLoading, router]);

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between py-4">
          <div className="h-8 w-40 bg-[var(--intensity-bg)] rounded animate-pulse"></div>
          <div className="h-10 w-20 bg-[var(--intensity-bg)] rounded animate-pulse"></div>
        </div>
=======
    const fetchWorkouts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Call API to get workouts for authenticated user
        const response = await fetch('http://localhost:1111/api/workouts/1', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            // Uncomment and adapt based on your auth system:
            // 'Authorization': `Bearer ${localStorage.getItem('token')}`,
            // 'X-AUTH-TOKEN': getCookie('auth_token'),
          },
          // Include cookies if using session-based auth
          credentials: 'include',
        });

        if (!response.ok) {
          // Log pour debug
          console.error('API Error:', {
            status: response.status,
            statusText: response.statusText,
            url: response.url
          });
          
          // Try to get error message from response body
          let errorMessage = `Erreur ${response.status}: ${response.statusText}`;
          try {
            const errorData = await response.json();
            if (errorData.message) {
              errorMessage = errorData.message;
            }
          } catch (e) {
            // If response is not JSON, keep the default message
          }
          
          if (response.status === 401) {
            throw new Error('Vous devez être connecté pour voir vos entraînements');
          }
          if (response.status === 404) {
            throw new Error('Endpoint API non trouvé - vérifiez votre configuration');
          }
          throw new Error(errorMessage);
        }

        const data: Workout[] = await response.json();

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
        console.error('Error fetching workouts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkouts();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short' 
    }).format(date);
  };



  if (error) {
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
        
        <div className="bg-[var(--card-bg)] p-4 rounded-lg shadow-[var(--shadow-sm)] text-center">
          <p className="text-red-500 text-sm mb-2">Erreur: {error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="text-[var(--primary)] text-sm font-medium hover:text-[var(--primary-hover)] transition-colors duration-200"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

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



      {loading ? (
>>>>>>> Stashed changes
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-[var(--card-bg)] p-4 rounded-lg shadow-[var(--shadow-sm)] animate-pulse">
              <div className="h-4 bg-[var(--intensity-bg)] rounded w-1/4 mb-2"></div>
              <div className="h-4 bg-[var(--intensity-bg)] rounded w-1/2"></div>
            </div>
          ))}
        </div>
<<<<<<< Updated upstream
      </div>
    );
  }

  // Don't render the page if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("fr-FR", {
      weekday: "short",
      day: "numeric",
      month: "short",
    }).format(date);
  };

  const filteredWorkouts =
      filter === "all"
          ? workouts
          : workouts.filter((w) => w.category.name.toLowerCase() === filter);

  // Démarrer la caméra
  const startCamera = async () => {
    setError(null);
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" }, // caméra arrière sur mobile
          audio: false,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          setCameraOn(true);
        }
      } catch (err) {
        setError("Impossible d'accéder à la caméra.");
      }
    } else {
      setError("Votre navigateur ne supporte pas la caméra.");
    }
  };

  // Prendre la photo
  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const width = videoRef.current.videoWidth;
    const height = videoRef.current.videoHeight;

    canvasRef.current.width = width;
    canvasRef.current.height = height;

    const ctx = canvasRef.current.getContext("2d");
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, width, height);
      const imageDataUrl = canvasRef.current.toDataURL("image/png");
      setPhoto(imageDataUrl);
      stopCamera();
    }
  };

  // Arrêter la caméra
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraOn(false);
  };

  return (
      <div className="space-y-6">
        <header className="flex items-center justify-between py-4">
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Entraînements
          </h1>
          <Link
              href="/workouts/new"
              className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors duration-200"
=======
      ) : workouts.length === 0 ? (
        <div className="bg-[var(--card-bg)] p-4 rounded-lg shadow-[var(--shadow-sm)] text-center">
          <p className="text-[var(--text-secondary)]">
            Aucun entraînement enregistré
          </p>
          <Link 
            href="/workouts/new" 
            className="text-[var(--primary)] text-sm font-medium mt-2 inline-block hover:text-[var(--primary-hover)] transition-colors duration-200"
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream

        {/* Partie caméra */}
        <div className="space-y-3 border rounded p-4 bg-[var(--card-bg)]">
          <h2 className="text-lg font-semibold mb-2 text-[var(--text-primary)]">
            Prendre une photo
          </h2>
          {!cameraOn && (
              <button
                  onClick={startCamera}
                  className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors duration-200"
              >
                Ouvrir la caméra
              </button>
          )}
          {error && <p className="text-red-500 mt-2">{error}</p>}

          {cameraOn && (
              <>
                <video
                    ref={videoRef}
                    className="rounded-lg w-full max-w-xs"
                    autoPlay
                    playsInline
                />
                <div className="mt-2 flex space-x-2">
                  <button
                      onClick={takePhoto}
                      className="bg-[var(--success)] hover:bg-[var(--success-hover)] text-white font-medium py-1 px-3 rounded"
                  >
                    Prendre la photo
                  </button>
                  <button
                      onClick={stopCamera}
                      className="bg-[var(--danger)] hover:bg-[var(--danger-hover)] text-white font-medium py-1 px-3 rounded"
                  >
                    Fermer la caméra
                  </button>
=======
      ) : (
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
                  {workout.notes && (
                    <p className="text-[var(--text-secondary)] text-xs mt-1 line-clamp-1">
                      {workout.notes}
                    </p>
                  )}
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
>>>>>>> Stashed changes
                </div>
              </>
          )}

          {photo && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-[var(--text-primary)] mb-1">
                  Photo capturée :
                </h3>
                <img
                    src={photo}
                    alt="Photo prise"
                    className="rounded-lg max-w-xs border"
                />
              </div>
          )}

          {/* Canvas caché pour capturer l'image */}
          <canvas ref={canvasRef} style={{ display: "none" }} />
        </div>

        {/* Affichage des workouts */}
        {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                  <div
                      key={i}
                      className="bg-[var(--card-bg)] p-4 rounded-lg shadow-[var(--shadow-sm)] animate-pulse"
                  >
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
                        <p className="text-[var(--text-secondary)] text-sm">
                          {formatDate(workout.date)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{workout.duration} min</p>
                        <div className="flex items-center mt-1">
                    <span className="text-xs text-[var(--text-secondary)] mr-1">
                      Intensité:
                    </span>
                          <div className="w-16 h-2 bg-[var(--intensity-bg)] rounded-full overflow-hidden">
                            <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${(workout.intensity / 10) * 100}%`,
                                  backgroundColor: workout.category.color,
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