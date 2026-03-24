import fs from 'fs';

export function assertFilepathExists(pathStr: string, msg?: string | ((pathStr: string) => string)) {
    if (fs.existsSync(pathStr) && fs.statSync(pathStr).isFile())
        return pathStr;

    const msgRes = msg
        ? typeof msg === 'string'
            ? msg
            : msg(pathStr)
        : "Path not found or is not a file: " + pathStr;

    throw new Error(msgRes);
}

export function assertDirpathExists(pathStr: string, msg?: string | ((pathStr: string) => string)) {
    if (fs.existsSync(pathStr) && fs.statSync(pathStr).isDirectory())
        return pathStr;

    const msgRes = msg
        ? typeof msg === 'string'
            ? msg
            : msg(pathStr)
        : "Path not found or is not a directory: " + pathStr;

    throw new Error(msgRes);
}