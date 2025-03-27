<?php

namespace App\Controller;

use App\Entity\Workout;
use App\Repository\WorkoutRepository;
use App\Repository\WorkoutCategoryRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use App\Entity\User;

#[Route('/api', name: 'api_')]
class WorkoutController extends AbstractController
{
    #[Route('/workouts/{userId}', name: 'workouts_list', methods: ['GET'])]
    public function list(
        string $userId,
        WorkoutRepository $workoutRepository,
        UserRepository $userRepository
    ): JsonResponse {
        $user = $userRepository->find($userId);
        if (!$user) {
            return $this->json(['message' => 'User not found'], 404);
        }

        $workouts = $workoutRepository->findBy(['user' => $user]);
        return $this->json($workouts, 200, [], ['groups' => 'workout:read']);
    }

    #[Route('/workouts', name: 'workouts_create', methods: ['POST'])]
    public function create(
        Request $request,
        WorkoutCategoryRepository $categoryRepository,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        try {
            $data = json_decode($request->getContent(), true);

            /** @var User|null $user */
            $user = $this->getUser();
            if (!$user instanceof User) {
                return $this->json(['message' => 'User not authenticated'], 401);
            }

            $category = $categoryRepository->find($data['categoryId']);
            if (!$category) {
                return $this->json(['message' => 'Category not found'], 404);
            }

            $workout = new Workout();
            $workout
                ->setUser($user)
                ->setCategory($category)
                ->setDate(new \DateTime($data['date']))
                ->setDuration($data['duration'])
                ->setIntensity($data['intensity'])
                ->setNotes($data['notes'] ?? null)
                ->setCreatedAt(new \DateTime())
                ->setUpdatedAt(new \DateTime());

            $entityManager->persist($workout);
            $entityManager->flush();

            return $this->json([
                'message' => 'Workout created successfully',
                'workout' => $workout
            ], 201, [], ['groups' => 'workout:read']);
        } catch (\Exception $e) {
            return $this->json([
                'message' => 'Error creating workout: ' . $e->getMessage()
            ], 500);
        }
    }



    #[Route('/workouts/{id}/{userId}', name: 'workouts_delete', methods: ['DELETE'])]
    public function delete(
        string $id,
        string $userId,
        WorkoutRepository $workoutRepository,
        UserRepository $userRepository,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        $user = $userRepository->find($userId);
        if (!$user) {
            return $this->json(['message' => 'User not found'], 404);
        }

        $workout = $workoutRepository->find($id);
        if (!$workout) {
            return $this->json(['message' => 'Workout not found'], 404);
        }

        if ($workout->getUser()->getId() !== $userId) {
            return $this->json(['message' => 'Access denied'], 403);
        }

        $entityManager->remove($workout);
        $entityManager->flush();

        return $this->json(['message' => 'Workout deleted successfully'], 200);
    }

    #[Route('/workouts/{userId}', name: 'workouts_list', methods: ['GET'])]
    public function lists(
        string $userId,
        WorkoutRepository $workoutRepository,
        UserRepository $userRepository
    ): JsonResponse {
        $user = $userRepository->find($userId);
        if (!$user) {
            return $this->json(['message' => 'User not found'], 404);
        }

        $workouts = $workoutRepository->findBy(['user' => $user]);
        return $this->json([
            'message' => 'Workouts retrieved successfully',
            'workouts' => $workouts
        ], 200, [], ['groups' => 'workout:read']);
    }
}
