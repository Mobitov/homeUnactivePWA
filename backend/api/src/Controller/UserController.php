<?php

namespace App\Controller;

use Doctrine\ORM\Exception\ORMException;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Mailer\Exception\TransportExceptionInterface;
use Symfony\Component\RateLimiter\RateLimiterFactory;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api')]
class UserController extends AbstractApiController
{
    #[Route('/get-user/{id}', name: 'api_get_user', methods: ["GET"])]
    public function getUserById(Request $request, int $id): Response
    {
        try {
            $response = $this->userService->getUserById($request, $id);
        } catch (\Exception $e) {
            return new JsonResponse(['error' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
        }

        return $response;
    }

    #[Route('/get-all-users', name: 'api_get_all_users', methods: ["GET"])]
    public function getAllUsers(Request $request): Response
    {
        try {
            $response = $this->userService->getAllUsers($request);
        } catch (\Exception $e) {
            return new JsonResponse(['error' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
        }

        return $response;
    }


    #[Route('/send-delete-code/{id}', name: 'api_send_delete_code', methods: ["POST"])]
    public function sendDeleteCode(Request $request, int $id, RateLimiterFactory $sendCodeLimiter): Response
    {
        $this->denyAccessUnlessGranted('IS_AUTHENTICATED_FULLY');

        $limiter = $sendCodeLimiter->create('send_code');
        $limit = $limiter->consume();

        if (!$limit->isAccepted()) {
            return new JsonResponse(['message' => 'Too many requests, please try again later.'], 429);
        }

        try {
            $response = $this->userService->sendDeleteCode($request, $id);
        } catch (\Exception $e) {
            return new JsonResponse(['error' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
        } catch (TransportExceptionInterface $e) {
            return new JsonResponse(['error' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }

        return $response;
    }

    #[Route('/delete-user/{id}', name: 'api_delete_user', methods: ["DELETE"])]
    public function deleteUserById(Request $request, int $id, RateLimiterFactory $deleteUserLimiter): Response
    {
        $this->denyAccessUnlessGranted('IS_AUTHENTICATED_FULLY');

        $limiter = $deleteUserLimiter->create('delete_user');
        $limit = $limiter->consume();

        if (!$limit->isAccepted()) {
            return new JsonResponse(['message' => 'Too many requests, please try again later.'], 429);
        }

        try {
            $response = $this->userService->deleteUserById($request, $id);
        } catch (\Exception $e) {
            return new JsonResponse(['error' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
        } catch (TransportExceptionInterface $e) {
            return new JsonResponse(['error' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }

        return $response;
    }

    #[Route('/update-user/{id}', name: 'api_update_user', methods: ["POST"])]
    public function updateUser(Request $request, int $id, RateLimiterFactory $updateUserLimiter): JsonResponse
    {
        $this->denyAccessUnlessGranted('IS_AUTHENTICATED_FULLY');

        $limiter = $updateUserLimiter->create('update_user');
        $limit = $limiter->consume();

        if (!$limit->isAccepted()) {
            return new JsonResponse(['message' => 'Too many requests, please try again later.'], 429);
        }

        try {
            $response = $this->userService->updateUser($request, $id);
        } catch (\Exception $e) {
            return new JsonResponse(['error' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
        } catch (ORMException|TransportExceptionInterface $e) {
            return new JsonResponse(['error' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }

        return $response;
    }
}