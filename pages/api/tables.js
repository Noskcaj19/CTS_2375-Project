// import type { NextApiRequest, NextApiResponse } from "next";
// import { ListTablesCommand } from "@aws-sdk/client-dynamodb";
// import db from "../../src/db/dynamodb";

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse
// ) {
//   try {
//     let tables = await db.send(new ListTablesCommand({}));
//     res.status(200).json({ tables: tables.TableNames });
//   } catch (err) {
//     res.status(400).json({ err: err });
//     return;
//   }
// }
