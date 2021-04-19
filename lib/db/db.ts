import { CognitoIdentityClient } from "@aws-sdk/client-cognito-identity";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-provider-cognito-identity";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";

import config from "../config";
import bcrypt from "bcryptjs";
import { z } from "zod";

export const FromDBToRecipe = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  body: z.string(),
  tags: z.array(z.string()),
  author_username: z.string(),
  image: z.optional(z.string()),
  created: z.string().transform((d) => new Date(d)),
});
export type DBRecipe = z.infer<typeof FromDBToRecipe>;

export const DBUser = z.object({
  name: z.string(),
  username: z.string(),
  password: z.string(),
});
export type DBUser = z.infer<typeof DBUser>;

export const DBFavorite = z.object({
  username: z.string(),
  recipe_id: z.string(),
});
export type DBFavorite = z.infer<typeof DBFavorite>;

class DB {
  private static RECIPES_TABLE: string = "cts-recipes";
  private static IMAGES_BUCKET: string = "s3-cts-images";
  private static FAVORITES_TABLE: string = "cts-favorites";
  private docClient: DynamoDBDocument;
  private s3: S3Client;
  private static USERS_TABLE: string = "cts-users";

  constructor() {
    const cognitoIdentityClient = new CognitoIdentityClient({
      region: config.region,
    });

    let cognitoCredentials = fromCognitoIdentityPool({
      client: cognitoIdentityClient,
      identityPoolId: config.identityPoolId,
    });
    const client = new DynamoDBClient({
      region: config.region,
      credentials: cognitoCredentials,
    });
    this.s3 = new S3Client({
      region: config.region,
      credentials: cognitoCredentials,
    });

    this.docClient = DynamoDBDocument.from(client);
  }

  public async taggedRecipes(tag: string): Promise<DBRecipe[]> {
    let items = await this.getRecipes();

    return items.filter((v) => v.tags.includes(tag));
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
    query = query.toLowerCase()
    return items.filter(
      (v) => v.name.toLowerCase().includes(query) || v.description.toLowerCase().includes(query)
    );
  }

  public async getRecipe(id: string): Promise<DBRecipe | null> {
    let response = await this.docClient.get({
      Key: { id },
      TableName: DB.RECIPES_TABLE,
    });

    if (response.Item) {
      return FromDBToRecipe.parse(response.Item);
    } else {
      return null;
    }
  }

  public async getRecipes(): Promise<DBRecipe[]> {
    let response = await this.docClient.scan({
      TableName: DB.RECIPES_TABLE,
      Limit: 100,
    });

    return response.Items.map((r) => FromDBToRecipe.parse(r));
  }

  public async addRecipe(recipe: DBRecipe) {
    let imageKey = undefined;
    if (recipe.image) {
      imageKey = uuidv4();
      try {
        await this.s3.send(
          new PutObjectCommand({
            Bucket: DB.IMAGES_BUCKET,
            Key: imageKey,
            Body: Buffer.from(recipe.image, "base64"),
          })
        );
      } catch (err) {
        console.log("Error", err);
      }
    }

    await this.docClient.put({
      Item: {
        id: uuidv4(),
        ...recipe,
        ...(imageKey && { image: imageKey }),
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
    } else {
      throw Error("Unknown user");
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

  async getFavorites(username: string): Promise<string[]> {
    let response = await this.docClient.query({
      TableName: DB.FAVORITES_TABLE,
      KeyConditionExpression: "username = :username",
      ExpressionAttributeValues: { ":username": username },
    });

    return response.Items.map((r) => DBFavorite.parse(r).recipe_id);
  }

  async addFavorite(username: string, recipeId: string): Promise<void> {
    await this.docClient.put({
      TableName: DB.FAVORITES_TABLE,
      Item: { username, recipe_id: recipeId },
    });
  }

  async removeFavorite(username: string, recipeId: string): Promise<void> {
    await this.docClient.delete({
      TableName: DB.FAVORITES_TABLE,
      Key: { username, recipe_id: recipeId },
    });
  }

  async deleteRecipe(recipeId: string, requestingUsername: string) {
    let fullRecipe = await this.getRecipe(recipeId);
    if (fullRecipe.author_username != requestingUsername) {
      throw Error("Unauthorized");
    }

    if (fullRecipe.image) {
      await this.s3.send(
        new DeleteObjectCommand({
          Key: fullRecipe.image,
          Bucket: DB.IMAGES_BUCKET,
        })
      );
    }

    await this.docClient.delete({
      TableName: DB.RECIPES_TABLE,
      Key: { id: recipeId },
    });
  }
}

let dbInstance = new DB();

export default dbInstance;
