<?php

namespace App\Controller;

use App\Entity\User;
use DateTimeImmutable;
use KnpU\OAuth2ClientBundle\Client\ClientRegistry;
use League\OAuth2\Client\Provider\GoogleUser;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Psr\Cache\InvalidArgumentException;
use Random\RandomException;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\TooManyRequestsHttpException;
use Symfony\Component\Mailer\Exception\TransportExceptionInterface;
use Symfony\Component\RateLimiter\RateLimiterFactory;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;

#[Route('/api')]
class OAuthController extends AbstractApiController
{
    private const int STATE_EXPIRATION_TIME = 300;
    private const int AUTH_CODE_CACHE_EXPIRATION_TIME = 300;

    private string $message = '';

    /**
     * @throws RandomException
     * @throws InvalidArgumentException
     */
    #[Route('/connect/{provider}', name: 'connect_oauth')]
    public function connectAction(
        string             $provider,
        ClientRegistry     $clientRegistry,
        Request            $request,
        RateLimiterFactory $connectActionLimiter
    ): RedirectResponse
    {
        // Rate limiting
        $limiter = $connectActionLimiter->create('connect_action');
        $limit = $limiter->consume(1);

        if (!$limit->isAccepted()) {
            throw new TooManyRequestsHttpException(null, 'Too many registration attempts, please try again later.');
        }

        $state = bin2hex(random_bytes(64));
        $this->cacheItemPool->save(
            $this->cacheItemPool->getItem($state)
                ->set(['state' => $state, 'ip' => $request->getClientIp()])
                ->expiresAfter(self::STATE_EXPIRATION_TIME)
        );

        return $clientRegistry
            ->getClient($provider)
            ->redirect(['email', 'profile'], ['state' => $state]);
    }

    /**
     * @throws TransportExceptionInterface
     * @throws InvalidArgumentException
     * @throws \JsonException
     */
    #[Route('/connect/{provider}/check', name: 'connect_oauth_check')]
    public function connectCheckAction(
        string             $provider,
        ClientRegistry     $clientRegistry,
        Request            $request,
        RateLimiterFactory $connectCheckActionLimiter,
    ): Response
    {

        // Rate limiting
        $limiter = $connectCheckActionLimiter->create('connect_check_action');
        $limit = $limiter->consume(1);

        if (!$limit->isAccepted()) {
            return new JsonResponse(['message' => 'Too many registration attempts, please try again later.'], 429);
        }

        // Verify the state
        $returnedState = $request->query->get('state');
        $cacheItem = $this->cacheItemPool->getItem($returnedState);

        if (!$returnedState || !$cacheItem->isHit()) {
            throw new AccessDeniedException('Invalid or expired state parameter.');
        }

        $stateData = $cacheItem->get();
        if ($stateData['state'] !== $returnedState || $stateData['ip'] !== $request->getClientIp()) {
            throw new AccessDeniedException('State validation failed.');
        }

        $this->cacheItemPool->deleteItem($returnedState);

        $client = $clientRegistry->getClient($provider);

        try {
            // Attempt to fetch user from OAuth provider
            $oauthUser = $client->fetchUser();

            // Ensure we have an email
            // GoogleUser ??
            /** @var GoogleUser $oauthUser */
            $email = $oauthUser->getEmail();

            if (!$email) {
                throw new \RuntimeException('No email returned from OAuth provider.');
            }

            // Check if the user already exists in the database
            /** @var User|null $user */
            $user = $this->entityManager->getRepository(User::class)->findOneBy(['email' => $email]);

            if (!$user) {
                // Existing username check
                do {
                    $randomUsername = $oauthUser->getFirstName() . random_int(1, 1000);
                    $existingUserName = $this->entityManager->getRepository(User::class)->findOneBy(['username' => $randomUsername]);
                } while ($existingUserName);


                // Create a new user if not exists
                /** @var User $user */
                $user = (new User())
                    ->setEmail($email)
                    ->setUsername($randomUsername)
                    ->setRoles(['ROLE_USER'])
                    ->setIsAccountActive(true)
                    ->setProfileImage($oauthUser->getAvatar())
                    ->setIsEmailConfirmed(true)
                    ->setPassword('')
                    ->setIsGoogleAuth(true)
                    ->setCreatedAt(new DateTimeImmutable());

                $this->entityManager->persist($user);
                $this->entityManager->flush();

                // Email
                $this->mailerService->sendEmail(
                    $user->getEmail(),
                    'Welcome to EchoHub!',
                    '/templates/welcome_email.twig',
                    ['' => '']
                );

                $this->message = 'User created successfully and logged successful';
            } else {
                $this->message = 'Login successful';
            }

            $authorizationCode = bin2hex(random_bytes(64));
            $this->cacheItemPool->save(
                $this->cacheItemPool->getItem($authorizationCode)->set($user->getId())->expiresAfter(self::AUTH_CODE_CACHE_EXPIRATION_TIME)
            );

            $frontendUrl = $_ENV['FRONTEND_REDIRECT_GOOGLE_AUTH_URL'];
            $redirectUrl = $frontendUrl . '?code=' . urlencode($authorizationCode) . '&message=' . $this->message;
            return new RedirectResponse($redirectUrl);

        } catch (\Exception $e) {
            return new JsonResponse(['error' => 'Authentication failed: ' . $e->getMessage()], 401);
        } catch (InvalidArgumentException $e) {
            return new JsonResponse(['error' => 'Invalid argument: ' . $e->getMessage()], 400);
        }
    }

    /**
     * @throws InvalidArgumentException
     * @throws \JsonException
     */
    #[Route('/exchange-code', name: 'exchange_code', methods: ['POST'])]
    public function exchangeCode(
        Request                  $request,
        JWTTokenManagerInterface $jwtTokenManager,
        RateLimiterFactory       $exchangeCodeLimiter,
    ): JsonResponse
    {
        // Rate limiting
        $limiter = $exchangeCodeLimiter->create('exchange_code');
        $limit = $limiter->consume(1);

        if (!$limit->isAccepted()) {
            return new JsonResponse(['message' => 'Too many registration attempts, please try again later.'], 429);
        }

        $data = json_decode($request->getContent(), true, 512, JSON_THROW_ON_ERROR);
        $code = $data['code'] ?? null;

        if (!$code) {
            return new JsonResponse(['error' => 'Authorization code is missing'], 400);
        }

        $cacheItem = $this->cacheItemPool->getItem($code);
        if (!$cacheItem->isHit()) {
            return new JsonResponse(['error' => 'Invalid or expired authorization code'], 400);
        }

        $userId = $cacheItem->get();
        $user = $this->entityManager->getRepository(User::class)->find($userId);

        if (!$user) {
            return new JsonResponse(['error' => 'User not found'], 404);
        }

        // Generate JWT token
        $token = $jwtTokenManager->createFromPayload($user, [
            'id' => $user->getId(),
            'username' => $user->getUsername(),
            'roles' => $user->getRoles()
        ]);

        // Set the JWT in an HttpOnly cookie
        $response = new JsonResponse([
            'user' => [
                'username' => $user->getUsername(),
                'roles' => $user->getRoles(),
            ]
        ]);

        $this->setCookie($response, 'jwt_token', $token, new \DateTime('+1 day'));
        return $response;
    }

}