import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { findUserByUsername, createUser } from "@/models/user";
import { signSession, SESSION_COOKIE_NAME } from "@/lib/session";

const ROLES = ["student", "employee", "rider"];

export async function POST(req) {
  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  const { name, username, password, role } = body;

  if (!name?.trim() || !username?.trim() || !password || !role) {
    return NextResponse.json(
      { error: "Name, username, password and role are required" },
      { status: 400 }
    );
  }
  if (!ROLES.includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }
  if (password.length < 4) {
    return NextResponse.json(
      { error: "Password must be at least 4 characters" },
      { status: 400 }
    );
  }

  try {
    const existing = await findUserByUsername(username);
    if (existing) {
      return NextResponse.json({ error: "Username already taken" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await createUser({
      name: name.trim(),
      username: username.trim(),
      passwordHash,
      role,
    });

    const token = signSession({
      id: user._id.toString(),
      name: user.name,
      role: user.role,
      username: user.username,
    });

    const res = NextResponse.json({
      user: { id: user._id.toString(), name: user.name, role: user.role, username: user.username },
    });
    res.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8,
    });
    return res;
  } catch (err) {
    console.error("Signup error:", err);
    return NextResponse.json(
      { error: `Database error: ${err.message}` },
      { status: 500 }
    );
  }
}
