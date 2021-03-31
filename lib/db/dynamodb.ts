import { CognitoIdentityClient } from "@aws-sdk/client-cognito-identity";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-provider-cognito-identity";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import config from "../config";

const cognitoIdentityClient = new CognitoIdentityClient({
  region: config.region,
});

const client = new DynamoDBClient({
  region: config.region,
  credentials: fromCognitoIdentityPool({
    client: cognitoIdentityClient,
    identityPoolId: config.identityPoolId,
  }),
});

const ddbDocClient = DynamoDBDocument.from(client);

export default ddbDocClient;
