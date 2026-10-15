<?php

namespace App\Services;

use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\PHPMailer;

class EmailService
{
    public function enviar(string $destinatario, string $asunto, string $cuerpo): bool
    {
        if (filter_var($_ENV['NOTIFICACIONES_MODO_SIMULACION'] ?? 'false', FILTER_VALIDATE_BOOLEAN)) {
            error_log("[EMAIL SIMULADO] {$destinatario}: {$asunto}");
            return true;
        }

        $mail = new PHPMailer(true);
        try {
            $mail->isSMTP();
            $mail->Host = $_ENV['SMTP_HOST'] ?? 'localhost';
            $mail->SMTPAuth = true;
            $mail->Username = $_ENV['SMTP_USER'] ?? '';
            $mail->Password = $_ENV['SMTP_PASS'] ?? '';
            $mail->Port = (int) ($_ENV['SMTP_PORT'] ?? 2525);
            $mail->CharSet = 'UTF-8';
            $mail->setFrom($_ENV['SMTP_FROM_EMAIL'] ?? 'notificaciones@clinica.com', $_ENV['SMTP_FROM_NAME'] ?? 'Clínica Veterinaria');
            $mail->addAddress($destinatario);
            $mail->isHTML(true);
            $mail->Subject = $asunto ?? 'Notificación Clínica';
            $mail->Body = $cuerpo;
            $mail->AltBody = strip_tags($cuerpo);
            return $mail->send();
        } catch (Exception $e) {
            error_log('Error PHPMailer: ' . $mail->ErrorInfo);
            return false;
        }
    }
}
