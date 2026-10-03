import "./globals.css";

export const metadata = {
  title: "Lawazia Mobility Desk",
  description: "One Toto. College, Station, Office.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-stone-50 text-stone-900 antialiased">{children}</body>
    </html>
  );
}
