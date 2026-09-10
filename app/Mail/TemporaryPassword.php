<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class TemporaryPassword extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public $senhaProvisoria;
    public $nomeCliente;

    public function __construct($senhaProvisoria, $nomeCliente = 'Cliente')
    {
        $this->senhaProvisoria = $senhaProvisoria;
        $this->nomeCliente = $nomeCliente;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Sua Senha de Acesso Provisória',
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.customers.temp-password',
        );
    }
}