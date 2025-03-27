<?php
// src/Entity/WorkoutCategory.php
namespace App\Entity;

use App\Repository\WorkoutCategoryRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: WorkoutCategoryRepository::class)]
class WorkoutCategory
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]  // Changed to integer
    #[Groups(['category:read'])]
    private ?int $id = null;        // Changed to int

    #[ORM\Column(type: 'string', unique: true)]
    #[Groups(['category:read'])]
    private string $name;

    #[ORM\Column(type: 'string', nullable: true)]
    #[Groups(['category:read'])]
    private ?string $description = null;

    #[ORM\Column(type: 'string')]
    #[Groups(['category:read'])]
    private string $color = '#4299e1';

    #[ORM\Column(type: 'string', nullable: true)]
    #[Groups(['category:read'])]
    private ?string $icon = null;

    #[ORM\OneToMany(mappedBy: 'category', targetEntity: Workout::class)]
    private Collection $workouts;

    #[ORM\OneToMany(mappedBy: 'category', targetEntity: Goal::class)]
    private Collection $goals;

    #[ORM\OneToMany(mappedBy: 'category', targetEntity: MotivationalQuote::class)]
    private Collection $quotes;

    #[ORM\Column(type: 'datetime')]
    #[Groups(['category:read'])]
    private \DateTimeInterface $createdAt;

    #[ORM\Column(type: 'datetime')]
    #[Groups(['category:read'])]
    private \DateTimeInterface $updatedAt;

    public function __construct()
    {
        $this->workouts = new ArrayCollection();
        $this->goals = new ArrayCollection();
        $this->quotes = new ArrayCollection();
        $this->createdAt = new \DateTime();
        $this->updatedAt = new \DateTime();
    }

    public function getId(): ?string
    {
        return $this->id;
    }

    public function setId(?string $id): WorkoutCategory
    {
        $this->id = $id;
        return $this;
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function setName(string $name): WorkoutCategory
    {
        $this->name = $name;
        return $this;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(?string $description): WorkoutCategory
    {
        $this->description = $description;
        return $this;
    }

    public function getColor(): string
    {
        return $this->color;
    }

    public function setColor(string $color): WorkoutCategory
    {
        $this->color = $color;
        return $this;
    }

    public function getIcon(): ?string
    {
        return $this->icon;
    }

    public function setIcon(?string $icon): WorkoutCategory
    {
        $this->icon = $icon;
        return $this;
    }

    public function getWorkouts(): Collection
    {
        return $this->workouts;
    }

    public function setWorkouts(Collection $workouts): WorkoutCategory
    {
        $this->workouts = $workouts;
        return $this;
    }

    public function getGoals(): Collection
    {
        return $this->goals;
    }

    public function setGoals(Collection $goals): WorkoutCategory
    {
        $this->goals = $goals;
        return $this;
    }

    public function getQuotes(): Collection
    {
        return $this->quotes;
    }

    public function setQuotes(Collection $quotes): WorkoutCategory
    {
        $this->quotes = $quotes;
        return $this;
    }

    public function getCreatedAt(): \DateTimeInterface
    {
        return $this->createdAt;
    }

    public function setCreatedAt(\DateTimeInterface $createdAt): WorkoutCategory
    {
        $this->createdAt = $createdAt;
        return $this;
    }

    public function getUpdatedAt(): \DateTimeInterface
    {
        return $this->updatedAt;
    }

    public function setUpdatedAt(\DateTimeInterface $updatedAt): WorkoutCategory
    {
        $this->updatedAt = $updatedAt;
        return $this;
    }

    public function addWorkout(Workout $workout): static
    {
        if (!$this->workouts->contains($workout)) {
            $this->workouts->add($workout);
            $workout->setCategory($this);
        }

        return $this;
    }

    public function removeWorkout(Workout $workout): static
    {
        if ($this->workouts->removeElement($workout)) {
            // set the owning side to null (unless already changed)
            if ($workout->getCategory() === $this) {
                $workout->setCategory(null);
            }
        }

        return $this;
    }

    public function addGoal(Goal $goal): static
    {
        if (!$this->goals->contains($goal)) {
            $this->goals->add($goal);
            $goal->setCategory($this);
        }

        return $this;
    }

    public function removeGoal(Goal $goal): static
    {
        if ($this->goals->removeElement($goal)) {
            // set the owning side to null (unless already changed)
            if ($goal->getCategory() === $this) {
                $goal->setCategory(null);
            }
        }

        return $this;
    }

    public function addQuote(MotivationalQuote $quote): static
    {
        if (!$this->quotes->contains($quote)) {
            $this->quotes->add($quote);
            $quote->setCategory($this);
        }

        return $this;
    }

    public function removeQuote(MotivationalQuote $quote): static
    {
        if ($this->quotes->removeElement($quote)) {
            // set the owning side to null (unless already changed)
            if ($quote->getCategory() === $this) {
                $quote->setCategory(null);
            }
        }

        return $this;
    }
}
