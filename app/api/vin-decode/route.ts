import { NextResponse } from "next/server";

type DecodeResponse = {
  success: boolean;
  vin: string;
  year: string;
  make: string;
  model: string;
  message?: string;
};

function normalizeVin(value: string) {
  return value
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .replace(/[IOQ]/g, "")
    .slice(0, 17);
}

function isValidVin(value: string) {
  return /^[A-HJ-NPR-Z0-9]{17}$/.test(value);
}

function toTitleCase(value: string) {
  return value
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const vin = normalizeVin(String(body?.vin ?? ""));
    const modelYear = String(body?.modelYear ?? "").trim();

    if (!isValidVin(vin)) {
      return NextResponse.json<DecodeResponse>(
        {
          success: false,
          vin,
          year: "",
          make: "",
          model: "",
          message: "VIN is invalid.",
        },
        { status: 400 },
      );
    }

    const yearSegment = modelYear ? `/${encodeURIComponent(modelYear)}` : "";
    const url = `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/${encodeURIComponent(
      vin,
    )}${yearSegment}?format=json`;

    const response = await fetch(url, {
      method: "GET",
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json<DecodeResponse>(
        {
          success: false,
          vin,
          year: "",
          make: "",
          model: "",
          message: "VIN decode service is unavailable right now.",
        },
        { status: 502 },
      );
    }

    const payload = await response.json();
    const row = Array.isArray(payload?.Results) ? payload.Results[0] : null;

    const year = String(row?.ModelYear ?? "").trim();
    const make = String(row?.Make ?? "").trim();
    const model = String(row?.Model ?? "").trim();

    return NextResponse.json<DecodeResponse>({
      success: true,
      vin,
      year: year && year !== "0" ? year : "",
      make:
        make && make.toLowerCase() !== "not applicable"
          ? toTitleCase(make)
          : "",
      model:
        model && model.toLowerCase() !== "not applicable" ? model : "",
    });
  } catch {
    return NextResponse.json<DecodeResponse>(
      {
        success: false,
        vin: "",
        year: "",
        make: "",
        model: "",
        message: "VIN decode request failed.",
      },
      { status: 500 },
    );
  }
}