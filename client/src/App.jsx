import React, { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    getUser();
  }, []);

  const getUser = () => {
    axios
      .get(process.env.REACT_APP_API_URL + "/user")
      .then((res) => {
        setUser(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <div className="App">
      Crimson LMS
      {user ? (
        <div>
          Welcome, {user.displayName}! <a href="/logout">Logout</a>
        </div>
      ) : (
        <a href="/login">Login</a>
      )}
    </div>
  );
}

export default App;
