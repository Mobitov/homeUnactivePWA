<?php


// src/Entity/NotificationSetting.php
namespace App\Entity;

use App\Repository\NotificationSettingRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: NotificationSettingRepository::class)]
class NotificationSetting
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(type: 'string', unique: true)]
    private string $userId;

    #[ORM\OneToOne(inversedBy: 'notificationSettings', targetEntity: User::class)]
    #[ORM\JoinColumn(name: 'userId', referencedColumnName: 'id', onDelete: 'CASCADE')]
    private User $user;

    #[ORM\Column(type: 'boolean')]
    private bool $workoutReminders = true;

    #[ORM\Column(type: 'boolean')]
    private bool $motivationalQuotes = true;

    #[ORM\Column(type: 'boolean')]
    private bool $goalAlerts = true;

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

    public function setId(?string $id): NotificationSetting
    {
        $this->id = $id;
        return $this;
    }

    public function getUserId(): string
    {
        return $this->userId;
    }

    public function setUserId(string $userId): NotificationSetting
    {
        $this->userId = $userId;
        return $this;
    }

    public function getUser(): User
    {
        return $this->user;
    }

    public function setUser(User $user): NotificationSetting
    {
        $this->user = $user;
        return $this;
    }

    public function isWorkoutReminders(): bool
    {
        return $this->workoutReminders;
    }

    public function setWorkoutReminders(bool $workoutReminders): NotificationSetting
    {
        $this->workoutReminders = $workoutReminders;
        return $this;
    }

    public function isMotivationalQuotes(): bool
    {
        return $this->motivationalQuotes;
    }

    public function setMotivationalQuotes(bool $motivationalQuotes): NotificationSetting
    {
        $this->motivationalQuotes = $motivationalQuotes;
        return $this;
    }

    public function isGoalAlerts(): bool
    {
        return $this->goalAlerts;
    }

    public function setGoalAlerts(bool $goalAlerts): NotificationSetting
    {
        $this->goalAlerts = $goalAlerts;
        return $this;
    }

    public function getCreatedAt(): \DateTimeInterface
    {
        return $this->createdAt;
    }

    public function setCreatedAt(\DateTimeInterface $createdAt): NotificationSetting
    {
        $this->createdAt = $createdAt;
        return $this;
    }

    public function getUpdatedAt(): \DateTimeInterface
    {
        return $this->updatedAt;
    }

    public function setUpdatedAt(\DateTimeInterface $updatedAt): NotificationSetting
    {
        $this->updatedAt = $updatedAt;
        return $this;
    }
}
