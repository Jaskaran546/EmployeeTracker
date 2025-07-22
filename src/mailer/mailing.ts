import { error } from "console";
import { configDotenv } from "dotenv";
import { Jwt } from "jsonwebtoken";
import nodemailer from "nodemailer";

configDotenv();
//function to send email to the user

export const transporterInstance = () => {
  return nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
  });
};

export interface MailOptions {
  from?: string;
  to: string;
  subject?: string;
  text?: string;
  html?: string;
}

export const sendingMail = async (options: MailOptions) => {
  try {
    let mailOptions = {
      from: process.env.FROM,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    };

    const Transporter = await transporterInstance();

    return await Transporter.sendMail(mailOptions);
  } catch (error) {
    console.log(error);
  }
};

export const sendVerificationMail = async (employee: any, token: Jwt) => {
  let mailOptions: MailOptions = {
    to: employee?.dataValues.email,
    subject: "Account Verification Link",
    text: `Hello, ${employee.dataValues.username} Please verify your email by
              clicking this link :
              http://localhost:${process.env.PORT}/api/verify-email/?token=${token}`,
  };

  await sendingMail(mailOptions).catch((error: any) => {
    console.log("error", error);
    return error;
  });
};

export const sendForgetPasswordMail = async (employee: any, token: Jwt) => {
  let mailOptions: MailOptions = {
    to: employee?.dataValues.email,
    subject: "Account Verification Link",
    text: `Hello, ${employee.dataValues.username} Please verify your email by
              clicking this link :
              http://localhost:${process.env.PORT}/api/verify-email/?token=${token}`,
  };
  await sendingMail(mailOptions);
};

export async function sendOtpNotification(userMail: any, user: any) {
  let mailOptions: MailOptions = {
    to: userMail,
    subject: "OTP to Reset password",
    text: `Your OTP for password reset is: ${user?.dataValues.resetOtp}. 
        Do not share your OTP with anyone else. Validity 5 Mins`,
  };
  try {
    await sendingMail(mailOptions).catch((error: any) => {
      console.log("error", error);
      return error;
    });
    console.log("OTP email sent to:", userMail);
  } catch (error) {
    console.error("Error sending OTP email:", error);
  }
}
