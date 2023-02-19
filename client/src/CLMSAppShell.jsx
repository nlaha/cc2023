import { useState, useEffect } from "react";
import {
  AppShell,
  Navbar,
  Header,
  Footer,
  Aside,
  Button,
  Text,
  MediaQuery,
  Burger,
  Title,
  useMantineTheme,
  Stack,
  NavLink,
} from "@mantine/core";

import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

export default function CLMSAppShell(props) {
  const theme = useMantineTheme();
  const [opened, setOpened] = useState(false);
  const user = useSelector((state) => state.user.user);

  return (
    <AppShell
      styles={{
        main: {
          background:
            theme.colorScheme === "dark"
              ? theme.colors.dark[8]
              : theme.colors.gray[0],
        },
      }}
      navbarOffsetBreakpoint="sm"
      asideOffsetBreakpoint="sm"
      navbar={
        <Navbar
          p="md"
          hiddenBreakpoint="sm"
          hidden={!opened}
          width={{ sm: 200, lg: 300 }}
        >
          {user && user.lms.classes ? (
            <Stack align="stretch" spacing={10}>
              <Title order={3}>Classes</Title>
              {user.classes.map((c) => (
                <Link
                  key={c.id}
                  component={Link}
                  to={`/class?id=${c.id}`}
                  className="link"
                >
                  <Button>{c.name}</Button>
                </Link>
              ))}
            </Stack>
          ) : (
            <></>
          )}

          {user && user.lms.is_school_admin ? (
            <Link to={`/admin`}>
              <Button color="red" className="admin-button">
                Admin
              </Button>
            </Link>
          ) : (
            <></>
          )}
        </Navbar>
      }
      footer={
        <Footer height={60} p="md">
          Crimson LMS - by Segfault - Crimson Code 2023
        </Footer>
      }
      header={
        <Header height={{ base: 50, md: 70 }} p="md">
          <div
            style={{ display: "flex", alignItems: "center", height: "100%" }}
          >
            <MediaQuery largerThan="sm" styles={{ display: "none" }}>
              <Burger
                opened={opened}
                onClick={() => setOpened((o) => !o)}
                size="sm"
                color={theme.colors.gray[6]}
                mr="xl"
              />
            </MediaQuery>

            <Link to="/" className="link site-title">
              <Title>Crimson LMS</Title>
            </Link>
          </div>
        </Header>
      }
    >
      {props.children}
    </AppShell>
  );
}
