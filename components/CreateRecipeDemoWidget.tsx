import { Button, TextField } from "@material-ui/core";
import React, { useState } from "react";
import { useRouter } from "next/router";
import { mutate } from "swr";

export default function CreateRecipeDemoWidget({
  username,
}: {
  username: String;
}) {
  const router = useRouter();
  const handleSubmit = async (e) => {
    e.preventDefault();
    let data = {
      name: e.currentTarget.name.value,
      description: e.currentTarget.description.value,
      body: e.currentTarget.body.value,
      author_username: username,
    };
    e.currentTarget.name.value = "";
    e.currentTarget.description.value = "";
    e.currentTarget.body.value = "";
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

      <Button variant="contained" color="primary" type="submit">
        Submit
      </Button>
    </form>
  );
}
