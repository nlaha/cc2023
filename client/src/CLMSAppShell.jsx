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
  ScrollArea,
  Burger,
  Title,
  useMantineTheme,
  Stack,
  NavLink,
  Divider,
} from "@mantine/core";

import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";

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
              key={c.id}
              component={Link}
              to={`/class?id=${c.id}`}
              className="link"
            >
              <Button color="pink" variant="light">
                {c.name} | {c.number}
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
          width={{ sm: 200, lg: 300 }}
        >
          <Stack align="stretch" spacing={10}>
            <Link to={`/enroll`} className="link">
              <Button color="yellow">Search & Enroll</Button>
            </Link>
          </Stack>
          <Divider my="md" />
          {user && classes ? (
            <Navbar.Section grow component={ScrollArea} mx="-xs" px="xs">
              <Stack align="stretch" spacing={10}>
                <Title order={3}>Classes</Title>
                {classes}
              </Stack>
            </Navbar.Section>
          ) : (
            <></>
          )}

          {user && user.lms.is_school_admin ? (
            <Stack align="stretch" spacing={10} className="admin-btn-container">
              <Link to={`/admin`}>
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
                color={theme.colors.gray[6]}
                mr="xl"
              />
            </MediaQuery>

            <Link to="/" className="link">
              <Title className="site-title">Crimson LMS</Title>
            </Link>
          </div>
        </Header>
      }
    >
      {props.children}
    </AppShell>
  );
}
