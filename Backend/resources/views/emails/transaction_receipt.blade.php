<!DOCTYPE html>
<html>
<head>
    <title>Transaction Receipt</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #4CAF50; text-align: center;">Resi Transaksi</h2>
        <p>Halo,</p>
        <p>Terima kasih telah menggunakan layanan kami. Berikut adalah pembaruan terkait transaksi Anda:</p>
        <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #4CAF50; margin: 20px 0;">
            <strong>Status / Info Transaksi:</strong><br/>
            {{ $transactionMessage }}
        </div>
        <p>Jika Anda memiliki pertanyaan, jangan ragu untuk menghubungi layanan dukungan kami.</p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />
        <p style="text-align: center; font-size: 0.9em; color: #777;">&copy; {{ date('Y') }} Managemen Kos. All rights reserved.</p>
    </div>
</body>
</html>
