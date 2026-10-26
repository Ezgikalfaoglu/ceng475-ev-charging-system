// Pure logic of the ownership check (no file or git access), so it can be unit tested.
// A rule is a path: 'folder/' matches everything below it, any other string matches that exact file.
// The longest matching rule wins. Files nobody lists belong to the PM.

const matches = (rule, file) => (rule.endsWith('/') ? file.startsWith(rule) : file === rule);

const branchMatches = (pattern, branch) =>
  pattern.endsWith('/*') ? branch.startsWith(pattern.slice(0, -1)) : pattern === branch;

/** Which owner key (melike | berfin | eda | pm) works on this branch? null for unknown branches. */
export function ownerOfBranch(config, branch) {
  for (const [key, owner] of Object.entries(config.owners)) {
    if (owner.branches.some((pattern) => branchMatches(pattern, branch))) return key;
  }
  return null;
}

/** Which owner key owns this file? Returns 'pm' when no developer lists it. */
export function ownerOfFile(config, file) {
  let best = { key: 'pm', length: -1 };
  for (const [key, owner] of Object.entries(config.owners)) {
    if (key === 'pm') continue;
    for (const rule of owner.paths) {
      if (matches(rule, file) && rule.length > best.length) best = { key, length: rule.length };
    }
  }
  return best.key;
}

/**
 * Returns the list of violations: files a branch is not allowed to touch.
 * Unknown branches are treated as read-only (everything is a violation) so a typo cannot bypass the check.
 */
export function findViolations(config, branch, files) {
  const branchOwner = ownerOfBranch(config, branch);
  if (branchOwner === 'pm') return [];
  return files
    .filter((file) => !config.anyone.some((rule) => matches(rule, file)))
    .map((file) => ({ file, owner: ownerOfFile(config, file) }))
    .filter(({ owner }) => owner !== branchOwner)
    .map(({ file, owner }) => ({ file, owner, branchOwner }));
}
