'use server';

import { customerSummary, type CustomerSummaryInput, type CustomerSummaryOutput } from '@/ai/flows/customer-summary';
import { agentFlow, type AgentFlowInput, type AgentFlowOutput } from '@/ai/flows/agent-flow';

export async function generateSummaryForCustomer(input: CustomerSummaryInput): Promise<CustomerSummaryOutput> {
  try {
    const summary = await customerSummary(input);
    return summary;
  } catch (error) {
    console.error('Error generating customer summary:', error);
    return { summary: 'Error: Could not generate summary.' };
  }
}

export async function processUserCommand(input: AgentFlowInput): Promise<AgentFlowOutput> {
  try {
    const result = await agentFlow(input);
    return result;
  } catch (error) {
    console.error('Error processing user command:', error);
    // Return a 'none' action with an error message
    return {
      agentAction: {
        action: 'none',
        details: {
          responseText: 'Sorry, I encountered an error trying to process your request.',
        },
      },
    };
  }
}
