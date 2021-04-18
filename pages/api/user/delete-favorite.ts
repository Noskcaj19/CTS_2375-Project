import { z } from "zod";
import db, { DBUser } from "../../../lib/db/db";
import withSession from "../../../lib/session";

const DeleteFavoriteArgs = z.object({
  recipe_id: z.string(),
});

export default withSession(async (req, res) => {
  let user = req.session.get("user") as DBUser;
  let args = DeleteFavoriteArgs.parse(req.body);

  try {
    let favorites = await db.removeFavorite(user.username, args.recipe_id);
    res.status(200).json(favorites);
  } catch (e) {
    res.status(403).json(e);
    return;
  }
});
