import { type GraphState } from "../graph.ts";

// identifies if we want to transform the message to uppercase, lowercase or if the command is unknown, 
// we can use simple keyword matching for this example, but in a real application we could use a more sophisticated approach, 
// like a small LLM prompt to identify the intent of the message
export function identifyIntent(state: GraphState): GraphState {
    const input = state.messages.at(-1)?.text ?? ""
    const inputLower = input.toLowerCase()

    let command: GraphState['command'] = 'unknown'

    if(inputLower.includes('upper')) {
        command = 'uppercase'
    } else if (inputLower.includes('lower')) {
        command = 'lowercase'
    }

    return {
        ...state,
        command,
        output: input
    }

}