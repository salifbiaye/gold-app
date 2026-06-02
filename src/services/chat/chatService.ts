import { Platform } from 'react-native';
import { endpoints } from '../../config/api';
import { apiRequest } from '../api/client';
import { serviceConfig } from '../serviceConfig';

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
};

export type ChatFilter = 'Tout' | 'Wallet' | 'Transport' | 'Santé' | 'Logement';

const MOCK_RESPONSES: Record<ChatFilter, string[]> = {
  Tout: [
    'Bonjour ! Comment puis-je vous aider aujourd\'hui ?',
    'Je comprends votre demande. Que souhaitez-vous faire ?',
    'Bien sûr ! Je suis là pour vous aider.',
  ],
  Wallet: [
    'Votre solde disponible est de 125 600 FCFA.',
    'Vous pouvez transférer depuis l\'onglet Wallet.',
    'Votre dernière transaction date d\'aujourd\'hui à 12:45.',
  ],
  Transport: [
    'Un Yango est disponible à 2 min pour 3 500 FCFA.',
    'Le trafic est fluide sur votre trajet habituel.',
    'Votre dernier trajet a été annulé. Voulez-vous en réserver un nouveau ?',
  ],
  Santé: [
    'Dr. Aissa Ndiaye est disponible pour une téléconsultation.',
    'Votre prochain RDV est le 20 juin à 10h.',
    'La pharmacie la plus proche est à 500 m.',
  ],
  Logement: [
    '3 appartements correspondent à vos critères aux Almadies.',
    'Le dépôt de garantie est de 2 mois de loyer.',
    'Voulez-vous planifier une visite ?',
  ],
};

function pickRandom(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)];
}

export async function sendMessage(
  message: string,
  filter: ChatFilter = 'Tout',
): Promise<string> {
  if (serviceConfig.useMock) {
    await new Promise((r) => setTimeout(r, 900));
    const pool = MOCK_RESPONSES[filter] ?? MOCK_RESPONSES['Tout'];
    return pickRandom(pool);
  }

  const data = await apiRequest<{ content: string; provider: string; model: string }>(
    endpoints.ai.chat,
    {
      method: 'POST',
      body: JSON.stringify({ query: message }),
    },
  );

  return data.content;
}

export async function transcribeAudio(uri: string): Promise<string> {
  if (serviceConfig.useMock) {
    await new Promise((r) => setTimeout(r, 1200));
    return 'Je cherche un appartement meublé à Dakar';
  }

  const formData = new FormData();

  if (Platform.OS === 'web') {
    const blob = await fetch(uri).then((r) => r.blob());
    formData.append('audio', blob, 'voice.webm');
  } else {
    const ext = uri.split('.').pop() ?? 'm4a';
    const mime = ext === 'webm' ? 'audio/webm' : ext === 'wav' ? 'audio/wav' : 'audio/m4a';
    formData.append('audio', { uri, type: mime, name: `voice.${ext}` } as unknown as Blob);
  }

  const data = await apiRequest<{ text: string }>(endpoints.ai.transcribe, {
    method: 'POST',
    body: formData,
  });

  return data.text;
}
