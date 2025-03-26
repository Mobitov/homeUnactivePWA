<?php

namespace App\Security;

use App\Entity\User;
use App\Exception\CustomTooManyRequestsHttpException;
use App\Service\LoginAttemptService;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Cache\InvalidArgumentException;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Security\Core\User\UserProviderInterface;
use Symfony\Component\Security\Core\Exception\UserNotFoundException;

class UserProvider implements UserProviderInterface
{
    private EntityManagerInterface $entityManager;
    private RequestStack $requestStack;
    private LoginAttemptService $loginAttemptService;

    public function __construct(
        EntityManagerInterface $entityManager, 
        RequestStack $requestStack, 
        LoginAttemptService $loginAttemptService , 
        )
    {
        $this->entityManager = $entityManager;
        $this->requestStack = $requestStack;
        $this->loginAttemptService = $loginAttemptService;
    }

    /**
     * @throws InvalidArgumentException
     */
    public function loadUserByUsername(string $identifier): UserInterface
    {
        return $this->loadUserByIdentifier($identifier);
    }

    /**
     * @throws InvalidArgumentException
     */
    public function loadUserByIdentifier(string $identifier): UserInterface
    {
        /** @var Request $request */
        $request = $this->requestStack->getCurrentRequest();
        $username = $request->get('identifier', 'anonymous');
        $clientIp = $request->getClientIp();
        $userAgent = $request->headers->get('User-Agent');

        $blockStatus = $this->loginAttemptService->isBlocked($username, $clientIp, $userAgent);
        if ($blockStatus['blocked']) {
            throw new CustomTooManyRequestsHttpException($blockStatus['block_time'], "Too many login attempts. Please wait {$blockStatus['block_time']} seconds.");
        }

        $user = $this->entityManager->getRepository(User::class)->findOneBy(['username' => $identifier]);

        if (!$user) {
            $user = $this->entityManager->getRepository(User::class)->findOneBy(['email' => $identifier]);
        }

        if (!$user) {
            throw new UserNotFoundException(sprintf('User "%s" not found.', $identifier));
        }

        return $user;
    }

    public function refreshUser(UserInterface $user): UserInterface
    {
        if (!$user instanceof User) {
            throw new \InvalidArgumentException('Invalid user class.');
        }

        return $this->entityManager->getRepository(User::class)->find($user->getId());
    }

    public function supportsClass(string $class): bool
    {
        return User::class === $class;
    }
}