// Summarizes key dashboard metrics using AI to provide admins with a quick overview of the application state.

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeDashboardDataInputSchema = z.object({
  userCount: z.number().describe('The total number of users in the application.'),
  productCount: z.number().describe('The total number of products in the inventory.'),
  averageProductPrice: z.number().describe('The average price of products in the inventory.'),
});

export type SummarizeDashboardDataInput = z.infer<typeof SummarizeDashboardDataInputSchema>;

const SummarizeDashboardDataOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the key dashboard metrics.'),
});

export type SummarizeDashboardDataOutput = z.infer<typeof SummarizeDashboardDataOutputSchema>;

export async function summarizeDashboardData(input: SummarizeDashboardDataInput): Promise<SummarizeDashboardDataOutput> {
  return summarizeDashboardDataFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeDashboardDataPrompt',
  input: {schema: SummarizeDashboardDataInputSchema},
  output: {schema: SummarizeDashboardDataOutputSchema},
  prompt: `You are an AI assistant that summarizes dashboard metrics for an admin user.

  Given the following metrics, provide a concise summary of the current state of the application:

  Total Users: {{{userCount}}}
  Total Products: {{{productCount}}}
  Average Product Price: ${{{{averageProductPrice}}}}

  Summary:`,
});

const summarizeDashboardDataFlow = ai.defineFlow(
  {
    name: 'summarizeDashboardDataFlow',
    inputSchema: SummarizeDashboardDataInputSchema,
    outputSchema: SummarizeDashboardDataOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
