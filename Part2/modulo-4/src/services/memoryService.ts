import { PostgresSaver } from "@langchain/langgraph-checkpoint-postgres"
import { PostgresStore } from "@langchain/langgraph-checkpoint-postgres/store"
import { config } from "../config.ts"

//checkpoint - used to save the state of the graph execution at a given point, so it can be resumed later from that point. 
// Useful for long-running conversations or when you want to persist the conversation state across sessions.
export type MemoryService = {
    checkpointer: PostgresSaver
    store: PostgresStore
}

export async function createMemoryService(): Promise<MemoryService> {
    const dbUri = config.memory.dbUri
    const store = PostgresStore.fromConnString(dbUri)
    const checkpointer = PostgresSaver.fromConnString(dbUri)

    await store.setup()
    await checkpointer.setup()

    console.log(`✅ Memory Configured: PostgreSQL`);
    return {
        checkpointer,
        store,
    }


}