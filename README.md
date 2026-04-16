## Domicial (SaaS dossiers locatifs)

Monolithe **Next.js App Router** (UI + API) avec **PostgreSQL/Supabase + Prisma**.

### Fonctionnalités

- Auth : inscription/connexion/déconnexion + session (`/api/auth/*`)
- Dossiers : création, listing filtré/trié/paginé, détail, split view (`/api/dossiers*`)
- Documents : upload PDF/JPG/PNG, validation/rejet admin, bulk (`/api/dossiers/*/documents/*`)
- Tags : CRUD admin + assignation dossier (`/api/tags`, `/api/dossiers/:id/tags`)
- Admin : actions groupées (`/api/admin/dossiers/bulk`)

### Démarrer en local

1. Créer un fichier `.env` à partir de `.env.example` (ne jamais committer `.env`).
2. Appliquer les tables (via Supabase SQL Editor ou Prisma migrations).
3. Seed (compte admin + client) :

```bash
npm run db:seed
```

4. Lancer :

```bash
npm run dev
```

### Déploiement (Vercel)

Voir `GUIDE_VERCEL.md`.

### Variables d’environnement (production)

Minimum :

- `DATABASE_URL`
- `DIRECT_URL` (souvent **session pooler** si IPv4)
- `JWT_SECRET` (32+ caractères aléatoires)
- `NEXT_PUBLIC_APP_URL` (ex. `https://ton-projet.vercel.app`)

Optionnel recommandé :

- `JWT_ISSUER` (défaut `dossierloc`)
- `JWT_AUDIENCE` (défaut `dossierloc-users`)

### Sécurité

- Ne jamais committer `.env`
- En cas de fuite : changer les mots de passe DB + `JWT_SECRET`
