import { App } from "./app";
import UserController from "./controllers/user.controller";

const app = new App(Number(3000));

app.listen();