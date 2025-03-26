<?php

namespace App\EventListener;

use App\Exception\CustomTooManyRequestsHttpException;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Event\ExceptionEvent;

class ExceptionListener
{
    public function onKernelException(ExceptionEvent $event): void
    {
        $exception = $event->getThrowable();
        if ($exception instanceof CustomTooManyRequestsHttpException) {
            $response = new JsonResponse([
                'type' => 'https://tools.ietf.org/html/rfc2616#section-10',
                'title' => 'Too Many Requests',
                'status' => 429,
                'detail' => $exception->getMessage(),
                'block_time' => $exception->getBlockTime(),
            ], 429);

            $event->setResponse($response);
        }
    }
}
