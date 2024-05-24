import express from "express";
import cookieParser from "cookie-parser";
import passport from "./passport/passport.jwt.js";
import morgan from "morgan";
import router_session from "./routes/sessions.js";
import dotenv from "dotenv";
import __dirname from "./__dirname.js";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUI from "swagger-ui-express";

dotenv.config();
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("tiny"));
app.use(passport.initialize());
app.use(cookieParser(process.env.COOKIE_SECRET));
//Swagger
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Api Login Test",
      version: "1.0.0",
      description: "API para probar sistemas de login por JWT y cookies",
    },
    servers: [
      {
        url: "http://localhost:3000/api",
      },
    ],
  },
  apis: [`${__dirname}/docs/**/*.yaml`],
};
console.log("dirname: ", __dirname);
const swaggerDocs = swaggerJSDoc(swaggerOptions);
app.use("/apidocs", swaggerUI.serve, swaggerUI.setup(swaggerDocs));
app.use("/api/session/", router_session);

app.listen(process.env.PORT, () => {
  console.log(`Server rnning at port ${process.env.PORT}`);
});
