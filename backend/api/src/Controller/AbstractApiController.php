<?php

namespace App\Controller;

use App\Service\ImageUploadService;
use App\Service\MailerService;
use App\Service\SecurityService;
use App\Service\UserService;
use Doctrine\ORM\EntityManagerInterface;
use Lexik\Bundle\JWTAuthenticationBundle\Encoder\JWTEncoderInterface;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Psr\Cache\CacheItemPoolInterface;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Cookie;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[\AllowDynamicProperties] class AbstractApiController extends AbstractController
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
    protected SecurityService $securityService;
    protected UserService $userService;

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
        SecurityService             $securityService,
        UserService                 $userService,
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
        $this->securityService = $securityService;
        $this->userService = $userService;
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
}