<?php

namespace App\Mail;

use Carbon\CarbonInterface;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

final class TenantInvitationMail extends Mailable
{
    public function __construct(
        public readonly string $tenantName,
        public readonly string $acceptUrl,
        public readonly CarbonInterface $expiresAt,
    ) {
    }

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Convite para a equipe da loja ' . $this->tenantName);
    }

    public function content(): Content
    {
        return new Content(view: 'emails.identity.tenant-invitation');
    }
}
