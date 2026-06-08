/* ════════════════════════════════════════════════════════════════════════
   Space Elevator — European space-industry companies
   Drop-in dataset for <EuropeActorsMap />.  Save as:
     src/data/europeanSpaceCompanies.ts

   tier:   1 = Grand groupe (>2000)   2 = ETI / scale-up (250–2000)
           3 = PME (50–250)            4 = Startup (<50)
   sector: classifies the company by domain (LAUNCH | SAT | EO | CONN | OPS | GROUND)
   lon/lat = approximate HQ coordinates (decimal degrees, WGS84)
   domain  = website link + logo lookup
   ─────────────────────────────────────────────────────────────────────── */

export type CompanyTier = 1 | 2 | 3 | 4;
export type SectorKey = 'LAUNCH' | 'SAT' | 'EO' | 'CONN' | 'OPS' | 'GROUND';

export interface SpaceCompany {
  name: string;
  tier: CompanyTier;
  sector: SectorKey;
  city: string;
  country: string;
  lon: number;
  lat: number;
  domain: string;
  desc: string;
}

export interface TierStyle {
  label: string;
  /** magenta-scale fill — brightest + biggest = largest firm (size encoding) */
  color: string;
  /** pin radius in the map's internal coordinate space */
  r: number;
}

export interface SectorStyle {
  label: string;
  /** harmonious categorical hue used only in "Domaine" colour mode */
  color: string;
}

/** Size scale — pin radius always encodes this; colour too in "Taille" mode. */
export const TIERS: Record<CompanyTier, TierStyle> = {
  1: { label: 'Grand groupe',   color: '#ff5fa8', r: 9.5 },
  2: { label: 'ETI / scale-up', color: '#e84d97', r: 7.5 },
  3: { label: 'PME',            color: '#cf6fa6', r: 6   },
  4: { label: 'Startup',        color: '#b06d92', r: 4.8 },
};

/** Domain scale — used for filtering, grouping, and "Domaine" colour mode. */
export const SECTORS: Record<SectorKey, SectorStyle> = {
  LAUNCH: { label: 'Lanceurs & propulsion',    color: '#ff5fa8' },
  SAT:    { label: 'Satellites & plateformes', color: '#b57be0' },
  EO:     { label: 'Observation & données',    color: '#5b8def' },
  CONN:   { label: 'Connectivité & IoT',       color: '#3fb6c4' },
  OPS:    { label: 'Opérations & services',    color: '#f0a14b' },
  GROUND: { label: 'Sol & équipements',        color: '#d98aa0' },
};

export const SECTOR_ORDER: SectorKey[] = ['LAUNCH', 'SAT', 'EO', 'CONN', 'OPS', 'GROUND'];

export const EUROPEAN_SPACE_COMPANIES: SpaceCompany[] = [
  /* ── Grands groupes / Primes ─────────────────────────────────────────── */
  { name: 'Airbus Defence and Space', tier: 1, sector: 'SAT', city: 'Toulouse', country: 'FR', lon: 1.4442, lat: 43.6047, domain: 'airbus.com', desc: 'Maître d\u2019\u0153uvre satellites, Galileo, modules de l\u2019ISS.' },
  { name: 'Thales Alenia Space', tier: 1, sector: 'SAT', city: 'Cannes', country: 'FR', lon: 7.0174, lat: 43.5528, domain: 'thalesaleniaspace.com', desc: 'Satellites de télécom, d\u2019observation et infrastructures orbitales.' },
  { name: 'ArianeGroup', tier: 1, sector: 'LAUNCH', city: 'Les Mureaux', country: 'FR', lon: 1.9279, lat: 48.9966, domain: 'ariane.group', desc: 'Maître d\u2019\u0153uvre des lanceurs Ariane 6 et de la propulsion.' },
  { name: 'Safran', tier: 1, sector: 'LAUNCH', city: 'Paris', country: 'FR', lon: 2.3522, lat: 48.8566, domain: 'safran-group.com', desc: 'Propulsion, électronique et équipements spatiaux.' },
  { name: 'OHB SE', tier: 1, sector: 'SAT', city: 'Brême', country: 'DE', lon: 8.8017, lat: 53.0793, domain: 'ohb.de', desc: 'Constructeur de satellites Galileo, Meteosat, défense.' },
  { name: 'Leonardo', tier: 1, sector: 'GROUND', city: 'Rome', country: 'IT', lon: 12.4964, lat: 41.9028, domain: 'leonardo.com', desc: 'Optique spatiale, senseurs et électronique de bord.' },
  { name: 'Avio', tier: 1, sector: 'LAUNCH', city: 'Colleferro', country: 'IT', lon: 13.0050, lat: 41.7299, domain: 'avio.com', desc: 'Maître d\u2019\u0153uvre du lanceur léger Vega.' },
  { name: 'Telespazio', tier: 1, sector: 'OPS', city: 'Rome', country: 'IT', lon: 12.49, lat: 41.90, domain: 'telespazio.com', desc: 'Opérations satellites, géo-information et navigation.' },
  { name: 'Beyond Gravity (RUAG)', tier: 1, sector: 'GROUND', city: 'Zurich', country: 'CH', lon: 8.5417, lat: 47.3769, domain: 'beyondgravity.com', desc: 'Coiffes de lanceurs, structures et électronique spatiale.' },
  { name: 'GMV', tier: 1, sector: 'OPS', city: 'Madrid', country: 'ES', lon: -3.7038, lat: 40.4168, domain: 'gmv.com', desc: 'Logiciels de contrôle, navigation et segment sol.' },

  /* ── ETI / scale-ups ─────────────────────────────────────────────────── */
  { name: 'Sener Aeroespacial', tier: 2, sector: 'GROUND', city: 'Bilbao', country: 'ES', lon: -2.9350, lat: 43.2630, domain: 'aeroespacial.sener', desc: 'Mécanismes, pointage d\u2019antennes et systèmes de bord.' },
  { name: 'Isar Aerospace', tier: 2, sector: 'LAUNCH', city: 'Munich', country: 'DE', lon: 11.5820, lat: 48.1351, domain: 'isaraerospace.com', desc: 'Micro-lanceur Spectrum pour petits satellites.' },
  { name: 'Rocket Factory Augsburg', tier: 2, sector: 'LAUNCH', city: 'Augsbourg', country: 'DE', lon: 10.8978, lat: 48.3705, domain: 'rfa.space', desc: 'Lanceur RFA ONE à coût réduit, production en série.' },
  { name: 'The Exploration Company', tier: 2, sector: 'OPS', city: 'Munich', country: 'DE', lon: 11.55, lat: 48.14, domain: 'exploration.space', desc: 'Capsule cargo réutilisable Nyx pour le ravitaillement.' },
  { name: 'ICEYE', tier: 2, sector: 'EO', city: 'Espoo', country: 'FI', lon: 24.6559, lat: 60.2055, domain: 'iceye.com', desc: 'Plus grande constellation radar SAR au monde.' },
  { name: 'D-Orbit', tier: 2, sector: 'OPS', city: 'Fino Mornasco', country: 'IT', lon: 9.0500, lat: 45.7470, domain: 'dorbit.space', desc: 'Logistique orbitale et véhicule de transfert ION.' },
  { name: 'Open Cosmos', tier: 2, sector: 'SAT', city: 'Harwell', country: 'UK', lon: -1.3140, lat: 51.5719, domain: 'open-cosmos.com', desc: 'Missions satellites clé en main et plateforme DataCosmos.' },
  { name: 'PLD Space', tier: 2, sector: 'LAUNCH', city: 'Elche', country: 'ES', lon: -0.6983, lat: 38.2655, domain: 'pldspace.com', desc: 'Lanceurs réutilisables Miura 1 et Miura 5.' },
  { name: 'Exotrail', tier: 2, sector: 'LAUNCH', city: 'Massy', country: 'FR', lon: 2.2730, lat: 48.7300, domain: 'exotrail.com', desc: 'Propulsion électrique et mobilité orbitale spacevan.' },
  { name: 'HEMERIA', tier: 2, sector: 'SAT', city: 'Toulouse', country: 'FR', lon: 1.43, lat: 43.61, domain: 'hemeria-group.com', desc: 'Nanosatellites, charges utiles et systèmes critiques.' },
  { name: 'Spire Global', tier: 2, sector: 'EO', city: 'Luxembourg', country: 'LU', lon: 6.1319, lat: 49.6116, domain: 'spire.com', desc: 'Constellation de nanosatellites météo et AIS/ADS-B.' },
  { name: 'AAC Clyde Space', tier: 2, sector: 'SAT', city: 'Glasgow', country: 'UK', lon: -4.2518, lat: 55.8642, domain: 'aac-clyde.space', desc: 'Plateformes CubeSat et sous-systèmes de bord.' },
  { name: 'GomSpace', tier: 2, sector: 'SAT', city: 'Aalborg', country: 'DK', lon: 9.9217, lat: 57.0488, domain: 'gomspace.com', desc: 'Nanosatellites et constellations clé en main.' },
  { name: 'Argotec', tier: 2, sector: 'SAT', city: 'Turin', country: 'IT', lon: 7.6869, lat: 45.0703, domain: 'argotecgroup.com', desc: 'Petits satellites d\u2019espace lointain (HERA, Artemis).' },

  /* ── PME ──────────────────────────────────────────────────────────────── */
  { name: 'Maia Space', tier: 3, sector: 'LAUNCH', city: 'Vernon', country: 'FR', lon: 1.4836, lat: 49.0930, domain: 'maia-space.com', desc: 'Mini-lanceur réutilisable, filiale d\u2019ArianeGroup.' },
  { name: 'Latitude', tier: 3, sector: 'LAUNCH', city: 'Reims', country: 'FR', lon: 4.0317, lat: 49.2583, domain: 'latitude.eu', desc: 'Micro-lanceur Zephyr produit en intégration verticale.' },
  { name: 'Orbex', tier: 3, sector: 'LAUNCH', city: 'Forres', country: 'UK', lon: -3.6200, lat: 57.6080, domain: 'orbex.space', desc: 'Lanceur Prime bio-propergol depuis l\u2019Écosse.' },
  { name: 'Skyrora', tier: 3, sector: 'LAUNCH', city: 'Édimbourg', country: 'UK', lon: -3.1883, lat: 55.9533, domain: 'skyrora.com', desc: 'Lanceurs suborbitaux et orbitaux Skyrora XL.' },
  { name: 'Unseenlabs', tier: 3, sector: 'EO', city: 'Rennes', country: 'FR', lon: -1.6778, lat: 48.1173, domain: 'unseenlabs.space', desc: 'Surveillance maritime par écoute radiofréquence.' },
  { name: 'Kinéis', tier: 3, sector: 'CONN', city: 'Toulouse', country: 'FR', lon: 1.44, lat: 43.60, domain: 'kineis.com', desc: 'Constellation IoT et connectivité des objets.' },
  { name: 'Loft Orbital', tier: 3, sector: 'SAT', city: 'Toulouse', country: 'FR', lon: 1.45, lat: 43.62, domain: 'loftorbital.com', desc: 'Satellites partagés « space infrastructure as a service ».' },
  { name: 'Aerospacelab', tier: 3, sector: 'SAT', city: 'Mont-Saint-Guibert', country: 'BE', lon: 4.6100, lat: 50.6400, domain: 'aerospacelab.com', desc: 'Méga-usine de satellites et intelligence géospatiale.' },
  { name: 'EnduroSat', tier: 3, sector: 'SAT', city: 'Sofia', country: 'BG', lon: 23.3219, lat: 42.6977, domain: 'endurosat.com', desc: 'Plateformes nanosatellites logicielles définies.' },
  { name: 'OroraTech', tier: 3, sector: 'EO', city: 'Munich', country: 'DE', lon: 11.58, lat: 48.13, domain: 'ororatech.com', desc: 'Détection des feux de forêt par infrarouge thermique.' },
  { name: 'constellr', tier: 3, sector: 'EO', city: 'Fribourg', country: 'DE', lon: 7.8421, lat: 47.9990, domain: 'constellr.com', desc: 'Mesure de la température de surface des sols.' },
  { name: 'Planetek', tier: 3, sector: 'EO', city: 'Bari', country: 'IT', lon: 16.8719, lat: 41.1171, domain: 'planetek.it', desc: 'Traitement d\u2019images et géo-information.' },
  { name: 'AIKO', tier: 3, sector: 'OPS', city: 'Turin', country: 'IT', lon: 7.69, lat: 45.07, domain: 'aikospace.com', desc: 'Autonomie des missions par intelligence artificielle.' },
  { name: 'Sateliot', tier: 3, sector: 'CONN', city: 'Barcelone', country: 'ES', lon: 2.1686, lat: 41.3874, domain: 'sateliot.space', desc: 'Constellation 5G NB-IoT depuis l\u2019espace.' },
  { name: 'Pangea Aerospace', tier: 3, sector: 'LAUNCH', city: 'Barcelone', country: 'ES', lon: 2.17, lat: 41.39, domain: 'pangeaaerospace.com', desc: 'Moteurs aerospike et propulsion réutilisable.' },
  { name: 'Kuva Space', tier: 3, sector: 'EO', city: 'Espoo', country: 'FI', lon: 24.65, lat: 60.20, domain: 'kuvaspace.com', desc: 'Constellation hyperspectrale pour l\u2019agriculture.' },
  { name: 'ReOrbit', tier: 3, sector: 'SAT', city: 'Helsinki', country: 'FI', lon: 24.9384, lat: 60.1699, domain: 'reorbit.space', desc: 'Satellites logiciels et liaisons inter-satellites.' },
  { name: 'Morpheus Space', tier: 3, sector: 'LAUNCH', city: 'Dresde', country: 'DE', lon: 13.7373, lat: 51.0504, domain: 'morpheus-space.com', desc: 'Propulsion électrique pour petits satellites.' },
  { name: 'LuxSpace', tier: 3, sector: 'SAT', city: 'Betzdorf', country: 'LU', lon: 6.3500, lat: 49.6850, domain: 'luxspace.lu', desc: 'Micro-satellites et systèmes maritimes.' },

  /* ── Startups ─────────────────────────────────────────────────────────── */
  { name: 'Skynopy', tier: 4, sector: 'GROUND', city: 'Paris', country: 'FR', lon: 2.3522, lat: 48.8566, domain: 'skynopy.com', desc: 'Réseau de stations sol en service pour relier les satellites.' },
  { name: 'Mecano ID', tier: 4, sector: 'GROUND', city: 'Toulouse', country: 'FR', lon: 1.46, lat: 43.59, domain: 'mecano-id.fr', desc: 'Structures, mécanismes et bancs de test spatiaux.' },
  { name: 'Anywaves', tier: 4, sector: 'GROUND', city: 'Toulouse', country: 'FR', lon: 1.43, lat: 43.62, domain: 'anywaves.com', desc: 'Antennes miniatures pour petits satellites.' },
  { name: 'Look Up Space', tier: 4, sector: 'OPS', city: 'Paris', country: 'FR', lon: 2.35, lat: 48.85, domain: 'lookupspace.com', desc: 'Surveillance du trafic spatial et anti-collision.' },
  { name: 'Dark', tier: 4, sector: 'OPS', city: 'Paris', country: 'FR', lon: 2.36, lat: 48.86, domain: 'dark.space', desc: 'Interception de débris et défense orbitale.' },
  { name: 'Infinite Orbits', tier: 4, sector: 'OPS', city: 'Toulouse', country: 'FR', lon: 1.47, lat: 43.60, domain: 'infiniteorbits.io', desc: 'Extension de vie et services en orbite géostationnaire.' },
  { name: 'Prométhée', tier: 4, sector: 'EO', city: 'Paris', country: 'FR', lon: 2.34, lat: 48.87, domain: 'promethee.space', desc: 'Constellation d\u2019observation à la demande.' },
  { name: 'Constellation Technologies', tier: 4, sector: 'CONN', city: 'Toulouse', country: 'FR', lon: 1.45, lat: 43.58, domain: 'constellationtechnologies.space', desc: 'Connectivité haut débit en orbite basse.' },
  { name: 'Reflex Aerospace', tier: 4, sector: 'SAT', city: 'Berlin', country: 'DE', lon: 13.4050, lat: 52.5200, domain: 'reflexaerospace.com', desc: 'Satellites sur-mesure rapides à fabriquer.' },
  { name: 'Atmos Space Cargo', tier: 4, sector: 'OPS', city: 'Stuttgart', country: 'DE', lon: 9.1829, lat: 48.7758, domain: 'atmos.space', desc: 'Capsule de retour de fret depuis l\u2019orbite.' },
  { name: 'Zero 2 Infinity', tier: 4, sector: 'LAUNCH', city: 'Barcelone', country: 'ES', lon: 2.16, lat: 41.38, domain: 'zero2infinity.space', desc: 'Accès à l\u2019espace par ballons stratosphériques.' },
  { name: 'Ienai Space', tier: 4, sector: 'LAUNCH', city: 'Madrid', country: 'ES', lon: -3.70, lat: 40.42, domain: 'ienai.space', desc: 'Micro-propulsion électrique à la demande.' },
];
