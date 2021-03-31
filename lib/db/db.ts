import { CognitoIdentityClient } from "@aws-sdk/client-cognito-identity";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-provider-cognito-identity";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import config from "../config";
import bcrypt from "bcryptjs";
import { z } from "zod";

export const FromDBToRecipe = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  body: z.string(),
  author_username: z.string(),
  created: z.string().transform((d) => new Date(d)),
});
export type DBRecipe = z.infer<typeof FromDBToRecipe>;

export const DBUser = z.object({
  name: z.string(),
  username: z.string(),
  password: z.string(),
});
export type DBUser = z.infer<typeof DBUser>;

class DB {
  private static RECIPES_TABLE: string = "cts-recipes";
  private docClient: DynamoDBDocument;
  private static USERS_TABLE: string = "cts-users";

  constructor() {
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

    this.docClient = DynamoDBDocument.from(client);
  }

  public async searchRecipes(query: string): Promise<DBRecipe[]> {
    // let response = await this.docClient.query({
    //   TableName: DB.RECIPES_TABLE,
    //   KeyConditionExpression: "#d = :d",
    //   ExpressionAttributeNames: {
    //     "#d": "_dummy",
    //   },
    //   ExpressionAttributeValues: {
    //     ":d": "dummy",
    //     ":s": "cake",
    //   },
    // });
    //
    // return response.Items.map((r) => DBRecipe.parse(r));
    let items = await this.getRecipes();
    return items.filter(
      (v) => v.name.includes(query) || v.description.includes(query)
    );
  }

  public async getRecipes(): Promise<DBRecipe[]> {
    let response = await this.docClient.scan({
      TableName: DB.RECIPES_TABLE,
      Limit: 10,
    });

    return response.Items.map((r) => FromDBToRecipe.parse(r));
  }

  public async addRecipe(recipe: DBRecipe) {
    await this.docClient.put({
      Item: {
        ...recipe,
        created: recipe.created.toISOString(),
        _dummy: "dummy",
      },
      TableName: DB.RECIPES_TABLE,
    });
  }

  public async getUser(
    username: string,
    password: string
  ): Promise<DBUser | null> {
    let response = await this.docClient.get({
      TableName: DB.USERS_TABLE,
      Key: { username },
    });
    if (response.Item) {
      let user = DBUser.parse(response.Item);
      let match = bcrypt.compare(password, user.password);
      if (match) {
        return user;
      } else {
        throw Error("Invalid password");
      }
    }
  }

  public async createUser(user: DBUser) {
    let response = await this.docClient.get({
      TableName: DB.USERS_TABLE,
      Key: { username: user.username },
    });

    if (response.Item) {
      throw { error: "username already exists" };
    }

    let hashed_password = await bcrypt.hash(user.password, 10);

    await this.docClient.put({
      TableName: DB.USERS_TABLE,
      Item: {
        ...user,
        password: hashed_password,
      },
    });
  }
}

let dbInstance = new DB();

export default dbInstance;
