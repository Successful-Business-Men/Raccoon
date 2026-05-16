import { PlacesClient } from "./PlacesClient";
import { listPlaces } from "@/lib/score";

export const metadata = {
  title: "Safety Score — Seagull",
};

export default function PlacesPage() {
  return <PlacesClient places={listPlaces()} />;
}
