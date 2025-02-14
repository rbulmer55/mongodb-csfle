# Example CSFLE

To get this example working replace the environment variables with your information, including:

- Your atlas cluster connection
- AWS Role permissions for the application
- AWS KMS key

Additionally, don't forget to enable KMS encryption at the project level in Atlas. Add a role that can use your KMS key. Add the KMS key ID and finally, enable KMS encryption on a M10+ cluster.

Start the app to configure KMS for the first time. Running it again will re-use the same key.

## Env file

```
PORT=3001
DB_USER=""
DB_PASS=""
DB_HOST="cluster.xyz.mongodb.net"
DB_CLUSTER="cluster"
AWS_ACCESS_KEY=""
AWS_SECRET_KEY=""
AWS_SESSION_TOKEN=""
AWS_REGION="eu-west-1"
AWS_CSFLE_KMS_KEY_ARN="arn:aws:kms:eu-west-1::key/"
```
