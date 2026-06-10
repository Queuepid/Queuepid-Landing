import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { Resend } from 'resend';

// Load .env.local explicitly — dotenv's default only reads `.env`, and
// `vercel dev` doesn't reliably inject env into this api-only project.
const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '..', '.env.local') });

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('RESEND_API_KEY is not set. Available env keys:', Object.keys(process.env).filter(k => k.startsWith('RESEND')));
    return res.status(500).json({ error: 'Server configuration error.' });
  }

  const resend = new Resend(apiKey);
  const AUDIENCE_ID = process.env.RESEND_WAITLIST_ID;


  const { email, nickname } = req.body || {};

  // Honeypot: hidden field humans never fill. Return a fake success so
  // bots don't learn they were filtered.
  if (nickname) {
    return res.status(200).json({ success: true });
  }

  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Email is required.' });
  }

  // Basic server-side email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  try {
    // 1. Add contact to the waitlist audience
    let alreadySubscribed = false;

    if (AUDIENCE_ID) {
      const { error: contactError } = await resend.contacts.create({
        email,
        unsubscribed: false,
        audienceId: AUDIENCE_ID,
      });

      if (contactError) {
        // If the contact already exists, treat it gracefully
        const msg = contactError.message || '';
        if (msg.toLowerCase().includes('already') || msg.toLowerCase().includes('exists')) {
          alreadySubscribed = true;
        } else {
          console.error('Contact creation error:', contactError);
        }
      }
    }

    // 2. Send confirmation email
    const { error: emailError } = await resend.emails.send({
      from: 'Queuepid <hello@queuepid.gg>',
      to: [email],
      subject: "You're on the Queuepid.gg waitlist! 💘",
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="margin:0;padding:0;background:#f4f4f7;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border:1px solid #e6e6ec;border-radius:14px;padding:40px 32px;">
          <tr>
            <td align="center" style="padding-bottom:20px;">
              <span style="font-size:30px;font-weight:800;color:#0ea5b7;">Queuepid.gg</span>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom:14px;">
              <span style="font-size:20px;font-weight:700;color:#16161d;">You're on the list! 🎮</span>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom:28px;">
              <p style="font-size:15px;line-height:1.7;color:#4a4a55;margin:0;">
                Thanks for joining the Queuepid waitlist. We're building the future of matchmaking for gamers, and you'll be among the first to know when we launch.
              </p>
            </td>
          </tr>
          <tr>
            <td align="center">
              <p style="font-size:13px;color:#9a9aa5;margin:0;">
                — The Queuepid Team
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    });

    if (emailError) {
      console.error('Email send error:', emailError);
      // Still return success if contact was added — email delivery can be retried
    }

    return res.status(200).json({
      success: true,
      alreadySubscribed,
    });
  } catch (err) {
    console.error('Waitlist error:', err);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}
