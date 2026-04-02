// import express from "express";
// import dotenv from "dotenv";
// import authRoutes from "./routes/authRoutes.js";
// import { connectDB } from "./lib/db.js";
// import cookieParser from "cookie-parser";
// import messageRoutes from "./routes/messageRoutes.js";
// import cors from "cors";

// dotenv.config();

// const app = express();
// app.use(express.json({ limit: "10mb" }));
// app.use(cookieParser());
// app.use(cors({
//     origin: "http://localhost:5173",
//     credentials: true,
// }))

// const PORT = process.env.PORT || 5002;

// app.use("/api/auth", authRoutes);
// app.use("/api/messages", messageRoutes);

// app.listen(PORT, ()=> {
//     console.log("Server is running on port", PORT);
//     connectDB();
// });


import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import path from "path";

import { connectDB } from "./lib/db.js";

import authRoutes from "./routes/authRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import { app, server } from "./lib/socket.js";

dotenv.config();

const PORT = process.env.PORT;
const __dirname = path.resolve();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

server.listen(PORT, () => {
  console.log("server is running on PORT:" + PORT);
  connectDB();
});