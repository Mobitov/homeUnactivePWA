<?php

namespace App\Controller;

use Symfony\Component\ErrorHandler\Exception\FlattenException;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

class CustomErrorController
{
    public function show(Request $request, FlattenException $exception): JsonResponse
    {
        $statusCode = $exception->getStatusCode();
        $message = $exception->getMessage();

        if (429 === $statusCode) {
            return new JsonResponse([
                'type' => 'https://tools.ietf.org/html/rfc2616#section-10',
                'title' => 'Too Many Requests',
                'status' => 429,
                'detail' => $message,
                'block_time' => $exception->getHeaders()['Retry-After'] ?? null,
            ], 429);
        }

        return new JsonResponse([
            'status' => $statusCode,
            'message' => $message,
        ], $statusCode);
    }
}
