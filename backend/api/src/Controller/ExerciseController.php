<?php

namespace App\Controller;

use App\Entity\Exercise;
use App\Repository\ExerciseRepository;
use App\Repository\WorkoutRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api', name: 'api_')]
class ExerciseController extends AbstractController
{
    #[Route('/exercises', name: 'exercises_create', methods: ['POST'])]
    public function create(
        Request $request,
        WorkoutRepository $workoutRepository,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        try {
            $data = json_decode($request->getContent(), true);
            
            // Check if workoutId is provided in the request body
            if (!isset($data['workoutId'])) {
                return $this->json(['message' => 'Workout ID is required'], 400);
            }

            $workout = $workoutRepository->find($data['workoutId']);
            if (!$workout) {
                return $this->json(['message' => 'Workout not found'], 404);
            }
    
            $exercise = new Exercise();
            $exercise
                ->setWorkout($workout)
                ->setName($data['name'])
                ->setSets($data['sets'])
                ->setReps($data['reps'])
                ->setWeight($data['weight'] ?? null)
                ->setDistance($data['distance'] ?? null)
                ->setDuration($data['duration'] ?? null)
                ->setNotes($data['notes'] ?? null);
    
            $entityManager->persist($exercise);
            $entityManager->flush();
    
            return $this->json([
                'message' => 'Exercise created successfully',
                'exercise' => $exercise
            ], 201, [], ['groups' => 'exercise:read']);
        } catch (\Exception $e) {
            return $this->json([
                'message' => 'Error creating exercise: ' . $e->getMessage()
            ], 500);
        }
    }


    #[Route('/exercises/{id}', name: 'exercises_delete', methods: ['DELETE'])]
    public function delete(
        Exercise $exercise,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        try {
            $entityManager->remove($exercise);
            $entityManager->flush();

            return $this->json([
                'message' => 'Exercise deleted successfully'
            ], 200);
        } catch (\Exception $e) {
            return $this->json([
                'message' => 'Error deleting exercise: ' . $e->getMessage()
            ], 500);
        }
    }
}