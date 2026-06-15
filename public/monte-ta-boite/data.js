/* ------------------------------------------------------------------
 * Monte ta boîte spatiale - base de référence des métiers
 *
 * Chaque métier porte une liste de mots-clés (déjà en minuscules,
 * sans accents) servant à reconnaître ce que l'élève a tapé.
 *
 * Dans le cœur de métier, chaque poste porte un niveau (lvl) :
 *   'ing'  - bureau d'études / ingénierie / conception
 *   'tech' - fabrication, essais, opérations, terrain
 * pour distinguer les ingénieurs des techniciens & opérateurs.
 * ------------------------------------------------------------------ */

/* Catégories de tête (avant le cœur de métier) */
const LEAD_CATS = [
  {
    id: 'direction',
    label: 'Direction & pilotage',
    note: 'Qui décide, porte la vision, signe ?',
    weight: 1.5,
    jobs: [
      { name: 'Directeur·rice général·e (CEO)', kw: ['ceo', 'pdg', 'directeur general', 'directrice generale', 'dirigeant', 'dirigeante', 'president', 'presidente', 'fondateur', 'fondatrice', 'patron', 'patronne', 'gerant', 'gerante', 'dg'] },
      { name: 'Directeur·rice des opérations (COO)', kw: ['coo', 'directeur des operations', 'directrice des operations', 'directeur operationnel', 'responsable des operations', 'directeur general adjoint'] },
      { name: 'Directeur·rice technique (CTO)', kw: ['cto', 'directeur technique', 'directrice technique', 'responsable technique', 'directeur r d', 'directeur recherche'] },
      { name: 'Directeur·rice administratif·ve & financier·e (CFO)', kw: ['cfo', 'daf', 'directeur financier', 'directrice financiere', 'directeur administratif', 'directeur general des finances'] },
    ],
  },
];

/* Catégories de support (après le cœur de métier) */
const TAIL_CATS = [
  {
    id: 'support',
    label: 'Fonctions support',
    note: 'Tout ce qui fait tourner la boîte au quotidien.',
    weight: 1.5,
    jobs: [
      { name: 'Ressources humaines (RH)', kw: ['rh', 'ressources humaines', 'ressource humaine', 'recruteur', 'recruteuse', 'recrutement', 'drh', 'gestion du personnel', 'paie', 'paye', 'gestionnaire de paie'] },
      { name: 'Juriste / Avocat·e', kw: ['juriste', 'avocat', 'avocate', 'juridique', 'droit', 'legal', 'contrat', 'propriete intellectuelle', 'brevet'] },
      { name: 'Commercial·e / Ventes', kw: ['commercial', 'commerciale', 'vente', 'vendeur', 'vendeuse', 'business developer', 'business development', 'account', 'sales', 'ingenieur d affaires'] },
      { name: 'Comptable / Contrôleur·se de gestion', kw: ['comptable', 'comptabilite', 'controleur de gestion', 'controleuse de gestion', 'tresorerie', 'facturation', 'gestionnaire'] },
      { name: 'Communication / Marketing', kw: ['communication', 'marketing', 'charge de com', 'chargee de com', 'community manager', 'relations presse', 'publicite', 'graphiste'] },
      { name: 'Acheteur·se / Achats & logistique', kw: ['acheteur', 'acheteuse', 'achat', 'achats', 'approvisionnement', 'supply chain', 'logistique', 'logisticien', 'magasinier', 'procurement'] },
      { name: 'Assistant·e de direction', kw: ['assistant', 'assistante', 'secretaire', 'office manager', 'assistanat', 'standardiste', 'accueil'] },
    ],
  },
  {
    id: 'securite',
    label: 'Sécurité, sûreté & qualité',
    note: 'Protéger les personnes, les sites, garantir la qualité.',
    weight: 1,
    jobs: [
      { name: 'Responsable QHSE / sécurité', kw: ['hse', 'qhse', 'prevention', 'responsable securite', 'hygiene securite', 'sst', 'safety', 'securite au travail'] },
      { name: 'Agent·e de sûreté / sécurité des sites', kw: ['surete', 'gardien', 'gardienne', 'agent de securite', 'securite des sites', 'securite physique', 'controle d acces', 'vigile'] },
      { name: 'Responsable qualité', kw: ['qualite', 'assurance qualite', 'controle qualite', 'qualiticien', 'qualiticienne', 'qa'] },
    ],
  },
  {
    id: 'si',
    label: 'Informatique & SI',
    note: 'Les systèmes, les données, la cybersécurité.',
    weight: 1,
    jobs: [
      { name: 'Administrateur·rice systèmes & réseaux', kw: ['informatique', 'informaticien', 'informaticienne', 'systeme d information', 'administrateur systeme', 'sysadmin', 'reseau informatique', 'support informatique', 'devops', 'infrastructure informatique', 'it'] },
      { name: 'Expert·e cybersécurité', kw: ['cybersecurite', 'cyber', 'securite informatique', 'ssi', 'rssi', 'pentest', 'securite des donnees', 'securite des systemes'] },
      { name: 'Développeur·se / Data interne', kw: ['developpeur', 'developpeuse', 'programmeur', 'programmeuse', 'data', 'base de donnees', 'logiciel interne', 'informatique de gestion'] },
    ],
  },
  {
    id: 'jeunes',
    label: 'Jeunes talents',
    note: 'On forme la relève : il y a de la place pour débuter.',
    weight: 0.5,
    jobs: [
      { name: 'Stagiaire·s', kw: ['stagiaire', 'stage', 'stagiaires'] },
      { name: 'Alternant·e / Apprenti·e', kw: ['alternant', 'alternante', 'alternance', 'apprenti', 'apprentie', 'apprentissage'] },
    ],
  },
];

/* Les 5 secteurs - chacun avec son cœur de métier, scindé en
 * ingénierie (ing) et fabrication / terrain (tech). */
const SECTORS = [
  {
    id: 'lanceurs',
    label: 'Lanceurs',
    icon: 'rocket',
    tagline: 'Concevoir et faire décoller les fusées.',
    example: 'Ex. : Ariane, le moteur Prometheus, les mini-lanceurs.',
    coreLabels: { ing: "Bureau d'études (ingénierie)", tech: 'Fabrication, essais & lancement' },
    coreNotes: { ing: 'Concevoir et calculer la fusée.', tech: 'Fabriquer, souder, assembler, tester et lancer.' },
    jobs: [
      { lvl: 'ing', name: 'Ingénieur·e propulsion', kw: ['propulsion', 'moteur fusee', 'motoriste', 'ingenieur moteur', 'combustion', 'ergol'] },
      { lvl: 'ing', name: 'Ingénieur·e structures', kw: ['structure', 'ingenieur structure', 'resistance des materiaux', 'calcul de structure'] },
      { lvl: 'ing', name: 'Ingénieur·e systèmes lanceur', kw: ['systeme lanceur', 'architecte lanceur', 'ingenieur systeme', 'architecte systeme'] },
      { lvl: 'ing', name: 'Ingénieur·e trajectoire / guidage', kw: ['trajectoire', 'guidage', 'trajectographie', 'balistique', 'navigation'] },
      { lvl: 'tech', name: 'Technicien·ne assemblage & intégration', kw: ['technicien', 'technicienne', 'assemblage', 'integration', 'monteur', 'ajusteur', 'assembleur'] },
      { lvl: 'tech', name: 'Soudeur·se / Chaudronnier·e', kw: ['soudeur', 'soudeuse', 'soudure', 'chaudronnier', 'chaudronniere', 'chaudronnerie', 'usinage', 'usineur'] },
      { lvl: 'tech', name: "Opérateur·rice banc d'essai", kw: ['banc d essai', 'essais', 'operateur essai', 'testeur', 'test moteur', 'essai au feu'] },
      { lvl: 'tech', name: 'Responsable base de lancement', kw: ['base de lancement', 'pas de tir', 'chef de tir', 'directeur de tir', 'operations de lancement'] },
    ],
  },
  {
    id: 'satellites',
    label: 'Satellites',
    icon: 'satellite',
    tagline: 'Fabriquer les satellites et leurs instruments.',
    example: "Ex. : satellites télécom, d'observation, nano-satellites.",
    coreLabels: { ing: "Bureau d'études (ingénierie)", tech: 'Intégration & essais' },
    coreNotes: { ing: 'Concevoir le satellite, sous-système par sous-système.', tech: 'Assembler en salle blanche et qualifier.' },
    jobs: [
      { lvl: 'ing', name: 'Ingénieur·e systèmes satellite', kw: ['systeme satellite', 'architecte satellite', 'ingenieur systeme', 'architecte systeme'] },
      { lvl: 'ing', name: 'Ingénieur·e charge utile', kw: ['charge utile', 'payload', 'instrument', 'capteur'] },
      { lvl: 'ing', name: 'Ingénieur·e thermique', kw: ['thermique', 'thermicien', 'thermicienne', 'controle thermique'] },
      { lvl: 'ing', name: 'Ingénieur·e mécanique / structure', kw: ['mecanique', 'mecanicien', 'mecanicienne', 'structure', 'panneau solaire'] },
      { lvl: 'ing', name: 'Ingénieur·e électronique', kw: ['electronique', 'electronicien', 'electronicienne', 'carte electronique', 'circuit'] },
      { lvl: 'ing', name: "Ingénieur·e contrôle d'attitude (AOCS)", kw: ['aocs', 'controle d attitude', 'attitude', 'sca', 'pointage'] },
      { lvl: 'tech', name: 'Technicien·ne intégration salle blanche', kw: ['technicien', 'technicienne', 'integration', 'salle blanche', 'assemblage', 'monteur', 'cablage'] },
      { lvl: 'tech', name: 'Technicien·ne / ingénieur·e essais', kw: ['essais', 'test', 'vibration', 'vide thermique', 'testeur', 'qualification', 'banc de test'] },
    ],
  },
  {
    id: 'applications',
    label: 'Applications & services',
    icon: 'radio',
    tagline: 'Exploiter les données : météo, GPS, internet, images.',
    example: 'Ex. : prévisions météo, navigation, internet par satellite.',
    coreLabels: { ing: 'Conception, données & développement', tech: 'Produit, terrain & service' },
    coreNotes: { ing: 'Concevoir les algorithmes, traiter les données, coder.', tech: 'Mettre le service entre les mains des clients.' },
    jobs: [
      { lvl: 'ing', name: "Ingénieur·e traitement d'images / données", kw: ['traitement d image', 'traitement de donnees', 'image satellite', 'teledetection', 'traitement du signal'] },
      { lvl: 'ing', name: 'Data scientist / analyste de données', kw: ['data scientist', 'analyste', 'statisticien', 'statisticienne', 'intelligence artificielle', 'ia', 'machine learning'] },
      { lvl: 'ing', name: 'Développeur·se logiciel', kw: ['developpeur', 'developpeuse', 'developpement', 'logiciel', 'programmeur', 'programmeuse', 'code', 'software', 'application'] },
      { lvl: 'ing', name: 'Ingénieur·e télécom', kw: ['telecom', 'telecommunication', 'reseau telecom', 'transmission', 'antenne reseau'] },
      { lvl: 'ing', name: 'Chercheur·se / R&D (algorithmes, signal)', kw: ['chercheur', 'chercheuse', 'recherche', 'r d', 'rd', 'doctorant', 'doctorante', 'scientifique', 'labo', 'recherche et developpement'] },
      { lvl: 'ing', name: 'Géomaticien·ne / cartographe', kw: ['geomatique', 'geomaticien', 'geomaticienne', 'cartographe', 'cartographie', 'sig', 'gis'] },
      { lvl: 'tech', name: 'Chef·fe de produit', kw: ['chef de produit', 'cheffe de produit', 'product manager', 'product owner', 'responsable produit'] },
      { lvl: 'tech', name: 'Designer UX / UI', kw: ['ux', 'ui', 'designer', 'design', 'ergonome', 'interface', 'experience utilisateur'] },
      { lvl: 'tech', name: 'Technicien·ne support client', kw: ['support client', 'hotline', 'assistance', 'technicien support', 'service client', 'relation client'] },
    ],
  },
  {
    id: 'vol-habite',
    label: 'Vol habité & exploration',
    icon: 'telescope',
    tagline: 'Envoyer humains et robots explorer en sécurité.',
    example: 'Ex. : la Station spatiale, les rovers, les missions Mars.',
    coreLabels: { ing: 'Ingénierie & conception', tech: 'Équipage, opérations & sciences' },
    coreNotes: { ing: "Concevoir les systèmes qui gardent l'équipage en vie.", tech: 'Faire voler, soigner, opérer et explorer.' },
    jobs: [
      { lvl: 'ing', name: 'Ingénieur·e systèmes habités (survie)', kw: ['systeme habite', 'support vie', 'life support', 'survie', 'environnement de vie', 'recyclage air'] },
      { lvl: 'ing', name: 'Ingénieur·e robotique', kw: ['robotique', 'roboticien', 'roboticienne', 'robot', 'bras robotise', 'rover'] },
      { lvl: 'ing', name: 'Ingénieur·e EVA / combinaisons', kw: ['eva', 'combinaison', 'scaphandre', 'sortie extravehiculaire'] },
      { lvl: 'ing', name: 'Ingénieur·e rentrée atmosphérique', kw: ['rentree atmospherique', 'bouclier thermique', 'reentree', 'capsule', 'atterrissage'] },
      { lvl: 'tech', name: 'Médecin / spécialiste santé spatiale', kw: ['medecin', 'medical', 'sante', 'physiologie', 'docteur', 'infirmier', 'infirmiere'] },
      { lvl: 'tech', name: 'Contrôleur·se de vol (flight controller)', kw: ['controleur de vol', 'controleuse de vol', 'flight controller', 'controle de mission', 'operateur de vol', 'capcom'] },
      { lvl: 'tech', name: 'Astronaute', kw: ['astronaute', 'spationaute', 'cosmonaute', 'taikonaute'] },
      { lvl: 'tech', name: 'Scientifique (biologie, géologie…)', kw: ['scientifique', 'chercheur', 'chercheuse', 'biologiste', 'geologue', 'astrophysicien', 'science'] },
    ],
  },
  {
    id: 'segment-sol',
    label: 'Segment sol & opérations',
    icon: 'radio-tower',
    tagline: 'Piloter les engins depuis la Terre.',
    example: 'Ex. : centres de contrôle, antennes, réseau de stations.',
    coreLabels: { ing: 'Ingénierie sol', tech: 'Opérations & maintenance' },
    coreNotes: { ing: 'Concevoir les stations, les orbites et les liaisons.', tech: 'Piloter au quotidien et entretenir les moyens.' },
    jobs: [
      { lvl: 'ing', name: 'Ingénieur·e station sol', kw: ['station sol', 'segment sol', 'station terrienne', 'ingenieur sol'] },
      { lvl: 'ing', name: 'Ingénieur·e dynamique de vol', kw: ['dynamique de vol', 'mecanique orbitale', 'orbitographie', 'flight dynamics', 'calcul d orbite'] },
      { lvl: 'ing', name: 'Ingénieur·e exploitation / planification', kw: ['exploitation', 'planification', 'planificateur', 'planificatrice', 'ordonnancement', 'mission planning'] },
      { lvl: 'tech', name: 'Opérateur·rice centre de contrôle', kw: ['operateur', 'operatrice', 'centre de controle', 'salle de controle', 'operateur console', 'controle satellite'] },
      { lvl: 'tech', name: 'Spécialiste télémesure / télécommande', kw: ['telemesure', 'telecommande', 'ttc', 'telemetrie', 'commande satellite'] },
      { lvl: 'tech', name: 'Technicien·ne antennes', kw: ['antenne', 'technicien antenne', 'parabole', 'radio', 'pointage antenne'] },
      { lvl: 'tech', name: 'Administrateur·rice réseaux sol', kw: ['reseau', 'administrateur reseau', 'infrastructure sol', 'sysadmin', 'reseau sol'] },
      { lvl: 'tech', name: 'Technicien·ne maintenance', kw: ['maintenance', 'maintenancier', 'support technique', 'depannage', 'entretien'] },
    ],
  },
];

window.MTB_DATA = { LEAD_CATS, TAIL_CATS, SECTORS };
