import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import midtransClient from "midtrans-client";
import { Resend } from "resend";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In-memory message store (Reset on restart)
const messages: any[] = [];

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  const PORT = 3000;

  app.use(express.json());

  // Socket.io Logic
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join-room", (roomId) => {
      socket.join(roomId);
      console.log(`User joined room: ${roomId}`);
      // Send previous messages for this room
      const roomMessages = messages.filter(m => m.roomId === roomId);
      socket.emit("initial-messages", roomMessages);
    });

    socket.on("send-message", (message) => {
      const newMessage = {
        ...message,
        id: `MSG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString()
      };
      messages.push(newMessage);
      
      // Broadcast to room (tenant + admins)
      io.to(message.roomId).emit("new-message", newMessage);
      
      // Also broadcast to admin channel for notifications
      io.to("admins").emit("new-message-notification", newMessage);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });

  // Initialize Midtrans
  const snap = new midtransClient.Snap({
    isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
    serverKey: process.env.MIDTRANS_SERVER_KEY || "",
    clientKey: process.env.MIDTRANS_CLIENT_KEY || ""
  });

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Send Verification Email
  app.post("/api/auth/send-verification", async (req, res) => {
    try {
      const { email, name } = req.body;
      const apiKey = process.env.RESEND_API_KEY;

      if (!apiKey || apiKey === "YOUR_RESEND_API_KEY") {
        console.warn("RESEND_API_KEY is not configured correctly. Email notification skipped.");
        return res.json({ 
          success: true, 
          simulated: true,
          message: "Mode simulasi aktif karena API Key belum dikonfigurasi di Secrets." 
        });
      }

      const resend = new Resend(apiKey);
      const appUrl = process.env.APP_URL || "http://localhost:3000";

      const { data, error } = await resend.emails.send({
        from: "NestIn <onboarding@resend.dev>",
        to: [email],
        subject: "Verifikasi Email Akun NestIn Anda",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              .container { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1e293b; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 16px; }
              .header { color: #059669; font-size: 24px; font-weight: bold; margin-bottom: 20px; }
              .button { display: inline-block; background: #059669; color: white !important; padding: 14px 28px; text-decoration: none; border-radius: 12px; font-weight: bold; margin: 30px 0; }
              .footer { font-size: 11px; color: #94a3b8; margin-top: 40px; border-top: 1px solid #f1f5f9; padding-top: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">NestIn</div>
              <h2>Verifikasi Akun Anda</h2>
              <p>Halo <strong>${name}</strong>,</p>
              <p>Terima kasih telah mendaftar di <strong>NestIn</strong>. Kami sangat senang Anda bergabung!</p>
              <p>Satu langkah lagi untuk memulai, silakan klik tombol di bawah ini untuk memverifikasi alamat email Anda:</p>
              
              <a href="${appUrl}" class="button">Verifikasi Email Sekarang</a>
              
              <p>Atau copy link berikut ke browser Anda:</p>
              <p style="font-size: 12px; color: #059669;">${appUrl}</p>
              
              <div class="footer">
                <p>Jika Anda tidak merasa mendaftar di NestIn, abaikan saja email ini.</p>
                <p>&copy; 2026 NestIn Property Management System.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      });

      if (error) {
        console.error("Resend API Error:", error);
        return res.status(500).json({ error: error.message });
      }

      console.log("Email sent successfully to:", email);
      res.json({ success: true, data });
    } catch (error: any) {
      console.error("Critical Server Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Create Midtrans Transaction
  app.post("/api/payment/token", async (req, res) => {
    try {
      const { bookingId, amount, customerDetails, itemDetails } = req.body;

      if (!process.env.MIDTRANS_SERVER_KEY) {
        return res.status(500).json({ 
          error: "MIDTRANS_SERVER_KEY is not configured. Please add it to your environment variables." 
        });
      }

      const parameter = {
        transaction_details: {
          order_id: `NESTIN-${bookingId}-${Date.now()}`,
          gross_amount: amount,
        },
        credit_card: {
          secure: true,
        },
        customer_details: customerDetails,
        item_details: itemDetails
      };

      const transaction = await snap.createTransaction(parameter);
      res.json(transaction);
    } catch (error: any) {
      console.error("Midtrans Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Midtrans Notification Webhook
  app.post("/api/payment/notification", async (req, res) => {
    try {
      const statusResponse = await snap.transaction.notification(req.body);
      const orderId = statusResponse.order_id;
      const transactionStatus = statusResponse.transaction_status;
      const fraudStatus = statusResponse.fraud_status;

      console.log(`Transaction notification received. Order ID: ${orderId}. Transaction status: ${transactionStatus}. Fraud status: ${fraudStatus}`);

      // In a real app, you would update your database here
      // For this demo, we can log it. 
      // Statuses to handle: 'capture', 'settlement', 'pending', 'deny', 'expire', 'cancel'
      
      if (transactionStatus == 'capture') {
        if (fraudStatus == 'challenge') {
          // TODO set transaction status on your database to 'challenge'
        } else if (fraudStatus == 'accept') {
          // TODO set transaction status on your database to 'success'
        }
      } else if (transactionStatus == 'settlement') {
        // TODO set transaction status on your database to 'success'
      } else if (transactionStatus == 'cancel' || transactionStatus == 'deny' || transactionStatus == 'expire') {
        // TODO set transaction status on your database to 'failure'
      } else if (transactionStatus == 'pending') {
        // TODO set transaction status on your database to 'pending'
      }

      res.status(200).send("OK");
    } catch (error: any) {
      console.error("Webhook Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
