import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/session";
import { serializeTrip } from "@/models/trip";

export async function POST(req, { params }) {
  const me = getCurrentUser();
  if (!me) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  if (me.role !== "rider") {
    return NextResponse.json({ error: "Only the rider can mark boarding" }, { status: 403 });
  }

  const { id } = params;
  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Trip not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const name = body?.name;
  const status = body?.status;
  if (!name || !["boarded", "missed"].includes(status)) {
    return NextResponse.json(
      { error: "A passenger name and status of boarded/missed are required" },
      { status: 400 }
    );
  }

  try {
    const db = await getDb();
    const trips = db.collection("trips");
    const trip = await trips.findOne({ _id: new ObjectId(id) });
    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }
    if (trip.status !== "accepted") {
      return NextResponse.json(
        { error: "Boarding can only be marked on an accepted trip" },
        { status: 409 }
      );
    }
    const hasPassenger = trip.passengers.some((p) => p.name === name);
    if (!hasPassenger) {
      return NextResponse.json({ error: "Passenger not found on this trip" }, { status: 404 });
    }

    await trips.updateOne(
      { _id: trip._id, "passengers.name": name },
      { $set: { "passengers.$.status": status, updatedAt: new Date() } }
    );
    const updated = await trips.findOne({ _id: trip._id });
    return NextResponse.json({ trip: serializeTrip(updated) });
  } catch (err) {
    console.error("Board error:", err);
    return NextResponse.json({ error: `Database error: ${err.message}` }, { status: 500 });
  }
}
