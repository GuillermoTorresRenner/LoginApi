import Router from "express";
import jwt from "jsonwebtoken";
import passport from "passport";

import UsersDAO from "../dao/users.dao.js";

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

    // ¿Por qué uso signed cookies y signed JWT?
    // El signed o firma únicamente me sirve para asegurar que el contenido (de la cookie
    // o del JWT) no fue alterado, ya que para poder alterarlo se necesita el secret correspondiente.
    // Tener ambas cosas firmadas con distintos secrets implica que un atacante debería encontrar
    // ambos secrets para poder alterar el contenido, siendo un poco más preventivo frente a un posible leakeo
    // de estos secrets.
  }
});

// El session:false indica a passport que no es necesario que persista data intemerdia del usuario
// a través de sesiones, esto depende mucho de la estrategia de autenticación que se este usando.
// En este caso como toda la data resultante del login se la asignamos al usuario directamete a través
// de cookies, no hace falta que passport maneje sesiones. Por esto mismo es que tampoco hacemos uso
// de las funciones serialize o deserealize de passport
router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.json(req.user);
  }
);

router.get("/logout", (req, res) => {
  res.clearCookie("jwt");
  res.status(200).json({ status: 200, msg: "Logged out" });
});

export default router;
