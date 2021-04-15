import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import db from "../../../lib/db/db";

const QueryArgs = z.object({
  query: z.string(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const args = QueryArgs.parse(req.query);

  let recipes;
  if (args.query.startsWith("tag: ")) {
    recipes = await db.taggedRecipes(args.query.substr("tag: ".length));
  } else {
    recipes = await db.searchRecipes(args.query);
  }

  res.status(200).json(recipes);
}
