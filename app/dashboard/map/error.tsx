"use client";

import { useEffect } from "react";

export default function MapPageError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Map page error:", error);
  }, [error]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <p className="font-montserrat text-xl font-bold text-white">
        Map could not load
      </p>
      <p className="font-inter max-w-md text-sm text-white/60">
        {error.message ||
          "Something went wrong while loading the checkpoint map."}
      </p>
      <button
        type="button"
        onClick={reset}
        className="font-montserrat rounded-xl bg-[#F57E3A] px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
      >
        Try again
      </button>
    </div>
  );
}
