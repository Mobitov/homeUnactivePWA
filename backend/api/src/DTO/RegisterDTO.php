<?php

namespace App\DTO;

use Symfony\Component\Validator\Constraints as Assert;

class RegisterDTO
{
    #[Assert\NotBlank]
    #[Assert\Length(min: 3, max: 255)]
    public ?string $username = null;

    #[Assert\NotBlank]
    #[Assert\Email]
    public ?string $email = null;

    #[Assert\NotBlank]
    #[Assert\Length(min: 8)]
    #[Assert\Regex(pattern: '/[A-Za-z].*[0-9]|[0-9].*[A-Za-z]/', message: 'Passwords must have at least one letter and one number.')]
    public ?string $password = null;
}
