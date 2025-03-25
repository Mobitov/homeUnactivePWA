<?php

namespace App\Controller;

use App\Entity\User;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Mailer\Exception\TransportExceptionInterface;
use Symfony\Component\RateLimiter\RateLimiterFactory;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api', name: 'api_')]
class SecurityController extends AbstractApiController
{
    /**
     * @throws TransportExceptionInterface
     */
    #[Route('/register', name: 'api_register', methods: ["POST"])]
    public function register(Request $request, RateLimiterFactory $registrationLimiter): JsonResponse
    {
        // Rate limiting
        $limiter = $registrationLimiter->create('registration');
        $limit = $limiter->consume();

        if (!$limit->isAccepted()) {
            return new JsonResponse(['message' => 'Too many registration attempts, please try again later.'], 429);
        }

        try {
            $response = $this->securityService->registerUser($request);
        } catch (\Exception $e) {
            return new JsonResponse(['error' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
        }

        return $response;
    }


    #[Route('/confirm/{token}', name: 'confirm_email')]
    public function confirmEmail(string $token): JsonResponse
    {
        try {
            $response = $this->securityService->confirmEmail($token);
        } catch (\Exception $e) {
            return new JsonResponse(['error' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
        } catch (TransportExceptionInterface $e) {
            return new JsonResponse(['error' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }

        return $response;
    }

    #[Route('/check-auth', name: 'api_check_auth', methods: ["GET"])]
    public function checkAuth(Request $request): Response
    {
        try {
            /** @var User|null $user */
            $user = $this->getUser();
            $response = $this->securityService->checkAuth($request, $user);
        } catch (\Exception $e) {
            return new JsonResponse(['error' => $e->getMessage()], Response::HTTP_UNAUTHORIZED);
        }

        return $response;
    }

    #[Route('/logout', name: 'api_logout', methods: ["POST"])]
    public function logout(): Response
    {
        try {
            $response = $this->securityService->logout();
        } catch (\Exception $e) {
            return new JsonResponse(['error' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }

        return $response;
    }


    /**
     * @throws TransportExceptionInterface
     */
    #[Route('/forgot-password', name: 'api_forgot_password', methods: ["POST"])]
    public function forgotPassword(
        Request            $request,
        RateLimiterFactory $forgotPasswordLimiter
    ): Response
    {
        $limiter = $forgotPasswordLimiter->create('forgot_password');
        $limit = $limiter->consume(1);

        if (!$limit->isAccepted()) {
            return new JsonResponse(['message' => 'Too many password reset attempts, please try again later.'], 429);
        }

        try {
            $response = $this->securityService->forgotPassword($request);
        } catch (\Exception $e) {
            return new JsonResponse(['error' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
        }

        return $response;
    }


    #[Route('/reset-password', name: 'api_reset_password', methods: ["POST"])]
    public function resetPassword(
        Request            $request,
        RateLimiterFactory $resetPasswordLimiter
    ): Response
    {
        $limiter = $resetPasswordLimiter->create('reset_password');
        $limit = $limiter->consume(1);

        if (!$limit->isAccepted()) {
            return new JsonResponse(['message' => 'Too many password reset attempts, please try again later.'], 429);
        }

        try {
            $response = $this->securityService->resetPassword($request);
        } catch (\Exception $e) {
            return new JsonResponse(['error' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
        } catch (TransportExceptionInterface $e) {
            return new JsonResponse(['error' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }

        return $response;
    }


}
