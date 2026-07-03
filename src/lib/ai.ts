import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

const LEAD_EXTRACTION_PROMPT = `Eres un asistente de bienes raíces. Recibes un mensaje de WhatsApp de un posible cliente.

Extrae la siguiente información en JSON válido. Solo responde JSON, sin markdown, sin explicaciones:
{
  "name": string | null,
  "email": string | null,
  "phone": string | null,
  "budget": number | null,
  "propertyType": string | null,
  "location": string | null,
  "bedrooms": number | null,
  "notes": string | null
}

Si el presupuesto viene en texto como "200k" o "$200,000", conviértelo a número.
Si algo no se menciona, usa null.`

const REPLY_PROMPT = `Eres un agente de bienes raíces profesional y amable en Perú.
El cliente acaba de enviar un mensaje por WhatsApp expresando interés en propiedades.

Según el análisis de su mensaje:
- Nombre: {name}
- Email: {email}
- Teléfono: {phone}
- Tipo de propiedad: {propertyType}
- Ubicación: {location}
- Presupuesto: {budget}
- Habitaciones: {bedrooms}
- Notas adicionales: {notes}

Responde de forma cortés, confirma que recibiste su información, y di que un asesor se comunicará pronto.
Máximo 3 oraciones. En español peruano natural, sin jerga excesiva.`

export interface ExtractedLead {
  name: string | null
  email: string | null
  phone: string | null
  budget: number | null
  propertyType: string | null
  location: string | null
  bedrooms: number | null
  notes: string | null
}

export async function extractLeadFromMessage(message: string): Promise<ExtractedLead> {
  if (!process.env.GEMINI_API_KEY) {
    return { name: null, email: null, phone: null, budget: null, propertyType: null, location: null, bedrooms: null, notes: message }
  }

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })
  const result = await model.generateContent([LEAD_EXTRACTION_PROMPT, message])
  const text = result.response.text().trim()
  const cleaned = text.replace(/```json\s*/i, "").replace(/```/g, "").trim()

  try {
    return JSON.parse(cleaned) as ExtractedLead
  } catch {
    return { name: null, email: null, phone: null, budget: null, propertyType: null, location: null, bedrooms: null, notes: message }
  }
}

export async function generateReply(lead: ExtractedLead): Promise<string> {
  if (!process.env.GEMINI_API_KEY) {
    return "¡Gracias por tu mensaje! Hemos recibido tu información y un asesor se comunicará contigo pronto."
  }

  const prompt = REPLY_PROMPT
    .replace("{name}", lead.name || "—")
    .replace("{email}", lead.email || "—")
    .replace("{phone}", lead.phone || "—")
    .replace("{propertyType}", lead.propertyType || "—")
    .replace("{location}", lead.location || "—")
    .replace("{budget}", lead.budget ? `$${lead.budget.toLocaleString()}` : "—")
    .replace("{bedrooms}", lead.bedrooms ? `${lead.bedrooms}` : "—")
    .replace("{notes}", lead.notes || "—")

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })
  const result = await model.generateContent(prompt)
  return result.response.text().trim()
}
