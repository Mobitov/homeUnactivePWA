<?php


// src/Entity/UserPreference.php
namespace App\Entity;

use App\Repository\UserPreferenceRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: UserPreferenceRepository::class)]
class UserPreference
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(type: 'string', unique: true)]
    private string $userId;

    #[ORM\OneToOne(inversedBy: 'preferences', targetEntity: User::class)]
    #[ORM\JoinColumn(name: 'userId', referencedColumnName: 'id', onDelete: 'CASCADE')]
    private User $user;

    #[ORM\Column(type: 'boolean')]
    private bool $darkMode = false;

    #[ORM\Column(type: 'string')]
    private string $language = 'fr';

    #[ORM\Column(type: 'string')]
    private string $measurementUnit = 'metric';

    #[ORM\Column(type: 'datetime')]
    private \DateTimeInterface $createdAt;

    #[ORM\Column(type: 'datetime')]
    private \DateTimeInterface $updatedAt;

    public function __construct()
    {
        $this->createdAt = new \DateTime();
        $this->updatedAt = new \DateTime();
    }

    public function getId(): ?string
    {
        return $this->id;
    }

    public function setId(?string $id): UserPreference
    {
        $this->id = $id;
        return $this;
    }

    public function getUserId(): string
    {
        return $this->userId;
    }

    public function setUserId(string $userId): UserPreference
    {
        $this->userId = $userId;
        return $this;
    }

    public function getUser(): User
    {
        return $this->user;
    }

    public function setUser(User $user): UserPreference
    {
        $this->user = $user;
        return $this;
    }

    public function isDarkMode(): bool
    {
        return $this->darkMode;
    }

    public function setDarkMode(bool $darkMode): UserPreference
    {
        $this->darkMode = $darkMode;
        return $this;
    }

    public function getLanguage(): string
    {
        return $this->language;
    }

    public function setLanguage(string $language): UserPreference
    {
        $this->language = $language;
        return $this;
    }

    public function getMeasurementUnit(): string
    {
        return $this->measurementUnit;
    }

    public function setMeasurementUnit(string $measurementUnit): UserPreference
    {
        $this->measurementUnit = $measurementUnit;
        return $this;
    }

    public function getCreatedAt(): \DateTimeInterface
    {
        return $this->createdAt;
    }

    public function setCreatedAt(\DateTimeInterface $createdAt): UserPreference
    {
        $this->createdAt = $createdAt;
        return $this;
    }

    public function getUpdatedAt(): \DateTimeInterface
    {
        return $this->updatedAt;
    }

    public function setUpdatedAt(\DateTimeInterface $updatedAt): UserPreference
    {
        $this->updatedAt = $updatedAt;
        return $this;
    }
}
