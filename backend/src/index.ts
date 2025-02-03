import express, { Request, Response } from "express";
import dotenv from "dotenv";
import { routes } from "./routes";
import { setUpCSFLE } from "./db/csfle";

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// routes
app.use("/", routes);

// start the server
app.listen(port, async () => {
  console.log("Initalising CSFLE...");
  const clientKey = await setUpCSFLE();
  process.env["MONGODB_CSFLE_CLIENT_KEY"] = clientKey;
  console.log("CSFLE Complete.");
  console.log(`server running : http://localhost:${port}`);
});
