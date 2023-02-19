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
  Group,
  ScrollArea,
  Burger,
  Title,
  useMantineTheme,
  Stack,
  NavLink,
  Divider,
  ActionIcon,
  Anchor,
} from "@mantine/core";

import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { IconLogin, IconLogout } from "@tabler/icons";

import { logout } from "./features/user/userSlice";

export default function CLMSAppShell(props) {
  const theme = useMantineTheme();
  const [opened, setOpened] = useState(false);
  const user = useSelector((state) => state.user.user);

  const [classes, setClasses] = useState([]);

  useEffect(() => {
    if (user) {
      axios.get("/api/enrolled_classes").then((res) => {
        setClasses(
          res.data.map((c) => (
            <Link
              className="link full-width"
              key={c.id}
              component={Link}
              to={`/class?id=${c.id}`}
            >
              <Button color="pink" variant="light">
                {c.name}
              </Button>
            </Link>
          ))
        );
      });
    }
  }, [user]);

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
          width={{ sm: 300, lg: 300 }}
        >
          <Stack align="stretch" spacing={10}>
            <Link className="full-width link" to={`/enroll`}>
              <Button color="yellow">Search & Enroll</Button>
            </Link>
          </Stack>
          <Divider my="md" />
          {user && classes ? (
            <Navbar.Section grow component={ScrollArea}>
              <Stack align="stretch" spacing={10}>
                <Title order={3}>Classes</Title>
                {classes}
              </Stack>
            </Navbar.Section>
          ) : (
            <></>
          )}

          {user && user.lms.is_school_admin ? (
            <Stack align="stretch" spacing={10}>
              <Link className="full-width" to={`/admin`}>
                <Button color="red" className="admin-button">
                  Admin
                </Button>
              </Link>
            </Stack>
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
        <Header height={{ base: 50, md: 70 }} p="md" className="site-header">
          <div
            style={{ display: "flex", alignItems: "center", height: "100%" }}
          >
            <MediaQuery largerThan="sm" styles={{ display: "none" }}>
              <Burger
                opened={opened}
                onClick={() => setOpened((o) => !o)}
                size="sm"
                color="white"
                mr="xl"
              />
            </MediaQuery>

            <Group position="apart" className="grow">
              <Link to="/" className="link">
                <Title className="site-title">Crimson LMS</Title>
              </Link>

              <Group align="flex-end" grow>
                {user ? (
                  <Anchor href={`/logout`} onClick={logout} className="link">
                    <ActionIcon size="lg">
                      <IconLogout />
                    </ActionIcon>
                  </Anchor>
                ) : (
                  <Anchor href={`/login`} className="link">
                    <ActionIcon size="lg">
                      <IconLogin />
                    </ActionIcon>
                  </Anchor>
                )}
              </Group>
            </Group>
          </div>
        </Header>
      }
    >
      {props.children}
    </AppShell>
  );
}
