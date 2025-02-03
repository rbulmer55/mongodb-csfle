import { Binary } from "mongodb";

export const encryptedCustomer = (csfleKey: string) => {
  return {
    "csfle.customers": {
      bsonType: "object",
      encryptMetadata: {
        keyId: [new Binary(Buffer.from(csfleKey, "base64"), 4)],
      },
      properties: {
        nationalInsuranceNumber: {
          encrypt: {
            bsonType: "string",
            algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic", // or "AEAD_AES_256_CBC_HMAC_SHA_512-Random"
          },
        },
      },
    },
  };
};
