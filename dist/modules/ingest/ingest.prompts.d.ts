import { ExecutionContext } from '@nitrostack/core';
/**
 * Ingest Prompts
 *
 * TODO: Add description
 */
export declare class IngestPrompts {
    helpPrompt(args: Record<string, unknown>, context: ExecutionContext): Promise<{
        role: "user";
        content: {
            type: "text";
            text: string;
        };
    }[]>;
}
//# sourceMappingURL=ingest.prompts.d.ts.map