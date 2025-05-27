"use client";

<<<<<<< Updated upstream
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import VoiceRecognition from "@/components/VoiceRecognition";

// This would typically come from an API or database
const workoutCategories = [
  { id: "1", name: "Musculation", color: "#4299e1", icon: "💪" },
  { id: "2", name: "Cardio", color: "#48bb78", icon: "🏃" },
  { id: "3", name: "Mobilité", color: "#ed8936", icon: "🧘" },
  { id: "4", name: "Sports collectifs", color: "#9f7aea", icon: "⚽" },
  { id: "5", name: "Natation", color: "#38b2ac", icon: "🏊" },
  { id: "6", name: "Vélo", color: "#f56565", icon: "🚴" }
];

export default function NewWorkoutPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  
  // Define types for workout and exercise
  type Exercise = {
    name: string;
    sets: number;
    reps: number;
    weight: string;
    duration: string;
    distance: string;
  };

  type Workout = {
    date: string;
    categoryId: string;
    duration: number;
    intensity: number;
    notes: string;
    exercises: Exercise[];
  };

  const [step, setStep] = useState(1);
  const [workout, setWorkout] = useState<Workout>({
    date: new Date().toISOString().split('T')[0],
    categoryId: "",
    duration: 30,
    intensity: 5,
    notes: "",
    exercises: []
  });
  const [currentExercise, setCurrentExercise] = useState<Exercise>({
    name: "",
    sets: 3,
    reps: 10,
    weight: "",
    duration: "",
    distance: ""
  });
  
  // Voice recognition states
  const [voiceTarget, setVoiceTarget] = useState<"notes" | "exercise" | null>(null);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
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
        <div className="bg-[var(--card-bg)] p-6 rounded-lg shadow-[var(--shadow-sm)]">
          <div className="space-y-4">
            <div className="h-6 bg-[var(--intensity-bg)] rounded w-1/3 animate-pulse"></div>
            <div className="h-4 bg-[var(--intensity-bg)] rounded w-full animate-pulse"></div>
            <div className="h-4 bg-[var(--intensity-bg)] rounded w-2/3 animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  // Don't render the page if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  const handleCategorySelect = (categoryId: string) => {
    setWorkout({ ...workout, categoryId });
    setStep(2);
  };

  const handleBasicInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(3);
  };

  const handleAddExercise = (e: React.FormEvent) => {
    e.preventDefault();
    setWorkout({
      ...workout,
      exercises: [...workout.exercises, currentExercise]
    });
    setCurrentExercise({
      name: "",
      sets: 3,
      reps: 10,
      weight: "",
      duration: "",
      distance: ""
    });
  };

  const handleRemoveExercise = (index: number) => {
    const updatedExercises = [...workout.exercises];
    updatedExercises.splice(index, 1);
    setWorkout({ ...workout, exercises: updatedExercises });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // In a real app, this would send data to an API
      console.log("Submitting workout:", workout);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Success - redirect to workouts page
      router.push("/workouts");
    } catch (error) {
      console.error("Error submitting workout:", error);
      setIsSubmitting(false);
    }
  };

  // Handle voice recognition results
  const handleVoiceResult = (transcript: string) => {
    setVoiceTranscript(transcript);
  };

  // Handle final voice recognition results
  const handleVoiceFinalResult = (transcript: string) => {
    if (voiceTarget === "notes") {
      // For notes, just use the transcript directly
      setWorkout({
        ...workout,
        notes: workout.notes ? `${workout.notes}\n${transcript}` : transcript
      });
      
      // Show success message
      alert("Notes vocales ajoutées avec succès!");
    } else if (voiceTarget === "exercise") {
      // Try to extract exercise information from voice input
      const exerciseName = transcript.match(/exercice (.*?)(?:\s\d|$)/i)?.[1] || 
                          transcript.match(/^(.*?)(?:\s\d|$)/i)?.[1] || 
                          transcript;
      
      // Try to extract sets, reps, and weight information
      const setsMatch = transcript.match(/(\d+)\s*séries/i) || transcript.match(/(\d+)\s*series/i);
      const repsMatch = transcript.match(/(\d+)\s*répétitions/i) || transcript.match(/(\d+)\s*reps/i) || transcript.match(/(\d+)\s*répés/i);
      const weightMatch = transcript.match(/(\d+(?:\.\d+)?)\s*(?:kg|kilos)/i);
      const durationMatch = transcript.match(/(\d+)\s*(?:min|minutes)/i);
      const distanceMatch = transcript.match(/(\d+(?:\.\d+)?)\s*(?:km|kilomètres|mètres|m)/i);
      
      // Create new exercise object with extracted information
      const newExercise = {
        name: exerciseName.trim() || currentExercise.name,
        sets: setsMatch ? parseInt(setsMatch[1]) : currentExercise.sets,
        reps: repsMatch ? parseInt(repsMatch[1]) : currentExercise.reps,
        weight: weightMatch ? weightMatch[1] : currentExercise.weight,
        duration: durationMatch ? durationMatch[1] : currentExercise.duration,
        distance: distanceMatch ? distanceMatch[1] : currentExercise.distance
      };
      
      setCurrentExercise(newExercise);
      
      // If we have a name and at least one other property with a value, automatically add the exercise
      if (newExercise.name && (newExercise.sets > 0 || newExercise.reps > 0 || newExercise.weight || newExercise.duration || newExercise.distance)) {
        setWorkout({
          ...workout,
          exercises: [...workout.exercises, newExercise]
        });
        
        // Reset current exercise
        setCurrentExercise({
          name: "",
          sets: 3,
          reps: 10,
          weight: "",
          duration: "",
          distance: ""
        });
        
        // Show success message
        alert(`Exercice "${newExercise.name}" ajouté avec succès!`);
      }
    }
    
    // Reset voice target and transcript
    setVoiceTarget(null);
    setIsVoiceRecording(false);
  };

  // Start voice recording for a specific target
  const startVoiceRecording = (target: "notes" | "exercise") => {
    setVoiceTarget(target);
    setIsVoiceRecording(true);
  };

  const selectedCategory = workoutCategories.find(c => c.id === workout.categoryId);

=======
import React from 'react';
import CreateWorkoutForm from '@/components/workouts/CreateWorkoutForm';

export default function NewWorkoutPage() {
>>>>>>> Stashed changes
  return (
    <div className="container mx-auto py-8">
      <CreateWorkoutForm />
    </div>
  );
}