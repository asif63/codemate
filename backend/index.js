import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import statsRouter from "./routes/stats.js";
import leetcodeProxy from "./routes/leetcodeProxy.js";
import judgeRouter from "./routes/judge.js";
import cfRouter from "./routes/cf.js";
import cf2Router from "./routes/cf2_browser.js";
import codechefRouter from "./routes/codechef.js";

dotenv.config();

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(cors({ origin: true}));
app.use(express.json());
app.use("/api/judge", judgeRouter);
app.use("/api/cf", cfRouter);
app.use("/api/cf2", cf2Router);

// ----- Routers you already had -----
app.use("/api/stats", statsRouter);
app.use("/api/leetcode", leetcodeProxy);
app.use("/api/codechef", codechefRouter);


// ----- Auth helper -----
function auth(req, res, next) {
  const h = req.headers.authorization || "";
  if (!h.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing token" });
  }
  const token = h.slice(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret");
    req.userId = payload.userId;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
}

// ----- Auth: signup -----
app.post("/api/signup", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const existingByEmail = await prisma.user.findUnique({ where: { email } });
    if (existingByEmail) {
      return res.status(400).json({ message: "Email already registered." });
    }
    const existingByUsername = await prisma.user.findUnique({ where: { username } });
    if (existingByUsername) {
      return res.status(400).json({ message: "Username already taken." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        // new fields will use defaults from schema (theme, defaultPlatform, isPublic, etc.)
      },
    });

    res.status(201).json({
      message: "User created successfully",
      user: { username: newUser.username, email: newUser.email },
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ----- Auth: login -----
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || "your_jwt_secret",
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ----- Profile: get my profile -----
app.get("/api/me", auth, async (req, res) => {
  try {
    const me = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        email: true,
        username: true,
        cfHandle: true,
        lcUsername: true,
        bio: true,
        isPublic: true,
        defaultPlatform: true,
        theme: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!me) return res.status(404).json({ message: "User not found" });
    res.json(me);
  } catch (e) {
    console.error("GET /api/me error:", e);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
});

// ----- Profile: update basic fields -----
app.put("/api/me", auth, async (req, res) => {
  const { username, cfHandle, lcUsername, bio } = req.body;
  try {
    const updated = await prisma.user.update({
      where: { id: req.userId },
      data: { username, cfHandle, lcUsername, bio },
      select: {
        id: true,
        email: true,
        username: true,
        cfHandle: true,
        lcUsername: true,
        bio: true,
        isPublic: true,
        defaultPlatform: true,
        theme: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    res.json({ message: "Profile updated", user: updated });
  } catch (e) {
    console.error("PUT /api/me error:", e);
    // handle unique username conflict politely
    if (e.code === "P2002") {
      return res.status(400).json({ message: "Username already taken" });
    }
    res.status(500).json({ message: "Failed to update profile" });
  }
});

// ----- Settings: theme/defaultPlatform/isPublic -----
app.put("/api/settings", auth, async (req, res) => {
  const { theme, defaultPlatform, isPublic } = req.body;
  try {
    const updated = await prisma.user.update({
      where: { id: req.userId },
      data: { theme, defaultPlatform, isPublic },
      select: {
        id: true,
        email: true,
        username: true,
        cfHandle: true,
        lcUsername: true,
        bio: true,
        isPublic: true,
        defaultPlatform: true,
        theme: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    res.json({ message: "Settings updated", user: updated });
  } catch (e) {
    console.error("PUT /api/settings error:", e);
    res.status(500).json({ message: "Failed to update settings" });
  }
});

// ----- Settings: change password -----
app.put("/api/me/password", auth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) return res.status(404).json({ message: "User not found" });

    const ok = await bcrypt.compare(currentPassword, user.password);
    if (!ok) return res.status(400).json({ message: "Current password incorrect" });

    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: req.userId }, data: { password: hashed } });
    res.json({ message: "Password changed" });
  } catch (e) {
    console.error("PUT /api/me/password error:", e);
    res.status(500).json({ message: "Failed to change password" });
  }
});

// ----- Start server -----
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
