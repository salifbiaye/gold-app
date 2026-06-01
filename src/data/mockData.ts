import {
  Ambulance,
  ArrowDownToLine,
  Bike,
  BriefcaseMedical,
  Building2,
  Car,
  CirclePlus,
  CreditCard,
  GraduationCap,
  MoreHorizontal,
  Navigation,
  Pill,
  Plane,
  QrCode,
  Receipt,
  ReceiptText,
  Send,
  ShoppingCart,
  Smartphone,
  Stethoscope,
  Utensils,
  WalletCards,
} from 'lucide-react-native';
import { colors } from '../theme/colors';
import { IconComponent } from '../types/icon';

export type ServiceItem = {
  id: string;
  label: string;
  icon: IconComponent;
  tint: string;
  route?: 'Transport' | 'RealEstate' | 'Health' | 'Delivery' | 'Food' | 'Education' | 'Tourism' | 'Payments' | 'Map';
};

type IconAction = {
  id: string;
  label: string;
  icon: IconComponent;
};

type PaymentAction = IconAction & {
  color: string;
  meta: string;
};

type Transaction = PaymentAction & {
  amount: string;
};

type TransportOption = IconAction & {
  time: string;
  price: string;
};

export const popularServices: ServiceItem[] = [
  { id: 'transport',   label: 'Transport',   icon: Car,             tint: '#0DB574', route: 'Transport'  },
  { id: 'delivery',    label: 'Livraison',   icon: Bike,            tint: '#F97316', route: 'Delivery'   },
  { id: 'real-estate', label: 'Immobilier',  icon: Building2,       tint: '#6366F1', route: 'RealEstate' },
  { id: 'health',      label: 'Santé',       icon: BriefcaseMedical,tint: '#3388F2', route: 'Health'     },
  { id: 'food',        label: 'Alimentation',icon: Utensils,        tint: '#0DB574', route: 'Food'       },
  { id: 'education',   label: 'Education',   icon: GraduationCap,   tint: '#8C54D9', route: 'Education'  },
  { id: 'tourism',     label: 'Tourisme',    icon: Plane,           tint: '#F43F5E', route: 'Tourism'    },
  { id: 'payments',    label: 'Paiements',   icon: WalletCards,     tint: '#6366F1', route: 'Payments'   },
];

export const walletActions: IconAction[] = [
  { id: 'transfer', label: 'Transférer',  icon: Navigation       },
  { id: 'scan',     label: 'Scanner QR',  icon: QrCode           },
  { id: 'pay',      label: 'Payer',       icon: CreditCard       },
  { id: 'withdraw', label: 'Retirer',     icon: ArrowDownToLine  },
  { id: 'topup',    label: 'Recharger',   icon: CirclePlus       },
  { id: 'bills',    label: 'Factures',    icon: ReceiptText      },
  { id: 'credit',   label: 'Crédit tél.', icon: Smartphone       },
  { id: 'more',     label: 'Plus',        icon: MoreHorizontal   },
];

export const apartments = [
  {
    id: 'apt-1',
    title: 'Appartement meublé',
    district: 'Almadies',
    price: '350 000 FCFA',
    rating: '4.5 (32)',
    image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600',
  },
  {
    id: 'apt-2',
    title: 'Studio moderne',
    district: 'Point E',
    price: '250 000 FCFA',
    rating: '4.2 (18)',
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600',
  },
  {
    id: 'apt-3',
    title: 'Appartement F3',
    district: 'Mermoz',
    price: '300 000 FCFA',
    rating: '4.4 (24)',
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600',
  },
];

export const orders = [
  {
    id: '#CMD-2024-1256',
    title: 'Restaurant Chez Fatou',
    meta: "Aujourd'hui · 12:45",
    detail: 'Livreur: Ousmane Diop',
    statusKey: 'active',
    status: 'En route',
    statusColor: colors.orange,
  },
  {
    id: '#CMD-2024-1255',
    title: 'Livraison de courses',
    meta: 'Hier · 16:20',
    detail: 'Livreur: Cheikh Fall',
    statusKey: 'completed',
    status: 'Livré',
    statusColor: colors.primary,
  },
  {
    id: '#CMD-2024-1254',
    title: 'Appartement Almadies',
    meta: '20 Mai · 11:10',
    detail: 'Paiement confirmé',
    statusKey: 'active',
    status: 'Confirmée',
    statusColor: colors.blue,
  },
  {
    id: '#CMD-2024-1253',
    title: 'Transport - Yango',
    meta: '19 Mai · 08:40',
    detail: 'Commande annulée',
    statusKey: 'cancelled',
    status: 'Annulée',
    statusColor: colors.danger,
  },
];

export const transactions: Transaction[] = [
  { id: 't1', label: 'Paiement restaurant', meta: "Aujourd'hui · 12:45", amount: '- 8 500 FCFA', icon: Utensils, color: '#FF6848' },
  { id: 't2', label: 'Transfert à O. Diop', meta: 'Hier · 18:30', amount: '- 25 000 FCFA', icon: Plane, color: colors.purple },
  { id: 't3', label: 'Recharge Orange', meta: 'Hier · 10:15', amount: '- 2 000 FCFA', icon: Send, color: colors.primary },
  { id: 't4', label: 'Paiement marchand', meta: '20 Mai · 14:22', amount: '- 15 500 FCFA', icon: ShoppingCart, color: colors.orange },
  { id: 't5', label: 'Facture électricité', meta: '19 Mai · 09:10', amount: '- 18 000 FCFA', icon: Receipt, color: colors.blue },
  { id: 't6', label: 'Retrait wallet', meta: '18 Mai · 17:45', amount: '- 30 000 FCFA', icon: WalletCards, color: colors.primaryDark },
];

export const transportOptions: TransportOption[] = [
  { id: 'taxi', label: 'Yango Taxi', time: '2 min', price: '3 500 FCFA', icon: Car },
  { id: 'comfort', label: 'Yango Confort', time: '3 min', price: '5 500 FCFA', icon: Car },
  { id: 'xl', label: 'Yango XL', time: '5 min', price: '7 500 FCFA', icon: Car },
  { id: 'moto', label: 'Moto', time: '1 min', price: '1 500 FCFA', icon: Bike },
];

export const healthServices: ServiceItem[] = [
  { id: 'teleconsultation', label: 'Téléconsultation', icon: Stethoscope, tint: colors.danger },
  { id: 'appointment', label: 'Prendre RDV', icon: Receipt, tint: colors.primary },
  { id: 'pharmacy', label: 'Pharmacies', icon: Pill, tint: colors.orange },
  { id: 'ambulance', label: 'Ambulance', icon: Ambulance, tint: colors.warning },
];

export const doctors = [
  { id: 'd1', name: 'Dr. Aissa Ndiaye', job: 'Généraliste', state: 'En ligne' },
  { id: 'd2', name: 'Dr. Marie Diop', job: 'Pédiatre', state: 'En ligne' },
];

export const paymentMenu: PaymentAction[] = [
  { id: 'merchant', label: 'Payer un marchand', meta: 'Scanner ou saisir le code', icon: QrCode, color: '#FF6161' },
  { id: 'bill', label: 'Payer une facture', meta: 'Eau, électricité, internet...', icon: Receipt, color: colors.blue },
  { id: 'airtime', label: 'Crédit téléphonique', meta: 'Orange, Expresso, Free...', icon: CreditCard, color: colors.purple },
  { id: 'transfer', label: 'Transférer (PI-SPI)', meta: 'Envoyer vers banque ou wallet', icon: Send, color: colors.primary },
  { id: 'request', label: 'Demander un paiement', meta: 'Créer une demande', icon: WalletCards, color: '#21A7A5' },
  { id: 'history', label: 'Historique paiements', meta: 'Voir vos transactions', icon: Receipt, color: colors.orange },
];

export const profileMenu = [
  'Informations personnelles',
  'Mes adresses',
  'Mes moyens de paiement',
  'Sécurité',
  'Paramètres',
  'Aide & Support',
];
