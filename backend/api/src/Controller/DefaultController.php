<?php

namespace App\Controller;

use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

class DefaultController
{
    #[Route('/', name: 'default_redirect')]
    public function index(): JsonResponse
    {
        return new JsonResponse(['message' => 'Welcome to the Auht api starter v1.0', 'status' => 'success']);
    }
}