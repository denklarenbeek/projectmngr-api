const nodemailer = require("nodemailer");
const handlebars = require("handlebars");
const fs = require("fs");
const path = require("path");

const sendEmail = async (options) => {

    const {subject, payload, template, email} = options;

    try {
      let HOST, PORT, USER, PASS
      
      if(process.env.NODE_ENV !== 'production') {

        HOST = process.env.MAIL_HOST_DEV;
        PORT = process.env.MAIL_PORT_DEV;
        USER = process.env.MAIL_USER_DEV;
        PASS = process.env.MAIL_PASS_DEV;

      } else {

        HOST = process.env.MAIL_HOST;
        PORT = process.env.MAIL_PORT;
        USER = process.env.MAIL_USER;
        PASS = process.env.MAIL_PASS;

      }

      // create reusable transporter object using the default SMTP transport
      const transporter = nodemailer.createTransport({
        host: HOST,
        port: PORT,
        auth: {
          user: USER,
          pass: PASS,
        },
      });

      const source = fs.readFileSync(path.join(__dirname, template), "utf8");
      const compiledTemplate = handlebars.compile(source);
      const options = () => {
        return {
          from: process.env.FROM_EMAIL,
          to: email,
          subject: subject,
          html: compiledTemplate(payload),
        };
      };

      // Send email
      transporter.sendMail(options(), (error, info) => {
        if (error) {
          return error;
        } else {
          return res.status(200).json({
            success: true,
          });
        }
      });
    } catch (error) {
      return error;
    }
};

module.exports = sendEmail