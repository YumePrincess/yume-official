const pricingThemeStorageKey = 'yume-theme';
const pricingThemes = new Set(['auto', 'dark', 'light']);
const pricingLangs = ['en', 'zh-cn', 'zh-tw', 'ja', 'fr'];

const pricingText = {
    en: {
        metaTitle: 'Yume Pricing',
        metaDescription: 'Yume pricing and service catalog.',
        themeAuto: 'Auto',
        themeDark: 'Dark',
        themeLight: 'Light',
        kicker: 'Pricing',
        title: 'Products and services',
        subtitle: 'A clear catalog for public services, memberships, and custom work across the Yume ecosystem.',
        contact: 'Contact support',
        backHome: 'Back to home',
        summaryPublicLabel: 'Public access',
        summaryPublicValue: 'Free',
        summaryMemberLabel: 'Membership services',
        summaryMemberValue: 'Quote',
        summaryCustomLabel: 'Custom work',
        summaryCustomValue: 'Quote',
        summaryFreeLabel: 'Free Plan',
        summaryFreeValue: 'Every product',
        summaryDriveLabel: 'Yume Drive',
        summaryPlanLabel: 'Yume Intelligence',
        summaryMailLabel: 'Yume Mail',
        productsTitle: 'Product plans',
        productsIntro: 'Every product includes a Free Plan. Paid plans unlock higher limits or membership benefits.',
        purchaseTitle: 'Purchase',
        purchaseIntro: 'Membership groups, sending quota, and sub-mailbox expansion packs.',
        tablePlan: 'Plan',
        tableScope: 'Scope',
        tablePeriod: 'Period',
        tablePrice: 'Price',
        tableUsage: 'Usage',
        publicTitle: 'Public services',
        publicIntro: 'Services available for everyday use.',
        membershipTitle: 'Membership services',
        membershipIntro: 'Membership names follow the current refund policy references.',
        customTitle: 'Custom services',
        customIntro: 'For integrations, deployment help, and dedicated support.',
        noteTitle: 'Billing note',
        noteBody: 'Final prices may vary by region, payment method, and service scope. Refund handling follows the published Terms and Refund Policy.',
        termsLink: 'User terms',
        refundLink: 'Refund policy',
        free: 'Free',
        quote: 'Quote',
        openService: 'Open service',
        askQuote: 'Ask for quote',
        priceFreeCadence: 'Public access',
        priceQuoteCadence: 'Contact us for current availability and billing details',
        badgePublic: 'Public',
        badgeMember: 'Member',
        badgeCustom: 'Custom',
        badgeProduct: 'Product',
        freePlan: 'Free Plan',
        permanent: 'Permanent',
        perMonth: 'per month',
        oneYear: '1 year',
        freeMemberPlan: 'Free Member',
        driveMemberPlan: 'AmaAme Member',
        hanaProPlan: 'HanaAme Pro',
        hanaMaxPlan: 'HanaAme Max',
        hanaUltraPlan: 'HanaAme Ultra',
        sakuraMemberPlan: 'SakuraAme Member',
        sendingQuotaPlan: 'Sending Quota Package',
        subEmailPlan: 'Sub-Email Expansion Pack',
        tableAiProPlan: 'Yume Intelligence / HanaAme Pro',
        tableAiMaxPlan: 'Yume Intelligence / HanaAme Max',
        tableAiUltraPlan: 'Yume Intelligence / HanaAme Ultra',
        tableDriveMemberPlan: 'Yume Drive / AmaAme Member',
        tableMailMemberPlan: 'Yume Mail / SakuraAme Member',
        tableMailQuotaPlan: 'Yume Mail / Sending Quota Package',
        tableMailSubEmailPlan: 'Yume Mail / Sub-Email Expansion Pack',
        driveScope: 'Yume Drive membership',
        sakuraScope: 'Mail membership',
        quota20: '20 sending credits',
        subEmail3: '3 sub-mailboxes',
        usage2Cycle: '$2 / cycle',
        usage30Cycle: '$30 / cycle',
        usage75Cycle: '$75 / cycle',
        usage200Cycle: '$200 / cycle',
        searchName: 'Yume Search',
        searchDesc: 'Search entry for the Yume ecosystem.',
        searchFeature1: 'Web search portal',
        searchFeature2: 'Designed for everyday access',
        searchFeature3: 'No paid plan required',
        accountName: 'Yume Account',
        accountDesc: 'Identity and account access for supported Yume services.',
        accountFeature1: 'Central account experience',
        accountFeature2: 'Used by connected products',
        accountFeature3: 'Basic access is free',
        officialName: 'Yume Official',
        officialDesc: 'Official information, links, notices, and service policies.',
        officialFeature1: 'Product and service entry',
        officialFeature2: 'Terms and announcements',
        officialFeature3: 'Public website access',
        driveName: 'Yume Drive / AmaAme',
        driveDesc: 'Cloud storage membership service.',
        driveFeature1: 'Private file storage',
        driveFeature2: 'Storage usage based service scope',
        driveFeature3: 'Refund threshold references 20% storage usage',
        aiName: 'Yume Intelligence / HanaAme',
        aiDesc: 'AI conversation and productivity membership service.',
        aiFeature1: 'AI conversation access',
        aiFeature2: 'Assistant support for daily tasks',
        aiFeature3: 'Refund threshold references 20 conversations',
        mailName: 'Yume Mail / SakuraAme',
        mailDesc: 'Mail membership service for Yume users.',
        mailFeature1: 'Mailbox service',
        mailFeature2: 'Sending and receiving support',
        mailFeature3: 'Refund threshold references 20 emails',
        designName: 'Yume Site Customization',
        designDesc: 'Visual, frontend, and content customization for Yume-related pages.',
        designFeature1: 'Interface and content adaptation',
        designFeature2: 'Responsive page implementation',
        designFeature3: 'Project based estimate',
        supportName: 'Dedicated Support',
        supportDesc: 'Dedicated assistance for service setup, migration, and troubleshooting.',
        supportFeature1: 'Setup and migration help',
        supportFeature2: 'Issue review and follow-up',
        supportFeature3: 'Scope based estimate'
    },
    'zh-cn': {
        metaTitle: 'Yume 价格',
        metaDescription: '雨梦商品与服务价格目录。',
        themeAuto: '自动',
        themeDark: '深色',
        themeLight: '浅色',
        kicker: '价格',
        title: '商品与服务内容',
        subtitle: '用于查看雨梦生态中公开服务、会员服务与定制服务的内容和价格状态。',
        contact: '联系支持',
        backHome: '返回首页',
        summaryPublicLabel: '公开访问',
        summaryPublicValue: '免费',
        summaryMemberLabel: '会员服务',
        summaryMemberValue: '报价',
        summaryCustomLabel: '定制服务',
        summaryCustomValue: '报价',
        summaryFreeLabel: 'Free Plan',
        summaryFreeValue: '全部产品',
        summaryDriveLabel: '雨梦网盘',
        summaryPlanLabel: '雨梦智能',
        summaryMailLabel: '雨梦邮箱',
        productsTitle: '产品方案',
        productsIntro: '全部产品均提供 Free Plan，付费方案用于解锁更高额度或会员权益。',
        purchaseTitle: '购买',
        purchaseIntro: '会员权限组、追加邮件发送件数和子邮箱包。',
        tablePlan: '套餐',
        tableScope: '说明',
        tablePeriod: '有效期',
        tablePrice: '价格',
        tableUsage: '用量额度',
        publicTitle: '公开服务',
        publicIntro: '面向日常访问开放的服务。',
        membershipTitle: '会员服务',
        membershipIntro: '会员名称沿用当前退款政策中的产品引用。',
        customTitle: '定制服务',
        customIntro: '用于集成、部署协助和专属支持。',
        noteTitle: '计费说明',
        noteBody: '最终价格可能因地区、支付方式和服务范围不同而变化。退款处理遵循已发布的用户条款和退款政策。',
        termsLink: '用户条款',
        refundLink: '退款政策',
        free: '免费',
        quote: '报价',
        openService: '打开服务',
        askQuote: '获取报价',
        priceFreeCadence: '公开访问',
        priceQuoteCadence: '请联系我们确认当前可用性与计费细节',
        badgePublic: '公开',
        badgeMember: '会员',
        badgeCustom: '定制',
        badgeProduct: '产品',
        freePlan: 'Free Plan',
        permanent: '永久',
        perMonth: '每月',
        oneYear: '1 年',
        freeMemberPlan: 'Free Member',
        driveMemberPlan: '雨梦网盘 / 天雨会员',
        hanaProPlan: 'HanaAme Pro',
        hanaMaxPlan: 'HanaAme Max',
        hanaUltraPlan: 'HanaAme Ultra',
        sakuraMemberPlan: 'SakuraAme Member',
        sendingQuotaPlan: 'Sending Quota Package',
        subEmailPlan: 'Sub-Email Expansion Pack',
        tableAiProPlan: '雨梦智能 / 花雨会员 Pro',
        tableAiMaxPlan: '雨梦智能 / 花雨会员 Max',
        tableAiUltraPlan: '雨梦智能 / 花雨会员 Ultra',
        tableDriveMemberPlan: '雨梦网盘 / 天雨会员',
        tableMailMemberPlan: '雨梦邮箱 / 桜雨会员',
        tableMailQuotaPlan: '雨梦邮箱 / 邮件发送包',
        tableMailSubEmailPlan: '雨梦邮箱 / 子邮箱扩展包',
        driveScope: '网盘会员',
        sakuraScope: '邮箱会员',
        quota20: '20 件',
        subEmail3: '3 个',
        usage2Cycle: '$2 / 周期',
        usage30Cycle: '$30 / 周期',
        usage75Cycle: '$75 / 周期',
        usage200Cycle: '$200 / 周期',
        searchName: '雨梦搜索',
        searchDesc: '雨梦生态的网站搜索入口。',
        searchFeature1: '网页搜索门户',
        searchFeature2: '适合日常访问使用',
        searchFeature3: '无需付费套餐',
        accountName: '雨梦 Account',
        accountDesc: '用于支持服务的身份与账号访问。',
        accountFeature1: '统一账号体验',
        accountFeature2: '连接相关产品使用',
        accountFeature3: '基础访问免费',
        officialName: '雨梦 Official',
        officialDesc: '官方信息、链接、公告与服务政策。',
        officialFeature1: '产品与服务入口',
        officialFeature2: '条款和公告查看',
        officialFeature3: '公开网站访问',
        driveName: '雨梦网盘 / 天雨会员',
        driveDesc: '面向用户的云存储会员服务。',
        driveFeature1: '私有文件存储',
        driveFeature2: '按存储使用情况确定服务范围',
        driveFeature3: '退款阈值参考 20% 存储使用率',
        aiName: '雨梦智能 / 花雨会员',
        aiDesc: 'AI 对话与效率辅助会员服务。',
        aiFeature1: 'AI 对话访问',
        aiFeature2: '日常任务辅助支持',
        aiFeature3: '退款阈值参考 20 次对话',
        mailName: '雨梦邮箱 / 桜雨会员',
        mailDesc: '面向雨梦用户的邮箱会员服务。',
        mailFeature1: '邮箱服务',
        mailFeature2: '收发邮件支持',
        mailFeature3: '退款阈值参考 20 封邮件',
        designName: '雨梦站点定制',
        designDesc: '面向雨梦相关页面的视觉、前端和内容定制。',
        designFeature1: '界面与内容适配',
        designFeature2: '响应式页面实现',
        designFeature3: '按项目报价',
        supportName: '专属支持',
        supportDesc: '用于服务开通、迁移和故障排查的专属协助。',
        supportFeature1: '开通和迁移协助',
        supportFeature2: '问题复查与跟进',
        supportFeature3: '按支持范围报价'
    },
    'zh-tw': {
        metaTitle: 'Yume 價格',
        metaDescription: '雨夢商品與服務價格目錄。',
        themeAuto: '自動',
        themeDark: '深色',
        themeLight: '淺色',
        kicker: '價格',
        title: '商品與服務內容',
        subtitle: '用於查看雨夢生態中公開服務、會員服務與客製服務的內容和價格狀態。',
        contact: '聯絡支援',
        backHome: '返回首頁',
        summaryPublicLabel: '公開訪問',
        summaryPublicValue: '免費',
        summaryMemberLabel: '會員服務',
        summaryMemberValue: '報價',
        summaryCustomLabel: '客製服務',
        summaryCustomValue: '報價',
        summaryFreeLabel: 'Free Plan',
        summaryFreeValue: '全部產品',
        summaryDriveLabel: '雨夢雲盤',
        summaryPlanLabel: '雨夢智能',
        summaryMailLabel: '雨夢郵箱',
        productsTitle: '產品方案',
        productsIntro: '全部產品均提供 Free Plan，付費方案用於解鎖更高額度或會員權益。',
        purchaseTitle: '購買',
        purchaseIntro: '會員權限群組、追加郵件傳送件數和子郵箱包。',
        tablePlan: '方案',
        tableScope: '說明',
        tablePeriod: '有效期',
        tablePrice: '價格',
        tableUsage: '用量額度',
        publicTitle: '公開服務',
        publicIntro: '面向日常訪問開放的服務。',
        membershipTitle: '會員服務',
        membershipIntro: '會員名稱沿用目前退款政策中的產品引用。',
        customTitle: '客製服務',
        customIntro: '用於整合、部署協助和專屬支援。',
        noteTitle: '計費說明',
        noteBody: '最終價格可能因地區、支付方式和服務範圍不同而變化。退款處理遵循已發布的使用者條款和退款政策。',
        termsLink: '使用者條款',
        refundLink: '退款政策',
        free: '免費',
        quote: '報價',
        openService: '開啟服務',
        askQuote: '取得報價',
        priceFreeCadence: '公開訪問',
        priceQuoteCadence: '請聯絡我們確認目前可用性與計費細節',
        badgePublic: '公開',
        badgeMember: '會員',
        badgeCustom: '客製',
        badgeProduct: '產品',
        freePlan: 'Free Plan',
        permanent: '永久',
        perMonth: '每月',
        oneYear: '1 年',
        freeMemberPlan: 'Free Member',
        driveMemberPlan: '雨夢雲盤 / 天雨會員',
        hanaProPlan: 'HanaAme Pro',
        hanaMaxPlan: 'HanaAme Max',
        hanaUltraPlan: 'HanaAme Ultra',
        sakuraMemberPlan: 'SakuraAme Member',
        sendingQuotaPlan: 'Sending Quota Package',
        subEmailPlan: 'Sub-Email Expansion Pack',
        tableAiProPlan: '雨夢智能 / 花雨會員 Pro',
        tableAiMaxPlan: '雨夢智能 / 花雨會員 Max',
        tableAiUltraPlan: '雨夢智能 / 花雨會員 Ultra',
        tableDriveMemberPlan: '雨夢雲盤 / 天雨會員',
        tableMailMemberPlan: '雨夢郵箱 / 桜雨會員',
        tableMailQuotaPlan: '雨夢郵箱 / 郵件傳送包',
        tableMailSubEmailPlan: '雨夢郵箱 / 子郵箱擴充包',
        driveScope: '雲盤會員',
        sakuraScope: '郵箱會員',
        quota20: '20 件',
        subEmail3: '3 個',
        usage2Cycle: '$2 / 週期',
        usage30Cycle: '$30 / 週期',
        usage75Cycle: '$75 / 週期',
        usage200Cycle: '$200 / 週期',
        searchName: '雨夢搜尋',
        searchDesc: '雨夢生態的網站搜尋入口。',
        searchFeature1: '網頁搜尋入口',
        searchFeature2: '適合日常訪問使用',
        searchFeature3: '無需付費方案',
        accountName: '雨夢 Account',
        accountDesc: '用於支援服務的身份與帳號訪問。',
        accountFeature1: '統一帳號體驗',
        accountFeature2: '連接相關產品使用',
        accountFeature3: '基礎訪問免費',
        officialName: '雨夢 Official',
        officialDesc: '官方資訊、連結、公告與服務政策。',
        officialFeature1: '產品與服務入口',
        officialFeature2: '條款和公告查看',
        officialFeature3: '公開網站訪問',
        driveName: '雨夢雲盤 / 天雨會員',
        driveDesc: '面向使用者的雲端儲存會員服務。',
        driveFeature1: '私有檔案儲存',
        driveFeature2: '依儲存使用情況確定服務範圍',
        driveFeature3: '退款門檻參考 20% 儲存使用率',
        aiName: '雨夢智能 / 花雨會員',
        aiDesc: 'AI 對話與效率輔助會員服務。',
        aiFeature1: 'AI 對話訪問',
        aiFeature2: '日常任務輔助支援',
        aiFeature3: '退款門檻參考 20 次對話',
        mailName: '雨夢郵箱 / 桜雨會員',
        mailDesc: '面向雨夢使用者的郵箱會員服務。',
        mailFeature1: '郵箱服務',
        mailFeature2: '收發郵件支援',
        mailFeature3: '退款門檻參考 20 封郵件',
        designName: '雨夢站點客製',
        designDesc: '面向雨夢相關頁面的視覺、前端和內容客製。',
        designFeature1: '介面與內容適配',
        designFeature2: '響應式頁面實作',
        designFeature3: '依專案報價',
        supportName: '專屬支援',
        supportDesc: '用於服務開通、遷移和故障排查的專屬協助。',
        supportFeature1: '開通和遷移協助',
        supportFeature2: '問題複查與跟進',
        supportFeature3: '依支援範圍報價'
    },
    fr: {
        metaTitle: 'Tarifs Yume',
        metaDescription: 'Catalogue des prix et services Yume.',
        themeAuto: 'Automatique',
        themeDark: 'Sombre',
        themeLight: 'Clair',
        kicker: 'Tarifs',
        title: 'Produits et services',
        subtitle: 'Un catalogue clair pour les services publics, les abonnements et les travaux personnalisés de l’écosystème Yume.',
        contact: 'Contacter le support',
        backHome: 'Retour à l’accueil',
        summaryPublicLabel: 'Accès public',
        summaryPublicValue: 'Gratuit',
        summaryMemberLabel: 'Services membres',
        summaryMemberValue: 'Devis',
        summaryCustomLabel: 'Travaux personnalisés',
        summaryCustomValue: 'Devis',
        summaryFreeLabel: 'Free Plan',
        summaryFreeValue: 'Tous les produits',
        summaryDriveLabel: 'Yume Drive',
        summaryPlanLabel: 'Yume IA',
        summaryMailLabel: 'Yume Mail',
        productsTitle: 'Offres produit',
        productsIntro: 'Chaque produit inclut un Free Plan. Les offres payantes débloquent des limites supérieures ou des avantages membre.',
        purchaseTitle: 'Achat',
        purchaseIntro: 'Groupes membres, quota d’envoi et packs d’extension de sous-boîtes mail.',
        tablePlan: 'Offre',
        tableScope: 'Portée',
        tablePeriod: 'Période',
        tablePrice: 'Prix',
        tableUsage: 'Usage',
        publicTitle: 'Services publics',
        publicIntro: 'Services disponibles pour un usage quotidien.',
        membershipTitle: 'Services membres',
        membershipIntro: 'Les noms de membres suivent les références actuelles de la politique de remboursement.',
        customTitle: 'Services personnalisés',
        customIntro: 'Pour les intégrations, l’aide au déploiement et le support dédié.',
        noteTitle: 'Note de facturation',
        noteBody: 'Les prix finaux peuvent varier selon la région, le mode de paiement et le périmètre du service. Les remboursements suivent les Conditions et la Politique de remboursement publiées.',
        termsLink: 'Conditions',
        refundLink: 'Politique de remboursement',
        free: 'Gratuit',
        quote: 'Devis',
        openService: 'Ouvrir le service',
        askQuote: 'Demander un devis',
        priceFreeCadence: 'Accès public',
        priceQuoteCadence: 'Contactez-nous pour confirmer la disponibilité et les détails de facturation',
        badgePublic: 'Public',
        badgeMember: 'Membre',
        badgeCustom: 'Sur mesure',
        badgeProduct: 'Produit',
        freePlan: 'Free Plan',
        permanent: 'Permanent',
        perMonth: 'par mois',
        oneYear: '1 an',
        freeMemberPlan: 'Free Member',
        driveMemberPlan: 'AmaAme Member',
        hanaProPlan: 'HanaAme Pro',
        hanaMaxPlan: 'HanaAme Max',
        hanaUltraPlan: 'HanaAme Ultra',
        sakuraMemberPlan: 'SakuraAme Member',
        sendingQuotaPlan: 'Sending Quota Package',
        subEmailPlan: 'Sub-Email Expansion Pack',
        tableAiProPlan: 'Yume IA / HanaAme Pro',
        tableAiMaxPlan: 'Yume IA / HanaAme Max',
        tableAiUltraPlan: 'Yume IA / HanaAme Ultra',
        tableDriveMemberPlan: 'Yume Drive / AmaAme Member',
        tableMailMemberPlan: 'Yume Mail / SakuraAme Member',
        tableMailQuotaPlan: 'Yume Mail / Sending Quota Package',
        tableMailSubEmailPlan: 'Yume Mail / Sub-Email Expansion Pack',
        driveScope: 'Abonnement Yume Drive',
        sakuraScope: 'Abonnement mail',
        quota20: '20 crédits d’envoi',
        subEmail3: '3 sous-boîtes mail',
        usage2Cycle: '$2 / cycle',
        usage30Cycle: '$30 / cycle',
        usage75Cycle: '$75 / cycle',
        usage200Cycle: '$200 / cycle',
        searchName: 'Yume Recherche',
        searchDesc: 'Point d’entrée de recherche pour l’écosystème Yume.',
        searchFeature1: 'Portail de recherche web',
        searchFeature2: 'Conçu pour un usage quotidien',
        searchFeature3: 'Aucun forfait payant requis',
        accountName: 'Yume Compte',
        accountDesc: 'Identité et accès au compte pour les services Yume compatibles.',
        accountFeature1: 'Expérience de compte centralisée',
        accountFeature2: 'Utilisé par les produits connectés',
        accountFeature3: 'L’accès de base est gratuit',
        officialName: 'Yume Official',
        officialDesc: 'Informations officielles, liens, avis et politiques de service.',
        officialFeature1: 'Entrée produits et services',
        officialFeature2: 'Conditions et annonces',
        officialFeature3: 'Accès public au site',
        driveName: 'Yume Drive / AmaAme',
        driveDesc: 'Service membre de stockage cloud.',
        driveFeature1: 'Stockage privé de fichiers',
        driveFeature2: 'Périmètre de service basé sur l’usage du stockage',
        driveFeature3: 'Seuil de remboursement lié à 20 % d’utilisation du stockage',
        aiName: 'Yume IA / HanaAme',
        aiDesc: 'Service membre pour conversations IA et productivité.',
        aiFeature1: 'Accès aux conversations IA',
        aiFeature2: 'Assistance pour les tâches quotidiennes',
        aiFeature3: 'Seuil de remboursement lié à 20 conversations',
        mailName: 'Yume Mail / SakuraAme',
        mailDesc: 'Service membre de messagerie pour les utilisateurs Yume.',
        mailFeature1: 'Service de boîte mail',
        mailFeature2: 'Envoi et réception pris en charge',
        mailFeature3: 'Seuil de remboursement lié à 20 e-mails',
        designName: 'Personnalisation de site Yume',
        designDesc: 'Personnalisation visuelle, frontend et contenu pour les pages liées à Yume.',
        designFeature1: 'Adaptation interface et contenu',
        designFeature2: 'Implémentation responsive',
        designFeature3: 'Estimation par projet',
        supportName: 'Support dédié',
        supportDesc: 'Aide dédiée pour configuration, migration et dépannage.',
        supportFeature1: 'Aide configuration et migration',
        supportFeature2: 'Analyse et suivi des problèmes',
        supportFeature3: 'Estimation selon le périmètre'
    },
    ja: {
        metaTitle: 'Yume 料金',
        metaDescription: 'Yumeの商品・サービス料金カタログ。',
        themeAuto: '自動',
        themeDark: 'ダーク',
        themeLight: 'ライト',
        kicker: '料金',
        title: '商品とサービス',
        subtitle: 'Yumeエコシステムの公開サービス、会員サービス、カスタム作業を確認できる料金カタログです。',
        contact: 'サポートに連絡',
        backHome: 'ホームへ戻る',
        summaryPublicLabel: '公開アクセス',
        summaryPublicValue: '無料',
        summaryMemberLabel: '会員サービス',
        summaryMemberValue: '見積',
        summaryCustomLabel: 'カスタム作業',
        summaryCustomValue: '見積',
        summaryFreeLabel: 'Free Plan',
        summaryFreeValue: '全製品',
        summaryDriveLabel: '雨夢ドライブ',
        summaryPlanLabel: '雨夢知能',
        summaryMailLabel: '雨夢メール',
        productsTitle: '製品プラン',
        productsIntro: 'すべての製品にFree Planがあります。有料プランでは上限や会員特典を拡張できます。',
        purchaseTitle: '購入',
        purchaseIntro: '会員権限グループ、送信枠、サブメールボックス追加パック。',
        tablePlan: 'プラン',
        tableScope: '内容',
        tablePeriod: '有効期間',
        tablePrice: '価格',
        tableUsage: '利用枠',
        publicTitle: '公開サービス',
        publicIntro: '日常利用向けに公開されているサービスです。',
        membershipTitle: '会員サービス',
        membershipIntro: '会員名は現在の返金ポリシー内の表記に基づいています。',
        customTitle: 'カスタムサービス',
        customIntro: '連携、デプロイ支援、専用サポート向けです。',
        noteTitle: '請求について',
        noteBody: '最終価格は地域、支払い方法、サービス範囲によって変わる場合があります。返金処理は公開済みの利用規約と返金ポリシーに従います。',
        termsLink: '利用規約',
        refundLink: '返金ポリシー',
        free: '無料',
        quote: '見積',
        openService: 'サービスを開く',
        askQuote: '見積を依頼',
        priceFreeCadence: '公開アクセス',
        priceQuoteCadence: '現在の提供状況と請求詳細はお問い合わせください',
        badgePublic: '公開',
        badgeMember: '会員',
        badgeCustom: 'カスタム',
        badgeProduct: '製品',
        freePlan: 'Free Plan',
        permanent: '永久',
        perMonth: '月',
        oneYear: '1年',
        freeMemberPlan: 'Free Member',
        driveMemberPlan: '雨夢ドライブ / 天雨会員',
        hanaProPlan: 'HanaAme Pro',
        hanaMaxPlan: 'HanaAme Max',
        hanaUltraPlan: 'HanaAme Ultra',
        sakuraMemberPlan: 'SakuraAme Member',
        sendingQuotaPlan: 'Sending Quota Package',
        subEmailPlan: 'Sub-Email Expansion Pack',
        tableAiProPlan: '雨夢知能 / HanaAme Pro',
        tableAiMaxPlan: '雨夢知能 / HanaAme Max',
        tableAiUltraPlan: '雨夢知能 / HanaAme Ultra',
        tableDriveMemberPlan: '雨夢ドライブ / 天雨会員',
        tableMailMemberPlan: '雨夢メール / SakuraAme Member',
        tableMailQuotaPlan: '雨夢メール / 送信枠パッケージ',
        tableMailSubEmailPlan: '雨夢メール / サブメール拡張パック',
        driveScope: 'ドライブ会員',
        sakuraScope: 'メール会員',
        quota20: '20件',
        subEmail3: '3個',
        usage2Cycle: '$2 / 周期',
        usage30Cycle: '$30 / 周期',
        usage75Cycle: '$75 / 周期',
        usage200Cycle: '$200 / 周期',
        searchName: '雨夢検索',
        searchDesc: 'Yumeエコシステムの検索入口です。',
        searchFeature1: 'Web検索ポータル',
        searchFeature2: '日常利用向け',
        searchFeature3: '有料プラン不要',
        accountName: '雨夢アカウント',
        accountDesc: '対応サービスで利用するIDとアカウントアクセスです。',
        accountFeature1: '統一されたアカウント体験',
        accountFeature2: '連携製品で利用',
        accountFeature3: '基本アクセスは無料',
        officialName: '雨夢Official',
        officialDesc: '公式情報、リンク、お知らせ、サービスポリシーを掲載します。',
        officialFeature1: '製品とサービスの入口',
        officialFeature2: '規約とお知らせ',
        officialFeature3: '公開サイトアクセス',
        driveName: '雨夢ドライブ / AmaAme',
        driveDesc: 'クラウドストレージ会員サービスです。',
        driveFeature1: 'プライベートファイル保存',
        driveFeature2: '保存容量の利用状況に基づくサービス範囲',
        driveFeature3: '返金基準は20%のストレージ利用を参照',
        aiName: '雨夢知能 / HanaAme',
        aiDesc: 'AI会話と生産性支援の会員サービスです。',
        aiFeature1: 'AI会話アクセス',
        aiFeature2: '日常タスクのアシスタント支援',
        aiFeature3: '返金基準は20回の会話を参照',
        mailName: '雨夢メール / SakuraAme',
        mailDesc: 'Yumeユーザー向けメール会員サービスです。',
        mailFeature1: 'メールボックスサービス',
        mailFeature2: '送受信サポート',
        mailFeature3: '返金基準は20通のメールを参照',
        designName: 'Yumeサイトカスタマイズ',
        designDesc: 'Yume関連ページのビジュアル、フロントエンド、コンテンツを調整します。',
        designFeature1: 'UIとコンテンツの調整',
        designFeature2: 'レスポンシブページ実装',
        designFeature3: 'プロジェクト単位の見積',
        supportName: '専用サポート',
        supportDesc: 'サービス設定、移行、問題調査の専用支援です。',
        supportFeature1: '設定と移行支援',
        supportFeature2: '問題確認とフォローアップ',
        supportFeature3: '支援範囲に応じた見積'
    }
};

const pricingProducts = {
    products: [
        {
            name: 'driveName',
            desc: 'driveDesc',
            features: ['driveFeature1', 'driveFeature2'],
            badge: 'badgeProduct',
            href: 'mailto:support@yume.zone?subject=Yume%20Drive%20pricing',
            cta: 'askQuote',
            plans: [
                { label: 'freePlan', price: '$0.00', cadence: 'permanent' },
                { label: 'driveMemberPlan', price: '$14.99', cadence: 'perMonth' }
            ]
        },
        {
            name: 'aiName',
            desc: 'aiDesc',
            features: ['aiFeature1', 'aiFeature2'],
            badge: 'badgeProduct',
            href: 'mailto:support@yume.zone?subject=Yume%20Intelligence%20pricing',
            cta: 'askQuote',
            plans: [
                { label: 'freePlan', price: '$0.00', cadence: 'permanent' },
                { label: 'hanaProPlan', price: '$19.99', cadence: 'perMonth' }
            ]
        },
        {
            name: 'mailName',
            desc: 'mailDesc',
            features: ['mailFeature1', 'mailFeature2'],
            badge: 'badgeProduct',
            href: 'mailto:support@yume.zone?subject=Yume%20Mail%20pricing',
            cta: 'askQuote',
            plans: [
                { label: 'freePlan', price: '$0.00', cadence: 'permanent' },
                { label: 'sakuraMemberPlan', price: '$7.99', cadence: 'perMonth' }
            ]
        },
        {
            name: 'searchName',
            desc: 'searchDesc',
            features: ['searchFeature1', 'searchFeature2', 'searchFeature3'],
            badge: 'badgeProduct',
            href: 'https://search.yume.zone/',
            cta: 'openService',
            plans: [
                { label: 'freePlan', price: '$0.00', cadence: 'permanent' }
            ]
        },
        {
            name: 'accountName',
            desc: 'accountDesc',
            features: ['accountFeature1', 'accountFeature2', 'accountFeature3'],
            badge: 'badgeProduct',
            href: 'https://account.yume.zone/',
            cta: 'openService',
            plans: [
                { label: 'freePlan', price: '$0.00', cadence: 'permanent' }
            ]
        },
        {
            name: 'officialName',
            desc: 'officialDesc',
            features: ['officialFeature1', 'officialFeature2', 'officialFeature3'],
            badge: 'badgeProduct',
            href: '/',
            cta: 'openService',
            plans: [
                { label: 'freePlan', price: '$0.00', cadence: 'permanent' }
            ]
        }
    ]
};

const pricingTableRows = [
    { plan: 'tableAiProPlan', usage: 'usage30Cycle', period: 'perMonth', price: '$19.99', scope: '' },
    { plan: 'tableAiMaxPlan', usage: 'usage75Cycle', period: 'perMonth', price: '$49.99', scope: '' },
    { plan: 'tableAiUltraPlan', usage: 'usage200Cycle', period: 'perMonth', price: '$99.99', scope: '' },
    { plan: 'tableDriveMemberPlan', usage: 'driveScope', period: 'perMonth', price: '$14.99', scope: '' },
    { plan: 'tableMailMemberPlan', usage: 'sakuraScope', period: 'perMonth', price: '$7.99', scope: '' },
    { plan: 'tableMailQuotaPlan', usage: 'quota20', period: 'oneYear', price: '$2.00', scope: '' },
    { plan: 'tableMailSubEmailPlan', usage: 'subEmail3', period: 'permanent', price: '$5.99', scope: '' }
];

const pricingRefundText = {
    en: {
        before: 'Refunds can be requested from the purchase page within 7 days. The system will automatically review eligible requests or complete manual review within 5 business days. Please refer to the ',
        link: 'Refund Policy',
        after: ' for refund request conditions.'
    },
    'zh-cn': {
        before: '支持7天内在购买页面自助申请退款，系统将视情况自动审核或由人工在5个工作日内完成退款审核。退款申请条件请参照',
        link: '退款政策',
        after: '。'
    },
    'zh-tw': {
        before: '支援 7 天內在購買頁面自助申請退款，系統將視情況自動審核或由人工在 5 個工作日內完成退款審核。退款申請條件請參照',
        link: '退款政策',
        after: '。'
    },
    fr: {
        before: 'Les remboursements peuvent être demandés depuis la page d’achat dans les 7 jours. Le système examinera automatiquement les demandes éligibles ou un examen manuel sera effectué sous 5 jours ouvrés. Consultez la ',
        link: 'Politique de remboursement',
        after: ' pour les conditions de demande.'
    },
    ja: {
        before: '購入ページから 7 日以内に返金申請を行えます。システムが状況に応じて自動審査するか、5 営業日以内に手動審査を完了します。返金申請条件は',
        link: '返金ポリシー',
        after: 'をご確認ください。'
    }
};

const pricingDefaultBgPreference = { type: '5', path: '' };
const pricingLocalBackgrounds = {
    1: Array.from({ length: 10 }, (_, index) => `/img/NIKKI/${index + 1}.jpg`),
    5: Array.from({ length: 10 }, (_, index) => `/img/MHFJ/${index + 1}.jpg`)
};

function normalizePricingLang(value) {
    const next = (value || '').toLowerCase();

    if (next.startsWith('zh-tw') || next.startsWith('zh-hk') || next.startsWith('zh-mo') || next.startsWith('zh-hant')) {
        return 'zh-tw';
    }

    if (next.startsWith('zh-cn') || next === 'zh') {
        return 'zh-cn';
    }

    const shortLang = next.slice(0, 2);
    return pricingLangs.includes(shortLang) ? shortLang : 'en';
}

function getPricingLang() {
    const urlLang = new URLSearchParams(window.location.search).get('lang');
    let storedLang = '';

    try {
        storedLang = localStorage.getItem('lang') || '';
    } catch (err) {
        storedLang = '';
    }

    return normalizePricingLang(urlLang || storedLang || navigator.language);
}

let pricingLang = getPricingLang();

function pricingT(key) {
    return pricingText[pricingLang]?.[key] || pricingText.en[key] || key;
}

function htmlLangForPricing(lang) {
    return {
        en: 'en',
        fr: 'fr',
        ja: 'ja',
        'zh-cn': 'zh-CN',
        'zh-tw': 'zh-TW'
    }[lang] || 'en';
}

function pricingRefundT() {
    return pricingRefundText[pricingLang] || pricingRefundText.en;
}

function getPricingCookie(name) {
    const cookie = `; ${document.cookie}`;
    const parts = cookie.split(`; ${name}=`);

    if (parts.length < 2) return '';

    return parts.pop().split(';').shift() || '';
}

function getPricingBgPreference() {
    const rawCookie = getPricingCookie('bg_img');

    if (!rawCookie || rawCookie === '{}') {
        return { ...pricingDefaultBgPreference };
    }

    try {
        const parsed = JSON.parse(decodeURIComponent(rawCookie));
        return {
            ...pricingDefaultBgPreference,
            ...parsed,
            type: String(parsed.type || pricingDefaultBgPreference.type)
        };
    } catch (err) {
        console.warn('Background preference parse failed', err);
        return { ...pricingDefaultBgPreference };
    }
}

function randomPricingBackground(type) {
    const pictures = pricingLocalBackgrounds[type] || pricingLocalBackgrounds[pricingDefaultBgPreference.type];
    return pictures[Math.floor(Math.random() * pictures.length)];
}

function applyPricingBackground() {
    const bg = document.getElementById('bg');
    if (!bg) return;

    const preference = getPricingBgPreference();
    let src = '';

    switch (preference.type) {
        case '1':
            src = randomPricingBackground('1');
            break;
        case '2':
            src = 'https://api.dujin.org/bing/1920.php';
            break;
        case '3':
            src = 'https://api.ixiaowai.cn/gqapi/gqapi.php';
            break;
        case '4':
            src = 'https://api.ixiaowai.cn/api/api.php';
            break;
        case '5':
        default:
            src = randomPricingBackground('5');
            break;
    }

    bg.classList.remove('error');
    bg.setAttribute('src', src);
}

function renderPricingRefundNote() {
    const copy = pricingRefundT();

    document.querySelectorAll('[data-pricing-refund-note]').forEach((note) => {
        note.replaceChildren(
            document.createTextNode(copy.before),
            document.createTextNode(copy.link),
            document.createTextNode(copy.after)
        );
    });
}

function renderPricingFooter() {
    const footer = document.getElementById('footer');
    if (!footer) return;

    const currentYear = new Date().getFullYear();

    if (pricingLang === 'zh-cn') {
        footer.innerHTML = `
            <div class="power">
                版权所有 &copy; ${currentYear}
                <a href="https://www.yume.zone/">美国雨梦互联网有限公司</a> 保留所有权利。本页面为在中国大陆使用而设计。
            </div>
            <div id="lrc"></div>
        `;
        return;
    }

    footer.innerHTML = `
        <div class="power">
            Copyright &copy; ${currentYear}
            <a href="https://www.yume.zone/">Yume Internet LLC</a>. All Rights Reserved.
        </div>
        <div id="lrc"></div>
    `;
}

function renderPricingCards() {
    Object.entries(pricingProducts).forEach(([group, products]) => {
        const container = document.querySelector(`[data-pricing-group="${group}"]`);
        if (!container) return;

        container.innerHTML = products.map((product) => `
            <article class="price-card">
                <div class="price-card-header">
                    <h3>${pricingT(product.name)}</h3>
                    <span class="price-badge">${pricingT(product.badge)}</span>
                </div>
                <div class="price-plans">
                    ${product.plans.map((plan) => `
                        <div class="price-plan-row">
                            <div>
                                <div class="price-card-label">${pricingT(plan.label)}</div>
                                <div class="price-cadence">${pricingT(plan.cadence)}</div>
                            </div>
                            <div class="price-value">${pricingT(plan.price)}</div>
                        </div>
                    `).join('')}
                </div>
                <p class="price-description">${pricingT(product.desc)}</p>
                <ul class="price-features">
                    ${product.features.map((feature) => `<li>${pricingT(feature)}</li>`).join('')}
                </ul>
            </article>
        `).join('');
    });
}

function renderPricingTable() {
    const tableBody = document.querySelector('[data-pricing-table]');
    if (!tableBody) return;

    tableBody.innerHTML = pricingTableRows.map((row) => `
        <tr>
            <td>${pricingT(row.plan)}</td>
            <td>${pricingT(row.usage)}</td>
            <td>${pricingT(row.period)}</td>
            <td>${pricingT(row.price)}</td>
            <td>${pricingT(row.scope)}</td>
        </tr>
    `).join('');
}

function updatePricingText() {
    document.documentElement.setAttribute('lang', htmlLangForPricing(pricingLang));
    document.title = pricingT('metaTitle');

    document
        .querySelectorAll('meta[name="description"], meta[property="og:description"], meta[name="twitter:description"]')
        .forEach((meta) => meta.setAttribute('content', pricingT('metaDescription')));

    document.querySelectorAll('[data-i18n]').forEach((element) => {
        element.textContent = pricingT(element.dataset.i18n);
    });

    document.querySelectorAll('.translate').forEach((option) => {
        option.classList.toggle('active', option.id === pricingLang);
    });

    renderPricingCards();
    renderPricingTable();
    renderPricingRefundNote();
    renderPricingFooter();
    bindPricingRails();
}

function getPricingTheme() {
    try {
        const theme = localStorage.getItem(pricingThemeStorageKey);
        return pricingThemes.has(theme) ? theme : 'auto';
    } catch (err) {
        return 'auto';
    }
}

function applyPricingTheme(theme) {
    const nextTheme = pricingThemes.has(theme) ? theme : 'auto';

    if (nextTheme === 'auto') {
        document.documentElement.removeAttribute('data-theme');
    } else {
        document.documentElement.setAttribute('data-theme', nextTheme);
    }

    try {
        localStorage.setItem(pricingThemeStorageKey, nextTheme);
    } catch (err) {
        console.warn('Theme preference write failed', err);
    }

    document.querySelectorAll('.theme-option').forEach((option) => {
        option.classList.toggle('active', option.dataset.themeOption === nextTheme);
    });
}

function bindPricingMenus() {
    const languageContainer = document.querySelector('.language-container');
    const languageButton = document.querySelector('.language-icon');
    const themeContainer = document.querySelector('.theme-container');
    const themeButton = document.querySelector('.theme-icon');

    if (languageContainer && languageButton) {
        languageButton.addEventListener('click', (event) => {
            event.stopPropagation();
            const isOpen = languageContainer.classList.toggle('open');
            languageButton.setAttribute('aria-expanded', String(isOpen));
            themeContainer?.classList.remove('open');
            themeButton?.setAttribute('aria-expanded', 'false');
        });

        document.querySelectorAll('.translate').forEach((option) => {
            option.addEventListener('click', (event) => {
                event.stopPropagation();
                pricingLang = normalizePricingLang(option.id);

                try {
                    localStorage.setItem('lang', pricingLang);
                } catch (err) {
                    console.warn('Language preference write failed', err);
                }

                languageContainer.classList.remove('open');
                languageButton.setAttribute('aria-expanded', 'false');
                updatePricingText();
            });
        });
    }

    if (themeContainer && themeButton) {
        themeButton.addEventListener('click', (event) => {
            event.stopPropagation();
            const isOpen = themeContainer.classList.toggle('open');
            themeButton.setAttribute('aria-expanded', String(isOpen));
            languageContainer?.classList.remove('open');
            languageButton?.setAttribute('aria-expanded', 'false');
        });

        document.querySelectorAll('.theme-option').forEach((option) => {
            option.addEventListener('click', (event) => {
                event.stopPropagation();
                applyPricingTheme(option.dataset.themeOption);
                themeContainer.classList.remove('open');
                themeButton.setAttribute('aria-expanded', 'false');
            });
        });
    }

    document.addEventListener('click', () => {
        languageContainer?.classList.remove('open');
        languageButton?.setAttribute('aria-expanded', 'false');
        themeContainer?.classList.remove('open');
        themeButton?.setAttribute('aria-expanded', 'false');
    });
}

const pricingPagerState = {
    index: 0,
    animating: false,
    timer: null
};

function getPricingPage() {
    return document.body;
}

function getPricingSections() {
    return Array.from(document.querySelectorAll('.pricing-main > .pricing-snap-section'));
}

function clampPricingIndex(index, sections = getPricingSections()) {
    return Math.max(0, Math.min(sections.length - 1, index));
}

function nearestPricingIndex(sections = getPricingSections()) {
    const page = getPricingPage();
    const currentTop = page.scrollTop;

    return sections.reduce((nearest, section, index) => {
        const nearestDistance = Math.abs(sections[nearest].offsetTop - currentTop);
        const nextDistance = Math.abs(section.offsetTop - currentTop);
        return nextDistance < nearestDistance ? index : nearest;
    }, 0);
}

function setPricingSectionState(index) {
    const page = getPricingPage();
    const sections = getPricingSections();
    const nextIndex = clampPricingIndex(index, sections);

    if (!sections.length) return;

    pricingPagerState.index = nextIndex;
    page.classList.add('pager-ready');

    sections.forEach((section, sectionIndex) => {
        section.classList.toggle('is-active', sectionIndex === nextIndex);
        section.classList.toggle('is-before', sectionIndex < nextIndex);
        section.classList.toggle('is-after', sectionIndex > nextIndex);
    });
}

function normalizePricingWheelDelta(event) {
    if (event.deltaMode === 1) return event.deltaY * 16;
    if (event.deltaMode === 2) return event.deltaY * window.innerHeight;
    return event.deltaY;
}

function getPricingEventSection(target) {
    return target.closest?.('.pricing-snap-section') || getPricingSections()[pricingPagerState.index];
}

function canScrollPricingSection(section, direction) {
    if (!section) return false;

    const maxScrollTop = section.scrollHeight - section.clientHeight;
    if (maxScrollTop <= 2) return false;

    if (direction > 0) return section.scrollTop < maxScrollTop - 2;
    if (direction < 0) return section.scrollTop > 2;

    return false;
}

function scrollPricingSection(section, direction, amount) {
    if (!section || !canScrollPricingSection(section, direction)) return false;

    section.scrollBy({
        top: direction * amount,
        behavior: 'smooth'
    });

    return true;
}

function scrollToPricingSection(index, instant = false) {
    const page = getPricingPage();
    const sections = getPricingSections();

    if (!sections.length) return false;

    const nextIndex = clampPricingIndex(index, sections);
    const targetTop = sections[nextIndex].offsetTop;

    setPricingSectionState(nextIndex);

    clearTimeout(pricingPagerState.timer);
    pricingPagerState.animating = !instant;
    page.classList.toggle('is-paging', !instant);
    page.scrollTo({
        top: targetTop,
        behavior: instant ? 'auto' : 'smooth'
    });

    if (instant) {
        pricingPagerState.animating = false;
        page.classList.remove('is-paging');
        return true;
    }

    pricingPagerState.timer = setTimeout(() => {
        pricingPagerState.animating = false;
        page.classList.remove('is-paging');
        page.scrollTo({ top: targetTop, behavior: 'auto' });
        setPricingSectionState(nextIndex);
    }, 820);

    return true;
}

function bindPricingRails() {
    document.querySelectorAll('.pricing-card-viewport, .pricing-table-wrap').forEach((rail) => {
        if (rail.dataset.pricingWheelBound === 'true') return;

        rail.dataset.pricingWheelBound = 'true';
        rail.addEventListener('wheel', (event) => {
            if (rail.scrollWidth <= rail.clientWidth) return;
            if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;

            const delta = normalizePricingWheelDelta(event);
            const maxScrollLeft = rail.scrollWidth - rail.clientWidth;
            const nextScrollLeft = Math.max(0, Math.min(maxScrollLeft, rail.scrollLeft + delta));

            if (nextScrollLeft === rail.scrollLeft) return;

            event.preventDefault();
            event.stopPropagation();
            rail.scrollLeft = nextScrollLeft;
        }, { passive: false });
    });
}

function bindPricingPager() {
    const page = getPricingPage();
    const sections = getPricingSections();
    let scrollFrame = 0;
    let touchStartX = 0;
    let touchStartY = 0;

    if (!sections.length || page.dataset.pricingPagerBound === 'true') return;

    page.dataset.pricingPagerBound = 'true';
    scrollToPricingSection(nearestPricingIndex(sections), true);

    page.addEventListener('wheel', (event) => {
        if (event.defaultPrevented) return;
        if (event.target.closest('.language-dropdown, .theme-dropdown')) return;
        if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;

        const deltaY = normalizePricingWheelDelta(event);
        const direction = deltaY > 0 ? 1 : -1;
        const section = getPricingEventSection(event.target);

        if (canScrollPricingSection(section, direction)) return;

        event.preventDefault();

        if (pricingPagerState.animating) return;

        scrollToPricingSection(pricingPagerState.index + direction);
    }, { passive: false });

    page.addEventListener('scroll', () => {
        if (pricingPagerState.animating) return;

        cancelAnimationFrame(scrollFrame);
        scrollFrame = requestAnimationFrame(() => {
            setPricingSectionState(nearestPricingIndex());
        });
    }, { passive: true });

    page.addEventListener('touchstart', (event) => {
        const touch = event.touches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
    }, { passive: true });

    page.addEventListener('touchend', (event) => {
        if (event.target.closest('.pricing-card-viewport, .language-dropdown, .theme-dropdown')) return;
        if (pricingPagerState.animating) return;

        const touch = event.changedTouches[0];
        const deltaX = touch.clientX - touchStartX;
        const deltaY = touch.clientY - touchStartY;

        if (Math.abs(deltaY) < 56 || Math.abs(deltaY) <= Math.abs(deltaX)) return;

        const direction = deltaY < 0 ? 1 : -1;
        const section = getPricingEventSection(event.target);

        if (canScrollPricingSection(section, direction)) return;

        scrollToPricingSection(pricingPagerState.index + direction);
    }, { passive: true });

    document.addEventListener('keydown', (event) => {
        if (!document.body.classList.contains('pricing-page')) return;
        if (event.metaKey || event.ctrlKey || event.altKey) return;
        if (event.target.closest('input, textarea, select, [contenteditable="true"]')) return;

        const nextKeys = new Set(['ArrowDown', 'PageDown', ' ']);
        const prevKeys = new Set(['ArrowUp', 'PageUp']);
        let nextIndex = pricingPagerState.index;

        if (nextKeys.has(event.key)) {
            nextIndex += 1;
        } else if (prevKeys.has(event.key)) {
            nextIndex -= 1;
        } else if (event.key === 'Home') {
            nextIndex = 0;
        } else if (event.key === 'End') {
            nextIndex = getPricingSections().length - 1;
        } else {
            return;
        }

        event.preventDefault();

        const direction = nextIndex > pricingPagerState.index ? 1 : nextIndex < pricingPagerState.index ? -1 : 0;
        const section = getPricingSections()[pricingPagerState.index];
        const scrollAmount = event.key === 'ArrowDown' || event.key === 'ArrowUp'
            ? 88
            : Math.max(220, Math.floor(window.innerHeight * 0.72));

        if (direction && scrollPricingSection(section, direction, scrollAmount)) return;

        if (!pricingPagerState.animating) scrollToPricingSection(nextIndex);
    });

    window.addEventListener('resize', () => {
        scrollToPricingSection(pricingPagerState.index, true);
    });
}

applyPricingTheme(getPricingTheme());
applyPricingBackground();

document.addEventListener('DOMContentLoaded', () => {
    applyPricingTheme(getPricingTheme());
    updatePricingText();
    bindPricingMenus();
    bindPricingPager();
});
