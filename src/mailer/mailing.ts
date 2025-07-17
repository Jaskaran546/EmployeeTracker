import { configDotenv } from "dotenv";
import nodemailer from "nodemailer";

configDotenv();
//function to send email to the user
export const sendingMail = async ({ from, to, subject, text }: any) => {
  try {
    let mailOptions = {
      from,
      to,
      subject,
      text,
      html: `<p>Hello, verify your email address by clicking on this</p>
        <br>`,
    };

    //asign createTransport method in nodemailer to a variable
    //service: to determine which email platform to use
    //auth contains the senders email and password which are all saved in the .env
    const Transporter = nodemailer.createTransport({
      host: "smtp.freesmtpservers.com",
      port: 25,
    });

    //return the Transporter variable which has the sendMail method to send the mail
    //which is within the mailOptions
    return await Transporter.sendMail(mailOptions);
  } catch (error) {
    console.log(error);
  }
};
