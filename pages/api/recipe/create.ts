import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import db from "../../../lib/db/db";

const NewRecipeArgs = z.object({
  name: z.string(),
  description: z.string(),
  body: z.string(),
  tags: z.array(z.string()),
  image: z.optional(z.string()),
  author_username: z.string(),
});
// type NewRecipeArgs = z.infer<typeof NewRecipeArgs>;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const args = NewRecipeArgs.parse(req.body);

  await db.addRecipe({
    ...args,
    created: new Date(),
  });

  res.status(200).json({});
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
};
