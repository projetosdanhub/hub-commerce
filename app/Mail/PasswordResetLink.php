<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PasswordResetLink extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public $token;
    public $nomeCliente;

    public function __construct($token, $nomeCliente = 'Cliente')
    {
        $this->token = $token;
        $this->nomeCliente = $nomeCliente;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Redefinição de Senha da Sua Conta',
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.customers.password-reset-link',
        );
    }
}