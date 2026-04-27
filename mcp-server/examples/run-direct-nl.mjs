import { CookbookLoader } from '../dist/loader.js';
import { recommendPatternNl } from '../dist/tools/recommend-pattern-nl.js';

const loader = new CookbookLoader();
console.error('CookbookLoader.repoRoot =', loader.repoRoot);

const args = {
  text: 'We operate a web application with user login, high security requirements, and sensitive personal data.'
};

const res = recommendPatternNl(loader, args);
console.log(JSON.stringify(res, null, 2));
