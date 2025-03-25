<?php

namespace App\Security;

use Symfony\Component\HttpFoundation\Request;
use Lexik\Bundle\JWTAuthenticationBundle\TokenExtractor\TokenExtractorInterface;
use Psr\Log\LoggerInterface;

class JwtCookieTokenExtractor implements TokenExtractorInterface
{
    private LoggerInterface $logger;

    public function __construct(LoggerInterface $logger)
    {
        $this->logger = $logger;
    }

    public function extract(Request $request): ?string
    {
        $token = $request->cookies->get('jwt_token');
        $this->logger->info('Extracted token from cookie: ' . ($token ?? 'No token'));
        return $token;
    }
}