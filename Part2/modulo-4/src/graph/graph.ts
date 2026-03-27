import {
  StateGraph,
  START,
  END,
  MessagesZodMeta,
} from "@langchain/langgraph";
import { withLangGraph } from "@langchain/langgraph/zod";
import { z } from "zod/v3";

import type { BaseMessage } from '@langchain/core/messages';
import { OpenRouterService } from '../services/openrouterService.ts';
import { createChatNode } from './nodes/chatNode.ts';
import { createSummarizationNode } from './nodes/summarizationNode.ts';
import { createSavePreferencesNode } from './nodes/savePreferencesNode.ts';
import { routeAfterChat, routeAfterSavePreferences } from './nodes/edgeConditions.ts';
import { PreferencesService } from "../services/preferencesService.ts";
import { type MemoryService } from "../services/memoryService.ts";

const ChatStateAnnotation = z.object({
  messages: withLangGraph(
    z.custom<BaseMessage[]>(),
    MessagesZodMeta),
  userContext: z.string().optional(),
  extractedPreferences: z.any().optional(),
  needsSummarization: z.boolean().optional(),
  conversationSummary: z.any().optional(),
  userId: z.string().optional(),
});

export type GraphState = z.infer<typeof ChatStateAnnotation>;

export function buildChatGraph(
  llmClient: OpenRouterService,
  preferencesService: PreferencesService,
  memoryService: MemoryService
) {
  const graph = new StateGraph(ChatStateAnnotation)
    .addNode('chat', createChatNode(llmClient, preferencesService))
    // extract preferences from user input and save to state, if user wants to save preferences
    .addNode('savePreferences', createSavePreferencesNode(preferencesService))
    // summarize conversation so the history fits inside context and memory and can be used more effectively
    .addNode('summarize', createSummarizationNode(llmClient, preferencesService))

    .addEdge(START, 'chat')

    .addConditionalEdges(
      'chat',
      routeAfterChat,
      {
        savePreferences: 'savePreferences',
        summarize: 'summarize',
        end: END,
      }
    )

    .addConditionalEdges(
      'savePreferences',
      routeAfterSavePreferences,
      {
        summarize: 'summarize',
        end: END,
      }
    )

    .addEdge('summarize', END);

  return graph.compile({
      checkpointer: memoryService.checkpointer,
      store: memoryService.store
    } 
  );
}
