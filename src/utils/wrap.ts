import { clamp } from './clamp';

export function wrapStringToTerminalWidth(str: string, leftPadLen: number) {
    const minContentCols = 10;

    let totalCols = process.stdout.columns;
    let contentCols = totalCols - leftPadLen;
    if(contentCols < minContentCols) {
        contentCols = Math.min(minContentCols, totalCols);
        leftPadLen = clamp(Math.min(leftPadLen, totalCols - contentCols), 0, Infinity);
    }

    const leftPad = ' '.repeat(leftPadLen);
    
    const out: string[] = [];
    let accum = str;
    while(accum.length > 0) {
        const slice = accum.slice(0, contentCols);
        accum = accum.slice(contentCols);

        if(out.length === 0)
            out.push(slice);
        else
            out.push(leftPad + slice);
    }

    return out.join('\n');
}