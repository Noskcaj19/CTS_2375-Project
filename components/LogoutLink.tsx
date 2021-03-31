import { Link, makeStyles, Typography } from "@material-ui/core";
import fetchJson from "../lib/fetchJson";
import useUser from "../lib/useUser";
import { useRouter } from "next/router";

const useStyles = makeStyles((theme) => ({
  link: {
    padding: theme.spacing(2, 2),
  },
}));

export default function LogoutLink() {
  const classes = useStyles();

  const { mutateUser } = useUser();

  const router = useRouter();

  return (
    <Typography>
      <Link
        className={classes.link}
        href="/api/logout"
        onClick={async (e) => {
          e.preventDefault();
          await mutateUser(fetchJson("/api/logout"));
          await router.push("/");
        }}
      >
        Logout
      </Link>
    </Typography>
  );
}
