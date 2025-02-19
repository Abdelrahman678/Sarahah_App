import { compareSync, hashSync } from "bcrypt";
import { User } from "../../../DB/models/user.model.js";
import { Encryption } from "../../../utils/encryption.utils.js";
import { emitter, sendEmailService } from "../../../Services/send-email.service.js";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import BlackListTokens from "../../../DB/models/black-list.model.js";

/* To get
    1. find
    2. findOne
    3.findById
*/
/* To Create
    1. create
    2. save "better with update"
    3. insertMany "bulk insert"
*/
/* To Update
    1. updateOne
    2. updateMany
    3. findOneAndUpdate
    4. findByIdAndUpdate
    5. save "better with update"
    
*/
// -------------------------------------------------------
/* Sign Up Steps
    1. destructure data from req.body
    2. check if email already exist
    3. if email doesn't exist
        3.1 hash password
        3.2 Encrypt phone number
        3.3 create user
    4. send email for verification    
*/ 


export const signUpService = async (req, res) => {
    try{
        const {username, email, password, confirmPassword, phone, age} = req.body;
        /** 1. validation **/
        if(password !== confirmPassword){
            return res.status(400).json({message: "Password and confirm password must be the same"});
        }
        const isEmailExist = await User.findOne({email: email});
        if(isEmailExist){
            return res.status(409).json({message: "Email already exist. Please try again."});
        }
    
        /** hash password **/
        const hashedPassword = hashSync(password, parseInt(process.env.SALT_ROUNDS));
        // console.log("password ==> ",password);
        // console.log("hashedPassword ==> ",hashedPassword);

        /**  Encrypt phone number **/
        const encryptedPhone = await Encryption({plaintext:phone,secretKey:process.env.ENCRYPTED_KEY});
        // console.log("encryptedPhone ==> ",encryptedPhone);

        /** send verification email **/
        // const isEmailSent = await sendEmailService({
        //     to:email,
        //     subject:"Verify your email",
        //     html:`<h1>Verify your email</h1>`
        // })
        // console.log("isEmailSent ==> ",isEmailSent);

        const token = jwt.sign({email:email}, process.env.JWT_SECRET, {expiresIn:'1d'});
        const confirmEmailLink = `${req.protocol}://${req.headers.host}/auth/verify/${token}`;
        emitter.emit("SendEmail",{
            to:email,
            subject:"Verify your email",
            html:`<h1>Verify your email</h1>
            <p>Click on the link below to verify your email</p>
            <a href="${confirmEmailLink}">Verify Email</a>`
        })
        
        /** create user **/
        const user = await User.create({
            username:username,
            email:email,
            password:hashedPassword,
            phone:encryptedPhone,
            age:age
        })


        // create user using save
        // -------------------------------
        // const newUser = new User({
        //     username:username,
        //     email:email, 
        //     password:hashedPassword,
        //     phone:phone,
        //     age:age
        // });
        // const user = await newUser.save(); // "this line checks with _id if exists update else create"
        
        // create user using insertMany
        // -------------------------------
        // const users = await User.insertMany([
        //     {
        //         username:username,
        //         email:email,
        //         password:hashedPassword,
        //         phone:phone,
        //         age:age
        //     }
        // ]);
        
        if(!user){
            return res.status(500).json({message: "Something went wrong. Please try again later."});
        }

        return res.status(201).json({
            message: "User created successfully",
            data: user
        })

    }
    catch(error){
        console.log("error", error);
        return res.status(500).json({
            message: error.message,
        })  
    }
}

export const verifyEmailService = async (req, res) => {
    try{
        const {token} = req.params;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const {email} = decoded;
        const user = await User.findOneAndUpdate({email:email}, {isEmailVerified:true}, {new:true});
        if(!user){
            return res.status(404).json({
                message: "User not found"
            })
        }
        return res.status(200).json({
            message: "Email verified successfully",
            data: user
        })
    }
    catch(error){
        console.log("error", error);
        return res.status(500).json({
            message: error,
        })  
    }
}

export const signInService = async (req, res) => {
    try{
        const {email, password} = req.body;
        // console.log("email ==> ",email);
        // console.log("password ==> ",password);
        const user = await User.findOne({email:email});
        if(!user){
            return res.status(404).json({message: "User not found"});
        }
        // console.log("user.password ==> ",user.password);
        const isPasswordMatch = compareSync(password, user.password);
        // console.log("isPasswordMatch ==> ",isPasswordMatch);
        if(!isPasswordMatch){
            return res.status(401).json({message: "Invalid credentials"});
        }
        const accessToken = jwt.sign(
            {_id:user._id, email:user.email},
             process.env.JWT_SECRET_LOGIN,
              {expiresIn:'1h', jwtid:uuidv4()}
            );
        const refreshToken = jwt.sign(
            {_id:user._id, email:user.email},
             process.env.JWT_SECRET_REFRESH,
              {expiresIn:'2d', jwtid:uuidv4()}
            );

        return res.status(200).json({
            message: "User logged in successfully",
            isPasswordMatch: isPasswordMatch,
            accessToken,
            refreshToken
        })
    }
    catch(error){
        console.log("error", error);
        return res.status(500).json({
            message: error,
        })  
    }
}

export const refreshTokenService = async (req, res) => {
    try{    
        const {refreshtoken} = req.headers;
        const decoded = jwt.verify(refreshtoken, process.env.JWT_SECRET_REFRESH);
        const accessToken = jwt.sign({_id:decoded._id, email:decoded.email}, process.env.JWT_SECRET_LOGIN, {expiresIn:'1h'});
        return res.status(200).json({
            message: "Token refreshed successfully",
            accessToken
        })        
        
    }   
    catch(error){
        console.log("error", error);
        return res.status(500).json({
            message: error,
        })  
    }
}

export const signOutService = async (req, res) => {
    try{
        const {accesstoken, refreshtoken} = req.headers;
        const decoded = jwt.verify(accesstoken, process.env.JWT_SECRET_LOGIN);
        const decodedRefreshToken = jwt.verify(refreshtoken, process.env.JWT_SECRET_REFRESH);
        // console.log(decoded, decodedRefreshToken);
    
        await BlackListTokens.insertMany(
        [
            {tokenId:decoded.jti, expiryDate:decoded.exp},
            {tokenId:decodedRefreshToken.jti, expiryDate:decodedRefreshToken.exp}
        ]
    );
        return res.status(200).json({
            message: "User logged out successfully",
        })
    }
    catch(error){
        console.log("error", error);
        return res.status(500).json({
            message: error,
        })  
    }
}

export const forgotPasswordService = async (req, res) => {
    try{
        const {email} = req.body;
        const user = await User.findOne({email:email});
        if(!user){
            return res.status(404).json({
                message: "User not found"
            })
        }
        const otp = Math.floor(Math.random() * 10000);
        emitter.emit("SendEmail",{
            subject:"Reset your password",
            html:`<h1>Reset your password</h1>
            <p>your otp is: ${otp}</p>`,
            to:user.email
        })
        
        // hash otp and save in db
        const hashedOtp = hashSync(otp.toString(), parseInt(process.env.SALT_ROUNDS));
        user.otp = hashedOtp;
        await user.save();
        return res.status(200).json({
            message: "Otp sent successfully"
        })
        
    }
    catch(error){
        console.log("error", error);
        return res.status(500).json({
            message: error,
        })  
    }
}


export const resetPasswordService = async (req, res) => {
    try{
        const {email, otp, password, confirmPassword} = req.body;
        if(password !== confirmPassword){
            return res.status(400).json({
                message: "Password and confirm password not match"
            })
        }
        const user = await User.findOne({email:email});
        if(!user){
            return res.status(404).json({
                message: "User not found"
            })
        }
        if(!user.otp){
            return res.status(400).json({
                message: "generate otp first"
            })
        }
        const isOtpMatch = compareSync(otp.toString(), user.otp);
        if(!isOtpMatch){
            return res.status(400).json({
                message: "Otp not match"
            })
        }
        const hashedPassword = hashSync(password, parseInt(process.env.SALT_ROUNDS));
        await User.updateOne({email:email}, {password:hashedPassword, $unset:{otp:""}});
        return res.status(200).json({
            message: "Password reset successfully"
        })
    }
    catch(error){
        console.log("error", error);
        return res.status(500).json({
            message: error,
        })  
    }
}