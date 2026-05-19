export interface DocumentGenerationAction {
  label: string
  shortLabel: string
  documentType: string
}

const DOCUMENT_ACTIONS: Array<{
  patterns: string[]
  label: string
  shortLabel: string
  documentType: string
}> = [
  {
    patterns: ["research strategy", "research plan"],
    label: "Create research strategy",
    shortLabel: "Research strategy",
    documentType: "research_strategy",
  },
  {
    patterns: ["specific aims"],
    label: "Create specific aims",
    shortLabel: "Specific aims",
    documentType: "specific_aims",
  },
  {
    patterns: ["technical proposal", "technical volume", "technical narrative"],
    label: "Create technical proposal",
    shortLabel: "Technical proposal",
    documentType: "technical_proposal",
  },
  {
    patterns: ["budget justification", "budget narrative"],
    label: "Create budget narrative",
    shortLabel: "Budget narrative",
    documentType: "budget_narrative",
  },
  {
    patterns: ["project narrative", "program narrative", "application narrative", "narrative"],
    label: "Create project narrative",
    shortLabel: "Project narrative",
    documentType: "project_narrative",
  },
  {
    patterns: ["grant proposal", "formal proposal", "full proposal", "project proposal", "proposal"],
    label: "Create grant proposal",
    shortLabel: "Grant proposal",
    documentType: "grant_proposal",
  },
  {
    patterns: ["concept paper", "white paper"],
    label: "Create concept paper",
    shortLabel: "Concept paper",
    documentType: "concept_paper",
  },
  {
    patterns: ["letter of inquiry"],
    label: "Draft letter of inquiry",
    shortLabel: "Letter of inquiry",
    documentType: "letter_of_inquiry",
  },
  {
    patterns: ["statement of work", "scope of work"],
    label: "Create statement of work",
    shortLabel: "Statement of work",
    documentType: "statement_of_work",
  },
  {
    patterns: ["business plan"],
    label: "Create business plan",
    shortLabel: "Business plan",
    documentType: "business_plan",
  },
  {
    patterns: ["commercialization plan"],
    label: "Create commercialization plan",
    shortLabel: "Commercialization plan",
    documentType: "commercialization_plan",
  },
  {
    patterns: ["evaluation plan"],
    label: "Create evaluation plan",
    shortLabel: "Evaluation plan",
    documentType: "evaluation_plan",
  },
  {
    patterns: ["data management", "data sharing"],
    label: "Create data management plan",
    shortLabel: "Data plan",
    documentType: "data_management_plan",
  },
  {
    patterns: ["logic model"],
    label: "Create logic model",
    shortLabel: "Logic model",
    documentType: "logic_model",
  },
  {
    patterns: ["project summary", "project abstract", "abstract"],
    label: "Create project summary",
    shortLabel: "Project summary",
    documentType: "project_summary",
  },
  {
    patterns: ["personal statement", "statement of purpose", "statement of grant purpose", "artist statement"],
    label: "Draft statement",
    shortLabel: "Statement",
    documentType: "statement",
  },
  {
    patterns: ["essay"],
    label: "Draft essay",
    shortLabel: "Essay",
    documentType: "essay",
  },
]

export function getDocumentGenerationAction(documentName: string): DocumentGenerationAction | null {
  const normalized = documentName.toLowerCase()
  const action = DOCUMENT_ACTIONS.find(({ patterns }) =>
    patterns.some((pattern) => normalized.includes(pattern)),
  )

  if (!action) return null

  return {
    label: action.label,
    shortLabel: action.shortLabel,
    documentType: action.documentType,
  }
}

export function getDocumentGenerationActions(documents: string[]): DocumentGenerationAction[] {
  const seen = new Set<string>()
  const actions: DocumentGenerationAction[] = []

  for (const documentName of documents) {
    const action = getDocumentGenerationAction(documentName)
    if (!action || seen.has(action.documentType)) continue
    seen.add(action.documentType)
    actions.push(action)
  }

  return actions
}
