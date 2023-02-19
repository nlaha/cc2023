import React, { useState, useEffect } from "react";
import { Button, Title, MantineProvider, Stack, Image } from "@mantine/core";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";

export default function Home() {
  const user = useSelector((state) => state.user.user);
  const userStatus = useSelector((state) => state.user.status);
  const dispatch = useDispatch();

  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (user) {
      axios.get("/api/stats").then((res) => {
        setStats(res.data);
      });
      console.log(stats);
    }
  }, [userStatus, dispatch, user]);

  return (
    <>
      {user ? (
        <Stack>
          <Title order={3}>Welcome {user.lms.name}</Title>
          {stats ? (
            <Title order={4}>Enrolled Classes: {stats.enrolledClasses}</Title>
          ) : null}
          <div style={{ width: 100 }}>
            <Image radius="xs" src={user.picture} alt="User profile picture" />
          </div>
        </Stack>
      ) : (
        <Title order={3}>
          Welcome, please <a href="/login">log in</a>
        </Title>
      )}
    </>
  );
}
