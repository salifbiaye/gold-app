import type { PublicServiceSlug } from '../screens/web/public/publicServices';

export type SeoMetadata = {
  canonicalPath: string;
  description: string;
  indexable: boolean;
  title: string;
};

export const publicRouteMetadata: Record<'home' | PublicServiceSlug, SeoMetadata> = {
  home: {
    canonicalPath: '/',
    description: 'Gold App regroupe wallet, transport, livraison et services essentiels dans une experience securisee a Dakar.',
    indexable: true,
    title: 'Gold App | Wallet et services du quotidien a Dakar',
  },
  transport: {
    canonicalPath: '/services/transport',
    description: 'Reservez un transport et suivez vos trajets a Dakar avec Gold App.',
    indexable: true,
    title: 'Transport a Dakar | Gold App',
  },
  livraison: {
    canonicalPath: '/services/livraison',
    description: 'Suivez livraisons et courses simplement depuis Gold App.',
    indexable: true,
    title: 'Livraison a Dakar | Gold App',
  },
  immobilier: {
    canonicalPath: '/services/immobilier',
    description: 'Comparez les biens disponibles et trouvez un logement avec Gold App.',
    indexable: true,
    title: 'Immobilier a Dakar | Gold App',
  },
  sante: {
    canonicalPath: '/services/sante',
    description: 'Accedez aux medecins et pharmacies de proximite avec Gold App.',
    indexable: true,
    title: 'Sante et pharmacies | Gold App',
  },
  paiements: {
    canonicalPath: '/services/paiements',
    description: 'Payez et transferez de facon securisee avec le wallet Gold App.',
    indexable: true,
    title: 'Paiements securises | Gold App',
  },
  alimentation: {
    canonicalPath: '/services/alimentation',
    description: 'Commandez repas et produits frais depuis Gold App.',
    indexable: true,
    title: 'Alimentation et commandes | Gold App',
  },
  education: {
    canonicalPath: '/services/education',
    description: 'Trouvez cours et formations locales dans Gold App.',
    indexable: true,
    title: 'Education et formations | Gold App',
  },
  tourisme: {
    canonicalPath: '/services/tourisme',
    description: 'Explorez les activites et experiences locales avec Gold App.',
    indexable: true,
    title: 'Tourisme et loisirs | Gold App',
  },
};

export const privateRouteMetadata: Record<string, SeoMetadata> = {
  connexion: { canonicalPath: '/connexion', description: 'Connectez-vous a Gold App.', indexable: false, title: 'Connexion | Gold App' },
  home: { canonicalPath: '/app', description: 'Espace personnel Gold App.', indexable: false, title: 'Accueil | Gold App' },
  wallet: { canonicalPath: '/app/wallet', description: 'Wallet Gold App.', indexable: false, title: 'Wallet | Gold App' },
  commandes: { canonicalPath: '/app/commandes', description: 'Commandes Gold App.', indexable: false, title: 'Commandes | Gold App' },
  chat: { canonicalPath: '/app/chat', description: 'Assistant Gold App.', indexable: false, title: 'Chat IA | Gold App' },
  carte: { canonicalPath: '/app/carte', description: 'Carte des services Gold App.', indexable: false, title: 'Carte | Gold App' },
  profil: { canonicalPath: '/app/profil', description: 'Profil Gold App.', indexable: false, title: 'Profil | Gold App' },
  notifications: { canonicalPath: '/app/notifications', description: 'Notifications Gold App.', indexable: false, title: 'Notifications | Gold App' },
  parametres: { canonicalPath: '/app/parametres', description: 'Parametres Gold App.', indexable: false, title: 'Parametres | Gold App' },
};

