<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class VerifyEmailUpdate extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public $token;
    public $novoEmail;
    public $nomeCliente;

    public function __construct($token, $novoEmail, $nomeCliente = 'Cliente')
    {
        $this->token = $token;
        $this->novoEmail = $novoEmail;
        $this->nomeCliente = $nomeCliente;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Confirme a atualização do seu E-mail',
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.customers.verify-email',
        );
    }
}