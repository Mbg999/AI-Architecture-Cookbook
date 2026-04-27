#!/usr/bin/env node
import { CookbookLoader } from '../dist/loader.js';

const loader = new CookbookLoader();
const text = 'We operate a web application with user login, high security requirements, and sensitive personal data.';

console.error('Repo root:', loader.repoRoot);
const hits = loader.searchByQuery(text);
console.log('searchByQuery hits:', JSON.stringify(hits.map(h => h.domain), null, 2));

const all = loader.getAllDomains();
console.log('getAllDomains (count):', all.length);

const domains = loader.getAllDomains().slice(0,6);
console.log('first 6 domains:', JSON.stringify(domains, null, 2));
