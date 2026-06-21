import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

// Next.js loads .env.local automatically, so no manual dotenv bootstrap is needed.

async function sendDiscordNotification(email: string, ip: string) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL
  if (!webhookUrl) return

  let geoFields: { name: string; value: string; inline?: boolean }[] = [
    { name: 'Location', value: 'Unknown', inline: false },
  ]

  try {
    const geoRes = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,regionName,city,lat,lon,isp,query`)
    if (geoRes.ok) {
      const geo = await geoRes.json()
      if (geo.status === 'success') {
        geoFields = [
          { name: 'Location', value: `${geo.city}, ${geo.regionName}, ${geo.country}`, inline: false },
          { name: 'Coordinates', value: `${geo.lat}, ${geo.lon}`, inline: true },
          { name: 'ISP', value: geo.isp || 'Unknown', inline: true },
        ]
      }
    }
  } catch (err) {
    console.error('ip-api lookup error:', err)
  }

  await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      embeds: [
        {
          title: '💘 New Waitlist Signup',
          color: 0x0ea5b7,
          fields: [
            { name: 'Email', value: email, inline: true },
            { name: 'IP', value: ip, inline: true },
            ...geoFields,
          ],
          timestamp: new Date().toISOString(),
        },
      ],
    }),
  }).catch((err) => console.error('Discord webhook error:', err))
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.error(
      'RESEND_API_KEY is not set. Available env keys:',
      Object.keys(process.env).filter((k) => k.startsWith('RESEND'))
    )
    return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 })
  }

  const resend = new Resend(apiKey)
  const AUDIENCE_ID = process.env.RESEND_WAITLIST_ID

  // Extract client IP (Vercel sets x-forwarded-for)
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0].trim() : (request.headers.get('x-real-ip') ?? 'unknown')

  let body: { email?: string; nickname?: string } = {}
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const { email, nickname } = body

  // Honeypot: hidden field humans never fill. Return a fake success so
  // bots don't learn they were filtered.
  if (nickname) {
    return NextResponse.json({ success: true })
  }

  if (!email || typeof email !== 'string') {
    return NextResponse.json({ error: 'Email is required.' }, { status: 400 })
  }

  // Basic server-side email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
  }

  try {
    // 1. Add contact to the waitlist audience
    let alreadySubscribed = false

    if (AUDIENCE_ID) {
      // contacts.create() is idempotent — it upserts silently, so we check existence first
      const { data: listData, error: listError } = await resend.contacts.list({ audienceId: AUDIENCE_ID })
      if (listError) {
        console.error('Contact list error:', listError)
      } else {
        alreadySubscribed = (listData?.data ?? []).some(
          (c: { email: string }) => c.email.toLowerCase() === email.toLowerCase()
        )
      }

      if (!alreadySubscribed) {
        const { error: contactError } = await resend.contacts.create({
          email,
          unsubscribed: false,
          audienceId: AUDIENCE_ID,
        })
        if (contactError) {
          console.error('Contact creation error:', contactError)
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
            <td align="center" style="padding-bottom:28px;">
              <p style="font-size:13px;line-height:1.6;color:#6b6b76;margin:0;background:#f8f8fa;border-radius:8px;padding:12px 16px;">
                💡 Found this in your Promotions or spam folder? Drag it to your Primary inbox so you don't miss our launch email.
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
    })

    if (emailError) {
      console.error('Email send error:', emailError)
      // Still return success if contact was added — email delivery can be retried
    }

    // Fire Discord notification (non-blocking, never fails the response)
    if (!alreadySubscribed) {
      sendDiscordNotification(email, ip).catch(() => {})
    }

    return NextResponse.json({ success: true, alreadySubscribed })
  } catch (err) {
    console.error('Waitlist error:', err)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 })
}
