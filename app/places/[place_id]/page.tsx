import { notFound } from "next/navigation";
import { getPlace, listPlaces } from "@/lib/score";
import { PlaceDetailClient } from "./PlaceDetailClient";

export async function generateStaticParams() {
  return listPlaces().map((p) => ({ place_id: p.place_id }));
}

export function generateMetadata({ params }: { params: { place_id: string } }) {
  const p = getPlace(params.place_id);
  if (!p) return { title: "Place not found — Seagull" };
  return {
    title: `${p.name} — Safety Score — Seagull`,
    description: `Safety Score breakdown for ${p.name} in ${p.city}, ${p.state_code}.`,
  };
}

export default function PlaceDetailPage({
  params,
}: {
  params: { place_id: string };
}) {
  const place = getPlace(params.place_id);
  if (!place) notFound();
  return <PlaceDetailClient place={place} />;
}
