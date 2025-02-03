import { Router } from "express";
import { connectWithEncryption } from "../db/conn";
import { Binary, ClientEncryption, Collection, MongoClient } from "mongodb";

export const paymentsRoutes = Router();

const keyVaultDatabase = "encryption";
const keyVaultCollection = "keys";
const keyVaultNamespace = `${keyVaultDatabase}.${keyVaultCollection}`;
const kmsCredentials = {
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY || "",
    secretAccessKey: process.env.AWS_SECRET_KEY || "",
    sessionToken: process.env.AWS_SESSION_TOKEN || "",
  },
};

paymentsRoutes.get("/payments/", async (req, res) => {
  //fetch env var here because it is set dynamically on start
  const encryptionKey = process.env.MONGODB_CSFLE_CLIENT_KEY || "";
  const query = {};

  const { connection: secureDb, client } = await connectWithEncryption();

  const collection: Collection = secureDb.collection("payments");
  const payments = await collection.find(query).toArray();

  if ((await collection.countDocuments(query)) === 0) {
    console.log("creating payment...");
    const encryption = new ClientEncryption(client as MongoClient, {
      keyVaultNamespace,
      kmsProviders: kmsCredentials,
    });
    console.log(encryptionKey);
    const encrpytedCardNumber = await encryption.encrypt(
      "1234 5678 9101 1121",
      {
        keyId: new Binary(Buffer.from(encryptionKey, "base64"), 4),
        algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic", // or "Random" depending on requirements
      }
    );

    const customer = {
      customer: "bob",
      amount: "10000.00",
      creditCardNumber: encrpytedCardNumber,
    };
    await collection.insertOne(customer);
    console.log("First customer Payment inserted");
  }

  res.status(200).json({ message: "Success!", payments });
});
