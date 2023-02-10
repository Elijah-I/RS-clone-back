// imports
import cors from "cors";
import express from "express";
import cookies from "cookie-parser";

import "./model/provider.js";

import { server } from "./config.js";
import Routing from "./routing/index.js";

// create new Express app with JSON support
const app = express();

// enable json
app.use(express.json());

// handle CORS
app.use(cors(server.CORS));

// parse cookies
app.use(cookies());

// auth
app.use("/auth", Routing.auth);

// Prigrams and Trainings
app.use("/api", Routing.program);
app.use("/api", Routing.training);

// Progress
app.use("/api", Routing.progress);

// Meditaion
app.use("/api", Routing.meditation);

// User Profile
app.use("/api", Routing.profile);

// listen server on port: server.PORT
app.listen(server.PORT, () => console.log(`SERVER STARTED ON PORT ${server.PORT}`));
