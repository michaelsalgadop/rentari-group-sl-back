import crypto from "crypto";

const createCookies = (req, res, next) => {
  if (!req.cookies.sessionId) {
    const sessionId = crypto.randomUUID();
    res.cookie("sessionId", sessionId, {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });
    req.sessionId = sessionId;
  } else {
    req.sessionId = req.cookies.sessionId;
  }
  next();
};
export { createCookies };
