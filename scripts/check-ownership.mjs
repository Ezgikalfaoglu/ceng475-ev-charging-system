// Fails when a branch changes files that belong to another team member. OWNER: PM.
//
//   npm run check:ownership                      compares HEAD with origin/main (or main)
//   npm run check:ownership -- --base main       choose the base ref
//   npm run check:ownership -- --branch dev/berfin-ozcelik   pretend to be this branch
//
// Rules live in ownership.json. Same-file edits by two people are what cause merge conflicts,
// so this check runs locally before a pull request and in CI on every pull request.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { findViolations, ownerOfBranch } from './ownership.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const args = process.argv.slice(2);
const option = (name) => {
  const index = args.indexOf(`--${name}`);
  return index === -1 ? null : args[index + 1];
};

const git = (...gitArgs) => execFileSync('git', gitArgs, { cwd: root, encoding: 'utf8' }).trim();
const refExists = (ref) => {
  try {
    git('rev-parse', '--verify', '--quiet', ref);
    return true;
  } catch {
    return false;
  }
};

const config = JSON.parse(readFileSync(new URL('../ownership.json', import.meta.url), 'utf8'));
const branch = option('branch') ?? process.env.GITHUB_HEAD_REF ?? git('rev-parse', '--abbrev-ref', 'HEAD');
const base = option('base') ?? [process.env.GITHUB_BASE_REF && `origin/${process.env.GITHUB_BASE_REF}`, 'origin/main', 'main'].filter(Boolean).find(refExists);

if (!base) {
  console.log('Ownership check skipped: no base branch (main) found to compare with.');
  process.exit(0);
}

const owner = ownerOfBranch(config, branch);
if (owner === 'pm') {
  console.log(`Branch "${branch}" is a PM branch: every file is allowed.`);
  process.exit(0);
}

const changed = git('diff', '--name-only', `${base}...HEAD`).split('\n').filter(Boolean);
const violations = findViolations(config, branch, changed);

if (violations.length === 0) {
  console.log(`Ownership check passed for "${branch}" (${changed.length} changed file${changed.length === 1 ? '' : 's'} compared with ${base}).`);
  process.exit(0);
}

console.error(`Ownership check FAILED for "${branch}". These files belong to someone else:\n`);
for (const { file, owner: fileOwner } of violations) {
  console.error(`  ${file}   (owner: ${config.owners[fileOwner].name})`);
}
if (!owner) console.error(`\n"${branch}" is not a known branch name. Use one listed in ownership.json.`);
console.error('\nAsk the owner to make the change, or ask the PM to approve an exception through a PM pull request.');
process.exit(1);
