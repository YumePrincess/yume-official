<p align="center">
  <img src="assets/yumeofficial.png" alt="Yume Official" width="540">
</p>

<p align="center">
  <a href="README.md">English</a> · <a href="README.fr.md">Français</a> · <a href="README.ja.md">日本語</a> · <a href="README.zh-CN.md">简体中文</a> · <a href="README.zh-TW.md">繁體中文</a>
</p>

# Yume Official Backend

Yume Official Backend est un service de gestion et de partage de fichiers pour Cloudflare Workers. Il utilise Cloudflare R2 pour stocker les fichiers et D1 pour les métadonnées de l’application.

Le nom de déploiement Worker et le nom de la base D1 par défaut sont tous deux `yume-official-backend`.

### Fonctionnalités

- Tableau d’administration pour téléverser, télécharger, prévisualiser et modifier des fichiers texte, organiser les dossiers et créer des archives ZIP.
- Partage public de fichiers et de dossiers avec mot de passe et date d’expiration facultatifs, ainsi qu’un navigateur public.
- Accès WebDAV à l’adresse `/dav`.
- Publication d’abonnements Clash et Mihomo à partir de fichiers YAML, avec des URL de partage chiffrées.
- Connexion OIDC facultative avec liste d’adresses e-mail autorisées ; la connexion par mot de passe est disponible lorsque OIDC est désactivé.
- API intégrées pour les annonces, la traduction, la géolocalisation, la météo et Workers AI.
- Interface disponible en anglais, français, japonais, chinois simplifié et chinois traditionnel.

### Déploiement

Prérequis : Node.js 20 ou version ultérieure, npm et un compte Cloudflare avec Workers, R2, D1, Queues et Workers AI.

1. Installez les dépendances, créez une configuration à partir du modèle et connectez Wrangler :

   ```sh
   npm install
   cp wrangler.example.jsonc wrangler.jsonc
   npx wrangler login
   ```

   La copie remplace un éventuel fichier `wrangler.jsonc`. Gardez vos paramètres de compte et vos identifiants privés.

2. Créez les ressources indiquées dans la configuration, ou adaptez celle-ci aux ressources existantes :

   ```sh
   npx wrangler r2 bucket create yume-oss
   npx wrangler d1 create yume-official-backend
   npx wrangler queues create yume-oss-cache-purge
   ```

   Ajoutez dans `wrangler.jsonc` l’identifiant D1 fourni par Wrangler et l’identifiant de l’espace de noms de limitation. Configurez aussi votre domaine, l’URL publique R2 et les noms du bucket, de la base de données et de la file.

3. Appliquez les migrations :

   ```sh
   npx wrangler d1 migrations apply VAULT_DB --remote
   ```

4. Ajoutez les secrets avec Wrangler. La configuration d’exemple exige `DEEPL_API_KEY` et `AI_API_KEY` ; ajoutez les autres secrets selon les fonctions activées :

   ```sh
   npx wrangler secret put ADMIN_PASSWORD
   npx wrangler secret put SESSION_SECRET
   npx wrangler secret put DEEPL_API_KEY
   npx wrangler secret put AI_API_KEY
   ```

   Pour OIDC, configurez ses variables dans `wrangler.jsonc` et ajoutez `OIDC_CLIENT_SECRET`. Pour la purge du cache R2, ajoutez `CACHE_PURGE_ZONE_ID` et `CACHE_PURGE_API_TOKEN`.

5. Pour purger les URL mises en cache lorsque des objets changent, reliez les événements du bucket à la file :

   ```sh
   npx wrangler r2 bucket notification create yume-oss --event-type object-create --queue yume-oss-cache-purge
   npx wrangler r2 bucket notification create yume-oss --event-type object-delete --queue yume-oss-cache-purge
   ```

6. Lancez le serveur local, vérifiez les types et déployez :

   ```sh
   npm run dev
   npm run typecheck
   npm run deploy
   ```

La configuration d’exemple active la connexion par mot de passe. Pour utiliser OIDC, renseignez l’émetteur, l’identifiant client, l’URL de rappel et les adresses autorisées dans `wrangler.jsonc`, puis définissez `OIDC_CLIENT_SECRET` comme secret Wrangler. Ne publiez pas de vrais identifiants ni de paramètres de compte de production.

### Droit d’auteur et licence

Copyright © 2026 Yume Internet LLC. Ce projet est distribué sous la licence MIT. Consultez [LICENSE](LICENSE) pour le texte et les conditions de la licence.
