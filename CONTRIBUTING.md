# Contributing

This is a **closed-contribution repository**. All commits, branches, and releases are authored and maintained exclusively by:

**Karim** — [@Wooinxlkz](https://github.com/Wooinxlkz)

---

## For Users

If you find a bug or have a question about the library:

- **Bug reports:** Open a GitHub Issue describing the problem, steps to reproduce, and your environment.
- **Feature requests:** Open a GitHub Issue tagged `enhancement`. No guarantees, but all ideas are read.
- **Commercial inquiries / full app:** Email [karimsc01t@gmail.com](mailto:karimsc01t@gmail.com)

## Pull Requests

External pull requests are **not accepted** at this time.

If you have a specific fix or addition you'd like to see, open an Issue instead — if it makes sense, it will be implemented by the maintainer.

---

## Code Style (for the maintainer)

- TypeScript strict mode — no `any`, no `as unknown`.
- Pure functions preferred; side effects isolated to integration helpers.
- Each system in its own `lib/<system>/index.ts` file.
- JSDoc on every exported function.
- No runtime dependencies — the library ships zero dependencies.
