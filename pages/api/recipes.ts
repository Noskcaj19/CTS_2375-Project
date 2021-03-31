import type { NextApiRequest, NextApiResponse } from "next";
import db from "../../lib/db/db";
import { z } from "zod";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  let recipes = await db.getRecipes();

  res.status(200).json(recipes);
}
