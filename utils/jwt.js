import jwt from "jsonwebtoken";

const SECRET_JWT = process.env.SECRET_JWT;

const crearToken = (infoToken) =>
  jwt.sign({ infoToken }, SECRET_JWT, { expiresIn: "2d" });

const validarToken = (token) => jwt.verify(token, SECRET_JWT);

const authMiddleware = (req, res, next) => {
  if (!req.header("Authorization")) {
    const error = new Error("Petición no autorizada");
    error.status = 403;
    return next(error);
  }
  try {
    const token = req.header("Authorization").split(" ")[1];
    const datosToken = validarToken(token);
    const { infoToken } = datosToken;
    req.idUsuario = infoToken.idUsuario;
    req.role = infoToken.role ?? "user";
    next();
  } catch (error) {
    if (error.message.includes("expired")) {
      const error = new Error(
        "Token caducado. En caso de tener una sesión abierta, cierre sesión y vuelva a iniciarla. De lo contrario, solamente inicie sesión."
      );
      error.status = 403;
      return next(error);
    }
    next(error);
  }
};
export { crearToken, validarToken, authMiddleware };
