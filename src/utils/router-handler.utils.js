import { globalErrorHandlerMiddleware } from "../Middleware/error-handler.middleware.js";
import authController from "../Modules/Auth/auth.controller.js";
import messageController from "../Modules/Message/message.controller.js";
import userController from "../Modules/User/user.controller.js";

const routerHandler = (app) => {
    app.use("/auth", authController);
    app.use("/user", userController);
    app.use("/message", messageController);

    // last and it converts any error html to json
    app.use(globalErrorHandlerMiddleware);
    /* app.use(
        (err, req, res, next) => {
            if(err){
                console.log("error", err);
                return res.status(500).json({
                    message: err.message
                })
            }
        }
    ) */
}

export default routerHandler;