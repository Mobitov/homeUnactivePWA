<?php

namespace App\Entity;

use App\Repository\UserRepository;
use Doctrine\DBAL\Types\Types;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;


/**
 * @ORM\Entity(repositoryClass=UserRepository::class)
 */
#[ORM\Entity(repositoryClass: UserRepository::class)]
#[ORM\Table(name: '`user`')]
class User implements PasswordAuthenticatedUserInterface, UserInterface
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 30, unique: true)]
    private ?string $username = null;

    #[ORM\Column(length: 255, unique: true, nullable: true)]
    private ?string $pendingEmail = null;

    #[ORM\Column(length: 255, unique: true)]
    private ?string $email = null;

    #[ORM\Column(length: 255)]
    private ?string $password = null;

    #[ORM\Column(type: "string", length: 255, nullable: true)]
    private ?string $profileImage;

    #[ORM\Column]
    private ?\DateTimeImmutable $created_at = null;


    #[ORM\Column(type: "string", length: 255, nullable: true)]
    private ?string $confirmationToken;

    #[ORM\Column(type: "datetime", nullable: true)]
    private ?\DateTimeInterface $tokenCreatedAt;

    #[ORM\Column(type: "datetime", nullable: true)]
    private ?\DateTimeInterface $codeCreatedAt;

    #[ORM\Column(type: "boolean", options: ["default" => false])]
    private ?bool $isEmailConfirmed = false;

    #[ORM\Column(type: "boolean", options: ["default" => false])]
    private ?bool $isNewEmailConfirmed = false;

    #[ORM\Column(type: "boolean", options: ["default" => true])]
    private bool $isAccountActive = true;

    #[ORM\Column(type: 'string', length: 64, nullable: true)]
    private ?string $resetToken = null;

    #[ORM\Column(type: "json", nullable: false)]
    private array $roles = ['ROLE_USER']; 

    #[ORM\Column(type: "string", length: 255, nullable: true)]
    private ?string $confirmationCode;

    #[ORM\Column(type: "boolean", options: ["default" => false])]   
    private ?bool $isGoogleAuth = false;


    public function __construct()
    {
        $this->roles = ['ROLE_USER'];
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getUsername(): ?string
    {
        return $this->username;
    }

    public function setUsername(string $username): static
    {
        $this->username = $username;

        return $this;
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(string $email): static
    {
        $this->email = $email;

        return $this;
    }

    public function getPendingEmail(): ?string
    {
        return $this->pendingEmail;
    }

    public function setPendingEmail(?string $pendingEmail): self
    {
        $this->pendingEmail = $pendingEmail;
        return $this;
    }

    public function getPassword(): ?string
    {
        return $this->password;
    }

    public function setPassword(string $password): static
    {
        $this->password = $password;

        return $this;
    }


    public function getProfileImage(): ?string
    {
        return $this->profileImage;
    }

    public function setProfileImage(?string $profileImage): self
    {
        $this->profileImage = $profileImage;

        return $this;
    }


    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->created_at;
    }

    public function setCreatedAt(\DateTimeImmutable $created_at): static
    {
        $this->created_at = $created_at;

        return $this;
    }

    public function getRoles(): array
    {
        $roles = $this->roles;
        $roles[] = 'ROLE_USER';

        return array_unique($roles);
    }

    public function setRoles(array $roles): self
    {
        $this->roles = $roles;

        return $this;
    }

    public function eraseCredentials(): void
    {
        // TODO: Implement eraseCredentials() method.
    }

    public function getUserIdentifier(): string
    {
        return $this->username;
    }

    public function getConfirmationToken(): ?string
    {
        return $this->confirmationToken;
    }

    public function setConfirmationToken(?string $confirmationToken): self
    {
        $this->confirmationToken = $confirmationToken;

        return $this;
    }

    public function getTokenCreatedAt(): ?\DateTimeInterface
    {
        return $this->tokenCreatedAt;
    }

    public function setTokenCreatedAt(\DateTimeInterface $tokenCreatedAt): self
    {
        $this->tokenCreatedAt = $tokenCreatedAt;

        return $this;
    }


    public function getCodeCreatedAt(): ?\DateTimeInterface
    {
        return $this->codeCreatedAt;
    }

    public function setCodeCreatedAt(\DateTimeInterface $codeCreatedAt): self
    {
        $this->codeCreatedAt = $codeCreatedAt;

        return $this;
    }

    public function getConfirmationCode(): ?string
    {
        return $this->confirmationCode;
    }

    public function setConfirmationCode(?string $confirmationCode): self
    {
        $this->confirmationCode = $confirmationCode;

        return $this;
    }


    public function getIsEmailConfirmed(): bool
    {
        return $this->isEmailConfirmed;
    }

    public function setIsEmailConfirmed(bool $isEmailConfirmed): self
    {
        $this->isEmailConfirmed = $isEmailConfirmed;

        return $this;
    }

    public function getIsNewEmailConfirmed(): bool
    {
        return $this->isNewEmailConfirmed;
    }

    public function setIsNewEmailConfirmed(bool $isEmailConfirmed): self
    {
        $this->isNewEmailConfirmed = $isEmailConfirmed;

        return $this;
    }

    public function getIsAccountActive(): bool
    {
        return $this->isAccountActive;
    }

    public function setIsAccountActive(bool $isAccountActive): self
    {
        $this->isAccountActive = $isAccountActive;

        return $this;
    }

    public function getResetToken(): ?string
    {
        return $this->resetToken;
    }

    public function setResetToken(?string $resetToken): self
    {
        $this->resetToken = $resetToken;
        return $this;
    }

    public function setIsGoogleAuth(bool $isGoogleAuth): self
    {
        $this->isGoogleAuth = $isGoogleAuth;
        return $this;    
    }
    
    public function getIsGoogleAuth(): bool
    { 
        return $this->isGoogleAuth;
    }

    public function isEmailConfirmed(): ?bool
    {
        return $this->isEmailConfirmed;
    }

    public function isNewEmailConfirmed(): ?bool
    {
        return $this->isNewEmailConfirmed;
    }

    public function isAccountActive(): ?bool
    {
        return $this->isAccountActive;
    }

    public function isGoogleAuth(): ?bool
    {
        return $this->isGoogleAuth;
    }

}
