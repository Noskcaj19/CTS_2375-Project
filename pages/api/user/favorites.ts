import db, { DBUser } from "../../../lib/db/db";
import withSession from "../../../lib/session";

export default withSession(async (req, res) => {
  let user = req.session.get("user") as DBUser;
  try {
    let favorites = await db.getFavorites(user.username);
    res.status(200).json(favorites);
  } catch (e) {
    res.status(403).json(e);
    return;
  }
});
