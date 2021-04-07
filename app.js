require("module-alias/register");

const express = require("express");
const app = express();
const { PORT, MONGO_URI } = require("@/config");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http").createServer(app);
const fileUpload = require("express-fileupload");

const AuthController = require("@/routes/auth.routes");
const CatalogController = require("@/routes/catalog.routes");

app.use(cors());
app.use(express.json());
app.use(fileUpload({}));

app.use("/auth", AuthController);
app.use("/catalog", CatalogController);

async function start() {
  try {
    await mongoose.connect(`${MONGO_URI}`, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
    http.listen(PORT, () => {
      console.log(`server up and running, PORT:${PORT}`);
    });
  } catch (e) {
    console.log("Server error:", e.message);
    process.exit(1);
  }
}
start();
