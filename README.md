## Part 1 - AI Fundamentals

# Module 2
Practice learning with Tensorflow

# Module 3
Product Recommendation system with Tensorflow

# Module 4
Using Yolo model trained to analyse screen/objects of DuckHunt game, converting the model to Tensorflow and then using it to find the coordinates of the ducks in the game and aim

# Module 5
Enables AI chatbot on Chrome - sets AI and translator for browser chat. The AI models need to be downladed on the user's computer

# Module 8
Prompt practices and examples. 
Project is a NextJs + SQLite + Better Auth project created with a prompt and using Context7 MCP server. It shows a initial page with an option to login with Github. It saves the user session info in SQLite. 

Ollama and OpenRouter - examples of usage with curl requests

# Modulo 10
This example gets a pdf document, split into chunks (1000 characters) and transformed into embeddings, saving them in Neo4j
Then Neo4j retrieves similar embeddings according to each question made. 

## Part 2 - Generative AI API's and Prompt Engineering

# Modulo 1
Using Openrouter SDK to chat 

# Modulo 2
LangGraph usage - creating Nodes and Edges on LangGraph and visualizing with LangSmith

# Modulo 3
Demonstration of **prompt engineering** with LangChain using structured outputs and conditional edges to capture user's intent for an appointment booking system

# Modulo 4
Demonstration of **LangGraph memory persistence** using conversational AI to recommend music based on user preferences. This project showcases how to build stateful, multi-turn conversations where the AI remembers context across messages. It saves users preferences in SQLite and message summaries in Postgres

# Modulo 5
Educational demonstration of **prompt injection attacks** and **guardrail defenses** in LLM-powered applications

# Modulo 6
Sales report about courses bought by students. Data stored in Neo4J vector DB, using Langchain to build a graph which will build sql queries to find relevant data in Neo4J based on user's question. It can break a question into smaller subqueries and feed it into the query executor, finally using a response analyser to build a human report. 

# Modulo 7
Using LLM to analyze midia (pdf document) to answer questions

## Part 3 - MCPs

# Modulo 2 - Exercise 1
This module uses LangGraph to identify the intent of the user - in this example it will ask to rank top 5 products or total revenue from sales data in cvs files. It will then use provided MCP tools (MongoDb, filesystem and cvs to Json) to read the csv file, optionally convert it to Json, create a document in MongoDB and add sales data, run some query (aggregation) to find results, and finally write the results into a text file.

# Modulo 2 - Exercise 2
LangGraph agent that wraps SerpAPI Google Trends as a LangChain tool to answer video content strategy questions. It then analyses the trends and uses AI to generate a report and suggestion of best titles, content, etc

# Modulo 3
Create different type of AI agents with instructions for specific tasks in VSCode
Add skills in VSCode

# Modulo 4
Create an MCP server (Stdio transport) for encryption/decryption using a passphrase. Create server, register tools, register resource info and prompt.

# Modulo 5
A CRUD server for customer using Fastify and MongoDB
A MCP server that wraps this CRUD server

# Modulo 6
A CRUD server for customer using Fastify and MongoDB with added JWT token for Authentication and role based authorization supported by Fastify plugin
A MCP server that wraps this CRUD server - uses service token to make API calls to the CRUD service

# Modulo 7 
Commands to publish the MCP server to private NPM registry

# Modulo 8
A Langchain agent that uses the MCP server tools to manage customers


