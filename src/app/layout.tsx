import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Friends Children's Ministry",
    template: "%s | Friends Children's Ministry"
  },
  description: "Sunday School lessons, Bible studies, resources, and ministry events."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
