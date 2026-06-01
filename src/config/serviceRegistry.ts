import { Bike, BookOpen, Building2, Bus, CreditCard, HeartPulse, MapPinned, Plane, Utensils } from 'lucide-react-native';
import type { IconComponent } from '../types/icon';
import type { ServiceId } from '../types/service';

export type ServicePresentation = { color: string; icon: IconComponent; label: string };

export const serviceRegistry: Record<ServiceId, ServicePresentation> = {
  transport: { color: '#0DB574', icon: Bus, label: 'Transport' },
  livraison: { color: '#F97316', icon: Bike, label: 'Livraison' },
  immobilier: { color: '#3B82F6', icon: Building2, label: 'Immobilier' },
  sante: { color: '#3388F2', icon: HeartPulse, label: 'Sante' },
  paiements: { color: '#6366F1', icon: CreditCard, label: 'Paiements' },
  alimentation: { color: '#EAB308', icon: Utensils, label: 'Alimentation' },
  education: { color: '#8C54D9', icon: BookOpen, label: 'Education' },
  tourisme: { color: '#0EA5E9', icon: Plane, label: 'Tourisme' },
  carte: { color: '#3388F2', icon: MapPinned, label: 'Carte' },
};
