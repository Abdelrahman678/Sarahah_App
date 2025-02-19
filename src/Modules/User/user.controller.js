import {Router} from "express";
import {
    listUsersService,
    profileService,
    updatePasswordService,
    updateProfileService
} from "./services/profile.service.js";
import {
    authenticationMiddleware,
    authorizationMiddleware
} from "../../Middleware/auth.middleware.js";
import { systemRoles } from "../../Constants/constants.js";
import asyncHandler from "express-async-handler";
import { errorHandlerMiddleware } from "../../Middleware/error-handler.middleware.js";

const userController = Router();

// use .use() to apply middleware to all routes in the router 'it runs before every route in this router'
userController.use(authenticationMiddleware());
userController.get("/profile", authorizationMiddleware([systemRoles.USER]) ,profileService);
userController.patch("/update-password", updatePasswordService);
userController.put("/update-profile", updateProfileService);
userController.get("/list-users", authorizationMiddleware([systemRoles.ADMIN]), errorHandlerMiddleware(listUsersService));

export default userController;