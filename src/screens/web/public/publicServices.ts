export type PublicServiceSlug =
  | 'transport'
  | 'livraison'
  | 'immobilier'
  | 'sante'
  | 'paiements'
  | 'alimentation'
  | 'education'
  | 'tourisme';

export type PublicService = {
  description: string;
  headline: string;
  image: number;
  label: string;
  slug: PublicServiceSlug;
};

export const publicServices: PublicService[] = [
  {
    slug: 'transport',
    label: 'Transport',
    headline: 'Vos trajets a Dakar, avec une arrivee lisible.',
    description: 'Selectionnez votre vehicule, suivez la carte et confirmez votre trajet depuis une interface unique.',
    image: require('../../../../assets/images/transport.png'),
  },
  {
    slug: 'livraison',
    label: 'Livraison',
    headline: 'Livraisons et courses, sans perdre le fil.',
    description: 'Planifiez une livraison et suivez son avancement dans le meme espace que vos commandes.',
    image: require('../../../../pdf-assets/delivery-light.png'),
  },
  {
    slug: 'immobilier',
    label: 'Immobilier',
    headline: 'Trouver un logement devient plus direct.',
    description: 'Explorez les appartements disponibles, filtrez et comparez les prix en quelques gestes.',
    image: require('../../../../pdf-assets/real-estate-light.png'),
  },
  {
    slug: 'sante',
    label: 'Sante',
    headline: 'Soins, pharmacies et rendez-vous accessibles.',
    description: 'Trouvez un medecin ou une pharmacie et gardez vos services essentiels proches de vous.',
    image: require('../../../../pdf-assets/health-light.png'),
  },
  {
    slug: 'paiements',
    label: 'Paiements',
    headline: 'Des paiements rapides et confirmes.',
    description: 'Reglez vos factures et transferts avec une verification biometrique sur les actions sensibles.',
    image: require('../../../../pdf-assets/payments-light.png'),
  },
  {
    slug: 'alimentation',
    label: 'Alimentation',
    headline: 'Restaurants et paniers frais au meme endroit.',
    description: 'Commandez repas ou produits frais avec un parcours simple et adapte au mobile.',
    image: require('../../../../pdf-assets/food-light.png'),
  },
  {
    slug: 'education',
    label: 'Education',
    headline: 'Apprendre avec des services locaux identifies.',
    description: 'Decouvrez cours, coaching et formations avec un acces clair a chaque offre.',
    image: require('../../../../pdf-assets/education-light.png'),
  },
  {
    slug: 'tourisme',
    label: 'Tourisme',
    headline: 'Explorez les experiences locales.',
    description: 'Retrouvez visites et activites a Dakar dans une interface pensee pour choisir vite.',
    image: require('../../../../pdf-assets/tourism-light.png'),
  },
];

export function getPublicService(slug: string | undefined) {
  return publicServices.find((service) => service.slug === slug);
}


