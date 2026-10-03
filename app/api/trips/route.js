import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/session";
import { LOCATIONS, escapeRegex, serializeTrip } from "@/models/trip";

export async function GET() {
  const me = getCurrentUser();
  if (!me) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const db = await getDb();
    let query = {};
    if (me.role !== "rider") {
      query = {
        $or: [
          { "requester.id": me.id },
          {
            passengers: {
              $elemMatch: { name: { $regex: `^${escapeRegex(me.name)}$`, $options: "i" } },
            },
          },
        ],
      };
    }
    const trips = await db.collection("trips").find(query).sort({ createdAt: -1 }).toArray();
    return NextResponse.json({ trips: trips.map(serializeTrip) });
  } catch (err) {
    console.error("List trips error:", err);
    return NextResponse.json({ error: `Database error: ${err.message}` }, { status: 500 });
  }
}

export async function POST(req) {
  const me = getCurrentUser();
  if (!me) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  if (!["student", "employee"].includes(me.role)) {
    return NextResponse.json(
      { error: "Only students and employees can file ride requests" },
      { status: 403 }
    );
  }

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { from, to, when } = body;
  const passengerNames = Array.isArray(body.passengers)
    ? body.passengers.map((n) => String(n).trim()).filter(Boolean)
    : [];

  if (!LOCATIONS.includes(from) || !LOCATIONS.includes(to)) {
    return NextResponse.json(
      { error: "From and To must be College, Station or Office" },
      { status: 400 }
    );
  }
  if (from === to) {
    return NextResponse.json({ error: "From and To cannot be the same place" }, { status: 400 });
  }
  if (!when || isNaN(new Date(when).getTime())) {
    return NextResponse.json({ error: "A valid date/time is required" }, { status: 400 });
  }
  if (passengerNames.length === 0) {
    return NextResponse.json(
      { error: "At least one passenger name is required" },
      { status: 400 }
    );
  }

  try {
    const db = await getDb();
    const trip = {
      requester: { id: me.id, name: me.name, role: me.role },
      from,
      to,
      when: new Date(when),
      passengers: passengerNames.map((name) => ({ name, status: "pending" })),
      status: "requested",
      riderId: null,
      clashWith: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("trips").insertOne(trip);
    return NextResponse.json(
      { trip: serializeTrip({ _id: result.insertedId, ...trip }) },
      { status: 201 }
    );
  } catch (err) {
    console.error("Create trip error:", err);
    return NextResponse.json({ error: `Database error: ${err.message}` }, { status: 500 });
  }
}
