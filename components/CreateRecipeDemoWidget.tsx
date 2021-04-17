import { Button, TextField } from "@material-ui/core";
import React, { ChangeEvent, ChangeEventHandler } from "react";
import { useRouter } from "next/router";
import { mutate } from "swr";

export default function CreateRecipeDemoWidget({
  username,
}: {
  username: String;
}) {
  const handleSubmit = async (e) => {
    e.preventDefault();

    let imageData = undefined;
    if (e.target.image.files.length == 1) {
      const reader = new FileReader();
      reader.readAsDataURL(e.target.image.files[0]);

      let imageUrlPromise = new Promise<string>((resolve) => {
        reader.addEventListener("load", function () {
          resolve(reader.result as string);
        });
      });
      let imageUrl = await imageUrlPromise;
      imageData = imageUrl.substr(
        imageUrl.indexOf(";base64,") + ";base64,".length
      );
    }
    let data = {
      name: e.target.name.value.trim(),
      description: e.target.description.value.trim(),
      body: e.target.body.value.trim(),
      tags: e.target.tags.value.trim(),
      image: imageData,
      author_username: username,
    };
    if (
      data.name.trim() == "" ||
      data.description.trim() == "" ||
      data.body.trim() == ""
    ) {
      return;
    }
    data.tags = !data.tags
      ? []
      : data.tags.split(",").map((t) => t.trim().toLowerCase());
    e.target.name.value = "";
    e.target.description.value = "";
    e.target.body.value = "";
    e.target.tags.value = "";
    e.target.image.value = "";
    await fetch("/api/recipe/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    await mutate("/api/recipes");
  };

  return (
    <form noValidate autoComplete="off" onSubmit={handleSubmit}>
      <TextField name="name" label="Recipe Name" />
      <TextField name="description" label="Recipe Description" multiline />
      <TextField name="body" label="Instructions" multiline />
      <TextField name="tags" label="Tags (optional, comma separated)" />
      <input
        accept="image/*"
        hidden
        id="image"
        name="image"
        multiple
        type="file"
      />
      <label htmlFor="image">
        <Button variant="contained" color="primary" component="span">
          Upload (optional) Image
        </Button>
      </label>

      <Button variant="contained" color="primary" type="submit">
        Submit
      </Button>
    </form>
  );
}
