import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/huggingface_transformers";
import { CONFIG } from "./config.ts";
import { DocumentProcessor } from "./documentProcessor.ts";
import { type PretrainedOptions } from "@huggingface/transformers";
import { Neo4jVectorStore } from "@langchain/community/vectorstores/neo4j_vector";
import { ChatOpenAI } from "@langchain/openai";
import { AI } from "./ai.ts";
import { writeFile, mkdir } from 'node:fs/promises'

let _neo4jVectorStore = null

async function clearAll(vectorStore: Neo4jVectorStore, nodeLabel: string): Promise<void> {
    console.log("🗑️  Removing all existing documents...");
    await vectorStore.query(
        `MATCH (n:\`${nodeLabel}\`) DETACH DELETE n`
    )
    console.log("✅ Documents removed successfully\n");
}


try {
    console.log("🚀 Initializing Embeddings system with Neo4j...\n");

    const documentProcessor = new DocumentProcessor(
        CONFIG.pdf.path,
        CONFIG.textSplitter,
    )
    const documents = await documentProcessor.loadAndSplit()
    // HuggingFace Transformer Embeddings serves as the bridge between our text data and the Neo4j vector store, converting text into numerical vectors that can be efficiently stored and queried in Neo4j. 
    // By leveraging HuggingFace's powerful transformer models, we can generate high-quality embeddings that capture the semantic meaning of our documents, enabling us to perform advanced similarity searches and analyses within our Neo4j graph database.
    const embeddings = new HuggingFaceTransformersEmbeddings({
        model: CONFIG.embedding.modelName,
        pretrainedOptions: CONFIG.embedding.pretrainedOptions as PretrainedOptions
    })

    const nlpModel = new ChatOpenAI({
        temperature: CONFIG.openRouter.temperature,
        maxRetries: CONFIG.openRouter.maxRetries,
        modelName: CONFIG.openRouter.nlpModel,
        openAIApiKey: CONFIG.openRouter.apiKey,
        configuration: {
            baseURL: CONFIG.openRouter.url,
            defaultHeaders: CONFIG.openRouter.defaultHeaders
        }
    })

    _neo4jVectorStore = await Neo4jVectorStore.fromExistingGraph(
        embeddings,
        CONFIG.neo4j
    )

    clearAll(_neo4jVectorStore, CONFIG.neo4j.nodeLabel)
    for (const [index, doc] of documents.entries()) {
        console.log(`✅ Adding document ${index + 1}/${documents.length}`);
        await _neo4jVectorStore.addDocuments([doc])
    }
    console.log("\n✅ Database populated successfully!\n");


    // ==================== STEP 2: RUN SIMILARITY SEARCH ====================
    console.log("🔍 ETAPA 2: Executing search for similar documents...\n");
    const questions = [
        "What are tensors and how are they represented in JavaScript?",
        "How to convert JavaScript objects into tensors?",
        "What is data normalization and why is it necessary?",
        "How does a neural network work in TensorFlow.js?",
        "What does it mean to train a neural network?",
        "What is one-hot encoding and when to use it?"
    ]

    const ai = new AI({
        nlpModel,
        debugLog: console.log,
        vectorStore: _neo4jVectorStore,
        promptConfig: CONFIG.promptConfig,
        templateText: CONFIG.templateText,
        topK: CONFIG.similarity.topK,
    })

    for (const index in questions) {
        const question = questions[index]
        // console.log(`\n${'='.repeat(80)}`);
        // console.log(`📌 QUESTION: ${question}`);
        // console.log('='.repeat(80));

        const results = await ai.answerQuestion(question!)
        if(results.error) {
            console.log(`\n❌ Error: ${results.error}\n`);
            continue
        }

        console.log(`\n${results.answer}\n`);
        await mkdir(CONFIG.output.answersFolder, { recursive: true })

        const fileName = `${CONFIG.output.answersFolder}/${CONFIG.output.fileName}-${index}-${Date.now()}.md`

        await writeFile(fileName, results.answer!)
    }


    // Cleanup
    console.log(`\n${'='.repeat(80)}`);
    console.log("✅ Processing completed successfully!\n");

} catch (error) {
    console.error('error', error)
} finally {
    await _neo4jVectorStore?.close();
}