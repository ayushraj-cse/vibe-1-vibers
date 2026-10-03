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
    return NextResponse.json({ error: "Only the rider can accept trips" }, { status: 403 });
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
    if (trip.status !== "requested") {
      return NextResponse.json({ error: `Trip is already ${trip.status}` }, { status: 409 });
    }

    // The Toto is a single vehicle: only one trip can be accepted (held) at a time.
    const activeTrip = await trips.findOne({ status: "accepted" });
    if (activeTrip) {
      await trips.updateOne(
        { _id: trip._id },
        { $set: { status: "clashed", clashWith: activeTrip._id, updatedAt: new Date() } }
      );
      return NextResponse.json(
        {
          error: `Clash: the Toto is already held for another trip (${activeTrip.from} to ${activeTrip.to}).`,
        },
        { status: 409 }
      );
    }

    await trips.updateOne(
      { _id: trip._id },
      {
        $set: {
          status: "accepted",
          riderId: me.id,
          acceptedAt: new Date(),
          updatedAt: new Date(),
        },
      }
    );
    const updated = await trips.findOne({ _id: trip._id });
    return NextResponse.json({ trip: serializeTrip(updated) });
  } catch (err) {
    console.error("Accept trip error:", err);
    return NextResponse.json({ error: `Database error: ${err.message}` }, { status: 500 });
  }
}
