# BTB Pilote — Guide de mise en service

Pas-à-pas pour passer de zéro à une app en ligne. Ordre strict : **1 → 2 → 3**.

---

## 1. Google Sheet + Apps Script (backend)

### 1a. Créer le Google Sheet
1. Aller sur https://sheets.new → renommer en **"BTB Pilote — Data"**
2. Sheets → Extensions → Apps Script

### 1b. Coller le code GAS
1. Dans l'éditeur Apps Script, supprimer le `Code.gs` par défaut
2. Créer 2 fichiers : `Code.gs` et `Api.gs`
3. Coller le contenu depuis `APP-BTB-PILOTE/Code.gs` et `APP-BTB-PILOTE/Api.gs`
4. Paramètres du projet (⚙) → cocher *"Afficher le fichier manifeste dans l'éditeur"*
5. Remplacer `appsscript.json` par le contenu du fichier local
6. Enregistrer (💾)

### 1c. Initialiser les feuilles
1. Dans l'éditeur, sélectionner la fonction `setupSpreadsheet` (menu déroulant en haut)
2. ▶ Exécuter
3. Accepter les permissions (Google demande l'accès au Sheet)
4. Vérifier dans le Sheet que les onglets sont créés :
   `Users`, `Chantiers`, `Prospects`, `SuiviCommercial`, `Logs`, `Societes`, `Params`

### 1d. Configurer les utilisateurs
Dans l'onglet **Users**, modifier la ligne admin et ajouter les 4 autres :

| id       | email                | pwd         | nom       | prenom   | role       | societePrincipale | actif |
|----------|----------------------|-------------|-----------|----------|------------|-------------------|-------|
| U1       | admin@btb.fr         | *à changer* | Tobelem   | Maxime   | admin      |                   | TRUE  |
| U2       | gerant.allee@btb.fr  | …           | …         | …        | gerant     | ALL               | TRUE  |
| U3       | gerant.jardin@btb.fr | …           | …         | …        | gerant     | JAR               | TRUE  |
| U4       | com1@btb.fr          | …           | …         | …        | commercial |                   | TRUE  |
| U5       | com2@btb.fr          | …           | …         | …        | commercial |                   | TRUE  |

### 1e. Déployer en Web App
1. Éditeur GAS → **Déployer** → **Nouveau déploiement**
2. Type : **Application Web**
3. Description : `v1`
4. Exécuter en tant que : **Moi (`votre email`)**
5. Accès : **Tout le monde** *(obligatoire pour contourner CORS)*
6. **Déployer**
7. **Copier l'URL** qui se termine par `/exec` — elle ressemble à :
   `https://script.google.com/macros/s/AKfycb.../exec`

---

## 2. Frontend Vercel

### 2a. Remplacer l'URL GAS dans le code
Dans `BTB-PILOTE/api.js`, ligne 5, remplacer :
```js
const GAS_URL = 'https://script.google.com/macros/s/REPLACE_WITH_YOUR_DEPLOY_ID/exec';
```
par l'URL copiée à l'étape **1e**.

### 2b. Créer le repo GitHub
```bash
cd BTB-PILOTE
git init
git add .
git commit -m "init: BTB Pilote v1"
# Créer le repo sur github.com/tobelem-sys (nom suggéré : btb-pilote)
git branch -M main
git remote add origin https://github.com/tobelem-sys/btb-pilote.git
git push -u origin main
```

### 2c. Déployer sur Vercel
1. https://vercel.com → **Add new** → **Project**
2. Importer le repo `btb-pilote`
3. Framework preset : **Other**
4. Build command : *(vide)*
5. Output directory : *(vide)*
6. **Deploy**
7. Note l'URL finale (ex : `btb-pilote.vercel.app`)

### 2d. Remplacer l'URL dans DM-PILOTE-360
Si l'URL Vercel n'est pas exactement `btb-pilote.vercel.app`, éditer
`DM-PILOTE-360/index.html` (recherche `btb-pilote.vercel.app`) et remplacer
par la vraie URL, puis `git push`.

---

## 3. Tests

1. Ouvrir `https://btb-pilote.vercel.app`
2. Login avec `admin@btb.fr` / le mot de passe défini à l'étape 1d
3. Créer un chantier test (cocher 1 ou plusieurs sociétés)
4. Créer un prospect test
5. Ajouter une entrée de suivi commercial (type = "devis_signe")
6. Aller sur l'onglet Dashboard → vérifier que le CA signé apparaît
7. Depuis DM-PILOTE-360, cliquer sur la pastille "BTB Pilote ↗" → bascule OK
8. Depuis BTB Pilote, cliquer sur "↗ DM Pilote" dans le header → bascule OK

---

## Dépannage

| Symptôme                                | Cause probable                             | Fix                                                      |
|-----------------------------------------|--------------------------------------------|----------------------------------------------------------|
| "Non autorisé"                          | Token `API_SECRET` différent front/back    | Vérifier qu'ils sont identiques dans `api.js` et `Api.gs` |
| "Failed to fetch"                       | Déploiement GAS pas en "Tout le monde"     | Redéployer, étape 1e option 5                           |
| Login échoue                            | Mauvais mot de passe ou `actif = FALSE`    | Ouvrir le Sheet → onglet Users                           |
| Données vides malgré création          | Cache localStorage                         | F12 → Application → Local Storage → vider `btb_*`        |
| Dashboard CA à 0                        | Pas d'entrée SuiviCommercial avec société | Créer des entrées de type `devis_signe` avec une `societe`|

---

## Évolutions prévues (V2)

- [ ] Droits granulaires par société
- [ ] Export Excel du suivi commercial
- [ ] Objectifs annuels par société / commercial
- [ ] Graphique évolution CA mensuel
- [ ] Import CSV prospects en masse
- [ ] Notifications (email / SMS) sur RDV pris
