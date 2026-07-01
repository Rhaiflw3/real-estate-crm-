import type { Lead } from './lead';
import type { Property } from './property';

export type InterestLevel = 'Low' | 'Medium' | 'High' | 'Offer';

export interface LeadProperty {
  id: string;
  leadId: string;
  propertyId: string;
  interestLevel: InterestLevel;
  notes?: string;
  createdAt: string;

  // Populated on read (joined)
  property?: Property;
  lead?: Lead;
}

export interface CreateLeadPropertyInput {
  propertyId: string;
  interestLevel?: InterestLevel;
  notes?: string;
}
