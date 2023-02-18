import React, { useState, useEffect } from "react";
import { Button, Title, MantineProvider } from "@mantine/core";
import { useSelector, useDispatch } from "react-redux";

export default function Home() {
  const user = useSelector((state) => state.user.user);
  const userStatus = useSelector((state) => state.user.status);
  const dispatch = useDispatch();

  useEffect(() => {
    console.log(user);
  }, [userStatus, dispatch]);

  return (
    <>
      {user ? (
        <Title order={3}>Welcome {user.lms.name}</Title>
      ) : (
        <Title order={3}>
          Welcome, please <a href="/login">log in</a>
        </Title>
      )}
    </>
  );
}
