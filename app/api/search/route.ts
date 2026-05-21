import { NextResponse } from "next/server"
import { anthropic } from "@/lib/anthropic"

const GRANT_CATEGORIES = ["small_business", "individual", "agricultural", "research", "veterans", "arts"]
const BENEFIT_SUBCATEGORIES = ["housing", "food", "disability", "education", "childcare", "energy", "health"]
const ALL_TOPICS = [...GRANT_CATEGORIES, ...BENEFIT_SUBCATEGORIES]

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = (searchParams.get("q") ?? "").trim()
  const rawType = searchParams.get("type")
  const type = rawType === "benefits" ? "benefits" : rawType === "programs" ? "programs" : "grants"

  if (!query) {
    return NextResponse.json({ keywords: [], categories: [], interpretation: "" })
  }

  const availableCategories =
    type === "benefits" ? BENEFIT_SUBCATEGORIES :
    type === "programs" ? ALL_TOPICS :
    GRANT_CATEGORIES
  const categoryField = type === "grants" ? "category" : type === "benefits" ? "subcategory" : "topic"

  try {
    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 400,
      messages: [
        {
          role: "user",
          content: `You are a search assistant for a U.S. government ${type} database. A user searched for: "${query}"

Available ${categoryField} filters: ${availableCategories.join(", ")}

Return ONLY a JSON object (no markdown, no explanation) with:
- "keywords": array of 4-10 search terms that would find relevant ${type} (include synonyms, related terms, common program names, agencies). Cast a wide net — include obvious variants.
- "categories": array of matching ${categoryField} values from the available list only. Empty array if none clearly apply.
- "interpretation": a concise phrase (under 10 words) describing what the user is looking for.

Examples:
Query "low income housing" → {"keywords":["housing","affordable","rent","low income","section 8","hud","shelter","housing assistance","subsidized","rental"],"categories":["housing"],"interpretation":"affordable housing programs for low-income people"}
Query "food stamps" → {"keywords":["food","snap","nutrition","ebt","supplemental nutrition","food assistance","grocery","hunger","meals"],"categories":["food"],"interpretation":"food assistance and nutrition programs"}
Query "small business loan" → {"keywords":["loan","small business","sba","startup","entrepreneur","financing","capital","grant","funding"],"categories":["small_business"],"interpretation":"small business loans and funding"}
Query "veteran benefits" → {"keywords":["veteran","veterans","military","service member","va","gi bill","armed forces","combat"],"categories":["veterans"],"interpretation":"benefits and grants for veterans"}`,
        },
      ],
    })

    const content = message.content[0]
    if (content.type !== "text") throw new Error("unexpected response type")

    // Strip any markdown code fences if present
    const text = content.text.replace(/```json\n?|\n?```/g, "").trim()
    const result = JSON.parse(text)

    return NextResponse.json({
      keywords: Array.isArray(result.keywords) ? result.keywords : [query],
      categories: Array.isArray(result.categories) ? result.categories : [],
      interpretation: typeof result.interpretation === "string" ? result.interpretation : query,
    })
  } catch (err) {
    console.error("[search] Claude error:", err)
    // Graceful fallback — plain keyword search
    return NextResponse.json({ keywords: [query], categories: [], interpretation: query })
  }
}
