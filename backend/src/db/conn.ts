import { config } from "dotenv";
import { Db, MongoClient } from "mongodb";
import { encryptedCustomer } from "./encryption-schemas/customer";

config();

let regularConn: MongoClient | null;
let secureConn: MongoClient | null;
let regularDb: Db;
let secureDb: Db;

const dbUser = process.env.DB_USER || "";
const dbPassword = process.env.DB_PASS || "";
const dbHost = process.env.DB_HOST || "";
const dbCluster = process.env.DB_CLUSTER || "";

export async function connect(database?: string) {
  if (!regularConn) {
    try {
      const client: MongoClient = new MongoClient(
        `mongodb+srv://${dbUser}:${dbPassword}@${dbHost}/?retryWrites=true&w=majority&appName=${dbCluster}`,
        {
          // Connection pool settings
          maxPoolSize: 10, // The maximum number of connections in the pool
          minPoolSize: 2, // The minimum number of connections in the pool
          maxIdleTimeMS: 30000, // The maximum time a connection can remain idle before being closed
          waitQueueTimeoutMS: 5000, // The maximum time to wait for a connection from the pool
        }
      );
      regularConn = await client.connect();
      console.log("Connect: Database connected successfully");
      regularDb = regularConn.db(database || "csfle");
    } catch (e) {
      console.error(e);
    }
  }
  return { connection: regularDb, client: regularConn };
}

export async function connectWithEncryption() {
  const csfleKey: string = process.env.MONGODB_CSFLE_CLIENT_KEY || "";
  if (!csfleKey) {
    throw Error("CSFLE Initialisation Failed.");
  }

  // start-kmsproviders
  const kmsCredentials = {
    aws: {
      accessKeyId: process.env.AWS_ACCESS_KEY || "",
      secretAccessKey: process.env.AWS_SECRET_KEY || "",
      sessionToken: process.env.AWS_SESSION_TOKEN || "",
    },
  };
  // end-kmsproviders

  const keyVaultDatabase = "encryption";
  const keyVaultCollection = "keys";
  const keyVaultNamespace = `${keyVaultDatabase}.${keyVaultCollection}`;

  if (!secureConn) {
    try {
      const client = new MongoClient(
        `mongodb+srv://${dbUser}:${dbPassword}@${dbHost}/?retryWrites=true&w=majority&appName=${dbCluster}`,
        {
          // Connection pool settings
          maxPoolSize: 10, // The maximum number of connections in the pool
          minPoolSize: 2, // The minimum number of connections in the pool
          maxIdleTimeMS: 30000, // The maximum time a connection can remain idle before being closed
          waitQueueTimeoutMS: 5000, // The maximum time to wait for a connection from the pool
          autoEncryption: {
            keyVaultNamespace,
            kmsProviders: kmsCredentials,
            schemaMap: { ...encryptedCustomer(csfleKey) }, //automatic encryption on customer
          },
        }
      );
      console.log("Secure Connect: Client Ready");
      secureConn = await client.connect();
      console.log("Secure Connect:Database connected successfully");
      secureDb = secureConn.db("csfle");
    } catch (e) {
      console.log("Secure Connect: Error!!!");
      console.error(e);
    }
  }
  return { connection: secureDb, client: secureConn };
}

export async function disconnect() {
  if (regularConn) {
    await regularConn.close();
    regularConn = null;
  }

  if (secureConn) {
    await secureConn.close();
    secureConn = null;
  }
}
