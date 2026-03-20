import {
    END,
    MessagesZodMeta,
    START,
    StateGraph,
} from '@langchain/langgraph'
import { withLangGraph } from '@langchain/langgraph/zod'
import { BaseMessage } from 'langchain'
import { z } from 'zod/v3'
import { identifyIntent } from './nodes/identifyIntentNode.ts'
import { chatResponseNode } from './nodes/chatResponseNode.ts'
import { upperCaseNode } from './nodes/upperCaseNode.ts'
import { lowerCaseNode } from './nodes/lowerCaseNode.ts'
import { fallbackNode } from './nodes/fallbackNode.ts'


//first we need to think about the app state

//the graph state will hold the conversation history, the output of the last node executed and the command identified by the identifyIntent node
// z.object is a zod schema that defines the shape of the graph state, we use withLangGraph to add the necessary metadata for the langgraph to 
// work with the messages array, which is an array of BaseMessage from langchain
const GraphState = z.object({
    messages: withLangGraph(
        z.custom<BaseMessage[]>(),
        MessagesZodMeta
    ),
    output: z.string(),
    command: z.enum(['uppercase', 'lowercase', 'unknown'])
})

// zod infer type for the graph state
// zod is a runtime type system, Typescript-first schema validation, so we can use it to validate the state at runtime
export type GraphState = z.infer<typeof GraphState>

//builds a langchain graph to handle the workflow of the application
export function buildGraph() {
    const workflow = new StateGraph({
        stateSchema: GraphState
    })
    

    // each node is a function that takes the graph state as input and returns a new graph state as output, 
    // the output of each node is stored in the graph state and can be used by the next nodes in the workflow
    // .addNode("identifyIntent", (state: GraphState) => {

    //     return {
    //         ...state,
    //         output: 'test',
    //     }
    // })
    .addNode("identifyIntent", identifyIntent)
    .addNode("chatResponse", chatResponseNode)
    .addNode("uppercase", upperCaseNode)
    .addNode("lowercase", lowerCaseNode)
    .addNode("fallback", fallbackNode)


    // each edge defines the flow of the workflow, in this case we start with the identifyIntent node, 
    // then we route to the chatResponse node, which will generate a response based on the identified intent, 
    // then we route to the upperCase or lowerCase node based on the command identified by the identifyIntent node, 
    // if the command is unknown we route to the fallback node
    .addEdge(START, "identifyIntent")
    .addConditionalEdges(
        "identifyIntent",
        (state: GraphState) => {
            switch(state.command) {
                case 'uppercase':
                    return 'uppercase';
                case 'lowercase':
                    return 'lowercase';
                default:
                    return 'fallback'
            }
        },
        {
            'uppercase': 'uppercase',
            'lowercase': 'lowercase',
            'fallback': 'fallback',
        }
    )
    .addEdge("uppercase", "chatResponse")
    .addEdge("lowercase", "chatResponse")
    .addEdge("fallback", "chatResponse")
    .addEdge("chatResponse", END)

    return workflow.compile();

}