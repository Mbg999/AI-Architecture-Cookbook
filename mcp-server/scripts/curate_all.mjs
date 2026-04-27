#!/usr/bin/env node
import fs from 'fs/promises'
import path from 'path'
import yaml from 'js-yaml'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '..', '..')
const curatedPath = path.join(repoRoot, 'mcp-server', 'data', 'curated-prompt-recipes.yaml')

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const files = []
  for (const e of entries) {
    // skip node_modules and .git and aidlc-docs and mcp-server/data
    if (e.name === 'node_modules' || e.name === '.git' || e.name === 'aidlc-docs') continue
    const full = path.join(dir, e.name)
    if (e.isDirectory()) {
      files.push(...(await walk(full)))
    } else {
      if (full.endsWith('.yaml') || full.endsWith('.yml')) files.push(full)
    }
  }
  return files
}

function makePrompt(domainObj) {
  const desc = (domainObj.meta && domainObj.meta.description) ? domainObj.meta.description.trim() : ''
  const inputs = Array.isArray(domainObj.context_inputs) ? domainObj.context_inputs : []

  const ctxLines = inputs.map(ci => {
    const parts = []
    parts.push(ci.name)
    parts.push(`(${ci.type}${ci.required ? ', required' : ''}${ci.default ? ', default: ' + ci.default : ''})`)
    if (ci.enum_values) parts.push(`choices: ${ci.enum_values.join(', ')}`)
    return `- ${parts.join(' ')}${ci.description ? ' — ' + ci.description : ''}`
  })

  return [
    `You are an expert in ${domainObj.meta?.domain || 'this domain'}.`,
    '',
    desc ? `Description: ${desc}` : null,
    '',
    'Context placeholders (provide values for the following):',
    ...ctxLines,
    '',
    'Task: Based on the description and context values, provide:',
    '- Top recommended architectural patterns and a one-paragraph rationale.',
    '- Key tradeoffs (pros/cons).',
    '- A short implementation checklist (3–6 items).',
    '- A brief example snippet or configuration as an illustration.',
    '',
  ].filter(Boolean).join('\n')
}

async function main() {
  const allYamlFiles = await walk(repoRoot)

  // Load existing curated recipes if present
  let curated = {}
  try {
    const raw = await fs.readFile(curatedPath, 'utf8')
    curated = yaml.load(raw) || {}
  } catch (err) {
    // no file yet — start fresh
    curated = {}
  }

  let added = 0

  for (const f of allYamlFiles) {
    // skip the curated file itself
    if (path.resolve(f) === path.resolve(curatedPath)) continue

    let text
    try {
      text = await fs.readFile(f, 'utf8')
    } catch (err) {
      continue
    }

    let doc
    try {
      doc = yaml.load(text)
    } catch (err) {
      continue
    }

    if (!doc || !doc.meta || !doc.meta.domain) continue
    const domain = doc.meta.domain

    // ensure array exists
    const existing = curated[domain]
    const hasAuto = Array.isArray(existing) && existing.some(e => e && e.id && String(e.id).startsWith(`curated_${domain}_auto`))
    if (hasAuto) continue

    const recipe = {
      id: `curated_${domain}_auto_v1`,
      scenario: 'greenfield',
      description: `Auto-generated curated prompt for ${domain} (synthesized from domain metadata).`,
      prompt: makePrompt(doc)
    }

    if (!Array.isArray(curated[domain])) curated[domain] = []
    curated[domain].push(recipe)
    added++
  }

  // write back
  const out = yaml.dump(curated, { lineWidth: 120 })
  await fs.mkdir(path.dirname(curatedPath), { recursive: true })
  await fs.writeFile(curatedPath, out, 'utf8')

  console.log(`Curated recipes updated. Added ${added} new entries to ${curatedPath}`)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
