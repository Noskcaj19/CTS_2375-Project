import { z } from "zod";
import db, { DBUser } from "../../../lib/db/db";
import withSession from "../../../lib/session";

const NewFavoriteArgs = z.object({
  recipe_id: z.string(),
});

export default withSession(async (req, res) => {
  let user = req.session.get("user") as DBUser;
  let args = NewFavoriteArgs.parse(req.body);

  try {
    let favorites = await db.addFavorite(user.username, args.recipe_id);
    res.status(200).json(favorites);
  } catch (e) {
    res.status(403).json(e);
    return;
  }
});
