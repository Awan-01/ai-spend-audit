import { createClient } from '@supabase/supabase-js';
import { AIToolSpend, Recommendation, AuditRecord, LeadRecord } from '../types/audit';

// Supabase table schemas for reference:
/*
-- RUN THIS IN YOUR SUPABASE SQL EDITOR:

CREATE TABLE audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tools JSONB NOT NULL,
  recommendations JSONB NOT NULL,
  total_savings NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  company_name TEXT NOT NULL,
  role TEXT NOT NULL,
  team_size INT NOT NULL,
  audit_id UUID REFERENCES audits(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
*/

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const isSupabaseConfigured = supabaseUrl && supabaseAnonKey;

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Mock database helper using localStorage for fallback
const getLocalAudits = (): Record<string, AuditRecord> => {
  if (typeof window === 'undefined') return {};
  const data = localStorage.getItem('ai_spend_audits');
  return data ? JSON.parse(data) : {};
};

const saveLocalAudit = (audit: AuditRecord) => {
  if (typeof window === 'undefined') return;
  const audits = getLocalAudits();
  audits[audit.id] = audit;
  localStorage.setItem('ai_spend_audits', JSON.stringify(audits));
};

const getLocalLeads = (): LeadRecord[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem('ai_spend_leads');
  return data ? JSON.parse(data) : [];
};

const saveLocalLead = (lead: LeadRecord) => {
  if (typeof window === 'undefined') return;
  const leads = getLocalLeads();
  leads.push(lead);
  localStorage.setItem('ai_spend_leads', JSON.stringify(leads));
};

// Unified Database API
export async function saveAuditToDb(
  tools: AIToolSpend[], 
  recommendations: Recommendation[], 
  totalSavings: number
): Promise<string> {
  const newId = typeof crypto !== 'undefined' && crypto.randomUUID 
    ? crypto.randomUUID() 
    : Math.random().toString(36).substring(2, 15);

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('audits')
        .insert([
          {
            id: newId,
            tools,
            recommendations,
            total_savings: totalSavings
          }
        ])
        .select();

      if (error) throw error;
      if (data && data[0]) return data[0].id;
    } catch (err) {
      console.warn('Supabase insert failed, falling back to local storage:', err);
    }
  }

  // Local storage fallback
  const mockAudit: AuditRecord = {
    id: newId,
    tools,
    recommendations,
    totalSavings,
    createdAt: new Date().toISOString()
  };
  saveLocalAudit(mockAudit);
  console.info('Audit saved to LocalStorage (Fallback Mode):', newId);
  return newId;
}

export async function getAuditFromDb(id: string): Promise<AuditRecord | null> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('audits')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.warn('Supabase fetch failed or row not found, checking local storage:', error.message);
      } else if (data) {
        return {
          id: data.id,
          tools: data.tools,
          recommendations: data.recommendations,
          totalSavings: Number(data.total_savings),
          createdAt: data.created_at
        };
      }
    } catch (err) {
      console.warn('Supabase query error, fallback to local storage:', err);
    }
  }

  // Local storage fallback
  const audits = getLocalAudits();
  const localAudit = audits[id];
  if (localAudit) {
    return localAudit;
  }

  return null;
}

export async function saveLeadToDb(
  email: string, 
  companyName: string, 
  role: string, 
  teamSize: number, 
  auditId: string
): Promise<boolean> {
  const newId = typeof crypto !== 'undefined' && crypto.randomUUID 
    ? crypto.randomUUID() 
    : Math.random().toString(36).substring(2, 15);

  if (supabase) {
    try {
      const { error } = await supabase
        .from('leads')
        .insert([
          {
            id: newId,
            email,
            company_name: companyName,
            role,
            team_size: teamSize,
            audit_id: auditId
          }
        ]);

      if (!error) return true;
      throw error;
    } catch (err) {
      console.warn('Supabase lead save failed, falling back to local storage:', err);
    }
  }

  // Local storage fallback
  const mockLead: LeadRecord = {
    id: newId,
    email,
    companyName,
    role,
    teamSize,
    auditId
  };
  saveLocalLead(mockLead);
  console.info('Lead saved to LocalStorage (Fallback Mode):', mockLead);
  return true;
}

export function isDbConnected(): boolean {
  return !!supabase;
}
