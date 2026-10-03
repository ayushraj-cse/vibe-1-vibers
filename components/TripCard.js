"use client";

import StatusBadge from "./StatusBadge";

function fmt(dt) {
  const d = new Date(dt);
  return d.toLocaleString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function TripCard({ trip, me, isRider, onAccept, onBoard, onDone }) {
  const myEntry =
    !isRider && me
      ? trip.passengers.find((p) => p.name.toLowerCase() === me.name.toLowerCase())
      : null;

  return (
    <div className="bg-white border border-stone-200 rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-stone-900">
            <span>{trip.from}</span>
            <span className="text-amber-500">&rarr;</span>
            <span>{trip.to}</span>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">{fmt(trip.when)}</p>
        </div>
        <StatusBadge status={trip.status} />
      </div>

      <p className="text-xs text-stone-500">
        Filed by <span className="font-medium text-stone-700">{trip.requester.name}</span> (
        {trip.requester.role})
      </p>

      <div className="flex flex-wrap gap-1.5">
        {trip.passengers.map((p) => (
          <span
            key={p.name}
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs border ${
              p.status === "boarded"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : p.status === "missed"
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-stone-200 bg-stone-50 text-stone-600"
            }`}
          >
            {p.name}
            {p.status !== "pending" && (
              <span className="font-medium">· {p.status === "boarded" ? "Boarded" : "Missed"}</span>
            )}
          </span>
        ))}
      </div>

      {myEntry && myEntry.status !== "pending" && (
        <p className="text-xs text-stone-500">
          Your status:{" "}
          <span className="font-medium text-stone-700">
            {myEntry.status === "boarded" ? "Boarded" : "Missed"}
          </span>
        </p>
      )}

      {isRider && trip.status === "requested" && (
        <button
          onClick={() => onAccept(trip.id)}
          className="w-full rounded-md bg-stone-900 text-white py-2 text-sm font-medium hover:bg-stone-800"
        >
          Accept
        </button>
      )}

      {isRider && trip.status === "clashed" && (
        <p className="text-xs text-red-600">
          Clash — the Toto was already held for another trip at this time.
        </p>
      )}

      {isRider && trip.status === "accepted" && (
        <div className="space-y-2 pt-1 border-t border-stone-100">
          <p className="text-xs font-medium text-stone-500 pt-2">Pickup — mark each passenger</p>
          {trip.passengers.map((p) => (
            <div key={p.name} className="flex items-center justify-between gap-2">
              <span className="text-sm text-stone-800 truncate">{p.name}</span>
              <div className="flex gap-1.5 shrink-0">
                <button
                  onClick={() => onBoard(trip.id, p.name, "boarded")}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium border ${
                    p.status === "boarded"
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "border-emerald-300 text-emerald-700"
                  }`}
                >
                  Boarded
                </button>
                <button
                  onClick={() => onBoard(trip.id, p.name, "missed")}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium border ${
                    p.status === "missed"
                      ? "bg-red-600 text-white border-red-600"
                      : "border-red-300 text-red-700"
                  }`}
                >
                  Missed
                </button>
              </div>
            </div>
          ))}
          <button
            onClick={() => onDone(trip.id)}
            className="w-full mt-2 rounded-md bg-amber-500 text-stone-900 py-2 text-sm font-semibold hover:bg-amber-400"
          >
            Drop · Mark done
          </button>
        </div>
      )}
    </div>
  );
}
