export type Material = {
  name: string
  confidence: number
  properties: string[]
}

export type DetectionResponse = { materials: Material[] }

const apiBase = import.meta.env.VITE_API_URL ?? ''

export async function compressImage(file: File, maxSize = 1280, quality = .78): Promise<string> {
  const source = await createImageBitmap(file)
  const scale = Math.min(1, maxSize / Math.max(source.width, source.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(source.width * scale))
  canvas.height = Math.max(1, Math.round(source.height * scale))
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Your browser could not prepare this image.')
  context.drawImage(source, 0, 0, canvas.width, canvas.height)
  source.close()
  return canvas.toDataURL('image/jpeg', quality)
}

export async function detectMaterials(image: string, signal?: AbortSignal): Promise<DetectionResponse> {
  const response = await fetch(`${apiBase}/api/materials/detect`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image }),
    signal,
  })
  if (!response.ok) throw new Error('The material scanner is taking a break. Try the demo pile instead.')
  return response.json() as Promise<DetectionResponse>
}

export const demoMaterials: DetectionResponse = {
  materials: [
    { name: 'cardboard', confidence: .94, properties: ['flat', 'lightweight', 'cuttable'] },
    { name: 'straw', confidence: .91, properties: ['hollow', 'rigid', 'lightweight'] },
    { name: 'pencil', confidence: .88, properties: ['rigid', 'rollable', 'lightweight'] },
    { name: 'tape', confidence: .97, properties: ['connective', 'flexible'] },
    { name: 'paper', confidence: .89, properties: ['flat', 'lightweight', 'foldable'] },
  ],
}