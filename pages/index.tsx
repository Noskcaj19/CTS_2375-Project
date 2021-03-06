import useUser from "../lib/useUser";
import Head from "next/head";
import {
  Button,
  CircularProgress,
  Collapse,
  Container,
  CssBaseline,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  fade,
  Grid,
  InputBase,
  makeStyles,
  Typography,
} from "@material-ui/core";
import SearchIcon from "@material-ui/icons/Search";
import RecipeCard from "../components/RecipeCard";
import fetchJson from "../lib/fetchJson";
import LogoutLink from "../components/LogoutLink";
import LoginLink from "../components/LoginLink";
import { useState } from "react";
import CreateRecipeDemoWidget from "../components/CreateRecipeDemoWidget";
import useSWR, { mutate } from "swr";
import { z } from "zod";

export const Favorites = z.array(z.string());

const Recipe = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  body: z.string(),
  tags: z.array(z.string()),
  image: z.optional(z.string()),
  author_username: z.string(),
  created: z.string().transform((d) => new Date(d)),
});
type Recipe = z.infer<typeof Recipe>;

const User = z.object({
  name: z.string(),
  username: z.string(),
  password: z.string(),
});
type User = z.infer<typeof User>;

const useStyles = makeStyles((theme) => ({
  heroContent: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(8, 0, 6),
  },
  cardGrid: { flexGrow: 1 },
  toolbar: {
    display: "flex",
    width: "100%",
    position: "fixed",
    top: 0,
    left: "auto",
    right: 0,
  },
  search: {
    position: "relative",
    borderRadius: theme.shape.borderRadius,
    backgroundColor: fade(theme.palette.common.white, 0.15),
    "&:hover": {
      backgroundColor: fade(theme.palette.common.white, 0.25),
    },
    marginRight: theme.spacing(2),
    marginLeft: 0,
    width: "100%",
    [theme.breakpoints.up("sm")]: {
      marginLeft: theme.spacing(3),
      width: "auto",
    },
  },
  inputRoot: {
    color: "inherit",
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("md")]: {
      width: "20ch",
    },
  },
  searchIcon: {
    padding: theme.spacing(0, 2),
    height: "100%",
    position: "absolute",
    pointerEvents: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    flexGrow: 1,
  },
}));

const Home = () => {
  const classes = useStyles();

  const [searchQuery, setSearchQuery] = useState("");
  const [deleteRecipeOpenFor, setDeleteRecipeOpenFor] = useState("");

  const { user } = useUser();
  const { data: rawRecipes, error: recipeError } = useSWR(
    "/api/recipes",
    fetchJson
  );
  const { data: searchResults, error: searchError } = useSWR(
    searchQuery != "" ? `/api/recipe/search?query=${searchQuery}` : null,
    fetchJson
  );
  const { data: favoriteResults, error: favoritesError } = useSWR(
    user?.isLoggedIn ? `/api/user/favorites` : null,
    fetchJson
  );
  const [createRecipeExpanded, setCreateRecipeExpanded] = useState(false);

  let recipes = (rawRecipes as any[])?.map((r) => Recipe.parse(r));
  recipes?.sort((a, b) => b.created.getTime() - a.created.getTime());
  let searchedRecipes = (searchResults as any[])?.map((r) => Recipe.parse(r));
  searchedRecipes?.sort((a, b) => b.created.getTime() - a.created.getTime());
  let favorites = favoriteResults ? Favorites.parse(favoriteResults) : [];

  let loading =
    (searchQuery.trim() == "" && !rawRecipes) ||
    (searchQuery.trim() != "" && !searchedRecipes);

  function tagClicked(tag: string) {
    setSearchQuery(`tag: ${tag}`);
  }

  function deleteClicked(recipeId: string) {
    setDeleteRecipeOpenFor(recipeId);
  }

  async function deleteRecipe(recipeId: string) {
    await fetch("/api/recipe/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: recipeId }),
    });
    await mutate("/api/recipes");
  }

  async function favoriteClicked(recipeId: string) {
    if (favorites?.includes(recipeId)) {
      await fetch("/api/user/delete-favorite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipe_id: recipeId }),
      });
    } else {
      await fetch("/api/user/new-favorite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipe_id: recipeId }),
      });
    }
    await mutate("/api/user/favorites");
  }

  return (
    <>
      <Head>
        <title>Recipes</title>
      </Head>
      <div className={classes.toolbar}>
        <div className={classes.search}>
          <div className={classes.searchIcon}>
            <SearchIcon />
          </div>
          <InputBase
            placeholder="Search???"
            classes={{
              root: classes.inputRoot,
              input: classes.inputInput,
            }}
            inputProps={{ "aria-label": "search" }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.currentTarget.value)}
          />
        </div>
        <p className={classes.title} />
        {user?.isLoggedIn ? (
          <div>
            <Typography variant="body1">Logged in as {user?.name}</Typography>
            <LogoutLink />
          </div>
        ) : (
          <LoginLink />
        )}
      </div>

      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <main>
          <div className={classes.heroContent}>
            <Container maxWidth="sm">
              <Typography
                component="h1"
                variant="h2"
                align="center"
                color="textPrimary"
                gutterBottom
              >
                Recipes
              </Typography>
              <Typography
                variant="h5"
                align="center"
                color="textSecondary"
                paragraph
              >
                A collection of user submitted recipes
              </Typography>
              {user?.isLoggedIn ? (
                <Grid container justify="center">
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() =>
                      setCreateRecipeExpanded(!createRecipeExpanded)
                    }
                  >
                    Submit your own
                  </Button>
                  <Collapse
                    in={createRecipeExpanded}
                    timeout="auto"
                    unmountOnExit
                  >
                    <CreateRecipeDemoWidget username={user.username} />
                  </Collapse>
                </Grid>
              ) : (
                <Typography
                  variant="body1"
                  align="center"
                  color="textSecondary"
                  paragraph
                >
                  Log in or sign up to submit your own
                </Typography>
              )}
            </Container>
          </div>
        </main>
      </Container>
      <Container className={classes.cardGrid} maxWidth="md">
        {loading ? (
          <Grid container justify="center">
            <CircularProgress />
          </Grid>
        ) : searchQuery.trim() != "" ? (
          <Grid container spacing={4}>
            {searchedRecipes?.map((recipe) => (
              <Grid item key={recipe.id} xs={12} sm={6} md={4}>
                <RecipeCard
                  recipe={recipe}
                  tagClicked={tagClicked}
                  canDelete={user?.username == recipe.author_username}
                  deleteClicked={() => deleteClicked(recipe.id)}
                  favorite={favorites.includes(recipe.id)}
                  canFavorite={user?.isLoggedIn}
                  favoriteClicked={() => favoriteClicked(recipe.id)}
                />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Grid container spacing={4}>
            {recipes?.map((recipe) => (
              <Grid item key={recipe.id} xs={12} sm={6} md={4}>
                <RecipeCard
                  recipe={recipe}
                  tagClicked={tagClicked}
                  canDelete={user?.username == recipe.author_username}
                  deleteClicked={() => deleteClicked(recipe.id)}
                  favorite={favorites.includes(recipe.id)}
                  canFavorite={user?.isLoggedIn}
                  favoriteClicked={() => favoriteClicked(recipe.id)}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
      <Dialog
        open={deleteRecipeOpenFor != ""}
        onClose={() => setDeleteRecipeOpenFor("")}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Delete recipe?"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Delete this recipe? This can't be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteRecipeOpenFor("")} color="primary">
            Cancel
          </Button>
          <Button
            onClick={async () => {
              await deleteRecipe(deleteRecipeOpenFor);
              setDeleteRecipeOpenFor("");
            }}
            color="secondary"
            autoFocus
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <p>{JSON.stringify(user)}</p>
    </>
  );
};

export default Home;
