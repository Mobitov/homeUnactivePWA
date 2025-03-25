<?php

namespace App\Exception;

use Symfony\Component\HttpKernel\Exception\TooManyRequestsHttpException;

class CustomTooManyRequestsHttpException extends TooManyRequestsHttpException
{
    private int $blockTime;

    public function __construct(int $blockTime, string $message = '', ?\Throwable $previous = null, int $code = 0, array $headers = [])
    {
        $this->blockTime = $blockTime;
        parent::__construct($blockTime, $message, $previous, $code, $headers);
    }

    public function getBlockTime(): int
    {
        return $this->blockTime;
    }
}