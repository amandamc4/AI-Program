import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { HumanMessage } from '@langchain/core/messages';
import { buildGraph } from './graph/factory.ts';

function parseArgs(): { userId?: string } {
  const args = process.argv.slice(2);
  const userIndex = args.indexOf('--user');

  if (userIndex !== -1 && args[userIndex + 1]) {
    return { userId: args[userIndex + 1] };
  }

  return {};
}

async function main(): Promise<void> {
  const readline = createInterface({ input: stdin, output: stdout });

  try {
    console.log('═'.repeat(60));
    console.log('  🎵 Music recommender - Music Recommendation with Memory (LangGraph)');
    console.log('═'.repeat(60));
    console.log('\n Enter your messages below. Type "exit" to quit.\n');

    const { graph, preferencesService } = await buildGraph();

    const { userId } = parseArgs();
    const actualUserId = userId || 'anonymous';
    const threadId = `${actualUserId}-${Date.now()}`;
    const config = {
      configurable: { thread_id: threadId },
      context: { userId: actualUserId }
    };

    console.log(`👤 User: ${actualUserId}`);
    console.log(`💬 Conversation Thread: ${threadId}\n`);

    const userContext = await preferencesService.getBasicInfo(actualUserId);
    if (userContext) {
      console.log(`📚 User Information Loaded:\n${userContext}\n`);
    }

    try {
      const initialMessage = userContext
        ? 'Start the conversation in a casual way, mentioning what you know about me and recommend a song!'
        : 'Hello! Introduce yourself in a friendly way and ask about my name and musical preferences.';

      const result = await graph.invoke(
        {
          messages: [new HumanMessage(initialMessage)],
          userContext,
          userId: actualUserId,
        },
        config
      );

      const greeting = result.messages[result.messages.length - 1];
      console.log(`AI: ${greeting.content}\n`);
    } catch (error) {
      console.error('❌ Error starting conversation:', (error as Error).message);
    }

    while (true) {
      const userInput = await readline.question('You: ');

      if (!userInput.trim()) continue;
      if (userInput.toLowerCase() === 'exit') {
        console.log('\n👋 Goodbye!\n');
        break;
      }

      try {
        const result = await graph.invoke(
          {
            messages: [new HumanMessage(userInput)],
            userId: actualUserId,
          },
          config
        );

        const lastMessage = result.messages[result.messages.length - 1];
        console.log(`\nAI: ${lastMessage.content}\n`);

      } catch (error) {
        console.error('\n❌ Error generating response:', error instanceof Error ? error.message : 'Unknown error');
        console.log('AI: Sorry, I encountered an error. Can you try again?\n');
      }
    }

    readline.close();

  } catch (error) {
    console.error('\n❌ Fatal error:', (error as Error).message);
    console.error('\nStack trace:', (error as Error).stack);
    process.exit(1);
  }
}

main();