import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { MantineProvider } from "@/providers/MantineProvider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "JobBoard - find and post jobs",
  description: "Search jobs by title, location, type and salary, and post new openings.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <MantineProvider>{children}</MantineProvider>
      </body>
    </html>
  );
}
