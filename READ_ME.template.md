# diff-mindustry-bundles

A CLI utility to view missing/extra/untranslated keys between bundles (localizations) for Mindustry.

# Requirements

The utility is hosted on NPM, so to run it you will need:
- A JS package manager that can run packages, so `npm` (`npx`), `bun` (`bunx`), etc. 
- Mindustry repository cloned locally.

# Usage

The readme will assume usage of `npm` (`npx`).

Navigate to the Mindustry repository you've cloned locally.

Then run:
```bash
npx diff-mindustry-bundles@latest <translation_bundle>
```
where `<translation_bundle>` is the name of a bundle you want to check (no extension), for example: `bundle_de`.
```bash
npx diff-mindustry-bundles@latest bundle_de
```

Available options:
```bash
%help_output
```
