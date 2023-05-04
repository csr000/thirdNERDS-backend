import { IAssessment } from "../../models/Assessment";
import { writelog } from "../../utils";
import nodemailer from "nodemailer";

/**
 * Compare incoming MCQ answers to existing MCQ answers and calculate a score.
 * Set incorrect flag on incoming MCQs and return the score and approval status.
 *
 * @param incomingMCQs Array of incoming MCQs to compare
 * @param existingMCQs Array of existing MCQs to compare against
 * @returns Object with approval status and array of incoming MCQs with incorrect flag set
 */

export function compareMCQs(
  incomingMCQs: IAssessment["mcq"],
  existingMCQs: IAssessment["mcq"]
) {
  let score = 0;

  for (let i = 0; i < existingMCQs.length; i++) {
    const existingMCQ = existingMCQs[i];
    const incomingMCQ = incomingMCQs.find(
      (m) => m.question === existingMCQ.question
    );

    if (incomingMCQ && incomingMCQ.answer === existingMCQ.answer) {
      score++;
      incomingMCQs[i].incorrect = false;
    } else {
      incomingMCQs[i].incorrect = true;
    }
  }

  writelog(score + " / " + existingMCQs.length);

  const approved = score / existingMCQs.length == 1 ? true : false;

  return { approved, incomingMCQs };
}

function sendEmail(message: any) {
  return new Promise((res, rej) => {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GOOGLE_USER,
        pass: process.env.GOOGLE_PASSWORD,
      },
    });

    transporter.sendMail(message, function (err, info) {
      if (err) {
        rej(err);
      } else {
        res(info);
      }
    });
  });
}

export function sendResetPasswordEmail(email: string, hash: string) {
  const message = {
    from: process.env.GOOGLE_USER,
    // to: toUser.email // in production uncomment this
    to: email,
    subject: "Reset Your Password",
    html: `
      <p>Dear User,</p>
      <p>We have received a request to reset your password for ThirdNerds. To reset your password, please click on the following link: <a target="_" href="${process.env.DOMAIN}/auth/reset-password/${hash}">${process.env.DOMAIN}/auth/reset-password</a></p>
      <p>If you did not request this change, please ignore this email and your password will remain unchanged.</p>
      <p>Thank you for being part of the ThirdNerds community and we hope you continue to learn and grow with us!</p>
      <p>Best regards,</p>
      <p>The ThirdNerds Team.</p>
    `,
  };
  return sendEmail(message);
}
