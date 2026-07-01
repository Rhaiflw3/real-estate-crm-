/**
 * CLI script to import Excel cartera files into the CRM.
 *
 * Usage:
 *   npx tsx scripts/import-cartera-excel.ts <path-to-excel-file>
 *
 * Examples:
 *   npx tsx scripts/import-cartera-excel.ts "cartera-properties/Cartera Inmobiliaria 2026.xlsx"
 *   npx tsx scripts/import-cartera-excel.ts "cartera-properties/Cartera Inmobiliaria PRO 2026.xlsx"
 */

import * as XLSX from "xlsx"
import { createClient } from "@supabase/supabase-js"
import * as path from "path"
import * as fs from "fs"

const envPath = path.resolve(__dirname, "..", ".env")
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8")
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith("#")) {
      const eqIdx = trimmed.indexOf("=")
      if (eqIdx > 0) {
        const key = trimmed.slice(0, eqIdx)
        let value = trimmed.slice(eqIdx + 1)
        if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1)
        process.env[key] = value
      }
    }
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } })

const SECTION_PATTERNS = [
  { pattern: /casas?\s*(en\s*)?venta/i, type: "House", defaultStatus: "Available" },
  { pattern: /terrenos?\s*(en\s*)?venta/i, type: "Land", defaultStatus: "Available" },
  { pattern: /departamentos?\s*(en\s*)?venta/i, type: "Apartment", defaultStatus: "Available" },
  { pattern: /hoteles?\s*(en\s*)?venta/i, type: "Commercial", defaultStatus: "Available" },
  { pattern: /locales?\s*comerciales?\s*(en\s*)?venta/i, type: "Commercial", defaultStatus: "Available" },
  { pattern: /locales?\s*(en\s*)?venta/i, type: "Commercial", defaultStatus: "Available" },
  { pattern: /casas?\s*\/\s*dptos?\s*(en\s*)?alquiler/i, type: "House", defaultStatus: "Rented" },
  { pattern: /dptos?\s*(en\s*)?alquiler/i, type: "Apartment", defaultStatus: "Rented" },
  { pattern: /locales?\s*(en\s*)?alquiler/i, type: "Commercial", defaultStatus: "Rented" },
  { pattern: /alquiler/i, type: "House", defaultStatus: "Rented" },
]

const STATUS_MAP: Record<string, string> = {
  urgente: "Available",
  activo: "Available",
  pendiente: "Pending",
  firmado: "Sold",
  firmar: "Pending",
  inactivo: "OffMarket",
  "sin precio": "OffMarket",
  "sin contrato": "Pending",
  "docs pendientes": "Pending",
  seguimiento: "Pending",
  contrato: "Pending",
  "fuera cartera": "OffMarket",
  debe: "Pending",
}

function parsePrice(raw: any): number | null {
  if (!raw || raw === "—" || raw === "-") return null
  const cleaned = String(raw)
    .replace(/^S\/\s*/, "")
    .replace(/^(\$|USD)\s*/, "")
    .replace(/\/mes.*$/, "")
    .replace(/,/g, "")
    .trim()
  const num = parseFloat(cleaned)
  return isNaN(num) ? null : num
}

function parseArea(raw: any): number | null {
  if (!raw || raw === "—" || raw === "-") return null
  let cleaned = String(raw).toLowerCase().replace(/\s*m²?\s*$/, "").replace(/,/g, "").trim()
  const haMatch = cleaned.match(/^([\d.]+)\s*ha$/)
  if (haMatch) return Math.round(parseFloat(haMatch[1]) * 10000)
  const num = parseFloat(cleaned)
  return isNaN(num) ? null : Math.round(num)
}

function mapStatus(raw: any): string {
  if (!raw || raw === "—" || raw === "-") return "Available"
  const lower = String(raw).toLowerCase().replace(/[^\w\s]/g, "").trim()
  for (const [key, value] of Object.entries(STATUS_MAP)) {
    if (lower.includes(key)) return value
  }
  return "Available"
}

function detectSection(raw: string): { type: string; defaultStatus: string } | null {
  for (const section of SECTION_PATTERNS) {
    if (section.pattern.test(raw)) return { type: section.type, defaultStatus: section.defaultStatus }
  }
  return null
}

function isDataRow(row: any[]): boolean {
  const num = row[0]
  const title = row[1]
  if (typeof num === "number" && title && String(title).trim().length > 0) return true
  if (typeof num === "string" && /^\d+$/.test(num) && title && String(title).trim().length > 0) return true
  return false
}

async function importExcel(filePath: string) {
  console.log(`\n Reading file: ${filePath}`)
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`)
    process.exit(1)
  }

  const workbook = XLSX.readFile(filePath)
  const targetSheetName = workbook.SheetNames.find(
    (n) => n.includes("Cartera") || n.includes("Propiedades") || n.includes("cartera")
  ) || workbook.SheetNames[0]

  console.log(`   Sheet: "${targetSheetName}"`)
  const sheet = workbook.Sheets[targetSheetName]
  const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" })

  if (rows.length === 0) {
    console.error("No data found in the Excel file")
    process.exit(1)
  }

  const portfolioName = path.basename(filePath).replace(/\.(xlsx|xls)$/i, "")
  const portfolioType = portfolioName.toUpperCase().includes("PRO") ? "PRO" : "Standard"
  const isPro = portfolioType === "PRO"

  console.log(`\n Creating portfolio: "${portfolioName}" (${portfolioType})`)

  const { data: portfolio, error: portfolioError } = await supabase
    .from("portfolios")
    .insert({
      name: portfolioName,
      description: `Imported from ${path.basename(filePath)}`,
      year: new Date().getFullYear(),
      type: portfolioType,
      status: "Active",
    })
    .select()
    .single()

  if (portfolioError) {
    console.warn(`   Could not create portfolio via API: ${portfolioError.message}`)
  }

  const portfolioId = portfolio?.id || `import_${Date.now()}`

  let currentType = "House"
  let currentDefaultStatus = "Available"
  let created = 0
  let skipped = 0
  let errors = 0

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const firstCell = String(row[0] || "").trim()

    if (firstCell && !isDataRow(row) && !firstCell.startsWith("N°")) {
      const section = detectSection(firstCell)
      if (section) {
        currentType = section.type
        currentDefaultStatus = section.defaultStatus
      }
      continue
    }

    if (firstCell.startsWith("N°") || !isDataRow(row)) continue

    const title = String(row[1] || "").trim()
    if (!title) continue

    const price = parsePrice(row[3])
    if (price === null) {
      skipped++
      continue
    }

    let propertyStatus = currentDefaultStatus
    if (isPro && row[8]) {
      propertyStatus = mapStatus(row[8])
    }

    const areaM2 = parseArea(row[2])
    const notes = String(row[isPro ? 9 : 8] || "").trim()

    const propertyData: Record<string, any> = {
      title,
      price,
      type: currentType,
      status: propertyStatus,
      area_sq_ft: areaM2 ? Math.round(areaM2 * 10.764) : null,
      notes: notes || null,
      description: `Area: ${row[2] || "—"} | ${currentType} en ${currentDefaultStatus === "Rented" ? "alquiler" : "venta"} — ${title}`,
    }

    const { data: property, error: propError } = await supabase
      .from("properties")
      .insert(propertyData)
      .select()
      .single()

    if (propError) {
      console.error(`   Row ${i + 1}: "${title}" — ${propError.message}`)
      errors++
      continue
    }

    const { error: linkError } = await supabase
      .from("portfolio_properties")
      .insert({ portfolio_id: portfolioId, property_id: property.id })

    if (linkError) {
      console.warn(`   Row ${i + 1}: "${title}" — created but could not link: ${linkError.message}`)
    }

    created++
    if (created % 10 === 0) process.stdout.write(`   ${created} properties imported...\r`)
  }

  console.log(`\n\n Import Summary:`)
  console.log(`   Portfolio: ${portfolioName} (${portfolioType})`)
  console.log(`   Properties created: ${created}`)
  console.log(`   Skipped (no price): ${skipped}`)
  console.log(`   Errors: ${errors}`)
}

const fileArg = process.argv[2]
if (!fileArg) {
  console.error("Please provide the path to an Excel file")
  console.log("\nUsage:")
  console.log('  npx tsx scripts/import-cartera-excel.ts <path-to-excel-file>')
  console.log('\nExamples:')
  console.log('  npx tsx scripts/import-cartera-excel.ts "cartera-properties/Cartera Inmobiliaria 2026.xlsx"')
  console.log('  npx tsx scripts/import-cartera-excel.ts "cartera-properties/Cartera Inmobiliaria PRO 2026.xlsx"')
  process.exit(1)
}

const fullPath = path.resolve(process.cwd(), fileArg)
importExcel(fullPath).catch((err) => {
  console.error("Import failed:", err)
  process.exit(1)
})
