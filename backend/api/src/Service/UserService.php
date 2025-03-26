<?php

namespace App\Service;

use App\DTO\DeleteUserDTO;
use App\DTO\UpdateUserDTO;
use App\Entity\User;
use DateTimeImmutable;
use Doctrine\ORM\Exception\ORMException;
use Random\RandomException;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\Mailer\Exception\TransportExceptionInterface;

class UserService extends AbstractService
{
    public function getUserById(Request $request, int $id): JsonResponse
    {
        try {
            /** @var User $user */
            $user = $this->validateRequest($request, $id, 'ROLE_USER');
        } catch (HttpException $e) {
            return new JsonResponse(['message' => $e->getMessage()], $e->getStatusCode());
        }

        return new JsonResponse([
            'id' => $user->getId(),
            'username' => $user->getUsername(),
            'email' => $user->getEmail(),
            'isEmailConfirmed' => $user->getIsEmailConfirmed(),
            'isAccountActive' => $user->getIsAccountActive(),
            'createdAt' => $user->getCreatedAt(),
            'profileImage' => $user->getProfileImage(),
            'pendingEmail' => $user->getPendingEmail(),
            'isGoogleAuth' => $user->getIsGoogleAuth(),
        ]);
    }

    public function getAllUsers(Request $request): JsonResponse
    {
        try {
            $this->validateRequest($request, null, 'ROLE_ADMIN');
        } catch (HttpException $e) {
            return new JsonResponse(['message' => $e->getMessage()], $e->getStatusCode());
        }

        $users = $this->entityManager->getRepository(User::class)->findAll();

        $userList = array_map(static function (User $user) {
            return [
                'id' => $user->getId(),
                'username' => $user->getUsername(),
                'email' => $user->getEmail(),
                'isEmailConfirmed' => $user->getIsEmailConfirmed(),
                'isAccountActive' => $user->getIsAccountActive(),
                'createdAt' => $user->getCreatedAt(),
                'profileImage' => $user->getProfileImage(),
                'pendingEmail' => $user->getPendingEmail(),
                'isGoogleAuth' => $user->getIsGoogleAuth(),
            ];
        }, $users);

        return new JsonResponse($userList);
    }

    /**
     * @throws TransportExceptionInterface
     * @throws RandomException
     */
    public function sendDeleteCode(Request $request, int $id): JsonResponse
    {
        /** @var User $user */
        $user = $this->validateRequest($request, $id, 'ROLE_USER');

        $code = random_int(100000, 999999);
        $user->setConfirmationCode((string)$code);
        $user->setCodeCreatedAt(new DateTimeImmutable());
        $this->entityManager->flush();

        $this->mailerService->sendEmail(
            $user->getEmail(),
            'Delete Your Account',
            '/templates/delete_account.twig',
            ['code' => $code]
        );

        return new JsonResponse(['message' => 'Confirmation code sent to email']);
    }

    /**
     * @throws TransportExceptionInterface
     * @throws RandomException
     * @throws \JsonException
     */
    public function deleteUserById(Request $request, int $id): JsonResponse
    {
        /** @var User $user */
        $user = $this->validateRequest($request, $id, 'ROLE_USER');

        $data = $this->parseRequestData($request);
        $dto = $this->deserializeData($data, DeleteUserDTO::class);

        $violations = $this->validator->validate($dto);
        if (count($violations) > 0) {
            return new JsonResponse(['errors' => $this->formatViolations($violations)], Response::HTTP_BAD_REQUEST);
        }

        if ($dto->code === null || $user->getConfirmationCode() !== $dto->code) {
            return new JsonResponse(['message' => 'Invalid confirmation code'], Response::HTTP_BAD_REQUEST);
        }

        if ($user->getCodeCreatedAt() <= new DateTimeImmutable('-1 hour')) {
            $newCode = random_int(100000, 999999);
            $user->setConfirmationCode((string)$newCode);
            $user->setCodeCreatedAt(new DateTimeImmutable());
            $this->entityManager->flush();

            $this->mailerService->sendEmail(
                $user->getEmail(),
                'Delete Your Account',
                '/templates/delete_account.twig',
                ['code' => $newCode]
            );

            return new JsonResponse(['message' => 'The confirmation code has expired. A new confirmation email has been sent.'], Response::HTTP_BAD_REQUEST);
        }

        $this->entityManager->remove($user);
        $this->entityManager->flush();

        if ($user->getProfileImage()) {
            $this->imageUploadService->removeImage($user->getProfileImage());
        }

        $response = new JsonResponse(['message' => 'User deleted'], Response::HTTP_OK);
        $response->headers->clearCookie('jwt_token');
        return $response;
    }

    /**
     * @throws RandomException
     * @throws TransportExceptionInterface
     * @throws ORMException
     * @throws \JsonException
     */
    public function updateUser(Request $request, int $id): JsonResponse
    {
        /** @var User $user */
        $user = $this->validateRequest($request, $id, 'ROLE_USER');

        $data = $this->parseRequestData($request);
        $dto = $this->deserializeData($data, UpdateUserDTO::class);

        $violations = $this->validator->validate($dto);
        if (count($violations) > 0) {
            return new JsonResponse(['errors' => $this->formatViolations($violations)], Response::HTTP_BAD_REQUEST);
        }

        $updatedFields = [];

        if ($dto->username !== null && $dto->username !== $user->getUsername()) {
            $user->setUsername($dto->username);
            $updatedFields[] = 'username';
        }

        if (isset($dto->email) && $dto->email !== $user->getEmail() && !$user->getIsGoogleAuth()) {
            // Check if the new email already exists in the database
            $existingUser = $this->entityManager->getRepository(User::class)->findOneBy(['email' => $dto->email]);
            if ($existingUser) {
                return new JsonResponse(['error' => 'The email address is already in use.'], Response::HTTP_BAD_REQUEST);
            }

            $user->setPendingEmail($dto->email);
            $user->setIsNewEmailConfirmed(false);
            $updatedFields[] = 'pendingEmail';
            $token = bin2hex(random_bytes(32));
            $user->setConfirmationToken($token);
            $user->setTokenCreatedAt(new DateTimeImmutable());

            // Email
            $this->mailerService->sendEmail(
                $user->getEmail(),
                'Please confirm your new email address',
                '/templates/update_email_confirmation.twig',
                ['token' => $token]
            );
        }

        // Handle profile image update
        $profileImage = $request->files->get('profileImage');
        if ($profileImage instanceof UploadedFile) {
            try {
                $fileName = $this->imageUploadService->upload($profileImage);
                $oldProfileImage = $user->getProfileImage();
                $this->imageUploadService->removeImage($oldProfileImage);
                $user->setProfileImage($fileName);
                $updatedFields[] = 'profileImage';
            } catch (\Exception $e) {
                return new JsonResponse(['error' => 'Failed to upload profile image: ' . $e->getMessage()], Response::HTTP_BAD_REQUEST);
            }
        }

        if (empty($updatedFields)) {
            return new JsonResponse(['message' => 'No fields were updated'], Response::HTTP_OK);
        }

        try {
            $this->entityManager->flush();
            $this->entityManager->refresh($user);

            // Call the token refresh endpoint
            $refreshTokenResponse = $this->refreshToken($this->JWTEncoder);

            return new JsonResponse([
                'message' => 'User updated successfully',
                'updatedFields' => $updatedFields,
                'user' => [
                    'id' => $user->getId(),
                    'username' => $user->getUsername(),
                    'email' => $user->getEmail(),
                    'profileImage' => $user->getProfileImage(),
                    'pendingEmail' => $user->getPendingEmail()
                ]
            ], Response::HTTP_OK, $refreshTokenResponse->headers->all());
        } catch (\Exception $e) {
            return new JsonResponse(['error' => 'Failed to update user: ' . $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

}