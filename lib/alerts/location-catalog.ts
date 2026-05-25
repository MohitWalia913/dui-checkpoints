import { CALIFORNIA_COUNTIES } from "@/lib/alerts/california-counties";
import { createAdminClient } from "@/lib/supabase/admin";

export type AlertCityOption = {
  city: string;
  county: string;
  key: string;
};

export type AlertLocationCatalog = {
  counties: string[];
  cities: AlertCityOption[];
};

export function cityKey(city: string, county: string): string {
  return `${city.trim()}|${county.trim()}`;
}

export function parseCityKey(key: string): { city: string; county: string } | null {
  const parts = key.split("|");
  if (parts.length !== 2) return null;
  const city = parts[0]?.trim();
  const county = parts[1]?.trim();
  if (!city || !county) return null;
  return { city, county };
}

export async function fetchAlertLocationCatalog(): Promise<{
  data: AlertLocationCatalog;
  error: string | null;
}> {
  const admin = createAdminClient();
  if (!admin) {
    return {
      data: { counties: [...CALIFORNIA_COUNTIES], cities: [] },
      error: null,
    };
  }

  const { data, error } = await admin
    .from("Checkpoints")
    .select("City, County")
    .eq("State", "California")
    .limit(5000);

  if (error) {
    return {
      data: { counties: [...CALIFORNIA_COUNTIES], cities: [] },
      error: error.message,
    };
  }

  const cityMap = new Map<string, AlertCityOption>();

  for (const row of data ?? []) {
    const city = String(row.City ?? "").trim();
    const county = String(row.County ?? "").trim();
    if (!city || !county) continue;
    const key = cityKey(city, county);
    if (!cityMap.has(key)) {
      cityMap.set(key, { city, county, key });
    }
  }

  const cities = Array.from(cityMap.values()).sort((a, b) => {
    const countyCmp = a.county.localeCompare(b.county);
    if (countyCmp !== 0) return countyCmp;
    return a.city.localeCompare(b.city);
  });

  return {
    data: {
      counties: [...CALIFORNIA_COUNTIES],
      cities,
    },
    error: null,
  };
}
