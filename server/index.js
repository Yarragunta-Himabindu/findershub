import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

dotenv.config();

const app = express();

const PORT = Number(process.env.PORT || process.env.port || 3000);
const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET || "dev_only_change_me";
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:8080";

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is missing in .env");
}

app.use(
  cors({
    origin: [CLIENT_ORIGIN, "http://127.0.0.1:8080"],
    credentials: false,
  }),
);
app.use(express.json({ limit: "12mb" }));
app.use(express.urlencoded({ extended: true, limit: "12mb" }));

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    rollNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);

const itemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["lost", "found", "claimed"],
      required: true,
      default: "lost",
    },
    type: {
      type: String,
      enum: ["lost", "found"],
      required: true,
    },
    imageUrl: { type: String, default: "" },
    postedBy: { type: String, required: true, trim: true },
    contactEmail: { type: String, required: true, trim: true, lowercase: true },
    contactPhone: { type: String, default: "", trim: true },
  },
  { timestamps: true },
);

const Item = mongoose.model("Item", itemSchema);

const toItemResponse = (itemDoc) => ({
  id: itemDoc._id.toString(),
  title: itemDoc.title,
  description: itemDoc.description,
  location: itemDoc.location,
  status: itemDoc.status,
  type: itemDoc.type,
  imageUrl: itemDoc.imageUrl || "",
  postedBy: itemDoc.postedBy,
  postedAt: itemDoc.createdAt,
  contactEmail: itemDoc.contactEmail,
  contactPhone: itemDoc.contactPhone || "",
});

const signToken = (user) =>
  jwt.sign({ userId: user._id.toString(), email: user.email }, JWT_SECRET, {
    expiresIn: "7d",
  });

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({ message: "Missing authentication token" });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(payload.userId).select("name email");

    if (!user) {
      return res.status(401).json({ message: "Invalid token" });
    }

    req.user = user;
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/api/auth/register", async (req, res) => {
  const { name, email, password } = req.body ?? {};
  const normalizedEmail = typeof email === "string" ? email.toLowerCase() : "";
  const derivedRollNumber = normalizedEmail.replace(/[^a-z0-9]/g, "_");

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email, and password are required" });
  }

  if (!email.endsWith("@college.edu")) {
    return res.status(400).json({ message: "Only college email addresses are allowed" });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters" });
  }

  try {
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    if (!derivedRollNumber) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: normalizedEmail,
      passwordHash,
      rollNumber: derivedRollNumber,
    });

    const token = signToken(user);

    return res.status(201).json({
      token,
      user: {
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    if (error?.code === 11000) {
      return res.status(409).json({
        message: "User already exists or roll number conflicts. Please use a different email.",
      });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body ?? {};

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = signToken(user);

    return res.json({
      token,
      user: {
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/api/auth/me", authMiddleware, (req, res) => {
  return res.json({ user: req.user });
});

app.get("/api/items", async (req, res) => {
  const { type, location, search } = req.query;

  const filter = {};
  if (type === "lost" || type === "found") {
    filter.type = type;
  }
  if (typeof location === "string" && location.trim()) {
    filter.location = location.trim();
  }
  if (typeof search === "string" && search.trim()) {
    filter.$or = [
      { title: { $regex: search.trim(), $options: "i" } },
      { description: { $regex: search.trim(), $options: "i" } },
    ];
  }

  try {
    const items = await Item.find(filter).sort({ createdAt: -1 }).limit(100);
    return res.json({ items: items.map(toItemResponse) });
  } catch (error) {
    console.error("List items error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/api/items/:id", async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    return res.json({ item: toItemResponse(item) });
  } catch {
    return res.status(404).json({ message: "Item not found" });
  }
});

app.get("/api/my-items", authMiddleware, async (req, res) => {
  try {
    const items = await Item.find({ contactEmail: req.user.email }).sort({ createdAt: -1 });
    return res.json({ items: items.map(toItemResponse) });
  } catch (error) {
    console.error("My items error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/api/items", authMiddleware, async (req, res) => {
  const { title, description, location, type, imageUrl, contactPhone } = req.body ?? {};

  if (!title || !description || !location || !type) {
    return res.status(400).json({ message: "Title, description, location and type are required" });
  }

  if (type !== "lost" && type !== "found") {
    return res.status(400).json({ message: "Type must be lost or found" });
  }

  try {
    const item = await Item.create({
      title,
      description,
      location,
      type,
      status: type,
      imageUrl: typeof imageUrl === "string" ? imageUrl : "",
      postedBy: req.user.name,
      contactEmail: req.user.email,
      contactPhone: typeof contactPhone === "string" ? contactPhone : "",
    });

    return res.status(201).json({ item: toItemResponse(item) });
  } catch (error) {
    console.error("Create item error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.patch("/api/items/:id/status", authMiddleware, async (req, res) => {
  const { status } = req.body ?? {};

  if (!["lost", "found", "claimed"].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    if (item.contactEmail !== req.user.email) {
      return res.status(403).json({ message: "Not allowed" });
    }

    item.status = status;
    await item.save();
    return res.json({ item: toItemResponse(item) });
  } catch {
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.delete("/api/items/:id", authMiddleware, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    if (item.contactEmail !== req.user.email) {
      return res.status(403).json({ message: "Not allowed" });
    }

    await Item.findByIdAndDelete(req.params.id);
    return res.json({ success: true });
  } catch {
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.use((err, _req, res, next) => {
  if (err?.type === "entity.too.large") {
    return res.status(413).json({
      message: "Uploaded image is too large. Please use a smaller image.",
    });
  }
  return next(err);
});

const start = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("MongoDB connected");

    app.listen(PORT, () => {
      console.log(`Auth server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

void start();
