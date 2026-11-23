# Yume Official

<p align="center">
  <img src="assets/readme/yumeofficial.png" alt="Yume Official" width="540">
</p>

<p align="center">
  <a href="README.md">English · Default</a> ·
  <a href="README.zh-CN.md">简体中文</a> ·
  <a href="README.zh-TW.md">繁體中文</a> ·
  <a href="README.fr.md">Français</a> ·
  <a href="README.ja.md">日本語</a>
</p>

## Français

Yume Official est le site statique multilingue et le portail de services de l’écosystème Yume. Ce dépôt contient l’interface ; l’API Worker et les services backend sont maintenus dans des projets distincts.

### Fonctionnalités

- Une page d’accueil qui présente Yume et réunit les liens vers ses services.
- Un portail de recherche sur [`/search/`](https://www.yume.zone/search/) et un catalogue de services et de tarifs sur [`/pricing/`](https://www.yume.zone/pricing/).
- Des préférences de langue, de thème et d’affichage en anglais, chinois simplifié, chinois traditionnel, français et japonais.
- Les politiques de confidentialité, conditions d’utilisation et règles de remboursement en cinq langues.
- Une page de consentement et de préférences pour les SMS, ainsi que les fichiers de distribution Android et iOS.

### Déploiement

Le site est déployé avec Cloudflare Workers Static Assets. Wrangler téléverse directement `frontend/`, sans répertoire de build séparé.

Prérequis : Node.js 22 ou version ultérieure, ainsi qu’un accès au compte Cloudflare et aux domaines configurés.

```bash
npm ci
npm run check
npx wrangler deploy --dry-run --config wrangler.jsonc
npm run deploy
```

Le Worker s’appelle `yume-official` et dessert `yume.zone` et `www.yume.zone`. L’API est fournie séparément à `https://aio.yume.zone/api/*` et ne fait pas partie de ce dépôt.

### Droits d’auteur et licence

Copyright © 2026 Yume Internet LLC. Le code original du projet est sous [licence MIT](./LICENSE).

Les logiciels, polices, musiques, images, paquets d’application et autres contenus tiers restent soumis à leurs propres licences et droits ; la licence MIT ne les couvre pas automatiquement.
