import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import db from "../../../lib/db/db";
import { v4 as uuidv4 } from "uuid";

const NewRecipeArgs = z.object({
  name: z.string(),
  description: z.string(),
  body: z.string(),
  tags: z.array(z.string()),
  author_username: z.string(),
});
// type NewRecipeArgs = z.infer<typeof NewRecipeArgs>;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const args = NewRecipeArgs.parse(req.body);

  await db.addRecipe({
    id: uuidv4(),
    ...args,
    created: new Date(),
  });

  res.status(200).json({});
}
