<?php

namespace App\Service;

use AllowDynamicProperties;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Lexik\Bundle\JWTAuthenticationBundle\Encoder\JWTEncoderInterface;
use Lexik\Bundle\JWTAuthenticationBundle\Exception\JWTDecodeFailureException;
use Lexik\Bundle\JWTAuthenticationBundle\Exception\JWTEncodeFailureException;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Psr\Cache\CacheItemPoolInterface;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Cookie;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Serializer\Exception\ExceptionInterface;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[AllowDynamicProperties] class AbstractService extends AbstractController
{
    protected MailerService $mailerService;
    protected ImageUploadService $imageUploadService;
    protected ValidatorInterface $validator;
    protected SerializerInterface $serializer;
    protected JWTEncoderInterface $JWTEncoder;
    protected CacheItemPoolInterface $cacheItemPool;

    protected LoggerInterface $logger;
    protected EntityManagerInterface $entityManager;

    protected UserPasswordHasherInterface $passwordHasher;
    protected JWTTokenManagerInterface $JWTManager;

    public function __construct(
        MailerService               $mailerService,
        ImageUploadService          $imageUploadService,
        ValidatorInterface          $validator,
        SerializerInterface         $serializer,
        JWTEncoderInterface         $JWTEncoder,
        LoggerInterface             $logger,
        EntityManagerInterface      $entityManager,
        CacheItemPoolInterface      $cacheItemPool,
        UserPasswordHasherInterface $passwordHasher,
        JWTTokenManagerInterface    $JWTManager,
    )
    {
        $this->mailerService = $mailerService;
        $this->imageUploadService = $imageUploadService;
        $this->validator = $validator;
        $this->serializer = $serializer;
        $this->JWTEncoder = $JWTEncoder;
        $this->logger = $logger;
        $this->entityManager = $entityManager;
        $this->cacheItemPool = $cacheItemPool;
        $this->passwordHasher = $passwordHasher;
        $this->JWTManager = $JWTManager;
    }

    /**
     * @throws \JsonException
     */
    protected function parseRequestData(Request $request): array
    {
        $contentType = $request->headers->get('Content-Type');
        if (str_contains($contentType, 'application/json')) {
            return json_decode($request->getContent(), true, 512, JSON_THROW_ON_ERROR);
        }

        if (str_contains($contentType, 'multipart/form-data')) {
            return json_decode($request->request->get('json', '{}'), true, 512, JSON_THROW_ON_ERROR);
        }
        throw new \InvalidArgumentException('Unsupported Content-Type');
    }

    protected function deserializeData(array $data, string $dtoClass)
    {
        try {
            return $this->serializer->denormalize($data, $dtoClass);
        } catch (ExceptionInterface $e) {
            throw new \InvalidArgumentException('Invalid data format');
        }
    }

    protected function formatViolations($violations): array
    {
        $errors = [];
        foreach ($violations as $violation) {
            $errors[$violation->getPropertyPath()][] = $violation->getMessage();
        }
        return $errors;
    }


    private function extractJWT(Request $request): ?string
    {
        $authHeader = $request->headers->get('Authorization');
        if ($authHeader && preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            return $matches[1];
        }

        $jwtCookie = $request->cookies->get('jwt_token');
        if ($jwtCookie) {
            return $jwtCookie;
        }

        return null;
    }

    protected function extractAndDecodeJWT(Request $request): ?array
    {
        $jwt = $this->extractJWT($request);
        if (!$jwt) {
            return null;
        }

        try {
            return $this->JWTEncoder->decode($jwt);
        } catch (JWTDecodeFailureException $e) {
            return null;
        }
    }

    protected function validateUserFromJWT(array $userData, int $id, string $requiredRole = 'ROLE_USER'): bool
    {
        // Check if the user is the owner and has the required role
        $isOwnerWithRole = isset($userData['id']) && ($userData['id'] === $id && in_array($requiredRole, $userData['roles'], true));

        // Check if the user has the admin role
        $isAdmin = in_array('ROLE_ADMIN', $userData['roles'], true);

        // Return true if the user is either the owner with the required role or an admin
        return $isOwnerWithRole || $isAdmin;
    }

    protected function validateRequest(Request $request, int $id = null, string $requiredRole = null): ?User
    {
        // Extract and decode the JWT from the request
        $userData = $this->extractAndDecodeJWT($request);
        if (!$userData) {
            throw new HttpException(Response::HTTP_UNAUTHORIZED, 'Invalid or missing JWT');
        }

        // Check if the user has the required role
        if ($requiredRole && !in_array($requiredRole, $userData['roles'], true)) {
            throw new HttpException(Response::HTTP_UNAUTHORIZED, 'Unauthorized action');
        }

        // Validate the user from JWT if an ID is provided
        if ($id !== null && !$this->validateUserFromJWT($userData, $id, $requiredRole)) {
            throw new HttpException(Response::HTTP_UNAUTHORIZED, 'Unauthorized action');
        }

        // Fetch the user from the database if an ID is provided
        if ($id !== null) {
            $user = $this->entityManager->getRepository(User::class)->find($id);
            if (!$user) {
                throw new HttpException(Response::HTTP_NOT_FOUND, 'User not found');
            }
            return $user;
        }

        // Return null if no ID is provided
        return null;
    }

    protected function setCookie
    (
        JsonResponse $response,
        string       $name,
        string       $value,
        \DateTime    $expiry,
        string       $path = '/',
        bool         $httpOnly = true,
        bool         $secure = false,
        string       $sameSite = 'Strict'
    ): void
    {
        $cookie = new Cookie(
            $name,
            $value,
            $expiry->getTimestamp(),
            $path,
            null,
            $secure,
            $httpOnly, // HttpOnly
            false,
            $sameSite
        );
        $response->headers->setCookie($cookie);
    }

    /**
     * @throws JWTEncodeFailureException
     */
    public function refreshToken(JWTEncoderInterface $JWTEncoder): JsonResponse
    {
        $user = $this->getUser();
        if (!$user instanceof User) {
            return new JsonResponse(['message' => 'User not found'], Response::HTTP_NOT_FOUND);
        }

        $jwt = $JWTEncoder->encode([
            'id' => $user->getId(),
            'username' => $user->getUsername(),
            'roles' => $user->getRoles()
        ]);

        $response = new JsonResponse(['message' => 'Token refreshed']);

        $this->setCookie($response, 'jwt_token', $jwt, new \DateTime('+1 day'));

        return $response;
    }

}
