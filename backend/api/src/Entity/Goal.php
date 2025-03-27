<?php


// src/Entity/Goal.php
namespace App\Entity;

use App\Repository\GoalRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: GoalRepository::class)]
class Goal
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(type: 'string')]
    private string $title;

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $description = null;

    #[ORM\Column(type: 'datetime', nullable: true)]
    private ?\DateTimeInterface $targetDate = null;

    #[ORM\Column(type: 'boolean')]
    private bool $achieved = false;

    #[ORM\Column(type: 'integer', nullable: true)]
    private ?int $categoryId = null;

    #[ORM\ManyToOne(targetEntity: WorkoutCategory::class, inversedBy: 'goals')]
    #[ORM\JoinColumn(name: 'category_id', referencedColumnName: 'id')]
    private ?WorkoutCategory $category = null;

    #[ORM\Column(type: 'float', nullable: true)]
    private ?float $targetValue = null;

    #[ORM\Column(type: 'string', nullable: true)]
    private ?string $valueType = null;

    #[ORM\Column(type: 'string')]
    private string $userId;

    #[ORM\ManyToOne(targetEntity: User::class, inversedBy: 'goals')]
    #[ORM\JoinColumn(name: 'userId', referencedColumnName: 'id', onDelete: 'CASCADE')]
    private User $user;

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

    public function setId(?string $id): Goal
    {
        $this->id = $id;
        return $this;
    }

    public function getTitle(): string
    {
        return $this->title;
    }

    public function setTitle(string $title): Goal
    {
        $this->title = $title;
        return $this;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(?string $description): Goal
    {
        $this->description = $description;
        return $this;
    }

    public function getTargetDate(): ?\DateTimeInterface
    {
        return $this->targetDate;
    }

    public function setTargetDate(?\DateTimeInterface $targetDate): Goal
    {
        $this->targetDate = $targetDate;
        return $this;
    }

    public function isAchieved(): bool
    {
        return $this->achieved;
    }

    public function setAchieved(bool $achieved): Goal
    {
        $this->achieved = $achieved;
        return $this;
    }

    public function getCategoryId(): ?string
    {
        return $this->categoryId;
    }

    public function setCategoryId(?string $categoryId): Goal
    {
        $this->categoryId = $categoryId;
        return $this;
    }

    public function getCategory(): ?WorkoutCategory
    {
        return $this->category;
    }

    public function setCategory(?WorkoutCategory $category): Goal
    {
        $this->category = $category;
        return $this;
    }

    public function getTargetValue(): ?float
    {
        return $this->targetValue;
    }

    public function setTargetValue(?float $targetValue): Goal
    {
        $this->targetValue = $targetValue;
        return $this;
    }

    public function getValueType(): ?string
    {
        return $this->valueType;
    }

    public function setValueType(?string $valueType): Goal
    {
        $this->valueType = $valueType;
        return $this;
    }

    public function getUserId(): string
    {
        return $this->userId;
    }

    public function setUserId(string $userId): Goal
    {
        $this->userId = $userId;
        return $this;
    }

    public function getUser(): User
    {
        return $this->user;
    }

    public function setUser(User $user): Goal
    {
        $this->user = $user;
        return $this;
    }

    public function getCreatedAt(): \DateTimeInterface
    {
        return $this->createdAt;
    }

    public function setCreatedAt(\DateTimeInterface $createdAt): Goal
    {
        $this->createdAt = $createdAt;
        return $this;
    }

    public function getUpdatedAt(): \DateTimeInterface
    {
        return $this->updatedAt;
    }

    public function setUpdatedAt(\DateTimeInterface $updatedAt): Goal
    {
        $this->updatedAt = $updatedAt;
        return $this;
    }
}
