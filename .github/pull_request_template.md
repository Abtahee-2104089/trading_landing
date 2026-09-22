# PR checklist (main-only releases, Kabir reviews)

- [ ] Branch name: `feat/cms-*` or `chore/cms-*` (short-lived, from `main`)
- [ ] Scope limited to my member folders (see CMS team plan §3) — otherwise pinged Kabir
- [ ] `bun run lint` + `bun run typecheck` + `bun run build` green locally
- [ ] `bun run test` green (or `--if-present` no-op documented)
- [ ] No secrets committed (`git status` checked, no `.env*`)
- [ ] Reviewer: Kabir requested. Do NOT push to GitHub until Kabir's QA gate passes.
