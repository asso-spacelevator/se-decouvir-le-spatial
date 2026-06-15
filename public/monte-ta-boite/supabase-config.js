/* ------------------------------------------------------------------
 * Monte ta boîte spatiale - configuration Supabase (facultative)
 *
 * Le logo importé par l'élève est, si ce fichier est rempli, envoyé
 * dans un bucket de stockage Supabase. Sans configuration, l'activité
 * fonctionne quand même : le logo reste local et sert au certificat.
 *
 * Pour activer l'enregistrement en ligne, sur le site qui héberge
 * l'activité :
 *   1. crée un bucket de stockage (ex. « logos ») dans Supabase ;
 *   2. autorise l'upload (policy d'insertion) pour la clé publique ;
 *   3. renseigne les 3 valeurs ci-dessous.
 *
 * N'utilise ICI que la clé publique « anon » - jamais la clé service.
 * ------------------------------------------------------------------ */

window.MTB_SUPABASE = {
  url:     '',        // ex. 'https://xxxxxxxx.supabase.co'
  anonKey: '',        // clé publique « anon »
  bucket:  'logos',   // nom du bucket de stockage
};
