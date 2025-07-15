'use server';

import { customerSummary, type CustomerSummaryInput, type CustomerSummaryOutput } from '@/ai/flows/customer-summary';

export async function generateSummaryForCustomer(input: CustomerSummaryInput): Promise<CustomerSummaryOutput> {
  try {
    const summary = await customerSummary(input);
    return summary;
  } catch (error) {
    console.error('Error generating customer summary:', error);
    return { summary: 'Error: Could not generate summary.' };
  }
}
