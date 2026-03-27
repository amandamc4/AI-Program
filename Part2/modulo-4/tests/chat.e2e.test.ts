import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { HumanMessage } from '@langchain/core/messages';
import { buildGraph } from '../src/graph/factory.ts';
import { unlinkSync, existsSync } from 'node:fs';

describe('Music Recommendation Chat - E2E Tests', () => {
  let graph: any;
  let preferencesService: any;
  const testDbPath = './test-preferences.db';

  before(async () => {
    if (existsSync(testDbPath)) {
      unlinkSync(testDbPath);
    }

    const built = await buildGraph(testDbPath);
    graph = built.graph;
    preferencesService = built.preferencesService;
  });

  after(async () => {
    await preferencesService.close();
    if (existsSync(testDbPath)) {
      unlinkSync(testDbPath);
    }
  });

  it('Should extract and save user preferences', async () => {
    const userId = 'test-alex';
    const threadId = `${userId}-${Date.now()}`;
    const config = {
      configurable: { thread_id: threadId },
      context: { userId }
    };

    const response = await graph.invoke(
      {
        messages: [new HumanMessage('Hello! My name is Alex and I love rock and metal')],
        userId,
      },
      config
    );

    assert.ok(response.messages.length > 0, 'Should have response messages');

    const lastMessage = response.messages.at(-1);
    assert.equal(lastMessage._getType(), 'ai', 'Last message should be from the AI');

    const content = lastMessage.content.toLowerCase();
    assert.ok(
      content.includes('alex') || content.includes('rock') || content.includes('metal'),
      'Response should recognize the preferences'
    );

    await new Promise(resolve => setTimeout(resolve, 500));

    const savedPreferences = await preferencesService.getSummary(userId);

    assert.ok(savedPreferences, 'Preferences should be saved');
    assert.ok(savedPreferences.name?.toLowerCase().includes('alex'), 'Name should be saved');
    assert.ok(
      savedPreferences.favoriteGenres?.some((g: string) => g.toLowerCase().includes('rock') || g.toLowerCase().includes('metal')),
      'Genres should be saved'
    );
  });

  // it('Should maintain multiple interactions and provide summarization', async () => {
  //   const userId = 'test-sarah';
  //   const threadId = `${userId}-${Date.now()}`;
  //   const config = {
  //     configurable: { thread_id: threadId },
  //     context: { userId }
  //   };

  //   await graph.invoke(
  //     {
  //       messages: [new HumanMessage('Hi! My name is Sarah and I love indie and electronic music')],
  //       userId,
  //     },
  //     config
  //   );

  //   const response2 = await graph.invoke(
  //     {
  //       messages: [new HumanMessage('I especially like Tame Impala and Daft Punk')],
  //       userId,
  //     },
  //     config
  //   );

  //   await new Promise(resolve => setTimeout(resolve, 500));

  //   const savedPreferences = await preferencesService.getSummary(userId);

  //   assert.ok(savedPreferences, 'Memórias devem existir');
  //   assert.ok(savedPreferences.name?.toLowerCase().includes('sarah'), 'Nome deve estar salvo');
  //   assert.ok(
  //     savedPreferences.favoriteGenres?.some((g: string) =>
  //       g.toLowerCase().includes('indie') || g.toLowerCase().includes('eletrônica') || g.toLowerCase().includes('electronic')
  //     ),
  //     'Genres must be saved'
  //   );
  // });

  // it('Should retrieve context in a new session', async () => {
  //   const userId = 'test-marcus';
  //   const threadId = `${userId}-${Date.now()}`;
  //   const config = {
  //     configurable: { thread_id: threadId },
  //     context: { userId }
  //   };

  //   await graph.invoke(
  //     {
  //       messages: [new HumanMessage('My name is Marcus, I am 28 years old and I love jazz and blues')],
  //       userId,
  //     },
  //     config
  //   );

  //   await new Promise(resolve => setTimeout(resolve, 500));

  //   const savedPreferences = await preferencesService.getSummary(userId);

  //   assert.ok(savedPreferences, 'Should retrieve basic information');
  //   assert.ok(savedPreferences.name?.includes('Marcus'), 'Should include name');
  //   assert.ok(savedPreferences.age === 28, 'Should include age');
  //   assert.ok(
  //     savedPreferences.favoriteGenres?.some((g: string) =>
  //       g.toLowerCase().includes('jazz') || g.toLowerCase().includes('blues')
  //     ),
  //     'Should include genres'
  //   );
  // });

  // it('Should respond to simple questions without extracting preferences', async () => {
  //   const userId = 'test-anonymous';
  //   const threadId = `${userId}-${Date.now()}`;
  //   const config = {
  //     configurable: { thread_id: threadId },
  //     context: { userId }
  //   };

  //   const response = await graph.invoke(
  //     {
  //       messages: [new HumanMessage('What is your favorite song?')],
  //       userId,
  //     },
  //     config
  //   );

  //   assert.ok(response.messages.length > 0, 'Should have a response');
  // });

  // it('Should maintain conversation history', async () => {
  //   const userId = 'test-taylor';
  //   const threadId = `${userId}-${Date.now()}`;
  //   const config = {
  //     configurable: { thread_id: threadId },
  //     context: { userId }
  //   };

  //   await graph.invoke(
  //     {
  //       messages: [new HumanMessage('Hi, I am Taylor and I love pop music')],
  //       userId,
  //     },
  //     config
  //   );

  //   const response2 = await graph.invoke(
  //     {
  //       messages: [new HumanMessage('Can you recommend something upbeat?')],
  //       userId,
  //     },
  //     config
  //   );

  //   assert.ok(response2.messages.length >= 2, 'Should have multiple messages in history');

  //   const hasUserMessage = response2.messages.some((msg: any) =>
  //     msg._getType() === 'human' && msg.content.includes('upbeat')
  //   );

  //   assert.ok(hasUserMessage, 'Should maintain conversation history');
  // });

  // it('Should share preferences between multiple threads of the same user', async () => {
  //   const userId = 'test-multi-thread-user';

  //   // First thread - user provides preferences
  //   const thread1Id = `${userId}-thread1-${Date.now()}`;
  //   const config1 = {
  //     configurable: { thread_id: thread1Id },
  //     context: { userId }
  //   };

  //   await graph.invoke(
  //     {
  //       messages: [new HumanMessage('Hi! My name is Jordan and I love reggae and ska')],
  //       userId,
  //     },
  //     config1
  //   );

  //   await new Promise(resolve => setTimeout(resolve, 500));

  //   // Second thread - same user, new conversation
  //   const thread2Id = `${userId}-thread2-${Date.now() + 1}`;
  //   const config2 = {
  //     configurable: { thread_id: thread2Id },
  //     context: { userId }
  //   };

  //   const response2 = await graph.invoke(
  //     {
  //       messages: [new HumanMessage('Can you recommend something to relax?')],
  //       userId,
  //     },
  //     config2
  //   );

  //   // Verify that the preferences were shared
  //   const savedPreferences = await preferencesService.getSummary(userId);

  //   assert.ok(savedPreferences, 'Preferences should exist');
  //   assert.ok(savedPreferences.name?.toLowerCase().includes('jordan'), 'Name should be saved');
  //   assert.ok(
  //     savedPreferences.favoriteGenres?.some((g: string) =>
  //       g.toLowerCase().includes('reggae') || g.toLowerCase().includes('ska')
  //     ),
  //     'Genres should be saved and shared between threads'
  //   );

  //   // Verify that the thread 2 has access to the context of the thread 1
  //   const lastMessage = response2.messages.at(-1);
  //   const content = String(lastMessage?.content || '').toLowerCase();

  //   // AI should know the user's name even in a different thread
  //   assert.ok(
  //     content.includes('jordan') || content.includes('reggae') || content.includes('ska'),
  //     'The second thread should have access to the preferences of the first'
  //   );
  // });



  // it('Should maintain conversation history', async () => {
  //   const userId = 'test-taylor';
  //   const threadId = `${userId}-${Date.now()}`;
  //   const config = {
  //     configurable: { thread_id: threadId },
  //     context: { userId }
  //   };

  //   await graph.invoke(
  //     {
  //       messages: [
  //         new HumanMessage('Hi, I am Taylor and I love pop music'),
  //         new HumanMessage('I am Erick!'),
  //         new HumanMessage('I am 30 years old'),
  //         new HumanMessage('I like guitar'),
  //         new HumanMessage('Can you recommend something upbeat?'),
  //         new HumanMessage('Can you recommend something upbeat?'),
  //         new HumanMessage('Can you recommend something upbeat?'),
  //       ],
  //       userId,
  //     },
  //     config
  //   );

  // });

});