<?php


// src/Entity/Workout.php
namespace App\Entity;

use App\Repository\WorkoutRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: WorkoutRepository::class)]
class Workout
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    #[Groups(['workout:read', 'exercise:read'])]
    private ?int $id = null;

    #[ORM\Column(type: 'datetime')]
    #[Groups(['workout:read'])]
    private \DateTimeInterface $date;

    #[ORM\Column(type: 'integer')]
    private int $categoryId;

    #[ORM\ManyToOne(targetEntity: WorkoutCategory::class, inversedBy: 'workouts')]
    #[ORM\JoinColumn(name: 'category_id', referencedColumnName: 'id', nullable: false)]
    private WorkoutCategory $category;

    #[ORM\Column(type: 'integer')]
    private int $duration;

    #[ORM\Column(type: 'integer')]
    private int $intensity;

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $notes = null;

    #[ORM\Column(type: 'integer')]
    #[Groups(['workout:read'])]
    private int $userId;

   #[ORM\ManyToOne(targetEntity: User::class, inversedBy: 'workouts')]
    #[ORM\JoinColumn(name: 'user_id', referencedColumnName: 'id', nullable: false)]
    #[Groups(['workout:read'])]
    private User $user;

    #[ORM\OneToMany(mappedBy: 'workout', targetEntity: Exercise::class)]
    #[Groups(['workout:read'])]
    private Collection $exercises;

    #[ORM\Column(type: 'boolean')]
    private bool $shared = false;

    #[ORM\Column(type: 'string', unique: true, nullable: true)]
    private ?string $shareLink = null;

    #[ORM\Column(type: 'datetime')]
    private \DateTimeInterface $createdAt;

    #[ORM\Column(type: 'datetime')]
    private \DateTimeInterface $updatedAt;

    public function __construct()
    {
        $this->exercises = new ArrayCollection();
        $this->createdAt = new \DateTime();
        $this->updatedAt = new \DateTime();
    }

    public function getId(): ?string
    {
        return $this->id;
    }

    public function setId(?string $id): Workout
    {
        $this->id = $id;
        return $this;
    }

    public function getDate(): \DateTimeInterface
    {
        return $this->date;
    }

    public function setDate(\DateTimeInterface $date): Workout
    {
        $this->date = $date;
        return $this;
    }

    public function getCategoryId(): string
    {
        return $this->categoryId;
    }

    public function setCategoryId(string $categoryId): Workout
    {
        $this->categoryId = $categoryId;
        return $this;
    }

    public function getCategory(): WorkoutCategory
    {
        return $this->category;
    }

    public function setCategory(WorkoutCategory $category): self
    {
        $this->category = $category;
        $this->categoryId = $category->getId();
        return $this;
    }

    public function getDuration(): int
    {
        return $this->duration;
    }

    public function setDuration(int $duration): Workout
    {
        $this->duration = $duration;
        return $this;
    }

    public function getIntensity(): int
    {
        return $this->intensity;
    }

    public function setIntensity(int $intensity): Workout
    {
        $this->intensity = $intensity;
        return $this;
    }

    public function getNotes(): ?string
    {
        return $this->notes;
    }

    public function setNotes(?string $notes): Workout
    {
        $this->notes = $notes;
        return $this;
    }

    public function getUserId(): string
    {
        return $this->userId;
    }

    public function setUserId(string $userId): Workout
    {
        $this->userId = $userId;
        return $this;
    }

    public function getUser(): User
    {
        return $this->user;
    }

    public function setUser(User $user): self
    {
        $this->user = $user;
        $this->userId = $user->getId(); // Make sure to set userId
        return $this;
    }

    public function getExercises(): Collection
    {
        return $this->exercises;
    }

    public function setExercises(Collection $exercises): Workout
    {
        $this->exercises = $exercises;
        return $this;
    }

    public function isShared(): bool
    {
        return $this->shared;
    }

    public function setShared(bool $shared): Workout
    {
        $this->shared = $shared;
        return $this;
    }

    public function getShareLink(): ?string
    {
        return $this->shareLink;
    }

    public function setShareLink(?string $shareLink): Workout
    {
        $this->shareLink = $shareLink;
        return $this;
    }

    public function getCreatedAt(): \DateTimeInterface
    {
        return $this->createdAt;
    }

    public function setCreatedAt(\DateTimeInterface $createdAt): Workout
    {
        $this->createdAt = $createdAt;
        return $this;
    }

    public function getUpdatedAt(): \DateTimeInterface
    {
        return $this->updatedAt;
    }

    public function setUpdatedAt(\DateTimeInterface $updatedAt): Workout
    {
        $this->updatedAt = $updatedAt;
        return $this;
    }

    public function addExercise(Exercise $exercise): static
    {
        if (!$this->exercises->contains($exercise)) {
            $this->exercises->add($exercise);
            $exercise->setWorkout($this);
        }

        return $this;
    }

    public function removeExercise(Exercise $exercise): static
    {
        if ($this->exercises->removeElement($exercise)) {
            // set the owning side to null (unless already changed)
            if ($exercise->getWorkout() === $this) {
                $exercise->setWorkout(null);
            }
        }

        return $this;
    }
}
