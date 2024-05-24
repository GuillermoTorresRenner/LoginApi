import Router from "express";
import jwt from "jsonwebtoken";
import passport from "passport";

import UsersDAO from "../dao/users.dao.js";
import UsersDto from "../app/dto/users.dto.js";

const router = Router();

router.post("/register", async (req, res) => {
  const { name, surname, email, password } = req.body;

  if (!name || !surname || !email || !password) {
    res.status(400).json({ status: 400, error: "Missing data" });
  }

  const emailUsed = await UsersDAO.getUserByEmail(email);

  if (emailUsed) {
    res.status(400).json({ status: 400, error: "Email already used" });
  } else {
    await UsersDAO.register(name, surname, email, password);
    res.status(200).json({ status: 200, message: "User created" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ status: 400, error: "Missing credentials" });
  }

  let user = await UsersDAO.getUserByCreds(email, password);

  if (!user) {
    res.status(404).json({ status: 404, error: "User not found" });
  } else {
    // Genero el JWT con el user ID firmado y con expiración de una hora
    let token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Genero la cookie firmada con el secret definido en app.use(cookieParser())
    // con la misma expiración que el JWT
    res
      .cookie("jwt", token, {
        signed: true,
        httpOnly: true,
        maxAge: 1000 * 60 * 60,
      })
      .json({ status: 200, msg: "Logged in" });
  }
});

router.get(
  "/whoami",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.send(UsersDto.getUser(req.user));
  }
);

router.get("/logout", (req, res) => {
  res.clearCookie("jwt");
  res.status(200).json({ status: 200, msg: "Logged out" });
});

router.get("/ping", (req, res) => {
  res.status(200).json({ status: 200, msg: "Pong" });
});

router.get("/users", async (req, res) => {
  const users = await UsersDAO.getUsers();
  res.status(200).send(users);
});

export default router;
