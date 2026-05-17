import { Suspense } from "react";
import { DocumentClient } from "./DocumentClient";

export const metadata = {
  title: "Pre-visit Card — Seagull",
};

export default function VisitCardPage() {
  return (
    <Suspense fallback={null}>
      <DocumentClient />
    </Suspense>
  );
}
