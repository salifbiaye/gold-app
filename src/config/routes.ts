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
    description: 'i-360 regroupe wallet, transport, livraison et services essentiels dans une experience securisee a Dakar.',
    indexable: true,
    title: 'i-360 | Wallet et services du quotidien a Dakar',
  },
  transport: {
    canonicalPath: '/services/transport',
    description: 'Reservez un transport et suivez vos trajets a Dakar avec i-360.',
    indexable: true,
    title: 'Transport a Dakar | i-360',
  },
  livraison: {
    canonicalPath: '/services/livraison',
    description: 'Suivez livraisons et courses simplement depuis i-360.',
    indexable: true,
    title: 'Livraison a Dakar | i-360',
  },
  immobilier: {
    canonicalPath: '/services/immobilier',
    description: 'Comparez les biens disponibles et trouvez un logement avec i-360.',
    indexable: true,
    title: 'Immobilier a Dakar | i-360',
  },
  sante: {
    canonicalPath: '/services/sante',
    description: 'Accedez aux medecins et pharmacies de proximite avec i-360.',
    indexable: true,
    title: 'Sante et pharmacies | i-360',
  },
  paiements: {
    canonicalPath: '/services/paiements',
    description: 'Payez et transferez de facon securisee avec le wallet i-360.',
    indexable: true,
    title: 'Paiements securises | i-360',
  },
  alimentation: {
    canonicalPath: '/services/alimentation',
    description: 'Commandez repas et produits frais depuis i-360.',
    indexable: true,
    title: 'Alimentation et commandes | i-360',
  },
  education: {
    canonicalPath: '/services/education',
    description: 'Trouvez cours et formations locales dans i-360.',
    indexable: true,
    title: 'Education et formations | i-360',
  },
  tourisme: {
    canonicalPath: '/services/tourisme',
    description: 'Explorez les activites et experiences locales avec i-360.',
    indexable: true,
    title: 'Tourisme et loisirs | i-360',
  },
};

export const privateRouteMetadata: Record<string, SeoMetadata> = {
  connexion: { canonicalPath: '/connexion', description: 'Connectez-vous a i-360.', indexable: false, title: 'Connexion | i-360' },
  home: { canonicalPath: '/app', description: 'Espace personnel i-360.', indexable: false, title: 'Accueil | i-360' },
  wallet: { canonicalPath: '/app/wallet', description: 'Wallet i-360.', indexable: false, title: 'Wallet | i-360' },
  commandes: { canonicalPath: '/app/commandes', description: 'Commandes i-360.', indexable: false, title: 'Commandes | i-360' },
  chat: { canonicalPath: '/app/chat', description: 'Assistant i-360.', indexable: false, title: 'Chat IA | i-360' },
  carte: { canonicalPath: '/app/carte', description: 'Carte des services i-360.', indexable: false, title: 'Carte | i-360' },
  profil: { canonicalPath: '/app/profil', description: 'Profil i-360.', indexable: false, title: 'Profil | i-360' },
  notifications: { canonicalPath: '/app/notifications', description: 'Notifications i-360.', indexable: false, title: 'Notifications | i-360' },
  parametres: { canonicalPath: '/app/parametres', description: 'Parametres i-360.', indexable: false, title: 'Parametres | i-360' },
};

