<?php

namespace App\Service;

use Symfony\Component\HttpKernel\KernelInterface;
use Symfony\Component\Mailer\Exception\TransportExceptionInterface;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;

class MailerService
{
    private ?MailerInterface $mailer;
    private KernelInterface $kernel;

    public function __construct(MailerInterface $mailer, KernelInterface $kernel)
    {
        $this->mailer = $mailer;
        $this->kernel = $kernel;
    }

    /**
     * @throws TransportExceptionInterface
     */
    public function sendEmail(string $to, string $subject, string $templatePath, array $context): void
    {
        if ($this->mailer === null) {
            // Log a warning or handle the case when the mailer is not set
            return;
        }

        $emailTemplatePath = $this->kernel->getProjectDir() . $templatePath;
        $emailContent = file_get_contents($emailTemplatePath);

        foreach ($context as $key => $value) {
            $emailContent = preg_replace('/\{\{\s*' . preg_quote($key, '/') . '\s*}}/', $value, $emailContent);
        }

        $email = (new Email())
            ->from('test@mail.com')
            ->to($to)
            ->subject($subject)
            ->html($emailContent);

        $this->mailer->send($email);
    }

    public function isMailerDsnSet(): bool
    {
        return $this->mailer !== null;
    }
}
