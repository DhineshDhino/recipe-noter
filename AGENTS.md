<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:git-workflow-rules -->
# Git Workflow Convention

**ALWAYS follow this branching and PR workflow when working on any story:**

1. **Branch Naming:** Before starting ANY story, create a branch from `main` using the format:
   `feature/story-{N}-{short-slug}` (e.g., `feature/story-5-global-yield-scaling`)

2. **Commit Convention:** Use semantic commit prefixes:
   - `feat:` for new features
   - `fix:` for bug fixes
   - `test:` for test additions/changes
   - `chore:` for tooling/docs/refactors

3. **PR Requirement:** When a story is complete (all tasks done, all tests passing), push the branch and instruct the user to create a PR to merge into `main`. Include a brief summary of what changed.

4. **Workflow Steps:**
   ```
   git checkout main && git pull
   git checkout -b feature/story-{N}-{slug}
   # ... do all work ...
   git add . && git commit -m "feat: ..."
   git push -u origin feature/story-{N}-{slug}
   # → Notify user to open PR on GitHub
   ```
<!-- END:git-workflow-rules -->
