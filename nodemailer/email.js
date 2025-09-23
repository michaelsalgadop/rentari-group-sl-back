import pkg from "debug";
import nodemailer from "nodemailer";
const { default: createDebug, enable } = pkg;
if (process.env.DEBUG) {
  enable(process.env.DEBUG);
}

const debug = createDebug("Rentari:Email");

const usuario = process.env.USER_EMAIL;
const password = process.env.PASS_EMAIL;

const transport = nodemailer.createTransport({
  service: "gmail",
  port: 8000,
  secure: false,
  auth: {
    user: usuario,
    pass: password,
  },
});

const enviarCorreo = (nombreUsuario, email, confirmationCode) => {
  const mensaje = {
    from: usuario,
    to: email,
    subject: "Porfavor, verifica tu cuenta",
    html: `
  <div style="max-width: 600px; margin: auto; padding: 20px;
              font-family: Arial, Helvetica, sans-serif;
              color: #333; background-color: #f9f9f9;
              border-radius: 10px; border: 1px solid #ddd;">

    <h1 style="text-align: center; color: #9cb5ffff;">Verificación de Email</h1>

    <h2 style="text-align: center;">Hola, ${nombreUsuario} 👋</h2>

    <p style="font-size: 16px; text-align: center;">
      ¡Gracias por registrarte en <strong>Rentari</strong>!
      Para completar tu registro, introduce el siguiente código en la web:
    </p>

    <div style="text-align: center; margin: 30px 0;">
      <span style="display: inline-block; padding: 15px 30px;
                   font-size: 28px; font-weight: bold;
                   letter-spacing: 5px; color: #fff;
                   background-color: #9cb5ffff;
                   border-radius: 8px;">
        ${confirmationCode}
      </span>
    </div>

    <p style="font-size: 14px; color: #666; text-align: center;">
      Si no solicitaste esta verificación, puedes ignorar este correo.
    </p>

  </div>
  `,
  };
  transport.sendMail(mensaje, (err, info) => {
    if (err) {
      debug("No he podido enviar el correo");
      debug(err.message);
    } else {
      debug("Correo enviado");
    }
  });
};

export { enviarCorreo };
