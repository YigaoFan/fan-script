import { appendFileSync, existsSync, unlinkSync } from "fs";
import { log } from "../util";

export class File {
    private mFilename: string;
    private mNeedImportIds: string[];
    private mImportPaths: [string, string][];
    private mDefinition: string;
    private mExports: string[];
    
    public static New(filename: string): File {
        return new File(filename);
    }

    private constructor(filename: string) {
        this.mFilename = filename;
        this.mDefinition = '';
        this.mImportPaths = [];
        this.mNeedImportIds = [];
        this.mExports = [];
    }

    /**
     * [filePath, exportIds]
     */
    public get Exports(): [string, string[]] {
        const fn = this.mFilename;
        return [fn.substring(0, fn.lastIndexOf('.')), this.mExports];
    }

    public AddDefinition(importsUsedByDef: string[], exports: string[], definition: string) {
        this.mDefinition = definition;
        this.mNeedImportIds = importsUsedByDef;
        this.mExports = exports;
    }

    public CompleteImportsFrom(...otherFilesExports: [string, string[]][]) {
        for (const id of this.mNeedImportIds) {
            let found = false;
            for (const exports of otherFilesExports) {
                if (exports[1].includes(id)) {
                    this.mImportPaths.push([id, exports[0]]);
                    found = true;
                    break;
                }
            }
            if (!found) {
                log('warn: not found id', id, 'which want to be imported in', this.mFilename);
            }
        }
        this.mNeedImportIds.length = 0;
    }

    public SaveToDisk() {
        if (existsSync(this.mFilename)) {
            unlinkSync(this.mFilename);
        }

        const importPathsRecord: Record<string, string[]> = {};
        for (const x of this.mImportPaths) {
            const p = x[1];
            if (!(p in importPathsRecord)) {
                importPathsRecord[p] = [];
            }
            importPathsRecord[p].push(x[0]);
        }
        for (const p in importPathsRecord) {
            appendFileSync(this.mFilename, `import { ${importPathsRecord[p].map(x => `${x}, `).join('')}} from "${p}";\n`);
        }

        appendFileSync(this.mFilename, this.mDefinition);
    }
}