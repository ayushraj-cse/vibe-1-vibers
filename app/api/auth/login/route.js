import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { findUserByUsername } from "@/models/user";
import { signSession, SESSION_COOKIE_NAME } from "@/lib/session";

export async function POST(req) {
  const body = await req.json().catch(() => null);
  if (!body?.username || !body?.password) {
    return NextResponse.json(
      { error: "Username and password are required" },
      { status: 400 }
    );
  }

  try {
    const user = await findUserByUsername(body.username);
    if (!user) {
      return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
    }

    const ok = await bcrypt.compare(body.password, user.passwordHash);
    if (!ok) {
      return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
    }

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
    console.error("Login error:", err);
    return NextResponse.json(
      { error: `Database error: ${err.message}` },
      { status: 500 }
    );
  }
}
