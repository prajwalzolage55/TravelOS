import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TravelOS — The Adaptive Travel Operating System",
  description:
    "TravelOS turns a static itinerary into a living graph — one that discovers what you'll love, and heals itself when things go wrong.",
  keywords: ["travel", "itinerary", "disruption", "recovery", "local experiences", "trip planner"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.getItem('travelos-theme') === 'dark') {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
