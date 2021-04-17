import {
  Avatar,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  CardMedia,
  Chip,
  Collapse,
  Divider,
  IconButton,
  makeStyles,
  Typography,
} from "@material-ui/core";
import clsx from "clsx";
import FavoriteIcon from "@material-ui/icons/Favorite";
import { red } from "@material-ui/core/colors";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ShareIcon from "@material-ui/icons/Share";
import React from "react";
import { z } from "zod";

const Recipe = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  body: z.string(),
  tags: z.array(z.string()),
  image: z.optional(z.string()),
  author_username: z.string(),
  created: z.date(),
});
type Recipe = z.infer<typeof Recipe>;

const useStyles = makeStyles((theme) => ({
  root: {
    maxWidth: 345,
  },
  longDescription: {
    padding: theme.spacing(0, 1, 0, 1),
  },
  media: {
    height: 0,
    paddingTop: "56.25%", // 16:9
  },
  expand: {
    transform: "rotate(0deg)",
    marginLeft: "auto",
    transition: theme.transitions.create("transform", {
      duration: theme.transitions.duration.shortest,
    }),
  },
  expandOpen: {
    transform: "rotate(180deg)",
  },
  avatar: {
    backgroundColor: red[500],
  },
}));

export default function RecipeCard({
  recipe,
  tagClicked,
}: {
  recipe: Recipe;
  tagClicked: (string) => void;
}) {
  const classes = useStyles();
  const [expanded, setExpanded] = React.useState(false);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  return (
    <Card>
      <CardHeader
        avatar={
          <Avatar aria-label="recipe" className={classes.avatar}>
            {recipe.author_username.substr(0, 1)}
          </Avatar>
        }
        // action={
        //   <IconButton aria-label="settings">
        //     <MoreVertIcon />
        //   </IconButton>
        // }
        title={recipe.name}
        subheader={recipe.created.toDateString()}
      />
      {recipe.image ? (
        <CardMedia
          className={classes.media}
          image={`https://s3-cts-images.s3.amazonaws.com/${recipe.image}`}
          title={recipe.name}
        />
      ) : (
        <></>
      )}
      <CardContent>
        <Typography variant="body2" color="textSecondary" component="p">
          {recipe.description}
        </Typography>
        <Divider />
        <div style={{ display: "inline-block" }}>
          <Typography variant="body2" color="textSecondary" component="p">
            Tags:
          </Typography>
          {recipe.tags.map((tag) => (
            <Chip label={tag} onClick={() => tagClicked(tag)} />
          ))}
        </div>
        <Divider style={{ marginTop: "5px" }} />
        <Typography variant="body2" color="textSecondary" component="p">
          Submitted by {recipe.author_username}
        </Typography>
      </CardContent>
      <CardActions disableSpacing>
        <IconButton aria-label="add to favorites">
          <FavoriteIcon />
        </IconButton>
        <IconButton aria-label="share">
          <ShareIcon />
        </IconButton>
        <IconButton
          className={clsx(classes.expand, {
            [classes.expandOpen]: expanded,
          })}
          onClick={handleExpandClick}
          aria-expanded={expanded}
          aria-label="show more"
        >
          <ExpandMoreIcon />
        </IconButton>
      </CardActions>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        {recipe.body.split("\n").map((l) => (
          <Typography paragraph className={classes.longDescription} key={l}>
            {l}
          </Typography>
        ))}
      </Collapse>
    </Card>
  );
}
