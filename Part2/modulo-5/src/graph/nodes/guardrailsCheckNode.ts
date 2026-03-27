import { OpenRouterService } from '../../services/openrouterService.ts';
import type { GraphState } from '../state.ts';
import { PromptTemplate } from '@langchain/core/prompts';
import { prompts } from '../../config.ts';


export const createGuardrailsCheckNode = (openRouterService: OpenRouterService) => {
    return async (state: GraphState): Promise<Partial<GraphState>> => {
        console.log('STATE IN GUARDRAILS CHECK NODE:', JSON.stringify(state, null, 2))
        try {
            const userPrompt = state.messages.at(-1)?.text!
            const template = PromptTemplate.fromTemplate(prompts.system)

            const systemPrompt = await template.format({
                USER_ROLE: state.user.role,
                USER_NAME: state.user.displayName
            })

            const msg = systemPrompt.concat('\n', userPrompt)

            const result = await openRouterService.checkGuardRails(
                msg,
                state.guardrailsEnabled,
            )

            return {
                guardrailCheck: result
            };

        } catch (error) {
            console.error('Guardrails check failed:', error);
            return {
                guardrailCheck: {
                    safe: false
                },
            };
        }
    }
}
