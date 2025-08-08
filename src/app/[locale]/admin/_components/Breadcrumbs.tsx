"use client";

import { usePathname } from "next/navigation";
import React from "react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";

const labelMap: Record<string, string> = {
  team: "Team",
};

const LOCALES = ["en", "de"];

// Konfigurierbarer Base Path
const BASE_PATH = "/admin";

function formatSegment(seg: string) {
  if (/^[0-9]+$/.test(seg) || /^[0-9a-fA-F\-]{36}$/.test(seg)) {
    return "Detail";
  }
  if (labelMap[seg]) {
    return labelMap[seg];
  }
  return seg.charAt(0).toUpperCase() + seg.slice(1);
}

export default function Breadcrumbs() {
  const pathname = usePathname();

  // 1. Base Path entfernen
  const pathWithoutBase = pathname.startsWith(BASE_PATH)
    ? pathname.slice(BASE_PATH.length)
    : pathname;

  // 2. Segmente filtern: leer + Locale entfernen
  const segments = pathWithoutBase
    .split("/")
    .filter(Boolean)
    .filter((seg) => !LOCALES.includes(seg));

  let cumulativePath = BASE_PATH; // Links immer mit Base Path aufbauen

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href={BASE_PATH}>Home</BreadcrumbLink>
        </BreadcrumbItem>

        {segments.map((seg, idx) => {
          cumulativePath += `/${seg}`;
          const isLast = idx === segments.length - 1;
          const label = formatSegment(seg);

          return (
            <React.Fragment key={cumulativePath}>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href={cumulativePath}>{label}</BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
