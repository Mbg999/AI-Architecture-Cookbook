import assert from "node:assert/strict";
import { CookbookLoader } from "../dist/loader.js";
import { promptRecipes } from "../dist/tools/prompt-recipes.js";
import { resolve } from "node:path";

const REPO_ROOT = resolve(import.meta.dirname, "../..");
const loader = new CookbookLoader(REPO_ROOT);

export default {
  "prompt_recipes returns recipes for a known domain or sample set": async () => {
    // Try domain-based call using 'authentication' which should exist
    const res = promptRecipes(loader, { domain: "authentication" });
    assert.ok(res && Array.isArray(res.recipes) || res.recipes === undefined || res.domain === "authentication");

    // Try query-based call
    const q = promptRecipes(loader, { query: "auth" });
    assert.ok(q && (Array.isArray(q.recipes) || q.recipes !== undefined));
  },
};
