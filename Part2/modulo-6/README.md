# This project simulates a sales report about courses bought by students

# It uses Langchain, Neo4J and OpenRouter 

Data (students, courses and sales) is fed to Neo4J DB at the start of the project for testing purposes
We then build a Graph on Langchain which will:
1 - Extract the user question - Eg: Which courses are commonly bought together?
2 - Feed it into a query planner - uses user and system prompts to feed LLM, which will generate Neo4J query and split it into subqueries if necessary
3 - Give the queries to the executor which will execute the Neo4J query
4a - If there are errors and the query is invalid, it will then use the correction to attempt to correct the query and re execute
4b - If it's a multi step query, it will run the generator again to generate next query and so on
5 - Once we have the query results, feed it to the LLM to analyse the results and give a "human" report