import fs from 'fs';
import { assertFilepathExists } from './fs';

export function gerVersionOrThrow(): string {
    const filename = 'package.json';
    assertFilepathExists(filename, p => `Failed to determine version: ${p} not found`);

    let json;
    try {
        json = JSON.parse(fs.readFileSync(filename, 'utf-8'));
    } catch (err) {
        throw new Error(`Failed to determine version: failed to parse ${filename}`);
    }

    const version = json.version;
    if(!version)
        throw new Error("Failed to determine version: version is undefined or an empty string");

    return version;
}