const express = require("express");
var cors = require("cors");
const app = express();
const config = require("./service/config");
const { connectDb } = require("./service/db");
app.use(cors());
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
require("./service/routes")(app);


connectDb().then(() => {
  app.listen(config.PORT, () => {
    console.log(`Connected to port ${config.PORT}`);
  });
});