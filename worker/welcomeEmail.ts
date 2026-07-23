/**
 * Deliverability-first vibe welcome email (moderate richness).
 *
 * Rules applied (email expert review):
 * - Relationship tone first; commerce second
 * - ≤3 content links (vibe card, one room shop, optional limited as text only — we use 2)
 * - No Amazon deep links in body
 * - First-party images only; one avatar; text stands alone if images blocked
 * - No spam subject tokens (FREE, ACT NOW, ALL CAPS, emoji piles)
 * - Table shell + inline CSS; system fonts
 * - Escape all dynamic fields
 * - Plain-text alternative for multipart clients
 * - Physical address + why-you-got-this footer (GHL also injects unsub)
 */

import {
  getVibeEmailProfile,
  isKnownVibeId,
  utm,
  type VibeEmailProfile,
} from './vibeEmailContent'

function escapeHtml(s: string) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export type WelcomeEmailInput = {
  firstName?: string
  personaId?: string
  personaLabel?: string
  interests?: string[]
}

export type WelcomeEmailParts = {
  subject: string
  preheader: string
  html: string
  text: string
  profile: VibeEmailProfile
}

export function buildWelcomeEmail(input: WelcomeEmailInput): WelcomeEmailParts {
  const profile = getVibeEmailProfile(input.personaId, input.personaLabel)
  const title = profile.title

  const first = String(input.firstName || '')
    .trim()
    .slice(0, 40)
  const greeting = first ? `Hi ${first},` : 'Hi there,'

  // Only link known vibe cards; explorer fallback goes to quiz
  const vibePath = isKnownVibeId(profile.id)
    ? `/vibe/${profile.id}`
    : '/quiz'
  const vibeUrl = utm(vibePath, `vibe_${profile.id}`)
  const shopUrl = utm(profile.shopPath, `shop_${profile.id}`)

  // Subject: identity payoff, no promo spam lexicon
  const subject = `Your Bamboo Vibe: ${title}`
  const preheader = `${profile.tagline} Your full vibe card is ready.`

  const traitLis = profile.traits
    .slice(0, 3)
    .map(
      (t) =>
        `<li style="margin:0 0 8px 0;font-size:15px;line-height:1.5;color:#3d4a3c">${escapeHtml(t)}</li>`,
    )
    .join('')

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background:#f6f3eb;-webkit-text-size-adjust:100%;">
  <!-- preheader: hidden preview text -->
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:#f6f3eb;opacity:0;">
    ${escapeHtml(preheader)}
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f6f3eb;border-collapse:collapse;">
    <tr>
      <td align="center" style="padding:28px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;border-collapse:collapse;background:#ffffff;border:1px solid #ddd6c6;">
          <tr>
            <td style="padding:28px 28px 8px 28px;font-family:Georgia,'Times New Roman',serif;">
              <p style="margin:0 0 20px 0;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#3f6b35;font-family:Arial,Helvetica,sans-serif;font-weight:700;">
                iBamboo
              </p>
              <p style="margin:0 0 12px 0;font-size:16px;line-height:1.5;color:#3d4a3c;font-family:Arial,Helvetica,sans-serif;">
                ${escapeHtml(greeting)}
              </p>
              <h1 style="margin:0 0 8px 0;font-size:26px;line-height:1.25;font-weight:600;color:#121a12;">
                You are a ${escapeHtml(title)}.
              </h1>
              <p style="margin:0 0 20px 0;font-size:16px;line-height:1.5;color:#3d4a3c;font-family:Arial,Helvetica,sans-serif;">
                ${escapeHtml(profile.tagline)}
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 28px 20px 28px;font-family:Arial,Helvetica,sans-serif;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                <tr>
                  <td valign="top" style="padding:0 16px 0 0;">
                    <img
                      src="${escapeHtml(profile.avatarImageUrl)}"
                      width="120"
                      height="150"
                      alt="${escapeHtml(profile.avatarName)}"
                      style="display:block;width:120px;max-width:120px;height:auto;border:1px solid #ddd6c6;border-radius:8px;"
                    />
                  </td>
                  <td valign="top" style="font-size:15px;line-height:1.55;color:#3d4a3c;">
                    <p style="margin:0 0 10px 0;">
                      ${escapeHtml(profile.story)}
                    </p>
                    <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-style:italic;color:#121a12;">
                      &ldquo;${escapeHtml(profile.catchphrase)}&rdquo;
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:0 28px 8px 28px;font-family:Arial,Helvetica,sans-serif;">
              <p style="margin:0 0 10px 0;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#3f6b35;font-weight:700;">
                A few things that fit your vibe
              </p>
              <ul style="margin:0 0 16px 0;padding:0 0 0 18px;">
                ${traitLis}
              </ul>
              <p style="margin:0 0 24px 0;font-size:15px;line-height:1.55;color:#3d4a3c;">
                <strong style="color:#121a12">${escapeHtml(profile.avatarName)} says:</strong>
                &ldquo;${escapeHtml(profile.avatarQuote)}&rdquo;
              </p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:0 28px 12px 28px;font-family:Arial,Helvetica,sans-serif;">
              <a href="${escapeHtml(vibeUrl)}"
                 style="display:inline-block;background:#1e3320;color:#f6f3eb;padding:14px 24px;border-radius:999px;text-decoration:none;font-size:14px;font-weight:700;">
                See your full vibe card
              </a>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:0 28px 28px 28px;font-family:Arial,Helvetica,sans-serif;">
              <p style="margin:0;font-size:14px;line-height:1.5;color:#3d4a3c;">
                When you are ready to outfit the room:<br />
                <a href="${escapeHtml(shopUrl)}" style="color:#3f6b35;font-weight:600;">
                  ${escapeHtml(profile.shopLabel)}
                </a>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 28px;border-top:1px solid #ddd6c6;font-family:Arial,Helvetica,sans-serif;background:#f6f3eb;">
              <p style="margin:0 0 10px 0;font-size:13px;line-height:1.5;color:#6b7768;">
                Discover on iBamboo. Buy on Amazon when you are ready.
                Lists refresh weekly.
              </p>
              <p style="margin:0 0 10px 0;font-size:12px;line-height:1.5;color:#6b7768;">
                You received this because you opted in after the Bamboo Vibe Check on ibamboo.com.
                If this was not you, use the unsubscribe link in this email.
              </p>
              <p style="margin:0;font-size:11px;line-height:1.5;color:#6b7768;">
                iBamboo &middot; ibamboo.com
                <!-- Physical mailing address: ensure GHL location footer injects your postal address for CAN-SPAM. -->
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

  const text = [
    greeting,
    '',
    `You are a ${title}.`,
    profile.tagline,
    '',
    profile.story,
    '',
    `"${profile.catchphrase}"`,
    '',
    'A few things that fit your vibe:',
    ...profile.traits.slice(0, 3).map((t) => `• ${t}`),
    '',
    `${profile.avatarName} says: "${profile.avatarQuote}"`,
    '',
    `See your full vibe card: ${vibeUrl}`,
    `${profile.shopLabel}: ${shopUrl}`,
    '',
    'Discover on iBamboo. Buy on Amazon when you are ready.',
    '',
    'You received this because you opted in after the Bamboo Vibe Check on ibamboo.com.',
    'iBamboo · https://ibamboo.com',
  ].join('\n')

  return { subject, preheader, html, text, profile }
}
