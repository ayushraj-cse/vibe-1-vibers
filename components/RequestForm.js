"use client";

import { useState } from "react";

const LOCATIONS = ["College", "Station", "Office"];

export default function RequestForm({ me, onCreated }) {
  const [from, setFrom] = useState("College");
  const [to, setTo] = useState("Station");
  const [when, setWhen] = useState("");
  const [passengers, setPassengers] = useState([me?.name || ""]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function updatePassenger(i, value) {
    setPassengers((p) => p.map((n, idx) => (idx === i ? value : n)));
  }
  function addPassenger() {
    setPassengers((p) => [...p, ""]);
  }
  function removePassenger(i) {
    setPassengers((p) => p.filter((_, idx) => idx !== i));
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (from === to) {
      setError("From and To cannot be the same place.");
      return;
    }
    if (!when) {
      setError("Pick a date and time.");
      return;
    }
    const names = passengers.map((n) => n.trim()).filter(Boolean);
    if (names.length === 0) {
      setError("Add at least one passenger name.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ from, to, when, passengers: names }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not submit the request.");
        setSubmitting(false);
        return;
      }
      setPassengers([me?.name || ""]);
      setWhen("");
      onCreated?.(data.trip);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-stone-500 mb-1">From</label>
          <select
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm bg-white"
          >
            {LOCATIONS.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-stone-500 mb-1">To</label>
          <select
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm bg-white"
          >
            {LOCATIONS.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-stone-500 mb-1">Date & time</label>
        <input
          type="datetime-local"
          value={when}
          onChange={(e) => setWhen(e.target.value)}
          className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-stone-500 mb-1">Passengers</label>
        <div className="space-y-2">
          {passengers.map((name, i) => (
            <div key={i} className="flex gap-2">
              <input
                value={name}
                onChange={(e) => updatePassenger(i, e.target.value)}
                placeholder={`Passenger ${i + 1} name`}
                className="flex-1 min-w-0 rounded-md border border-stone-300 px-3 py-2 text-sm"
              />
              {passengers.length > 1 && (
                <button
                  type="button"
                  onClick={() => removePassenger(i)}
                  className="shrink-0 px-3 rounded-md border border-stone-300 text-stone-500 text-sm"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addPassenger}
          className="mt-2 text-sm font-medium text-amber-700 hover:text-amber-800"
        >
          + Add person
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-md bg-stone-900 text-white py-2.5 text-sm font-medium hover:bg-stone-800 transition disabled:opacity-60"
      >
        {submitting ? "Submitting..." : "Submit request"}
      </button>
    </form>
  );
}
