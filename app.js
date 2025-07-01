import express from "express";
import { modelList } from "./config/model-list.js";
import { sequelize } from "./config/db.js";
import userGeneralRoutes from "./routes/userRoutes/routes.js";
import authRoutes from "./routes/authRoutes/routes.js";
import adminProductRoutes from "./routes/adminRoutes/Product/routes.js";
import adminSocialRoutes from "./routes/adminRoutes/Social/routes.js";
import adminUserRoutes from "./routes/adminRoutes/User/routes.js";
import adminFaqRoutes from "./routes/adminRoutes/FAQ/routes.js";
import paymentRoutes from "./routes/payemntRoutes/routes.js"
import bodyParser from "body-parser";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cron from "node-cron";
import { deleteTokenFromDB } from "./controllers/clear-token.js";

dotenv.config({ path: "./config/.env" });
try {
  cron.schedule("* */1 * * *", () => {
    deleteTokenFromDB();
  });
} catch (err) {
  console.log("token not deleted", err); 
} 

await sequelize
  .sync() 
  .then(() => console.log("Syncing Successful"))
  .catch((err) => console.log(err));

const app = express();
  
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));
app.set("view engine", "ejs");

app.use("/", authRoutes);

app.use("/", userGeneralRoutes);

app.use("/", adminProductRoutes);
app.use("/", adminFaqRoutes);
app.use("/", adminSocialRoutes);
app.use("/", adminUserRoutes);
app.use("/checkout",paymentRoutes);

app.use((req, res, next) => {
  res.send("Not found");
  next();
}); 

app.listen(3000);
