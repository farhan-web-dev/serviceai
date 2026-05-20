import { API_BASE_URL } from '../constants/config';

export interface Intent {
  serviceType: string;
  location: string;
  requestedTime: string;
  confidenceScore?: number;
}

export interface Provider {
  _id: string;
  name: string;
  avatar: string;
  category: string;
  location: string;
  rating: number;
  price: number;
  availability: boolean;
  distance: string;
  distanceScore?: number;
  ratingScore?: number;
  availabilityScore?: number;
  finalScore?: number;
  explanation?: string;
}

export interface Booking {
  _id: string;
  status: string;
  scheduledTime: string;
  confirmationCode?: string;
  confidenceScore?: number;
}

export interface WorkflowLog {
  _id: string;
  step: string;
  message: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export interface OrchestrationResult {
  success: boolean;
  intent: Intent;
  recommendedProvider: Provider;
  reasoning: string;
  topProviders: Provider[];
  decisionPanel: {
    selectedReason: string;
    rejectedReasons: Array<{ name: string; reason: string }>;
  };
  booking: Booking;
  followUp: unknown;
  logs: WorkflowLog[];
  confidenceMetrics: {
    intent: number;
    match: number;
    ranking: number;
    booking: number;
  };
  error?: string;
}

export async function orchestrate(text: string): Promise<OrchestrationResult> {
  const response = await fetch(`${API_BASE_URL}/api/orchestrate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  if (!response.ok) throw new Error(`Server error: ${response.status}`);
  return response.json();
}

export async function getProviders(category?: string, location?: string): Promise<Provider[]> {
  const params = new URLSearchParams();
  if (category) params.append('category', category);
  if (location) params.append('location', location);
  const response = await fetch(`${API_BASE_URL}/api/providers?${params}`);
  if (!response.ok) throw new Error(`Server error: ${response.status}`);
  return response.json();
}

export async function getLogs(): Promise<WorkflowLog[]> {
  const response = await fetch(`${API_BASE_URL}/api/logs`);
  if (!response.ok) throw new Error(`Server error: ${response.status}`);
  return response.json();
}

export async function getBooking(id: string): Promise<{ booking: Booking; logs: WorkflowLog[] }> {
  const response = await fetch(`${API_BASE_URL}/api/bookings/${id}`);
  if (!response.ok) throw new Error(`Server error: ${response.status}`);
  return response.json();
}
