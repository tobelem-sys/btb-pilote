# BTB Pilote — Frontend

Pilotage triple société (Allée · Clôture · Jardin).

## Architecture

- **Frontend** : HTML + JS natif, hébergé sur Vercel (`btb-pilote.vercel.app`).
- **Backend** : Google Apps Script (`APP-BTB-PILOTE/`) exposant une API REST sur un Google Sheet.
- **Même pattern technique que DM-PILOTE-360** : `api.js` cache localStorage, `apiGet`/`apiPost` via `action=write` pour contourner CORS cross-origin GAS.

## Stack

| Couche       | Fichier          |
|--------------|------------------|
| Login        | `index.html` section `#loginView` |
| Dashboard    | `loadDashboard()` |
| Chantiers    | `renderChantiers()` + modale `#modalChantier` |
| Prospects    | `renderProspects()` + modale `#modalProspect` |
| Suivi comm.  | `renderSuivi()` + modale `#modalSuivi` |
| API client   | `api.js` (objet `API`) |

## Déploiement

1. Remplacer `GAS_URL` dans `api.js` par l'URL de déploiement GAS.
2. `git push` → Vercel redéploie.

## Modèle de données

Tableau `societes` = array de codes `['ALL','CLO','JAR']` — permet les chantiers/prospects qui concernent 1, 2 ou 3 sociétés.

Colonne dans le Sheet = CSV (`"ALL,CLO"`) → le backend normalise entrée/sortie.

## Rôles

- `admin` (Tobelem) : accès complet, gestion utilisateurs
- `gerant` : lecture + écriture sur les 3 sociétés
- `commercial` : lecture + écriture sur les 3 sociétés

(Filtrage par société se fait côté UI via les dropdowns "Filtre société".)
