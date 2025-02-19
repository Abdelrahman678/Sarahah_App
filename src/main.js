import express from "express";
import {db_connection} from "./DB/connection.js";
import routerHandler from "./utils/router-handler.utils.js";
import { config } from "dotenv";
import path from "path";

config({path:path.resolve(`src/config/.${process.env.NODE_ENV}.env`)});

async function bootStrap() {

    // express app
    const app = express();
    app.use(express.json());
    // routerHandler
    routerHandler(app);
    // db connection
    db_connection();

    app.listen(process.env.PORT, () => {
        console.log(`Server Started on port ${process.env.PORT}`);
    })
}

export default bootStrap;