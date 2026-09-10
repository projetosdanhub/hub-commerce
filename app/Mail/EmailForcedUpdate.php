<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class EmailForcedUpdate extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public $nomeCliente;
    public $novoEmail;
    public $motivo;

    public function __construct($nomeCliente, $novoEmail, $motivo)
    {
        $this->nomeCliente = $nomeCliente;
        $this->novoEmail = $novoEmail;
        $this->motivo = $motivo;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Aviso de Segurança: Seu E-mail de Acesso Foi Alterado',
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.customers.email-forced',
        );
    }
}