"use client";

import { use } from "react";
import { SheetDetail } from "@/components/dashboard/sheets/SheetDetail";

export default function SheetDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  return <SheetDetail slug={slug} />;
}
