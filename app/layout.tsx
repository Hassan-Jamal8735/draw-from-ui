import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SketchUI — Draw. Generate. Ship.",
  description:
    "Transform hand-drawn wireframes into stunning, production-ready HTML & Tailwind CSS pages using AI. Draw your idea, click Generate, and get a full landing page instantly.",
  keywords: ["AI", "UI Generator", "Wireframe to Code", "Tailwind CSS", "Design Tool"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
      </head>
      <body className="app-body">
        {children}
      </body>
    </html>
  );
}
