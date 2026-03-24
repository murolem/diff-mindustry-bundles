#!/usr/bin/env node

import { program } from '@commander-js/extra-typings';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { assertDirpathExists, assertFilepathExists } from '../utils/fs';
import { clamp } from '../utils/clamp';
import { gerVersionOrThrow } from '../utils/getVersion';

Error.stackTraceLimit = 0;

program
    .name("diff-mindustry-bundles")
    .description("A handy utility to view missing/extra/untranslated keys between bundles.")
    .version(gerVersionOrThrow())
    .addHelpText("afterAll", chalk.gray(`\nVersion: ${gerVersionOrThrow()}`))
    .addHelpText("afterAll", chalk.gray("Repository: https://github.com/murolem/diff-mindustry-bundles"))
    .configureHelp({
        formatHelp(cmd, helper) {
            // Build custom help output
            const helpLines = [];

            // DESCRIPTION section
            helpLines.push(chalk.bold("DESCRIPTION"));
            helpLines.push(program.description());

            // USAGE section
            helpLines.push('');
            helpLines.push(chalk.bold("USAGE"));
            helpLines.push(helper.commandUsage(cmd));

            const padWidth = helper.padWidth(cmd, helper);

            // Add arguments if they exist
            if (program.arguments.length > 0) {
                helpLines.push('');
                helpLines.push(chalk.bold('ARGUMENTS'));

                program.registeredArguments.forEach(arg => {
                    const termPart = 
                        (arg.required ? '<' : '[')
                        + helper.argumentTerm(arg)
                        + (arg.required ? '>' : ']')

                    helpLines.push(
                        helper.formatItem(
                            termPart,
                            padWidth,
                            helper.argumentDescription(arg),
                            helper
                        )
                    );
                });
            }

            // Add options if they exist
            if (program.options.length > 0) {
                helpLines.push('');
                helpLines.push(chalk.bold('OPTIONS'));

                program.options.forEach(option => {
                    helpLines.push(
                        helper.formatItem(
                            helper.optionTerm(option),
                            padWidth, 
                            helper.optionDescription(option),
                            helper
                        )
                    );
                });
            }

            return helpLines.join('\n') + '\n'
        }
    })
    .argument('<top-bundle>', `Bundle with your localization (no extension). For example: 'bundle_ru'`)
    .argument('[base-bundle]', `Bundle to compare with.`, 'bundle')
    .option('--base-dir <dirpath>', `Path to the directory containing ${chalk.bold('Mindustry')}`, '.')
    .option('--bundles-dir <dirpath>', `Path to the directory containing ${chalk.bold('bundles')}. Relative to the base directory.`, path.normalize('./core/assets/bundles'))
    .action((topBundleNameShort, baseBundleNameShort, opts) => {
        const baseDpResolved = path.resolve(opts.baseDir);
        const bundlesDpResolved = path.resolve(path.join(baseDpResolved, opts.bundlesDir));

        console.log("   Mindustry directory: " + baseDpResolved);
        console.log("Looking for bundles at: " + bundlesDpResolved);

        assertDirpathExists(baseDpResolved, "Mindustry directory not found.");
        assertDirpathExists(bundlesDpResolved, "Bundles directory not found.");

        const topBundleFn = topBundleNameShort + '.properties';
        const baseBundleFn = baseBundleNameShort + '.properties';

        const topBundleFp = assertFilepathExists(path.join(bundlesDpResolved, topBundleFn), p => `Top bundle not found at: ${p} \n- Bundle filename: ${topBundleFn}`);
        const baseBundleFp = assertFilepathExists(path.join(bundlesDpResolved, baseBundleFn), p => `Base bundle not found at: ${p} \n- Bundle filename: ${baseBundleFn}`);

        const topBundle = parseBundle(fs.readFileSync(topBundleFp, 'utf-8'));
        const baseBundle = parseBundle(fs.readFileSync(baseBundleFp, 'utf-8'));

        const diff = diffBundles(topBundle, baseBundle);

        const formatDiffLog = (msg: string, diff: Bundle, prefix: string) => {
            const tabSize = 10;
            const tab = ' '.repeat(tabSize);

            const diffLen = Object.keys(diff).length;
            const diffFmted = Object.entries(diff)
                .map(([key, { string: value, line }]) => {
                    const leftPadSpaces = ' '.repeat(clamp(tabSize - line.toString().length, 0, Infinity));
                    const leftPadChars = leftPadSpaces + chalk.gray(line) + " " + prefix + ' ';
                    const allNoValue = leftPadChars + key + ' = ';
                    return allNoValue + value;
                })
                .join("\n");

            const header = chalk.bold(`    ${msg} (${diffLen}):`);
            const headerEnd = chalk.bold(msg);
            
            // const header = `${msg} ${chalk.bold(baseBundleName)} -> ${chalk.bold(topBundleName)} (${diffLen}):`;
            return `${header} \n${diffLen === 0 ? tab + chalk.italic('none') : diffFmted} \n${chalk.bold('END')} ${headerEnd}\n`;
        }

        console.log('')
        console.log(formatDiffLog(`Untranslated strings`, diff.unchanged, chalk.gray("~")));
        console.log(formatDiffLog(`Extra strings`, diff.added, chalk.green("+")))
        console.log(formatDiffLog(`Missing strings`, diff.removed, chalk.red("-")))
        console.log(`Strings in top bundle: ${Object.keys(topBundle).length}`);
        console.log(`Strings in base bundle: ${Object.keys(baseBundle).length}`);
    })
    .parse();

// ============

type Bundle = Record<string, { string: string, line: number }>;

function diffBundles(top: Bundle, base: Bundle): { removed: Bundle, added: Bundle, unchanged: Bundle } {
    const removed = findMissing(top, base);
    const added = findMissing(base, top);
    const unchanged = findMatching(top, base);

    return { removed, added, unchanged }

    function findMissing(top: Bundle, base: Bundle): Bundle {
        const missingInTop: Bundle = {}
        for (const key in base) {
            if (key in top) {
                // ok
            } else {
                missingInTop[key] = base[key]!;
            }
        }
        return missingInTop;
    }

    function findMatching(top: Bundle, base: Bundle): Bundle {
        const res: Bundle = {};
        for (const key in base) {
            if (key in top && top[key]!.string === base[key]!.string) {
                res[key] = base[key]!;
            }
        }
        return res;
    }
}

function parseBundle(bundle: string): Bundle {
    return bundle
        .split("\n")
        .reduce<Bundle>((acc, line, lineIdx) => {
            const trimmed = line.trim();
            if (trimmed === '' || trimmed.startsWith('#'))
                return acc;

            let [key, ...value] = trimmed.split("=");
            if (value.length === 0)
                throw new Error(`Bundle parsing failed: encountered a line not in key=value format: key '${key}'`);

            acc[key!.trim()] = { string: value.join("=").trim(), line: lineIdx + 1 }

            return acc;
        }, {})
}