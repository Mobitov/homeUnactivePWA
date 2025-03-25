<?php

namespace App\DTO;

use Symfony\Component\Validator\Constraints as Assert;

class UpdateUserDTO
{
    #[Assert\Length(min: 3, max: 255)]
    public ?string $username = null;

    #[Assert\Email]
    public ?string $email = null;
}
