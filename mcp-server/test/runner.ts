/**
 * Minimal test runner — zero dependencies.
 * Each test file exports a default async function.
 * Uses Node's built-in assert module.
 */

import { resolve, basename } from "node:path";
import { readdirSync } from "node:fs";

const testDir = resolve(import.meta.dirname);
const files = readdirSync(testDir)
  .filter((f) => f.endsWith(".test.ts") || f.endsWith(".test.js"))
  .sort();

let passed = 0;
let failed = 0;
const failures: { file: string; error: unknown }[] = [];

console.log(`\n${"=".repeat(60)}`);
console.log("AI Architecture Cookbook — MCP Server Tests");
console.log(`${"=".repeat(60)}\n`);

for (const file of files) {
  const mod = await import(`./${file}`);
  const suites: Record<string, () => Promise<void>> = mod.default ?? mod;

  for (const [name, fn] of Object.entries(suites)) {
    const label = `${basename(file, ".test.ts")} > ${name}`;
    try {
      await (fn as () => Promise<void>)();
      passed++;
      console.log(`  ✓ ${label}`);
    } catch (err) {
      failed++;
      failures.push({ file: label, error: err });
      console.log(`  ✗ ${label}`);
      console.log(`    ${err instanceof Error ? err.message : err}`);
    }
  }
}

console.log(`\n${"─".repeat(60)}`);
console.log(`Results: ${passed} passed, ${failed} failed, ${passed + failed} total`);

if (failures.length) {
  console.log(`\nFailure details:`);
  for (const f of failures) {
    console.log(`\n  ${f.file}:`);
    console.log(`    ${f.error}`);
  }
  process.exit(1);
}

console.log("\n✓ All tests passed.\n");
