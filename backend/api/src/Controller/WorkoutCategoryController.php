<?php

namespace App\Controller;

use App\Repository\WorkoutCategoryRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;

#[Route('/api', name: 'api_')]
class WorkoutCategoryController extends AbstractController
{
    #[Route('/workout-categories', name: 'workout_categories_list', methods: ['GET'])]
    public function list(WorkoutCategoryRepository $categoryRepository): JsonResponse
    {
        $categories = $categoryRepository->findAll();
        
        return $this->json($categories, 200, [], [
            'groups' => ['category:read']
        ]);
    }
}