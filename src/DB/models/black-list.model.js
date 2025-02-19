import mongoose from "mongoose";

const blackListTokensSchema = new mongoose.Schema({
    tokenId: {type: String, required: true, unique: true},
    expiryDate: {type: String,required: true}
},
{
    timestamps: true
})

const BlackListTokens = mongoose.models.BlackListTokens || mongoose.model("BlackListTokens", blackListTokensSchema);

export default BlackListTokens;