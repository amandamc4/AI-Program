import { z } from 'zod/v3';

export const SummarySchema = z.object({
  name: z.string().optional().describe('User name'),
  age: z.number().optional().describe('User age'),
  favoriteGenres: z.array(z.string()).optional().describe('All music genres mentioned'),
  favoriteBands: z.array(z.string()).optional().describe('All bands/artists mentioned'),
  keyPreferences: z.string().describe('Concise summary of musical preferences, humor patterns, and listening context'),
  importantContext: z.string().optional().describe('Any other relevant details about the user'),
});

export type ConversationSummary = z.infer<typeof SummarySchema>;

export const getSummarizationSystemPrompt = () => {
  return JSON.stringify({
    role: 'Conversation Summarizer for Music Preferences',

    tarefa: 'Analyze conversation and extract structured musical preferences.',

    campos_para_extrair: {
      name: 'User name',
      age: 'User age',
      favoriteGenres: 'All music genres mentioned',
      favoriteBands: 'All bands/artists mentioned',
      keyPreferences: 'Concise summary of musical preferences, humor patterns, and listening context',
      importantContext: 'Any other relevant details about the user'
    },

    regras: [
      'Combine duplicate information',
      'Be specific about genres and artists',
      'Include humor associations (e.g., "likes upbeat rock while exercising")',
      'When updating the previous summary, preserve information not discussed in the new conversation',
      'Include only information explicitly declared'
    ]
  });
};

// we keep summarizing the conversation and feeding it back into the prompt
export const getSummarizationUserPrompt = (
  conversationHistory: Array<{ role: string; content: string }>,
  previousSummary?: ConversationSummary
) => {
  return JSON.stringify({
    conversa: conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n'),
    sumario_anterior: previousSummary || 'None',
    instrucoes: [
      'Update the summary with new information from this conversation',
      'Preserve existing information not discussed in the new messages'
    ]
  });
};
