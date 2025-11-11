import http from "http";
import app from "./app.js";

const initServer = () => {
  const server = http.createServer(app);
  const PORT = process.env.PORT || 8080;

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

initServer();
