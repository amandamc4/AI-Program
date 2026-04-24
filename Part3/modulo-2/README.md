# Modulo 2 Exercise 1

This module uses LangGraph to identify the intent of the user - in this example it will ask to rank top 5 products or total revenue from sales data in cvs files. It will then use provided MCP tools (MongoDb, filesystem and cvs to Json) to read the csv file, optionally convert it to Json, create a document in MongoDB and add sales data, run some query (aggregation) to find results, and finally write the results into a text file.
