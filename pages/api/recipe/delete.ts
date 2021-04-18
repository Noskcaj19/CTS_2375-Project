import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import db from "../../../lib/db/db";
import withSession from "../../../lib/session";

const DeleteRecipeArgs = z.object({
  id: z.string(),
});
// type NewRecipeArgs = z.infer<typeof NewRecipeArgs>;

export default withSession(async (req, res) => {
  let requestingUsername = req.session.get("user").username;
  const args = DeleteRecipeArgs.parse(req.body);

  try {
    await db.deleteRecipe(args.id, requestingUsername);
  } catch (e) {
    res.status(403).json({ error: "Unauthorized" });
  }

  res.status(200).json({});
});
