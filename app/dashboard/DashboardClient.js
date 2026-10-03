"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import RequestForm from "@/components/RequestForm";
import TripCard from "@/components/TripCard";

export default function DashboardClient({ me }) {
  const router = useRouter();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState("");
  const isRider = me.role === "rider";

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/trips");
      const data = await res.json();
      setTrips(data.trips || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  async function handleAccept(id) {
    setActionError("");
    const res = await fetch(`/api/trips/${id}/accept`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) setActionError(data.error || "Could not accept trip.");
    load();
  }

  async function handleBoard(id, name, status) {
    setActionError("");
    const res = await fetch(`/api/trips/${id}/board`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, status }),
    });
    const data = await res.json();
    if (!res.ok) setActionError(data.error || "Could not update boarding status.");
    load();
  }

  async function handleDone(id) {
    setActionError("");
    const res = await fetch(`/api/trips/${id}/done`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) setActionError(data.error || "Could not complete trip.");
    load();
  }

  const requested = trips.filter((t) => t.status === "requested");
  const active = trips.filter((t) => t.status === "accepted");

  return (
    <main className="min-h-screen pb-16">
      <header className="border-b border-stone-200 bg-white sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-8 w-8 rounded-md bg-amber-500 text-stone-900 font-bold flex items-center justify-center">
              T
            </span>
            <span className="font-semibold text-stone-900 hidden sm:inline">
              Lawazia Mobility Desk
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-stone-900">{me.name}</p>
              <p className="text-xs text-stone-500 capitalize">{me.role}</p>
            </div>
            <button
              onClick={logout}
              className="text-sm text-stone-500 hover:text-stone-900 border border-stone-300 rounded-md px-3 py-1.5"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-8">
        {actionError && (
          <div className="rounded-md bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2">
            {actionError}
          </div>
        )}

        {!isRider && (
          <section>
            <h2 className="text-sm font-semibold text-stone-900 mb-3">New ride request</h2>
            <div className="bg-white border border-stone-200 rounded-lg p-4 max-w-md">
              <RequestForm me={me} onCreated={load} />
            </div>
          </section>
        )}

        {isRider && (
          <section>
            <h2 className="text-sm font-semibold text-stone-900 mb-3">
              Pending requests{" "}
              {requested.length > 0 && (
                <span className="text-stone-400 font-normal">({requested.length})</span>
              )}
            </h2>
            {requested.length === 0 ? (
              <p className="text-sm text-stone-400">No pending requests right now.</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {requested.map((t) => (
                  <TripCard
                    key={t.id}
                    trip={t}
                    me={me}
                    isRider
                    onAccept={handleAccept}
                    onBoard={handleBoard}
                    onDone={handleDone}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {isRider && (
          <section>
            <h2 className="text-sm font-semibold text-stone-900 mb-3">Active trip</h2>
            {active.length === 0 ? (
              <p className="text-sm text-stone-400">The Toto is free. No trip in progress.</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {active.map((t) => (
                  <TripCard
                    key={t.id}
                    trip={t}
                    me={me}
                    isRider
                    onAccept={handleAccept}
                    onBoard={handleBoard}
                    onDone={handleDone}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        <section>
          <h2 className="text-sm font-semibold text-stone-900 mb-3">
            {isRider ? "Rider history · every trip" : "Your trip history"}
          </h2>
          {loading ? (
            <p className="text-sm text-stone-400">Loading…</p>
          ) : trips.length === 0 ? (
            <p className="text-sm text-stone-400">No trips yet.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {trips.map((t) => (
                <TripCard
                  key={t.id}
                  trip={t}
                  me={me}
                  isRider={isRider}
                  onAccept={handleAccept}
                  onBoard={handleBoard}
                  onDone={handleDone}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
