#!/usr/bin/env node
import { resolve } from 'node:path';
import { CookbookLoader } from '../dist/loader.js';
import { recommendPatternNl } from '../dist/tools/recommend-pattern-nl.js';

const REPO_ROOT = resolve(new URL('.', import.meta.url).pathname, '../..');
console.error('Computed REPO_ROOT (debug):', REPO_ROOT);
const loader = new CookbookLoader(REPO_ROOT);

const text = 'Recommend the top 3 architecture patterns for an enterprise web+mobile application that requires user login and has real-time features.';
const res = recommendPatternNl(loader, { text });
console.log(JSON.stringify(res, null, 2));
