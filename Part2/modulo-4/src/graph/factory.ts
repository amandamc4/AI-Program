import { OpenRouterService } from '../services/openrouterService.ts';
import { config } from '../config.ts';
import { buildChatGraph } from './graph.ts';
import { PreferencesService } from '../services/preferencesService.ts';
import { createMemoryService } from '../services/memoryService.ts';

export async function buildGraph(dbPath: string = './preferences.db') {
  const llmClient = new OpenRouterService(config);
  // sql lite to store user preferences
  const preferencesService = new PreferencesService(dbPath);
  // postgreSQL to store conversation history and checkpoints for resumability
  const memoryService = await createMemoryService();

  const graph = buildChatGraph(
    llmClient,
    preferencesService,
    memoryService
  );

  return {
    graph,
    preferencesService
  };
}

export const graph = async () => buildGraph();
export default graph;
