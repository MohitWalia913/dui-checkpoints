"use client";

import { useEffect } from "react";

export default function MapRedirectPage() {
  useEffect(() => {
    window.location.replace("/#view-map");
  }, []);

  return null;
}
