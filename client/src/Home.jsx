import React, { useState, useEffect } from "react";
import { Button, Title, MantineProvider, Stack } from "@mantine/core";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";

export default function Home() {
  const user = useSelector((state) => state.user.user);
  const userStatus = useSelector((state) => state.user.status);
  const dispatch = useDispatch();

  const [stats, setStats] = useState();

  useEffect(() => {
    if (user) {
      axios.get("/api/stats").then((res) => {
        setStats(res.data);
      });
    }
  }, [userStatus, user]);

  useEffect(() => {
    console.log(user);
  }, [userStatus, dispatch]);

  return (
    <>
      {user ? (
        <Title order={3}>Welcome {user.lms.name}</Title>
      ) : (
        <Stack>
          <Title order={3}>
            Welcome, please <a href="/login">log in</a>
          </Title>
          {stats ? (
            <Title order={4}>Enrolled Classes: {stats.enrolledClasses}</Title>
          ) : null}
        </Stack>
      )}
    </>
  );
}
