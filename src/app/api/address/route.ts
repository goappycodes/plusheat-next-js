import { NextRequest, NextResponse } from "next/server";

/**
 * Postcode lookup (Loqate / PostcodeAnywhere Capture), proxied so the key
 * stays on the server. Same calls the WordPress checkout made from the
 * browser (eazycollect.js CapturePlus_Interactive_Find_v2_10 / Retrieve):
 *
 *   GET /api/address?postcode=SW1A1AA   -> list of addresses
 *   GET /api/address?id=GB|RM|A|123     -> one address, split into fields
 */
const BASE = "https://services.postcodeanywhere.co.uk";

function key() {
  return process.env.LOQATE_CAPTURE_KEY || process.env.LOQATE_API_KEY || "";
}

interface FindItem {
  Id: string;
  Type: string;
  Text: string;
  Description: string;
  Error?: string;
  Cause?: string;
}

async function find(text: string, container = ""): Promise<FindItem[]> {
  const q = new URLSearchParams({
    Key: key(),
    Text: text,
    Countries: "GBR",
    Language: "en-gb",
    Container: container,
    Limit: "100",
  });
  const res = await fetch(`${BASE}/Capture/Interactive/Find/v1.10/json3.ws?${q}`, { cache: "no-store" });
  const json = (await res.json()) as { Items?: FindItem[] };
  return json.Items ?? [];
}

export async function GET(req: NextRequest) {
  if (!key()) return NextResponse.json({ error: "Address lookup is not configured." }, { status: 503 });
  const postcode = (req.nextUrl.searchParams.get("postcode") ?? "").trim().slice(0, 10);
  const id = (req.nextUrl.searchParams.get("id") ?? "").trim().slice(0, 200);

  try {
    if (id) {
      const q = new URLSearchParams({ Key: key(), Id: id });
      const res = await fetch(`${BASE}/CapturePlus/Interactive/Retrieve/v2.10/json3.ws?${q}`, { cache: "no-store" });
      const json = (await res.json()) as {
        Items?: { Line1?: string; Line2?: string; City?: string; Province?: string; CountryName?: string; PostalCode?: string; Error?: string; Description?: string }[];
      };
      const a = json.Items?.[0];
      if (!a || a.Error) return NextResponse.json({ error: a?.Description || "Address not found." }, { status: 404 });
      return NextResponse.json({
        address: {
          line1: a.Line1 ?? "",
          line2: a.Line2 ?? "",
          town: a.City ?? "",
          county: a.Province ?? "",
          country: a.CountryName || "United Kingdom",
          postcode: a.PostalCode ?? "",
        },
      });
    }

    if (!postcode) return NextResponse.json({ error: "Please enter a postcode." }, { status: 400 });
    let items = await find(postcode);
    if (items[0]?.Error) return NextResponse.json({ error: items[0].Description || "Lookup failed." }, { status: 400 });
    // One postcode match: look inside it for the addresses (as the WP checkout did).
    if (items.length === 1 && items[0].Type !== "Address") items = await find(postcode, items[0].Id);
    const addresses = items
      .filter((i) => i.Type === "Address")
      .map((i) => ({ id: i.Id, label: `${i.Text}, ${i.Description}` }));
    return NextResponse.json({ addresses });
  } catch (e) {
    console.error("[loqate]", e);
    return NextResponse.json({ error: "Address lookup is unavailable. Please enter your address manually." }, { status: 502 });
  }
}
