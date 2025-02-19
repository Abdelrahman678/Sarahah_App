import {Router} from "express";
import { getUserMessageService, listMessagesService, sendMessageService } from "./services/message.service.js";
import { errorHandlerMiddleware } from "../../Middleware/error-handler.middleware.js";
import { authenticationMiddleware } from "../../Middleware/auth.middleware.js";
const messageController = Router();

messageController.post("/send",errorHandlerMiddleware(sendMessageService));
messageController.get("/list", errorHandlerMiddleware(listMessagesService));
messageController.get("/get-user-messages", authenticationMiddleware() ,errorHandlerMiddleware(getUserMessageService));





export default messageController;