import mongoose from "mongoose";
const {Schema} = mongoose;

/* 
1. parent child relationship --> if i went to user and added an array of messages ids
2. child parent relationship --> this is our case
3. embedded document
 */

const messageSchema = new Schema({
    body: {
        type: String,
        required: true
    },
    ownerId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, {
    timestamps: true
})


export const Message = mongoose.models.Message || mongoose.model("Message", messageSchema);
