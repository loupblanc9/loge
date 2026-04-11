# Déployer sur Vercel (sans mettre les secrets sur GitHub)

## Règle d’or

- **Ne jamais** committer le fichier `.env` sur GitHub.
- Les mots de passe vont uniquement dans **Vercel → Settings → Environment Variables**.

Si `.env` a déjà été poussé sur GitHub : considérez les secrets comme **compromis** → changez le mot de passe base Supabase, générez un nouveau `JWT_SECRET`, régénérez les clés S3 si vous en aviez.

---

## 1. Retirer `.env` du dépôt Git

Sur ton PC, dans le dossier du projet :

1. Vérifie que `.env` n’est pas versionné :  
   `git status`  
   S’il apparaît, ne le commit plus.

2. Pour le retirer du dépôt **sans le supprimer de ton disque** :  
   `git rm --cached .env`  
   puis commit + push :  
   `git commit -m "Retrait du fichier .env du dépôt"`  
   `git push`

3. Sur GitHub, ouvre le repo → si `.env` est encore visible dans un ancien commit, les secrets ont fuité → **changez-les** (Supabase, JWT, etc.).

---

## 2. Où mettre les variables sur Vercel (étape par étape)

1. Va sur **https://vercel.com** et connecte-toi.
2. Clique sur ton **projet** (ex. `logement`).
3. En haut : **Settings** (Paramètres).
4. Dans le menu de gauche : **Environment Variables**.
5. Pour **chaque** ligne du tableau ci-dessous :
   - **Key** = le nom exact (ex. `DATABASE_URL`)
   - **Value** = la valeur (copiée depuis ton `.env` **local**, pas depuis GitHub)
   - Coche au minimum **Production** (et **Preview** si tu veux que les previews marchent aussi).
   - Clique **Save**.

6. Va dans **Deployments** → sur le dernier déploiement : menu **⋯** → **Redeploy** (pour prendre en compte les nouvelles variables).

---

## 3. Liste des variables à renseigner

| Nom sur Vercel | Obligatoire ? | D’où la prendre |
|----------------|---------------|-----------------|
| `DATABASE_URL` | Oui | Supabase → Settings → Database → URI **Transaction pooler** (souvent port `6543`). |
| `DIRECT_URL` | Oui (Prisma) | Même page : URI **Session pooler** (port `5432`) ou celle qui marche depuis Vercel. |
| `JWT_SECRET` | Oui | Une longue chaîne aléatoire (32+ caractères), **différente** du dev. |
| `NEXT_PUBLIC_APP_URL` | Recommandé | `https://ton-projet.vercel.app` (l’URL affichée après le 1er déploiement). |
| `MAX_FILE_BYTES` | Optionnel | Ex. `10485760` |
| `UPLOAD_DIR` | Sur Vercel peu utile | Ex. `./uploads` |
| `STORAGE_DRIVER` | Recommandé prod | `local` pour test rapide ; `s3` pour garder les fichiers (voir doc S3). |

**Important :** Prisma lit `DATABASE_URL` et `DIRECT_URL` au moment du `postinstall` / build. Si l’une manque, le build peut échouer.

---

## 4. Root Directory sur Vercel

Si le repo contient plusieurs dossiers et que Next.js est dans `dossierloc-backend` :

- **Settings → General → Root Directory** → `dossierloc-backend`  
- Save, puis Redeploy.

---

## 5. Lire les logs de build

- **Deployments** → clique sur le déploiement → **Building** / **Logs**.
- Fais défiler jusqu’à la **fin** : en rouge = erreur (copie le message complet pour le support).

Les 32 premières lignes avec seulement `prisma generate` peuvent être normales ; la suite montre `next build` et les erreurs éventuelles.

---

## 6. Après un déploiement réussi

- Ouvre l’URL `https://….vercel.app`
- Teste **Inscription** et **Connexion**.
- Crée un admin : SQL Supabase `UPDATE "User" SET role = 'admin' WHERE email = 'ton@email.com';` puis reconnecte-toi.
