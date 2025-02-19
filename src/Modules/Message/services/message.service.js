import { Message } from "../../../DB/models/message.model.js";
import { User } from "../../../DB/models/user.model.js";

export const sendMessageService = async (req, res) => {
    const {body, ownerId} = req.body;

    // check if the owner id exists
    const user = await User.findById(ownerId);
    if(!user){
        return res.status(404).json({
            message: "User not found"
        })
    }

    const message = await Message.create({body, ownerId});
    return res.status(201).json({
        message: "Message sent successfully",
        data: message
    })
}

export const listMessagesService = async (req, res) => {
    const messages = await Message.find().populate([
        {
        path: "ownerId",
        select: "-password -__v"
        }
    ]);
    return res.status(200).json({
        message: "Messages found",
        data: messages
    })
}

/*
- populate takes an array of objects and returns a new array of objects where each object has the data of the object to which it is populated
- in this case get the user data of each message
*/

export const getUserMessageService = async (req, res) => {
    const {_id} = req.loggedInUser;
    const messages = await Message.find({ownerId:_id});
    if(!messages){
        return res.status(404).json({
            message: "Messages not found"
        })
    }
    return res.status(200).json({
        message: "Messages found",
        data: messages
    })
}