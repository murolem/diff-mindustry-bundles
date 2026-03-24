# diff-mindustry-bundles

A CLI utility to view missing/extra/untranslated keys between bundles (localizations) for Mindustry.

# Requirements

The utility is hosted on NPM, so to run it you will:
- A JS package manager that can run packages, so `npm` (`npx`), `bun` (`bunx`), etc. 
- Local Mindustry repository.

# Usage

The readme will assume usage of `npm` (`npx`).

Navigate to the Mindustry repository you've cloned locally.

Then run:
```bash
npx diff-mindustry-bundles <translation_bundle>
```
where `<translation_bundle>` is the name of a bundle you want to check (no extension), for example: `bundle_de`.
```bash
npx diff-mindustry-bundles bundle_de
```

Available options:
```bash
DESCRIPTION
A handy utility to view missing/extra/untranslated keys between bundles.

USAGE
diff-mindustry-bundles [options] <top-bundle> [base-bundle]

ARGUMENTS
  <top-bundle>             Bundle with your localization (no extension). For
                           example: 'bundle_ru'
  [base-bundle]            Bundle to compare with. (default: "bundle")

OPTIONS
  -V, --version            output the version number
  --base-dir <dirpath>     Path to the directory containing Mindustry (default:
                           ".")
  --bundles-dir <dirpath>  Path to the directory containing bundles. Relative to
                           the base directory. (default: "core/assets/bundles")

Version: 1.0.7
Repository: https://github.com/murolem/diff-mindustry-bundles

```
