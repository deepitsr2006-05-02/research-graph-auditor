import { ExecutionContext } from '@nitrostack/core';
/**
 * Audit Prompts
 *
 * TODO: Add description
 */
export declare class AuditPrompts {
    helpPrompt(args: Record<string, unknown>, context: ExecutionContext): Promise<{
        role: "user";
        content: {
            type: "text";
            text: string;
        };
    }[]>;
}
//# sourceMappingURL=audit.prompts.d.ts.map