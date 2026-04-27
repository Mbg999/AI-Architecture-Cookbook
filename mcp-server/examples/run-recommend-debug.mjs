#!/usr/bin/env node
import { CookbookLoader } from '../dist/loader.js';
import { recommendPattern } from '../dist/tools/recommend-pattern.js';

const loader = new CookbookLoader();
const args = { context: { client_types: ['web'], needs_login: true }, domains: loader.getAllDomains().slice(0,6) };

const res = recommendPattern(loader, args);
console.log('recommendPattern returned', res.recommendations.length, 'recommendations');
console.log(JSON.stringify(res.recommendations, null, 2));
