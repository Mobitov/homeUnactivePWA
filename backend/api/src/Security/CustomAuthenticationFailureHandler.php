<?php

namespace App\Security;

use App\Service\LoginAttemptService;
use Psr\Cache\InvalidArgumentException;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
use Symfony\Component\Security\Http\Authentication\AuthenticationFailureHandlerInterface;

class CustomAuthenticationFailureHandler implements AuthenticationFailureHandlerInterface
{
    private LoginAttemptService $loginAttemptService;

    public function __construct(LoginAttemptService $loginAttemptService)
    {
        $this->loginAttemptService = $loginAttemptService;
    }

    /**
     * @throws InvalidArgumentException
     */
    public function onAuthenticationFailure(Request $request, AuthenticationException $exception): Response
    {
        $username = $request->get('identifier', 'anonymous');
        $clientIp = $request->getClientIp();
        $userAgent = $request->headers->get('User-Agent');

        $blockStatus = $this->loginAttemptService->isBlocked($username, $clientIp, $userAgent);
        if ($blockStatus['blocked']) {
            return new JsonResponse(
                [
                    'success' => false,
                    'message' => "Too many login attempts. Please wait {$blockStatus['block_time']} seconds.",
                    'block_time' => $blockStatus['block_time'],
                ], 429
            );
        }

        $loginAttempts = $this->loginAttemptService->setLoginAttempt($username, $clientIp, $userAgent);

        return new JsonResponse(
            [
                'success' => false,
                'message' => 'Invalid credentials',
                'mistake' => $loginAttempts,
            ], 401
        );
    }
}
