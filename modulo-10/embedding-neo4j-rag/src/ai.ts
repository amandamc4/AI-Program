import { type Neo4jVectorStore } from "@langchain/community/vectorstores/neo4j_vector";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { ChatOpenAI } from "@langchain/openai";

type DebugLog = (...args: unknown[]) => void;
type params = {
    debugLog: DebugLog,
    vectorStore: Neo4jVectorStore,
    nlpModel: ChatOpenAI,
    promptConfig: any,
    templateText: string,
    topK: number,
}

interface ChainState {
    question: string;
    context?: string;
    topScore?: number;
    error?: string;
    answer?: string;
}

export class AI {
    private params: params
    constructor(params: params) {
        this.params = params
    }

    async retrieveVectorSearchResults(input: ChainState): Promise<ChainState> {
        this.params.debugLog("🔍 Searching Neo4j vector store ...");
        // with score returns an array of tuples, where each tuple contains a document and its corresponding similarity score. 
        // The similarity score indicates how closely the document matches the input query, with higher scores representing greater relevance. 
        // This allows us to not only retrieve relevant documents but also to rank them based on their relevance to the query.
        const vectorResults = await this.params.vectorStore.similaritySearchWithScore(input.question, this.params.topK);

        /**
         * vectorResults: [
         *  [Document {pageContent: '...', metadata: {...}}], 0.85],
         *  [Document {pageContent: '...', metadata: {...}}], 0.78],
         *   ...
         * ]
         */

        if (!vectorResults.length) {
            this.params.debugLog("⚠️  No results found in the vector store.");
            return {
                ...input,
                error: "Sorry, I couldn't find any relevant information about that question in the knowledge base."
            };
        }

        const topScore = vectorResults[0]![1]
        this.params.debugLog(`✅ Found ${vectorResults.length} relevant results (best score: ${topScore.toFixed(3)})`);

        const contexts = vectorResults
            .filter(([, score]) => score > 0.5)
            .map(([doc]) => doc.pageContent)
            .join("\n\n---\n\n");

        return {
            ...input,
            context: contexts,
            topScore,
        }
    }

    async generateNLPResponse(input: ChainState): Promise<ChainState> {
        if (input.error) return input
        this.params.debugLog("🤖 Generating response with AI...");

        const responsePrompt = ChatPromptTemplate.fromTemplate(
            this.params.templateText
        )
        const responseChain = responsePrompt
            .pipe(this.params.nlpModel)
            .pipe(new StringOutputParser())

        const rawResponse = await responseChain.invoke({
            role: this.params.promptConfig.role,
            task: this.params.promptConfig.task,
            tone: this.params.promptConfig.constraints.tone,
            language: this.params.promptConfig.constraints.language,
            format: this.params.promptConfig.constraints.format,
            instructions: this.params.promptConfig.instructions.map((instruction: string, idx: number) =>
                `${idx + 1}. ${instruction}`
            ).join('\n'),
            question: input.question,
            context: input.context
        })

        return {
            ...input,
            answer: rawResponse,
        }
    }
    async answerQuestion(question: string) {
        const chain = RunnableSequence.from([
            this.retrieveVectorSearchResults.bind(this),
            this.generateNLPResponse.bind(this)
        ])

        //invoke passes the question object to the first function in the chain (retrieveVectorSearchResults), which processes it and passes its output to the next function (GenerateNLPResponse), and so on until we get the final answer. 
        //The debug logs are interleaved within the functions to provide insights into each step of the process.
        const result = await chain.invoke({ question })
        this.params.debugLog("\n🎙️  Question:");
        this.params.debugLog(question, "\n");
        this.params.debugLog("💬 Answer:");
        this.params.debugLog(result.answer || result.error, "\n");
        return result

    }
}