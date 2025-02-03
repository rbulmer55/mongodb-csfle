import { ClientEncryption, Collection, MongoClient } from "mongodb";
import { connect, disconnect } from "./conn";
import { config } from "dotenv";

config();

// start-kmsproviders
const provider = "aws";
const kmsCredentials = {
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY || "",
    secretAccessKey: process.env.AWS_SECRET_KEY || "",
    sessionToken: process.env.AWS_SESSION_TOKEN || "",
  },
};
// end-kmsproviders

// start-datakeyopts
const masterKey = {
  key: process.env.AWS_CSFLE_KMS_KEY_ARN || "",
  region: process.env.AWS_REGION || "eu-west-1",
};
// end-datakeyopts

const keyAltName = "my-csfle-key";

export async function setUpCSFLE() {
  const keyVaultDatabase = "encryption";
  const keyVaultCollection = "keys";
  const keyVaultNamespace = `${keyVaultDatabase}.${keyVaultCollection}`;
  const indexName = "csfleKeyIndex";

  const { connection, client } = await connect(keyVaultDatabase);

  const collections = await connection
    .listCollections({ name: keyVaultCollection })
    .toArray();
  if (collections.length === 0) {
    await connection.createCollection(keyVaultCollection);
  }

  const keyVaultColl: Collection = connection.collection(keyVaultCollection);

  // create index
  await createIndex(indexName, keyVaultColl);
  // create client key
  const clientKey = await findOrCreateClientKey(
    client as MongoClient,
    keyVaultColl,
    keyVaultNamespace
  );
  //close connection
  await disconnect();

  return clientKey;
}

async function createIndex(indexName: string, collection: Collection) {
  // If index doesn't exist, create it
  if (!collection.indexExists(indexName)) {
    await collection.createIndex(
      { keyAltNames: 1 },
      {
        name: indexName,
        unique: true,
        partialFilterExpression: { keyAltNames: { $exists: true } },
      }
    );
  }
}
async function findOrCreateClientKey(
  client: MongoClient,
  collection: Collection,
  keyVaultNamespace: string
): Promise<string> {
  const encryption = new ClientEncryption(client, {
    keyVaultNamespace,
    kmsProviders: kmsCredentials,
  });

  let key: any = await collection.findOne({
    keyAltNames: { $in: [keyAltName] },
  });

  if (key === null) {
    key = await encryption.createDataKey(provider, {
      masterKey: masterKey,
    });
    return key.toString("base64");
  }

  return key["_id"].toString("base64");
}
