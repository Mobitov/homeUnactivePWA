<?php

namespace App\Security;

use AllowDynamicProperties;
use App\Entity\User;
use App\Service\LoginAttemptService;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Psr\Cache\InvalidArgumentException;
use Psr\Log\LoggerInterface;
use Symfony\Component\HttpFoundation\Cookie;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\RateLimiter\RateLimiterFactory;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Http\Authentication\AuthenticationSuccessHandlerInterface;

#[AllowDynamicProperties] class CustomAuthenticationSuccessHandler implements AuthenticationSuccessHandlerInterface
{
    private JWTTokenManagerInterface $JWTManager;
    private LoginAttemptService $loginAttemptService;
    private RateLimiterFactory $loginLimiter;
    private LoggerInterface $logger;

    public function __construct(
        JWTTokenManagerInterface $JWTManager,
        LoginAttemptService      $loginAttemptService,
        LoggerInterface          $logger,
        RateLimiterFactory       $loginLimiter)
    {
        $this->JWTManager = $JWTManager;
        $this->loginAttemptService = $loginAttemptService;
        $this->loginLimiter = $loginLimiter;
        $this->logger = $logger;
    }

    /**
     * @throws InvalidArgumentException
     */
    public function onAuthenticationSuccess(Request $request, TokenInterface $token): ?Response
    {

        // Rate limiting
        $limiter = $this->loginLimiter->create('login');
        $limit = $limiter->consume(1);

        if (!$limit->isAccepted()) {
            return new JsonResponse(['message' => 'Too many registration attempts, please try again later.'], 429);
        }

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

        /** @var User $user */
        $user = $token->getUser();

        if (!$user->getIsAccountActive()) {
            return new JsonResponse([
                'message' => 'Your account is inactive. Please contact support.'
            ], 403);
        }

        $jwt = $this->JWTManager->createFromPayload($user, [
            'id' => $user->getId(),
            'username' => $user->getUsername(),
            'roles' => $user->getRoles()
        ]);

$this->logger->info('Generated JWT custom: ' . $jwt); // Log JWT token


        $response = new JsonResponse([
            'id' => $user->getId(),
            'username' => $user->getUsername(),
            'message' => sprintf('Logged in as %s', $user->getUsername()),
        ]);

        $response->headers->setCookie(
            new Cookie(
                'jwt_token',
                $jwt,
                time() + (3600 * 24), // 24 hours
                '/',
                null,
                false,
                true,
                false,
                'Strict'
            )
        );


        $this->logger->info('"Existing cookies: ": ' . json_encode($request->cookies->all(), JSON_THROW_ON_ERROR)); // Log JWT token

        $this->loginAttemptService->deleteLoginAttempt($username, $clientIp, $userAgent);
        return $response;
    }
}