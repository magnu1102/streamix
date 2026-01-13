import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport(process.env.EMAIL_SERVER);

export async function sendVerificationEmail(email: string, token: string) {
  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Streamix Verification Code",
    text: `Your verification code is: ${token}\n\nThis code expires in 15 minutes.`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Verify your Streamix Account</h2>
        <p>Please enter the following code to complete your registration:</p>
        <div style="background: #f4f4f4; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0;">
          <strong style="font-size: 24px; letter-spacing: 5px;">${token}</strong>
        </div>
        <p>This code expires in 15 minutes.</p>
      </div>
    `,
  });

  console.log("Message sent: %s", info.messageId);
}