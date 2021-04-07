const { Schema, model, Types } = require("mongoose");

const tokenSchema = new Schema({
  _userId: { type: Types.ObjectId, required: true, ref: "User" },
  token: { type: String, required: true },
  expireAt: { type: Date, default: Date.now, index: { expires: 86400000 } },
});

module.exports = model("Token", tokenSchema);
