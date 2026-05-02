import { create } from 'zustand';
import api from '@/lib/api';

export interface DecisionResult {
  id: string;
  query: string;
  recommendation: string;
  confidenceScore: number;
  // Mapped from backend's flat string[] key_factors
  factors: { name: string; weight: number; impact: 'positive' | 'negative' | 'neutral' }[];
  pros: string[];
  cons: string[];
  // Mapped from backend's flat string[] risks
  risks: { level: 'low' | 'medium' | 'high'; description: string }[];
  // Mapped from backend's flat string[] alternatives
  alternatives: { title: string; description: string; score: number }[];
  domain: string;
  createdAt: string;
}

/**
 * Map a backend decision (with output) to the frontend DecisionResult shape.
 * Shared between DecisionInput (new decisions) and fetchHistory (loading history).
 */
export function mapBackendDecision(data: any): DecisionResult | null {
  const output = data.output;
  if (!output) return null; // Skip decisions without output (failed)

  return {
    id: data.id.toString(),
    query: data.query,
    recommendation: output.recommendation,
    confidenceScore: data.confidence_score ?? 0,
    factors: (output.key_factors || []).map((f: any) => ({
      name: typeof f === 'string' ? f : f.name,
      weight: f.weight || 0.5,
      impact: f.impact || 'neutral'
    })),
    pros: output.pros || [],
    cons: output.cons || [],
    risks: (output.risks || []).map((r: any) => ({
      level: typeof r === 'string' ? 'medium' : (r.level || 'medium'),
      description: typeof r === 'string' ? r : r.description
    })),
    alternatives: (output.alternatives || []).map((a: any) => ({
      title: typeof a === 'string' ? a : (a.title || 'Alternative'),
      description: typeof a === 'string' ? '' : (a.description || ''),
      score: a.score || 0
    })),
    domain: data.domain,
    createdAt: data.created_at,
  };
}

interface DecisionState {
  currentDecision: DecisionResult | null;
  history: DecisionResult[];
  isStreaming: boolean;
  streamedText: string;
  isLoadingHistory: boolean;
  historyError: string | null;
  setCurrentDecision: (d: DecisionResult | null) => void;
  addToHistory: (d: DecisionResult) => void;
  setHistory: (h: DecisionResult[]) => void;
  fetchHistory: () => Promise<void>;
  setStreaming: (s: boolean) => void;
  setStreamedText: (t: string) => void;
  appendStreamedText: (t: string) => void;
}

export const useDecisionStore = create<DecisionState>((set, get) => ({
  currentDecision: null,
  history: [],
  isStreaming: false,
  streamedText: '',
  isLoadingHistory: false,
  historyError: null,
  setCurrentDecision: (d) => set({ currentDecision: d }),
  addToHistory: (d) => set((s) => ({ history: [d, ...s.history.filter(h => h.id !== d.id)] })),
  setHistory: (history) => set({ history }),
  fetchHistory: async () => {
    set({ isLoadingHistory: true, historyError: null });
    try {
      // Fetch all pages of decisions (backend paginates at 15 per page)
      const response = await api.get('/decisions');
      const raw = response.data.data || [];
      const mapped: DecisionResult[] = [];

      for (const item of raw) {
        const result = mapBackendDecision(item);
        if (result) mapped.push(result);
      }

      set({ history: mapped, isLoadingHistory: false });
    } catch (error: any) {
      console.error('Failed to fetch decision history', error);
      set({ isLoadingHistory: false, historyError: error.message || 'Failed to load history' });
    }
  },
  setStreaming: (isStreaming) => set({ isStreaming }),
  setStreamedText: (streamedText) => set({ streamedText }),
  appendStreamedText: (t) => set((s) => ({ streamedText: s.streamedText + t })),
}));

