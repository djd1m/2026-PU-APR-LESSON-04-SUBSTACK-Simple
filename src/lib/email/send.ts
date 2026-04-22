import { getResend } from "./resend";

const from = process.env.EMAIL_FROM || "onboarding@resend.dev";
const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function sendVerificationEmail(email: string, token: string) {
  const url = `${appUrl}/verify-email?token=${token}`;

  await getResend().emails.send({
    from,
    to: email,
    subject: "Подтвердите ваш email — SubStack RU",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Добро пожаловать в SubStack RU!</h2>
        <p>Для завершения регистрации подтвердите ваш email:</p>
        <a href="${url}" style="display: inline-block; padding: 12px 24px; background: #0f172a; color: #fff; text-decoration: none; border-radius: 6px;">
          Подтвердить email
        </a>
        <p style="margin-top: 16px; color: #666; font-size: 14px;">
          Если вы не регистрировались, просто проигнорируйте это письмо.
        </p>
      </div>
    `,
  });
}

export async function sendPostNotificationEmail(
  to: string,
  post: { title: string; contentHtml: string; slug: string; publicationSlug: string; publicationName: string },
  unsubscribeToken: string,
  trackingPixelId: string
) {
  const postUrl = `${appUrl}/${post.publicationSlug}/${post.slug}`;
  const unsubscribeUrl = `${appUrl}/api/subscribers/confirm?action=unsubscribe&token=${unsubscribeToken}`;
  const pixelUrl = `${appUrl}/api/analytics/track?type=open&id=${trackingPixelId}`;

  await getResend().emails.send({
    from,
    to,
    subject: post.title,
    html: `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto;">
        <p style="color: #666; font-size: 14px;">${post.publicationName}</p>
        <h1 style="font-size: 28px; line-height: 1.3;">${post.title}</h1>
        <div style="font-size: 18px; line-height: 1.7;">
          ${post.contentHtml}
        </div>
        <hr style="margin: 32px 0; border: none; border-top: 1px solid #eee;" />
        <p style="font-size: 14px; color: #666;">
          <a href="${postUrl}">Читать на сайте</a> ·
          <a href="${unsubscribeUrl}">Отписаться</a>
        </p>
        <img src="${pixelUrl}" width="1" height="1" style="display:none;" alt="" />
      </div>
    `,
    headers: {
      "List-Unsubscribe": `<${unsubscribeUrl}>`,
    },
  });
}
