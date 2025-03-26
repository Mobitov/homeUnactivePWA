<?php

namespace App\Service;

use Psr\Cache\CacheItemPoolInterface;
use Psr\Cache\InvalidArgumentException;

class LoginAttemptService
{
    private CacheItemPoolInterface $cache;
    private const CACHE_EXPIRATION_TIME = 86400; // 24 hours in seconds

    public function __construct(CacheItemPoolInterface $cache)
    {
        $this->cache = $cache;
    }

    /**
     * @throws InvalidArgumentException
     */
    public function setLoginAttempt(string $username, string $clientIp, string $userAgent): int
    {
        $cacheKey = $this->generateCacheKey($username, $clientIp, $userAgent);
        $cacheItem = $this->cache->getItem($cacheKey);
        $loginAttempts = $cacheItem->isHit() ? $cacheItem->get() : 0;
        $loginAttempts++;
        $cacheItem->set($loginAttempts);
        $cacheItem->expiresAfter(self::CACHE_EXPIRATION_TIME);
        $this->cache->save($cacheItem);

        $blockKey = $this->generateBlockKey($username, $clientIp, $userAgent);
        $blockItem = $this->cache->getItem($blockKey);

        $blockDuration = $loginAttempts; // Block duration equals the number of failed attempts in seconds
        $blockItem->set(['blocked' => true, 'block_time' => time(), 'block_duration' => $blockDuration]);
        $blockItem->expiresAfter($blockDuration);

        $this->cache->save($blockItem);

        return $loginAttempts;
    }

    /**
     * @throws InvalidArgumentException
     */
    public function deleteLoginAttempt(string $username, string $clientIp, string $userAgent): void
    {
        $cacheKey = $this->generateCacheKey($username, $clientIp, $userAgent);
        $this->cache->deleteItem($cacheKey);
    }

    /**
     * @throws InvalidArgumentException
     */
    public function isBlocked(string $username, string $clientIp, string $userAgent): array
    {
        $blockKey = $this->generateBlockKey($username, $clientIp, $userAgent);
        $blockItem = $this->cache->getItem($blockKey);
        if ($blockItem->isHit()) {
            $blockData = $blockItem->get();
            if (is_array($blockData) && isset($blockData['blocked'], $blockData['block_time'], $blockData['block_duration'])) {
                $remainingTime = $blockData['block_duration'] - (time() - $blockData['block_time']);
                if ($remainingTime > 0) {
                    return ['blocked' => true, 'block_time' => $remainingTime];
                }
            }
        }
        return ['blocked' => false, 'block_time' => 0];
    }

    private function generateCacheKey(string $username, string $clientIp, string $userAgent): string
    {
        return 'login_attempts_' . md5($username . '_' . $clientIp . '_' . $userAgent);
    }

    private function generateBlockKey(string $username, string $clientIp, string $userAgent): string
    {
        return 'login_block_' . md5($username . '_' . $clientIp . '_' . $userAgent);
    }
}