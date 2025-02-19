import { compareSync, hashSync } from "bcrypt";
import BlackListTokens from "../../../DB/models/black-list.model.js";
import { User } from "../../../DB/models/user.model.js";
import { Decryption, Encryption } from "../../../utils/encryption.utils.js";
import jwt from "jsonwebtoken";
import { emitter } from "../../../Services/send-email.service.js";

export const profileService = async (req, res) => {
    try{
        const {_id} = req.loggedInUser;
        // console.log("logged in user", {loggedInUser: req.loggedInUser});

        const user = await User.findById(_id);
        if(!user){
            return res.status(404).json({
                message: "User not found"
            })
        }
        // decrypt phone number
        user.phone = await Decryption({ciphertext:user.phone,secretKey:process.env.ENCRYPTED_KEY});
        return res.status(200).json({
            message: "User found",
            user
        })
    }
    catch(error){
        console.log("error", error);
        return res.status(500).json({
            message: error.message,
        })  
    }
}

export const updatePasswordService = async (req, res) => {
    try{
        console.log({loggedInUser: req.loggedInUser});
        
        const {_id} = req.loggedInUser;
        const {oldPassword, newPassword, confirmPassword} = req.body;
        if(newPassword !== confirmPassword){
            return res.status(400).json({
                message: "Passwords do not match"
            })
        }
        const user = await User.findById(_id);
        if(!user){
            return res.status(404).json({
                message: "User not found"
            })
        }
        const isPasswordMatch = compareSync(oldPassword, user.password);
        if(!isPasswordMatch){
            return res.status(400).json({
                message: "Old password do not match"
            })
        }
        const hashedPassword = hashSync(newPassword, parseInt(process.env.SALT_ROUNDS));
        user.password = hashedPassword;
        await user.save();

        await BlackListTokens.create(req.loggedInUser.token);


        return res.status(200).json({
            message: "Password updated successfully"
        })

    }
    catch(error){
        console.log("error", error);
        return res.status(500).json({
            message: error.message,
        })  
    }
}

export const updateProfileService = async (req, res) => {
    try{
        const {_id} = req.loggedInUser;
        const {username, email, phone} = req.body;
        const user = await User.findById(_id);
        if(!user){
            return res.status(404).json({
                message: "User not found"
            })
        }

        if(username){
            user.username = username;
        }

        if(phone){
            user.phone = await Encryption({plaintext:phone,secretKey:process.env.ENCRYPTED_KEY});
        } 

        if(email){
            // check if email exists
            const isEmailExist = await User.findOne({email:email});
            if(isEmailExist){
                return res.status(409).json({
                    message: "Email already exist. Please try again."
                })
            }
            // send verification email
            const token = jwt.sign({email:email}, process.env.JWT_SECRET, {expiresIn:'1d'});
            const confirmEmailLink = `${req.protocol}://${req.headers.host}/auth/verify/${token}`;
            emitter.emit("SendEmail",{
                to:email,
                subject:"Verify your email",
                html:`<h1>Verify your email</h1>
                <p>Click on the link below to verify your email</p>
                <a href="${confirmEmailLink}">Verify Email</a>`
            })
            // update email
            user.email = email;
            user.isEmailVerified = false;
        }

        await user.save();
        return res.status(200).json({
            message: "Profile updated successfully"
        })
    }
    catch(error){
        console.log("error", error);
        return res.status(500).json({
            message: error.message,
        })  
    }
}

/*
- this api is only to be used to check authorization
- instead of try catch block asyncHandler third party module is used
 */
export const listUsersService = async (req, res) => {
        const users = await User.find({}, '-password -__v');
        return res.status(200).json({
            message: "Users found",
            users
        })
}

