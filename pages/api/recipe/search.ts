import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import db from "../../../lib/db/db";
import { v4 as uuidv4 } from "uuid";

const QueryArgs = z.object({
  query: z.string(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const args = QueryArgs.parse(req.query);

  let recipes = await db.searchRecipes(args.query);

  res.status(200).json(recipes);
}
