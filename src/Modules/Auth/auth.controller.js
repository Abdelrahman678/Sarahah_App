import {Router} from "express";
import { 
    forgotPasswordService,
    refreshTokenService,
    resetPasswordService,
    signInService,
    signOutService,
    signUpService,
    verifyEmailService
} from "./services/authentication.service.js";
import { validationMiddleware } from "../../Middleware/validation.middelware.js";
import { signUpSchema } from "../../Validators/auth.schema.js";

const authController = Router();

authController.post("/signup", validationMiddleware(signUpSchema), signUpService);
authController.post("/signin", signInService);
authController.get("/verify/:token", verifyEmailService);
authController.post("/refresh", refreshTokenService);
authController.post("/signout", signOutService);
authController.patch("/forgot-password", forgotPasswordService);
authController.put("/reset-password", resetPasswordService);

export default authController;