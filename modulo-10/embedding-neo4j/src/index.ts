import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/huggingface_transformers";
import { CONFIG } from "./config.ts";
import { DocumentProcessor } from "./documentProcessor.ts";
import { type PretrainedOptions } from "@huggingface/transformers";
import { Neo4jVectorStore } from "@langchain/community/vectorstores/neo4j_vector";
import { displayResults } from "./util.ts";

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
    // const response = await embeddings.embedQuery(
    //     "JavaScript"
    // )
    // const response = await embeddings.embedDocuments([
    //     "JavaScript"
    // ])
    // console.log('response', response)

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
        "O que são tensores e como são representados em JavaScript?",
        "Como converter objetos JavaScript em tensores?",
        "O que é normalização de dados e por que é necessária?",
        "Como funciona uma rede neural no TensorFlow.js?",
        "O que significa treinar uma rede neural?",
        "O que é hot enconding e quando usar?"
    ]

    for (const question of questions) {
        console.log(`\n${'='.repeat(80)}`);
        console.log(`📌 QUESTION: ${question}`);
        console.log('='.repeat(80));

        const results = await _neo4jVectorStore.similaritySearch(
            question,
            CONFIG.similarity.topK
        )
        displayResults(results)
        // console.log(results)
    }


    // Cleanup
    console.log(`\n${'='.repeat(80)}`);
    console.log("✅ Processing completed successfully!\n");

} catch (error) {
    console.error('error', error)
} finally {
    await _neo4jVectorStore?.close();
}