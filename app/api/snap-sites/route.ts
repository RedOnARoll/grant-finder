import { NextResponse } from "next/server"

const SNAP_LAYER =
  "https://services1.arcgis.com/RLQu0rK7h4kbsBq5/arcgis/rest/services/snap_retailer_location_data/FeatureServer/0/query"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const zip = (searchParams.get("zip") ?? "").replace(/\D/g, "").slice(0, 5)

  if (zip.length !== 5) {
    return NextResponse.json({ error: "Invalid ZIP" }, { status: 400 })
  }

  try {
    const url = new URL(SNAP_LAYER)
    url.searchParams.set("where", `Zip_Code='${zip}'`)
    url.searchParams.set("outFields", "Store_Name,Store_Street_Address,City,State,Store_Type")
    url.searchParams.set("resultRecordCount", "5")
    url.searchParams.set("f", "json")

    const res = await fetch(url.toString(), {
      next: { revalidate: 86400 },
    })

    if (!res.ok) {
      return NextResponse.json({ found: false, sites: [], hasMore: false })
    }

    const data = await res.json()

    if (data.error) {
      return NextResponse.json({ found: false, sites: [], hasMore: false })
    }

    const features: any[] = data.features ?? []
    const sites = features.map(f => ({
      name: (f.attributes.Store_Name as string) ?? "",
      address: [f.attributes.Store_Street_Address, f.attributes.City, f.attributes.State]
        .filter(Boolean)
        .join(", "),
      type: (f.attributes.Store_Type as string) ?? "",
    }))

    return NextResponse.json({
      found: sites.length > 0,
      sites,
      hasMore: data.exceededTransferLimit === true,
    })
  } catch {
    return NextResponse.json({ found: false, sites: [], hasMore: false })
  }
}
