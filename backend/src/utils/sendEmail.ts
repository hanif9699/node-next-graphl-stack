import nodemailer from "nodemailer";
import logger from "./logger";

// async..await is not allowed in global scope, must use a wrapper
export async function sendEmail(to: string, html: string) {
    // Generate test SMTP service account from ethereal.email
    // Only needed if you don't have a real mail account for testing
    // let testAccount = await nodemailer.createTestAccount();
    // logger.debug(testAccount)
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: 'blk2h72npmgbb7ys@ethereal.email', // generated ethereal user
            pass: 'NuSreCe3qdJEdVUEkY', // generated ethereal password
        },
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
        from: '"Fred Foo 👻" <foo@example.com>', // sender address
        to, // list of receivers
        subject: "Change Password", // Subject line
        html, // html body
    });
    logger.debug(info)
    logger.debug(info.messageId);
    logger.debug(nodemailer.getTestMessageUrl(info));
}

