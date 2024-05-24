import passport from "passport";
import { Strategy } from "passport-jwt";
import UsersDAO from "../dao/users.dao.js";

// Configuro passport para el uso de JWT
passport.use(
  "jwt",
  new Strategy(
    {
      // jwtFromRequest: función que recibe el objeto request y como resultado
      // debe devolver el token a passport. Esto passport-jwt lo pide ya que solo
      // el desarrollador es quien sabe como se manda el jwt (puede enviarse, en las
      // cookies, distintas cabeceras, en el body, como un url param, etc.)
      jwtFromRequest: (req) => {
        let token = null;
        if (req && req.signedCookies) {
          token = req.signedCookies["jwt"];
        }
        return token;
      },

      // secretOrKey: Nos lo pide pada poder verificar la firma del JWT (claramente
      // tiene que tener el mismo valor que el secret que usamos para firmar el JWT
      // en la libreria jsonwebtoken)
      secretOrKey: process.env.JWT_SECRET,
    },
    async function (jwt_payload, done) {
      // jwt_payload representa el objeto json que guardamos dentro del JWT
      let userId = jwt_payload.id;
      let user = await UsersDAO.getUserByID(userId);

      // La funcion done(error, valor) sirve para indicar la salida de passport en donde
      // error puede contener un objeto representando un error o ser null en caso que no haya,
      // y valor es lo que vamos a poder acceder en nuestras funciones de rutas como req.user.
      // En caso de que las crendeciales no sean válidas se debe devolver un done(null, false)
      if (user) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    }
  )
);

export default passport;
