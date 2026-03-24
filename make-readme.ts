import { assertFilepathExists } from './src/utils/fs';
import fs from 'fs';
import { exec } from 'node:child_process';

const readmeTemplateName = 'READ_ME.template.md';
const readmeName = 'README.md';

assertFilepathExists(readmeTemplateName, p => `Readme template not found at: ` + p);

let content = fs.readFileSync(readmeTemplateName, 'utf-8');

exec('bun run cli --help', (err, stdout, stderr) => {
    if (err) {
        console.error(stderr);
        throw err;
    }

    content = content.replace('%help_output', stdout);

    fs.writeFileSync(readmeName, content);
});
