import { useEffect, useState } from "react";

function App() {
  const [health, setHealth] = useState<string>("");

  useEffect(() => {
    fetch("/api/health")
      .then((res) => res.json())
      .then((data) => setHealth(data.status))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>My App</h1>
      <p>API Health: {health || "Loading..."}</p>
    </div>
  );
}

export default App;
