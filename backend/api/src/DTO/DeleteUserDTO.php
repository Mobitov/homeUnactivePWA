<?php

namespace App\DTO;

use Symfony\Component\Validator\Constraints as Assert;

class DeleteUserDTO
{
    #[Assert\NotBlank]
    #[Assert\Length(exactly: 6)]
    #[Assert\Regex(pattern: '/^\d{6}$/', message: 'The confirmation code must be a 6-digit number.')]
    public ?string $code = null;
}
