import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import db from "../../../lib/db/db";

const NewUserArgs = z.object({
  name: z.string(),
  username: z.string(),
  password: z.string(),
});
// type NewRecipeArgs = z.infer<typeof NewRecipeArgs>;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const args = NewUserArgs.parse(req.body);

  let user = {
    name: args.name,
    username: args.username,
    password: args.password,
  };
  try {
    await db.createUser(user);
  } catch (e) {
    res.status(403).json(e);
    return;
  }

  res.status(200).json(user);
}
