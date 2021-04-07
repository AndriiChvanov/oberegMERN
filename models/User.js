const { Schema, model, Types } = require("mongoose");

const schema = new Schema({
  name: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  resetLink: { data: String, default: false },
  isVerified: { type: Boolean, default: false },
});

module.exports = model("User", schema);
