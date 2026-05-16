import { Suspense } from "react";
import { DocumentClient } from "./DocumentClient";

export const metadata = {
  title: "Document an incident — Seagull",
};

export default function DocumentPage() {
  return (
    <Suspense fallback={null}>
      <DocumentClient />
    </Suspense>
  );
}
