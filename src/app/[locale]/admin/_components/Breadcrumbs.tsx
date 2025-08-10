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

  // 1. Locale entfernen
  const withoutLocale = pathname
    .split("/")
    .filter(Boolean)
    .filter((seg) => !LOCALES.includes(seg));

  // 2. Admin-Teil für Anzeige entfernen
  const displaySegments =
    withoutLocale[0] === BASE_PATH.slice(1)
      ? withoutLocale.slice(1) // "admin" raus
      : withoutLocale;

  // 3. Admin-Teil für Links behalten
  let cumulativePath = BASE_PATH;

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {/* Home-Link immer zum Base Path */}
        <BreadcrumbItem>
          <BreadcrumbLink href={BASE_PATH}>Home</BreadcrumbLink>
        </BreadcrumbItem>

        {displaySegments.map((seg, idx) => {
          cumulativePath += `/${seg}`;
          const isLast = idx === displaySegments.length - 1;
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
