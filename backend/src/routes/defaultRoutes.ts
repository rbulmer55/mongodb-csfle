import { Router } from "express";
import { connect, connectWithEncryption } from "../db/conn";
import { Collection, Db } from "mongodb";

export const defaultRoutes = Router();

defaultRoutes.get("/", async (req, res) => {
  const { connection: db } = await connect();
  const { connection: secureDb } = await connectWithEncryption();

  const regularCustomers = await getCustomers(db);
  const secureCustomers = await getCustomersEncypted(secureDb);

  const regularPayments = await getPayments(db);
  const securePayments = await getPaymentsEncypted(secureDb);

  res.status(200).json({
    message: "Success!",
    regularCustomers,
    secureCustomers,
    regularPayments,
    securePayments,
  });
});

async function getCustomers(db: Db) {
  const query = {};
  const collection: Collection = db.collection("customers");
  const customers = await collection.find(query).toArray();

  if ((await collection.countDocuments(query)) === 0) {
    console.log("No customers found!");
  }

  return customers;
}

async function getCustomersEncypted(db: Db) {
  const query = {};
  const collection: Collection = db.collection("customers");
  const customers = await collection.find(query).toArray();

  if ((await collection.countDocuments(query)) === 0) {
    console.log("No customers found!");
  }

  return customers;
}

async function getPayments(db: Db) {
  const query = {};
  const collection: Collection = db.collection("payments");
  const payments = await collection.find(query).toArray();

  if ((await collection.countDocuments(query)) === 0) {
    console.log("No Payments found!");
  }

  return payments;
}

async function getPaymentsEncypted(db: Db) {
  const query = {};
  const collection: Collection = db.collection("payments");
  const payments = await collection.find(query).toArray();

  if ((await collection.countDocuments(query)) === 0) {
    console.log("No Payments found!");
  }

  return payments;
}
