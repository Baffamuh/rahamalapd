import { lazy, Suspense } from "react";
import { ClientOnly } from "@tanstack/react-router";
import type { LeafletMapProps } from "./LeafletMap";

const LeafletMap = lazy(() => import("./LeafletMap"));

export function MapView(props: LeafletMapProps) {
  const fallback = <div style={{ height: props.height ?? 380 }} className="w-full animate-pulse rounded-lg border bg-muted" />;
  return (
    <ClientOnly fallback={fallback}>
      <Suspense fallback={fallback}>
        <LeafletMap {...props} />
      </Suspense>
    </ClientOnly>
  );
}
