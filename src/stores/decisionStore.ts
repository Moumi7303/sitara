import { create } from 'zustand';

export interface DecisionResult {
  id: string;
  query: string;
  recommendation: string;
  confidenceScore: number;
  factors: { name: string; weight: number; impact: 'positive' | 'negative' | 'neutral' }[];
  pros: string[];
  cons: string[];
  risks: { level: 'low' | 'medium' | 'high'; description: string }[];
  alternatives: { title: string; description: string; score: number }[];
  domain: string;
  createdAt: string;
}

interface DecisionState {
  currentDecision: DecisionResult | null;
  history: DecisionResult[];
  isStreaming: boolean;
  streamedText: string;
  setCurrentDecision: (d: DecisionResult | null) => void;
  addToHistory: (d: DecisionResult) => void;
  setStreaming: (s: boolean) => void;
  setStreamedText: (t: string) => void;
  appendStreamedText: (t: string) => void;
}

export const useDecisionStore = create<DecisionState>((set) => ({
  currentDecision: null,
  history: [],
  isStreaming: false,
  streamedText: '',
  setCurrentDecision: (d) => set({ currentDecision: d }),
  addToHistory: (d) => set((s) => ({ history: [d, ...s.history] })),
  setStreaming: (isStreaming) => set({ isStreaming }),
  setStreamedText: (streamedText) => set({ streamedText }),
  appendStreamedText: (t) => set((s) => ({ streamedText: s.streamedText + t })),
}));
