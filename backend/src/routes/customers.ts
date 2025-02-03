import { Router } from "express";
import { connectWithEncryption } from "../db/conn";
import { Collection } from "mongodb";

export const customersRoutes = Router();

customersRoutes.get("/customers/", async (req, res) => {
  const query = {};

  const { connection: secureDb } = await connectWithEncryption();

  const collection: Collection = secureDb.collection("customers");
  const customers = await collection.find(query).toArray();

  if ((await collection.countDocuments(query)) === 0) {
    const customer = {
      name: "bob",
      nationalInsuranceNumber: "1234",
    };
    await collection.insertOne(customer);
    console.log("First customer inserted");
  }

  res.status(200).json({ message: "Success!", customers });
});
