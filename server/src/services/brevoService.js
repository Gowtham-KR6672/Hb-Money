import axios from 'axios';
import nodemailer from 'nodemailer';

function getSmtpTransporter() {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    return null;
  }

  return nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
}

async function sendViaSmtp({ to, subject, htmlContent }) {
  const transporter = getSmtpTransporter();
  if (!transporter) {
    return false;
  }

  await transporter.sendMail({
    from: `"HB Money" <${process.env.EMAIL_FROM || process.env.BREVO_SENDER_EMAIL || process.env.EMAIL_USER}>`,
    to,
    subject,
    html: htmlContent
  });

  return true;
}

export async function sendOtpEmail(email, otp) {
  const subject = 'HB Money verification code';
  const htmlContent = `<h2>HB Money OTP Verification</h2><p>Your OTP is <strong>${otp}</strong>. It expires in 10 minutes.</p>`;

  if (process.env.BREVO_API_KEY) {
    await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      {
        sender: {
          name: 'HB Money',
          email: process.env.BREVO_SENDER_EMAIL || process.env.EMAIL_FROM
        },
        to: [{ email }],
        subject,
        htmlContent
      },
      {
        headers: {
          'api-key': process.env.BREVO_API_KEY,
          'content-type': 'application/json'
        }
      }
    );
    return;
  }

  const sent = await sendViaSmtp({ to: email, subject, htmlContent });
  if (!sent) {
    console.log(`HB Money OTP for ${email}: ${otp}`);
  }
}

export async function sendMonthlyStatement(email, summary) {
  const subject = 'HB Money monthly statement';
  const htmlContent = `
    <h2>HB Money Monthly Statement</h2>
    <p>Total income: <strong>${summary.totalIncome}</strong></p>
    <p>Total expenses: <strong>${summary.totalExpense}</strong></p>
    <p>Savings: <strong>${summary.savings}</strong></p>
    <p>Top categories: <strong>${summary.topCategories}</strong></p>
  `;

  if (process.env.BREVO_API_KEY) {
    await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      {
        sender: { name: 'HB Money', email: process.env.BREVO_SENDER_EMAIL || process.env.EMAIL_FROM },
        to: [{ email }],
        subject,
        htmlContent
      },
      {
        headers: {
          'api-key': process.env.BREVO_API_KEY,
          'content-type': 'application/json'
        }
      }
    );
    return;
  }

  const sent = await sendViaSmtp({ to: email, subject, htmlContent });
  if (!sent) {
    console.log(`Monthly statement for ${email}`, summary);
  }
}
