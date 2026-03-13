## Langchain processor + Huggingface transformer + Neo4j project

This example gets a pdf document, split into chunks (1000 characters) and transformed into embeddings, saving them in Neo4j
Then Neo4j retrieves similar embeddings according to each question made. 