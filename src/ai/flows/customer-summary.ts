'use server';
/**
 * @fileOverview AI agent that provides customer interaction and property detail summaries.
 *
 * - customerSummary - A function that generates customer summaries.
 * - CustomerSummaryInput - The input type for the customerSummary function.
 * - CustomerSummaryOutput - The return type for the customerSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CustomerSummaryInputSchema = z.object({
  customerName: z.string().describe('The name of the customer.'),
  interactionNotes: z.string().describe('Notes from the latest customer interaction.'),
  propertyDetails: z.string().describe('Details about the customer\u2019s property (e.g., lawn size, special features).'),
  serviceRequested: z.string().describe('Service requested by the customer (e.g., mowing, fertilization).'),
});
export type CustomerSummaryInput = z.infer<typeof CustomerSummaryInputSchema>;

const CustomerSummaryOutputSchema = z.object({
  summary: z.string().describe('A concise summary of customer interactions, property details, and service requests.'),
});
export type CustomerSummaryOutput = z.infer<typeof CustomerSummaryOutputSchema>;

export async function customerSummary(input: CustomerSummaryInput): Promise<CustomerSummaryOutput> {
  return customerSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'customerSummaryPrompt',
  input: {schema: CustomerSummaryInputSchema},
  output: {schema: CustomerSummaryOutputSchema},
  prompt: `You are a CRM assistant for a lawn care business. Generate a concise summary of the customer interaction, property details, and service requested.  Use the following information to create the summary.

Customer Name: {{{customerName}}}
Interaction Notes: {{{interactionNotes}}}
Property Details: {{{propertyDetails}}}
Service Requested: {{{serviceRequested}}}`,
});

const customerSummaryFlow = ai.defineFlow(
  {
    name: 'customerSummaryFlow',
    inputSchema: CustomerSummaryInputSchema,
    outputSchema: CustomerSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
