<?php


// src/Entity/Exercise.php
namespace App\Entity;

use App\Repository\ExerciseRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: ExerciseRepository::class)]
class Exercise
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(type: 'string')]
    private string $name;

    #[ORM\Column(type: 'integer')]
    private int $sets;

    #[ORM\Column(type: 'integer', nullable: true)]
    private ?int $reps = null;

    #[ORM\Column(type: 'float', nullable: true)]
    private ?float $weight = null;

    #[ORM\Column(type: 'float', nullable: true)]
    private ?float $distance = null;

    #[ORM\Column(type: 'integer', nullable: true)]
    private ?int $duration = null;

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $notes = null;

    #[ORM\Column(type: 'string')]
    private string $workoutId;

    #[ORM\ManyToOne(targetEntity: Workout::class, inversedBy: 'exercises')]
    #[ORM\JoinColumn(name: 'workoutId', referencedColumnName: 'id', onDelete: 'CASCADE')]
    private Workout $workout;

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

    public function setId(?string $id): Exercise
    {
        $this->id = $id;
        return $this;
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function setName(string $name): Exercise
    {
        $this->name = $name;
        return $this;
    }

    public function getSets(): int
    {
        return $this->sets;
    }

    public function setSets(int $sets): Exercise
    {
        $this->sets = $sets;
        return $this;
    }

    public function getReps(): ?int
    {
        return $this->reps;
    }

    public function setReps(?int $reps): Exercise
    {
        $this->reps = $reps;
        return $this;
    }

    public function getWeight(): ?float
    {
        return $this->weight;
    }

    public function setWeight(?float $weight): Exercise
    {
        $this->weight = $weight;
        return $this;
    }

    public function getDistance(): ?float
    {
        return $this->distance;
    }

    public function setDistance(?float $distance): Exercise
    {
        $this->distance = $distance;
        return $this;
    }

    public function getDuration(): ?int
    {
        return $this->duration;
    }

    public function setDuration(?int $duration): Exercise
    {
        $this->duration = $duration;
        return $this;
    }

    public function getNotes(): ?string
    {
        return $this->notes;
    }

    public function setNotes(?string $notes): Exercise
    {
        $this->notes = $notes;
        return $this;
    }

    public function getWorkoutId(): string
    {
        return $this->workoutId;
    }

    public function setWorkoutId(string $workoutId): Exercise
    {
        $this->workoutId = $workoutId;
        return $this;
    }

    public function getWorkout(): Workout
    {
        return $this->workout;
    }

    public function setWorkout(Workout $workout): Exercise
    {
        $this->workout = $workout;
        return $this;
    }

    public function getCreatedAt(): \DateTimeInterface
    {
        return $this->createdAt;
    }

    public function setCreatedAt(\DateTimeInterface $createdAt): Exercise
    {
        $this->createdAt = $createdAt;
        return $this;
    }

    public function getUpdatedAt(): \DateTimeInterface
    {
        return $this->updatedAt;
    }

    public function setUpdatedAt(\DateTimeInterface $updatedAt): Exercise
    {
        $this->updatedAt = $updatedAt;
        return $this;
    }
}
