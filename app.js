import express from "express";
import cookieParser from "cookie-parser";
import passport from "./passport/passport.jwt.js";
import morgan from "morgan";
import router_session from "./routes/sessions.js";
import dotenv from "dotenv";

dotenv.config();
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("tiny"));
app.use(passport.initialize());
app.use(cookieParser(process.env.COOKIE_SECRET));

app.use("/api/session/", router_session);

app.listen(process.env.PORT, () => {
  console.log(`Server rnning at port ${process.env.PORT}`);
});
