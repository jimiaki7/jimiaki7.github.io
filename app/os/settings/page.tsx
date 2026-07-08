import type { Metadata } from "next";
import OsSettingsApp from "../_components/OsSettingsApp";

export const metadata: Metadata = {
  title: "Jimi OS Settings | Personal AI Agentic OS",
  description: "Private connection settings for Jimi OS.",
};

export default function OsSettingsPage() {
  return <OsSettingsApp />;
}
