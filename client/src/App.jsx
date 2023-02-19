import React, { useState, useEffect, createContext } from "react";
import {
  MantineProvider,
  ColorSchemeProvider,
  useMantineTheme,
} from "@mantine/core";
import { SpotlightProvider } from "@mantine/spotlight";
import { ModalsProvider } from "@mantine/modals";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useColorScheme } from "@mantine/hooks";

import Home from "./Home";
import Grades from "./Grades";
import Class from "./Class";
import CLMSAppShell from "./CLMSAppShell";

import { useSelector, useDispatch } from "react-redux";
import { fetchUser } from "./features/user/userSlice";
import Admin from "./Admin";
import Enroll from "./Enroll";

function App() {
  const theme = useMantineTheme();
  const [opened, setOpened] = useState(false);
  // hook will return either 'dark' or 'light' on client
  // and always 'light' during ssr as window.matchMedia is not available
  const preferredColorScheme = "dark";
  const [colorScheme, setColorScheme] = useState(preferredColorScheme);
  const toggleColorScheme = (value) =>
    setColorScheme(value || (colorScheme === "dark" ? "light" : "dark"));

  const dispatch = useDispatch();
  const userStatus = useSelector((state) => state.user.status);

  useEffect(() => {
    console.log(userStatus);
    if (userStatus === "idle") {
      dispatch(fetchUser());
    }
  }, [userStatus, dispatch]);

  return (
    <ColorSchemeProvider
      colorScheme={colorScheme}
      toggleColorScheme={toggleColorScheme}
    >
      <MantineProvider
        withGlobalStyles
        withNormalizeCSS
        theme={{ colorScheme }}
      >
        <ModalsProvider>
          <BrowserRouter>
            <CLMSAppShell
              toggleColorScheme={toggleColorScheme}
              colorScheme={colorScheme}
            >
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/class" element={<Class />} />
                <Route path="/grades" element={<Grades />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/enroll" element={<Enroll />} />
              </Routes>
            </CLMSAppShell>
          </BrowserRouter>
        </ModalsProvider>
      </MantineProvider>
    </ColorSchemeProvider>
  );
}

export default App;
