<?php
// src/Entity/MotivationalQuote.php
namespace App\Entity;

use App\Repository\MotivationalQuoteRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: MotivationalQuoteRepository::class)]
class MotivationalQuote
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(type: 'text')]
    private string $text;

    #[ORM\Column(type: 'string', nullable: true)]
    private ?string $author = null;

    #[ORM\Column(type: 'string', nullable: true)]
    private ?string $categoryId = null;

    #[ORM\ManyToOne(targetEntity: WorkoutCategory::class, inversedBy: 'quotes')]
    #[ORM\JoinColumn(name: 'categoryId', referencedColumnName: 'id')]
    private ?WorkoutCategory $category = null;

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

    public function setId(?string $id): MotivationalQuote
    {
        $this->id = $id;
        return $this;
    }

    public function getText(): string
    {
        return $this->text;
    }

    public function setText(string $text): MotivationalQuote
    {
        $this->text = $text;
        return $this;
    }

    public function getAuthor(): ?string
    {
        return $this->author;
    }

    public function setAuthor(?string $author): MotivationalQuote
    {
        $this->author = $author;
        return $this;
    }

    public function getCategoryId(): ?string
    {
        return $this->categoryId;
    }

    public function setCategoryId(?string $categoryId): MotivationalQuote
    {
        $this->categoryId = $categoryId;
        return $this;
    }

    public function getCategory(): ?WorkoutCategory
    {
        return $this->category;
    }

    public function setCategory(?WorkoutCategory $category): MotivationalQuote
    {
        $this->category = $category;
        return $this;
    }

    public function getCreatedAt(): \DateTimeInterface
    {
        return $this->createdAt;
    }

    public function setCreatedAt(\DateTimeInterface $createdAt): MotivationalQuote
    {
        $this->createdAt = $createdAt;
        return $this;
    }

    public function getUpdatedAt(): \DateTimeInterface
    {
        return $this->updatedAt;
    }

    public function setUpdatedAt(\DateTimeInterface $updatedAt): MotivationalQuote
    {
        $this->updatedAt = $updatedAt;
        return $this;
    }
}
