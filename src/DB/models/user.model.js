import mongoose from "mongoose";
import { systemRoles } from "../../Constants/constants.js";
const {Schema} = mongoose;

const userSchema = new Schema({
    username: {
        type: String,
        lowercase: true,
        trim: true,
        required: [true, "Username is required"],
        unique: [true, "Username already taken"],
        minlength: [3, "Username must be at least 3 characters long"],
        maxlength: [20, "Username must be at most 20 characters long"]
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: [true, "Email already taken"],
    },
    password: {
        type: String,
        required: [true, "Password is required"],
    },
    phone: {
        type: String,
        required: [true, "Phone is required"],
    },
    age: {
        type: Number,
        required: [true, "Age is required"],
        min: [18, "Age must be at least 18"],
        max: [100, "Age must be at most 100"],
    },
    profileImage: String,
    isDeleted: {
        type: Boolean,
        default: false
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    otp: {
        type: String
    },
    role: {
        type: String,
        default: systemRoles.USER,
        enum: Object.values(systemRoles)
    }
},
{
    timestamps: true,
    
}
);

export const User = mongoose.models.User || mongoose.model("User", userSchema);