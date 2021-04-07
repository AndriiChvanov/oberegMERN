const { Schema, model, Types } = require("mongoose");

const schema = new Schema({
  itemId: { type: String },
  name: { type: String },
  phone: { type: String },
  email: { type: String },
  title: { type: String },
  address: { type: String },
  immovable: { type: String },
  condition: { type: String },
  area: { type: String },
  price: { type: String },
  images: {
    type: Array,
  },
  text: { type: String },
  isAgree: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false },
});

module.exports = model("Catalog", schema);
