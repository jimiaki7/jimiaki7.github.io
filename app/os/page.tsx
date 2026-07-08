import type { Metadata } from "next";
import OsApp from "./_components/OsApp";

export const metadata: Metadata = {
  title: "Jimi OS | Personal AI Agentic OS",
  description: "Private command center for Jimi's AI tools, memory, and projects.",
};

export default function OsPage() {
  return <OsApp />;
}
