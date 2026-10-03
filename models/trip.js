export const LOCATIONS = ["College", "Station", "Office"];

export function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function serializeTrip(trip) {
  return {
    id: trip._id.toString(),
    requester: trip.requester,
    from: trip.from,
    to: trip.to,
    when: trip.when,
    passengers: trip.passengers,
    status: trip.status,
    riderId: trip.riderId,
    clashWith: trip.clashWith ? trip.clashWith.toString() : null,
    createdAt: trip.createdAt,
    updatedAt: trip.updatedAt,
  };
}
