<?php

namespace App\Service;

use Psr\Log\LoggerInterface;
use Symfony\Component\HttpFoundation\File\UploadedFile;

class ImageUploadService
{
    private string $targetDirectory;
    private LoggerInterface $logger;
    private array $allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    private const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

    public function __construct(LoggerInterface $logger)
    {
        $this->targetDirectory = dirname(__DIR__, 2) . '/public/uploads/profile_images';
        $this->logger = $logger;
    }

    public function upload(UploadedFile $file): string
    {
        if (!$this->isImage($file)) {
            throw new \InvalidArgumentException('The file must be a .jpg, .jpeg, .png, or .webp image.');
        }

        if (!$this->isFileSizeValid($file)) {
            throw new \InvalidArgumentException('The file size must not exceed 5MB.');
        }

        $this->ensureTargetDirectoryExists();

        $fileName = uniqid('', true) . '.webp';
        $filePath = $file->getPathname();
        $targetPath = $this->getTargetDirectory() . '/' . $fileName;

        try {
            if ($file->isValid()) {
                // Transform the image to WebP format
                $image = imagecreatefromstring(file_get_contents($filePath));
                if ($image === false) {
                    throw new \RuntimeException('Failed to create image from file.');
                }

                if (!imagewebp($image, $targetPath)) {
                    throw new \RuntimeException('Failed to save image as WebP.');
                }

                imagedestroy($image);
            } else {
                throw new \RuntimeException('Uploaded file is not valid.');
            }
        } catch (\Exception $e) {
            throw new \RuntimeException('Failed to upload file: ' . $e->getMessage());
        }

        return $fileName;
    }

    private function isImage(UploadedFile $file): bool
    {
        return in_array($file->getMimeType(), $this->allowedMimeTypes, true);
    }

    private function isFileSizeValid(UploadedFile $file): bool
    {
        return $file->getSize() <= self::MAX_FILE_SIZE;
    }

    private function ensureTargetDirectoryExists(): void
    {
        if (!is_dir($this->targetDirectory)) {
            if (!mkdir($concurrentDirectory = $this->targetDirectory, 0777, true) && !is_dir($concurrentDirectory)) {
                $this->logger->error(sprintf('Directory "%s" was not created due to permission issues', $concurrentDirectory));
                throw new \RuntimeException(sprintf('Directory "%s" was not created', $concurrentDirectory));
            }
        }
    }

    public function getTargetDirectory(): string
    {
        return $this->targetDirectory;
    }

    public function removeImage(?string $fileName): ?string
    {
        if ($fileName === null) {
            return null;
        }

        // Remove the image from the server
        $imagePath = $this->getTargetDirectory() . '/' . $fileName;
        if (file_exists($imagePath)) {
            unlink($imagePath);
        }

        return $fileName;
    }
}
