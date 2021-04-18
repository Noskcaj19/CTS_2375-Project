// this file is a wrapper with defaults to be used in both API routes and `getServerSideProps` functions
import { Session, withIronSession } from "next-iron-session";
import {
  NextApiRequest,
  NextApiResponse,
} from "next/dist/next-server/lib/utils";

type WithSessionParams<T = any> =
  | ((
      req: NextApiRequest & { session: Session },
      res: NextApiResponse<T>
    ) => void | Promise<any>)
  | (({
      req,
      res,
    }: {
      req: NextApiRequest & { session: Session };
      res: NextApiResponse<T>;
    }) => void | Promise<any>);

export default function withSession<T = any>(handler: WithSessionParams) {
  return withIronSession(handler, {
    password: process.env.SECRET_COOKIE_PASSWORD,
    cookieName: "cloud-project-recipe-token",
    cookieOptions: {
      // the next line allows to use the session in non-https environments like
      // Next.js dev mode (http://localhost:3000)
      secure: false, //process.env.NODE_ENV === "production",
    },
  });
}
