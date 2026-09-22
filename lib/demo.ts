import type { Product, ShareLink } from './types';

export const demoProducts: Product[] = [
  {
    id: 'demo-idealmelt',
    name: 'IdealMelt',
    slug: 'idealmelt',
    category: 'Melting systems',
    description: 'Sistema Idealtech per la gestione professionale dei materiali hot-melt.',
    model_url: null,
    model_path: null,
    poster_url: null,
    published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-idmgp',
    name: 'IDM-GP',
    slug: 'idm-gp',
    category: 'Melting systems',
    description: 'Configurazione dimostrativa predisposta per la vista interna senza carter laterale.',
    model_url: null,
    model_path: null,
    poster_url: null,
    published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-drum',
    name: 'Drum 200-20',
    slug: 'drum-200-20',
    category: 'Drum melters',
    description: 'Unità per fusti predisposta alla presentazione 3D interattiva.',
    model_url: null,
    model_path: null,
    poster_url: null,
    published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const demoShares: ShareLink[] = [];
