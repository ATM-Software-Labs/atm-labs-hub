const fs = require('fs');
const content = fs.readFileSync('functions/api/projects.js', 'utf-8');
const execContent = content.replace('export async function onRequestGet(context)', 'async function runTest()')
                           .replace('export async function onRequestOptions', 'async function runTestOptions');
eval(execContent + "\n\nconsole.log(fallbackCatalog().map(p => p.id));");
