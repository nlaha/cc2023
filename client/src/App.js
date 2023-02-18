import React, { useState, useEffect } from "react";

function App() {
  const [user, setUser] = useState({});

  useEffect(() => {
    // GET request using fetch inside useEffect React hook
    fetch("/user")
      .then((response) => response.json())
      .then((data) => setUser(data));

    // empty dependency array means this effect will only run once (like componentDidMount in classes)
  }, []);

  return <div className="App">{user.displayName}</div>;
}

export default App;
