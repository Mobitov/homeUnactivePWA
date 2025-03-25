<?php

namespace App\DTO;

use Symfony\Component\Validator\Constraints as Assert;

class ResetPasswordDTO
{
    #[Assert\NotBlank]
    public ?string $token = null;

    #[Assert\NotBlank]
    #[Assert\Length(min: 8)]
    #[Assert\Regex(pattern: '/[A-Za-z].*[0-9]|[0-9].*[A-Za-z]/', message: 'Passwords must have at least one letter and one number.')]
    public ?string $password = null;
}
