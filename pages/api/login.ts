import withSession from "../../lib/session";
import db from "../../lib/db/db";

export default withSession(async (req, res) => {
  const { username, password } = await req.body;
  try {
    let user = { isLoggedIn: true, ...(await db.getUser(username, password)) };
    req.session.set("user", user);
    await req.session.save();
    res.json(user);
  } catch {
    res.status(403).json({ error: "unauthorized" });
  }
});
