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
    return NextResponse.json({ error: "Only the rider can complete trips" }, { status: 403 });
  }

  const { id } = params;
  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Trip not found" }, { status: 404 });
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
        { error: "Only an accepted trip can be marked done" },
        { status: 409 }
      );
    }

    await trips.updateOne(
      { _id: trip._id },
      { $set: { status: "done", doneAt: new Date(), updatedAt: new Date() } }
    );
    const updated = await trips.findOne({ _id: trip._id });
    return NextResponse.json({ trip: serializeTrip(updated) });
  } catch (err) {
    console.error("Done error:", err);
    return NextResponse.json({ error: `Database error: ${err.message}` }, { status: 500 });
  }
}
