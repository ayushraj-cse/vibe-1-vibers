const STYLES = {
  requested: "bg-stone-100 text-stone-600",
  accepted: "bg-blue-50 text-blue-700",
  clashed: "bg-red-50 text-red-700",
  done: "bg-emerald-50 text-emerald-700",
};

const LABELS = {
  requested: "Waiting",
  accepted: "Accepted · Toto held",
  clashed: "Clash",
  done: "Done",
};

export default function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap ${
        STYLES[status] || "bg-stone-100 text-stone-600"
      }`}
    >
      {LABELS[status] || status}
    </span>
  );
}
