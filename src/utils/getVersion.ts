import fs from 'fs';
import { assertFilepathExists } from './fs';

declare const VERSION: string;

export function gerVersionOrThrow(): string {
    try {
        const version = VERSION;
        return version;
    } catch (err) {
        // pass
    }
    
    const filename = 'package.json';
    assertFilepathExists(filename, p => `Failed to determine version: ${p} not found and no version was baked`);

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