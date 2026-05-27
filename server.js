import 'dotenv/config';
import express from 'express';
import { Resend } from 'resend';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('.'));

app.post('/api/waitlist', async (req, res) => {
  const { email } = req.body;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Valid email required.' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Resend API key not configured.' });
  }

  const resend = new Resend(apiKey);
  const audienceId = process.env.RESEND_AUDIENCE_ID;

  try {
    if (audienceId) {
      await resend.contacts.create({ audienceId, email });
    }

    await resend.emails.send({
      from: process.env.RESEND_FROM || 'FORMA <onboarding@resend.dev>',
      to: email,
      subject: 'You\'re on the FORMA waitlist',
      html: `
        <div style="font-family:Inter,Helvetica,Arial,sans-serif;max-width:480px;margin:0 auto;padding:40px 24px;color:#E0E1DD;background:#0D1B2A;">
          <h1 style="font-family:Georgia,serif;font-size:28px;font-weight:700;margin:0 0 16px;color:#E0E1DD;">You're in.</h1>
          <p style="font-size:15px;line-height:1.6;color:#9BA0A0;margin:0 0 24px;">
            We've added you to the FORMA waitlist. You'll be among the first to know when we launch.
          </p>
          <p style="font-size:12px;letter-spacing:0.2em;text-transform:uppercase;color:#00B4D8;margin:0;">
            FORMA &mdash; by Buena Lab
          </p>
        </div>
      `,
    });

    res.json({ ok: true });
  } catch (err) {
    console.error('Resend error:', err);
    res.status(500).json({ error: 'Failed to join waitlist.' });
  }
});

app.listen(port, () => {
  console.log(`FORMA server running on http://localhost:${port}`);
});
