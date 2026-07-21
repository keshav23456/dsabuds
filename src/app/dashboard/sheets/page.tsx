"use client";

import { useEffect, useState } from "react";
import { sheetService } from "@/services/sheetService";
import { Spinner } from "@/components/common";
import { getErrorMessage } from "@/utils";
import { SheetCard } from "@/components/dashboard/sheets/SheetCard";
import type { SheetListItem } from "@/components/dashboard/sheets/types";

export default function SheetsPage() {
  const [sheets, setSheets] = useState<SheetListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res: any = await sheetService.getSheets();
        if (!cancelled) setSheets(res.sheets || []);
      } catch (e) {
        console.error("Failed to load sheets", e);
        if (!cancelled) setError(getErrorMessage(e) || "Failed to load sheets.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-white text-4xl font-normal italic mb-2 font-serif flex items-center gap-3">
          Practice Sheets
        </h1>
        <p className="text-neutral-500 font-mono text-sm">
          Curated DSA sheets — track your progress problem by problem.
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {sheets.length === 0 && !error ? (
        <div className="text-center py-24 text-neutral-600 font-mono">No sheets available yet.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sheets.map((s) => (
            <SheetCard key={s.id} sheet={s} />
          ))}
        </div>
      )}
    </div>
  );
}
