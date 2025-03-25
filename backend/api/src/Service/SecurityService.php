<?php

namespace App\Service;

use App\DTO\ForgotPasswordDTO;
use App\DTO\RegisterDTO;
use App\DTO\ResetPasswordDTO;
use App\Entity\User;
use DateTimeImmutable;
use JsonException;
use Random\RandomException;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Mailer\Exception\TransportExceptionInterface;


class SecurityService extends AbstractService
{
    /**
     * @throws RandomException
     * @throws TransportExceptionInterface
     */
    public function registerUser(Request $request): JsonResponse
    {
        try {
            $data = $this->parseRequestData($request);
            $dto = $this->deserializeData($data, RegisterDTO::class);
        } catch (\InvalidArgumentException|JsonException $e) {
            return new JsonResponse(['error' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
        }

        $violations = $this->validator->validate($dto);
        if (count($violations) > 0) {
            return new JsonResponse(['errors' => $this->formatViolations($violations)], Response::HTTP_BAD_REQUEST);
        }

        if ($this->checkExistingUser($dto->username, $dto->email)) {
            return new JsonResponse(['message' => 'A user with this username or email already exists.'], Response::HTTP_CONFLICT);
        }

        $user = new User();
        $user->setUsername($dto->username);
        $user->setEmail($dto->email);
        $user->setPassword($this->passwordHasher->hashPassword($user, $dto->password));
        $user->setCreatedAt(new DateTimeImmutable());
        $token = bin2hex(random_bytes(32));
        $user->setConfirmationToken($token);
        $user->setTokenCreatedAt(new DateTimeImmutable());
        $user->setIsGoogleAuth(false);

        $profileImage = $request->files->get('profileImage');
        if ($profileImage) {
            $fileName = $this->imageUploadService->upload($profileImage);
            $user->setProfileImage($fileName);
        }

        $this->entityManager->persist($user);
        $this->entityManager->flush();

        $this->mailerService->sendEmail(
            $user->getEmail(),
            'Please confirm your email address',
            '/templates/email_confirmation.twig',
            ['token' => $user->getConfirmationToken()]
        );

        $jwt = $this->generateJWT($user);

        $response = new JsonResponse([
            'message' => 'User created successfully and logged in. Please check your email to verify your account.',
            'status' => Response::HTTP_OK,
            'user' => [
                'id' => $user->getId(),
                'username' => $user->getUsername(),
            ]
        ], Response::HTTP_CREATED);

        $this->setCookie($response, 'jwt_token', $jwt, new \DateTime('+1 day'));

        return $response;
    }

    /**
     * @throws RandomException
     * @throws TransportExceptionInterface
     */
    public function confirmEmail(string $token): JsonResponse
    {
        /** @var User $user */
        $user = $this->entityManager->getRepository(User::class)->findOneBy(['confirmationToken' => $token]);

        if (!$user) {
            return new JsonResponse(['message' => 'This confirmation token does not exist.'], Response::HTTP_NOT_FOUND);
        }

        // Check if the token has expired
        /** @var DateTimeImmutable $tokenCreatedAt */
        $tokenCreatedAt = $user->getTokenCreatedAt();
        $now = new DateTimeImmutable();
        $tokenLifetime = $now->diff($tokenCreatedAt);

        if ($tokenLifetime->days > 0) {
            $newToken = bin2hex(random_bytes(64));
            $user->setConfirmationToken($newToken);
            $user->setTokenCreatedAt(new DateTimeImmutable());
            $this->entityManager->flush();

            $this->resendConfirmationEmail($user, $newToken, 'confirmEmail');

            return new JsonResponse(
                [
                    'message' => 'The confirmation token has expired. A new confirmation email has been sent.',
                    'status' => 'expired'
                ]
            );
        }

        if ($user->getPendingEmail()) {
            $user->setEmail($user->getPendingEmail());
            $user->setPendingEmail(null);
            $user->setIsNewEmailConfirmed(true);
        } else {
            $user->setIsEmailConfirmed(true);
        }

        $user->setConfirmationToken(null);
        $this->entityManager->flush();

        return new JsonResponse(
            [
                'message' => 'Email confirmed successfully.',
                'status' => 'confirmed'
            ]
        );
    }


    public function checkAuth(Request $request, ?User $user): JsonResponse
    {
        if (!$user) {
            return new JsonResponse(['message' => 'Unauthorized'], Response::HTTP_UNAUTHORIZED);
        }

        $token = $request->cookies->get('jwt_token');
        if (!$token) {
            return new JsonResponse(['message' => 'Token not found'], Response::HTTP_UNAUTHORIZED);
        }

        return new JsonResponse([
            'username' => $user->getUsername(),
            'id' => $user->getId(),
            'message' => 'Token is valid'
        ], 200);
    }


    public function logout(): JsonResponse
    {
        $response = new JsonResponse(['message' => 'Logged out successfully.']);
        $response->headers->clearCookie('jwt_token');

        return $response;
    }

    /**
     * @throws RandomException
     * @throws TransportExceptionInterface
     * @throws JsonException
     */
    public function forgotPassword(Request $request): JsonResponse
    {
        try {
            $data = $this->parseRequestData($request);
            $dto = $this->deserializeData($data, ForgotPasswordDTO::class);
        } catch (\InvalidArgumentException $e) {
            return new JsonResponse(['error' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
        }

        $violations = $this->validator->validate($dto);
        if (count($violations) > 0) {
            return new JsonResponse(['errors' => $this->formatViolations($violations)], Response::HTTP_BAD_REQUEST);
        }

        $user = $this->entityManager->getRepository(User::class)->findOneBy(['email' => $dto->email]);
        if (!$user) {
            return new JsonResponse(['message' => 'User not found'], Response::HTTP_NOT_FOUND);
        }

        //TODO: if hte token exist alredy on another user ???
        $token = bin2hex(random_bytes(32));
        $user->setResetToken($token);
        $user->setTokenCreatedAt(new DateTimeImmutable());
        $this->entityManager->flush();

        $this->mailerService->sendEmail(
            $user->getEmail(),
            'Reset Your Password',
            '/templates/reset_password.twig',
            ['token' => $token]
        );

        return new JsonResponse(['message' => 'Password reset email sent.'], Response::HTTP_OK);
    }

    /**
     * @throws RandomException
     * @throws JsonException
     * @throws TransportExceptionInterface
     */
    public function resetPassword(Request $request): JsonResponse
    {
        try {
            $data = $this->parseRequestData($request);
            $dto = $this->deserializeData($data, ResetPasswordDTO::class);
        } catch (\InvalidArgumentException $e) {
            return new JsonResponse(['error' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
        }

        $violations = $this->validator->validate($dto);
        if (count($violations) > 0) {
            return new JsonResponse(['errors' => $this->formatViolations($violations)], Response::HTTP_BAD_REQUEST);
        }

        $user = $this->entityManager->getRepository(User::class)->findOneBy(['resetToken' => $dto->token]);
        if (!$user) {
            return new JsonResponse(['message' => 'Invalid token'], Response::HTTP_BAD_REQUEST);
        }


        // Check if the token has expired (e.g., 24 hours)
        /** @var DateTimeImmutable $tokenCreatedAt */
        $tokenCreatedAt = $user->getTokenCreatedAt();
        $now = new DateTimeImmutable();
        if ($now->getTimestamp() - $tokenCreatedAt->getTimestamp() > 86400) {
            $newToken = bin2hex(random_bytes(32));
            $user->setResetToken($newToken);
            $user->setTokenCreatedAt(new DateTimeImmutable());
            $this->entityManager->flush();

            $this->resendConfirmationEmail($user, $newToken, 'resetPassword');

            return new JsonResponse(
                [
                    'message' => 'The confirmation token has expired. A new confirmation email has been sent.',
                    'status' => 'expired'
                ],
                Response::HTTP_BAD_REQUEST
            );
        }

        $hashedPassword = $this->passwordHasher->hashPassword($user, $dto->password);
        $user->setPassword($hashedPassword);
        $user->setResetToken(null);
        $user->setTokenCreatedAt(new DateTimeImmutable());
        $this->entityManager->flush();

        return new JsonResponse(
            [
                'message' => 'Password has been reset successfully',
                'status' => 'rested'
            ],
            Response::HTTP_OK
        );
    }


    public function checkExistingUser(string $username, string $email): bool
    {
        $existingUser = $this->entityManager->getRepository(User::class)->findOneBy(['username' => $username]);
        $existingEmail = $this->entityManager->getRepository(User::class)->findOneBy(['email' => $email]);
        return $existingUser || $existingEmail;
    }

    public function     generateJWT(User $user): string
    {
        return $this->JWTManager->createFromPayload($user, [
            'id' => $user->getId(),
            'username' => $user->getUsername(),
            'roles' => $user->getRoles()
        ]);
    }


    /**
     * @throws TransportExceptionInterface
     */
    private function resendConfirmationEmail(User $user, string $token, string $caller): void
    {
        if ($caller === 'confirmEmail') {
            $this->mailerService->sendEmail(
                $user->getEmail(),
                'Please confirm your email address',
                '/templates/email_confirmation.twig',
                ['token' => $token]
            );
        } elseif ($caller === 'resetPassword') {
            $this->mailerService->sendEmail(
                $user->getEmail(),
                'Reset Your Password',
                '/templates/reset_password.twig',
                ['token' => $token]
            );
        }
    }


}