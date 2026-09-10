<?php

namespace App\Mail;

use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

final class PasswordResetLink extends Mailable
{
    public function __construct(
        public readonly string $token,
        public readonly string $nomeCliente = 'Cliente',
        public readonly string $email = '',
    ) {
    }

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Redefinição de senha da sua conta');
    }

    public function content(): Content
    {
        return new Content(markdown: 'emails.customers.password-reset-link');
    }
}
