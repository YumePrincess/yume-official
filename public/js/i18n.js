(function () {
  var languages = ['en', 'fr', 'ja', 'zh-CN', 'zh-TW'];
  var languageOptions = ['auto'].concat(languages);
  var labels = {
    en: 'English',
    fr: 'Français',
    ja: '日本語',
    'zh-CN': '简体中文',
    'zh-TW': '繁體中文',
  };

  var dict = {
    en: {
      'ui.home': 'Home',
      'ui.admin': 'Admin',
      'ui.language': 'Language',
      'ui.theme': 'Theme',
      'ui.storage': 'Storage',
      'ui.folder': 'Folder',
      'ui.upload': 'Upload',
      'ui.refresh': 'Refresh',
      'ui.delete': 'Delete',
      'ui.cancel': 'Cancel',
      'ui.save': 'Save',
      'ui.rename': 'Rename',
      'ui.move': 'Move',
      'ui.copy': 'Copy',
      'ui.download': 'Download',
      'ui.directLink': 'Direct Link',
      'ui.createLink': 'Create Link',
      'ui.revokeLink': 'Revoke Link',
      'ui.password': 'Password',
      'ui.expiresInDays': 'Expires in (days)',
      'ui.searchFiles': 'Search files...',
      'ui.allTypes': 'All Types',
      'ui.loading': 'Loading...',
      'ui.previewUnavailable': 'Preview not available for this file type',
      'login.poweredBy': 'Powered by Yume',
      'login.signIn': 'Sign In',
      'login.signingIn': 'Signing in...',
      'login.oidcSignIn': 'Continue with {provider}',
      'login.oidcOnly': '{provider} login is enabled for this site.',
      'login.passwordPlaceholder': 'Enter your password',
      'login.invalidPassword': 'Invalid password',
      'login.connectionError': 'Connection error. Please try again.',
      'login.unauthorizedEmail': 'This {provider} account is not authorized for this site.',
      'login.emailUnverified': 'Please verify your {provider} account email first.',
      'login.missingEmail': '{provider} did not return an email address.',
      'login.oidcFailed': '{provider} sign-in failed. Please try again.',
      'login.invalidState': 'The sign-in session expired. Please try again.',
      'login.oidcMisconfigured': '{provider} is not configured correctly.',
      'login.oidcSessionExpired': 'Your {provider} account session ended. Please sign in again.',
      'settings.title': 'Site Settings',
      'settings.siteName': 'Site Name',
      'settings.siteNameHelp': 'Displayed in header, titles, and public pages',
      'settings.iconUrl': 'Icon URL',
      'settings.iconUrlHelp': 'Custom logo image URL (leave empty for default cloud icon)',
      'settings.logoBarUrl': 'Logo Bar Image URL',
      'settings.logoBarUrlHelp': 'Header brand image shown at the top left',
      'settings.backgroundUrl': 'Background Image URL',
      'settings.backgroundUrlHelp': 'Custom background image URL (leave empty for bundled Yume background)',
      'settings.language': 'Default Language',
      'settings.languageHelp': 'Auto follows each visitor browser language',
      'settings.preview': 'Preview',
      'settings.enableGuest': 'Enable Guest Page',
      'settings.enableGuestHelp': 'Show public shared files at the home page',
      'settings.showLogin': 'Show Login Button',
      'settings.showLoginHelp': 'Display "Admin" button on guest page',
      'settings.saved': 'Settings saved',
      'settings.saveFailed': 'Failed to save settings',
      'guest.sharedFiles': 'Shared Files',
      'guest.noSharedFiles': 'No shared files',
      'guest.noSharedFilesHelp': 'Nothing has been shared publicly yet.',
      'guest.noMatches': 'No files match "{query}"',
      'guest.fileCount': '{files} file(s)',
      'guest.folderCount': '{folders} folder(s)',
      'dashboard.noFiles': 'No files or folders yet',
      'dashboard.noFilesHelp': 'Drop files here or click Upload to get started',
      'dashboard.dropFiles': 'Drop files to upload',
      'dashboard.selected': '{count} selected',
      'dashboard.zip': 'Zip',
      'dashboard.used': '{size} used',
      'share.passwordProtected': 'Password Protected',
      'share.enterPassword': 'Enter the password to access this file',
      'share.unlock': 'Unlock',
      'share.incorrectPassword': 'Incorrect password',
      'share.connectionError': 'Connection error',
      'share.fileNotAvailable': 'File Not Available',
      'share.fileUnavailableHelp': 'This share link may have expired or been revoked.',
      'share.linkCopied': 'Link copied to clipboard',
      'share.downloads': '{count} downloads',
      'share.sharedFolder': 'Shared Folder',
      'share.emptyFolder': 'This folder is empty',
      'notFound.title': 'Page not found',
      'notFound.help': "The page you're looking for doesn't exist or has been moved.",
      'notFound.back': 'Back to Home',
    },
    fr: {
      'ui.home': 'Accueil',
      'ui.admin': 'Admin',
      'ui.language': 'Langue',
      'ui.theme': 'Thème',
      'ui.storage': 'Stockage',
      'ui.folder': 'Dossier',
      'ui.upload': 'Importer',
      'ui.refresh': 'Actualiser',
      'ui.delete': 'Supprimer',
      'ui.cancel': 'Annuler',
      'ui.save': 'Enregistrer',
      'ui.rename': 'Renommer',
      'ui.move': 'Déplacer',
      'ui.copy': 'Copier',
      'ui.download': 'Télécharger',
      'ui.directLink': 'Lien direct',
      'ui.createLink': 'Créer le lien',
      'ui.revokeLink': 'Révoquer le lien',
      'ui.password': 'Mot de passe',
      'ui.expiresInDays': 'Expire dans (jours)',
      'ui.searchFiles': 'Rechercher des fichiers...',
      'ui.allTypes': 'Tous les types',
      'ui.loading': 'Chargement...',
      'ui.previewUnavailable': 'Aperçu indisponible pour ce type de fichier',
      'login.poweredBy': 'Propulsé par Yume',
      'login.signIn': 'Se connecter',
      'login.signingIn': 'Connexion...',
      'login.oidcSignIn': 'Continuer avec {provider}',
      'login.oidcOnly': 'La connexion {provider} est activée pour ce site.',
      'login.passwordPlaceholder': 'Saisissez votre mot de passe',
      'login.invalidPassword': 'Mot de passe invalide',
      'login.connectionError': 'Erreur de connexion. Veuillez réessayer.',
      'login.unauthorizedEmail': "Ce compte {provider} n'est pas autorisé pour ce site.",
      'login.emailUnverified': "Veuillez d'abord vérifier l'e-mail de votre compte {provider}.",
      'login.missingEmail': "{provider} n'a pas renvoyé d'adresse e-mail.",
      'login.oidcFailed': 'La connexion {provider} a échoué. Veuillez réessayer.',
      'login.invalidState': 'La session de connexion a expiré. Veuillez réessayer.',
      'login.oidcMisconfigured': "{provider} n'est pas configuré correctement.",
      'login.oidcSessionExpired': 'La session de votre compte {provider} a pris fin. Veuillez vous reconnecter.',
      'settings.title': 'Paramètres du site',
      'settings.siteName': 'Nom du site',
      'settings.siteNameHelp': 'Affiché dans les en-têtes, titres et pages publiques',
      'settings.iconUrl': "URL de l'icône",
      'settings.iconUrlHelp': "URL de l'image du logo (vide pour l'icône par défaut)",
      'settings.logoBarUrl': "URL de l'image de barre logo",
      'settings.logoBarUrlHelp': "Image de marque affichée en haut à gauche",
      'settings.backgroundUrl': "URL de l'image de fond",
      'settings.backgroundUrlHelp': "Image de fond personnalisée (vide pour l'arrière-plan Yume intégré)",
      'settings.language': 'Langue par défaut',
      'settings.languageHelp': 'Auto suit la langue du navigateur de chaque visiteur',
      'settings.preview': 'Aperçu',
      'settings.enableGuest': 'Activer la page invitée',
      'settings.enableGuestHelp': "Afficher les fichiers publics partagés sur la page d'accueil",
      'settings.showLogin': 'Afficher le bouton de connexion',
      'settings.showLoginHelp': 'Afficher le bouton « Admin » sur la page invitée',
      'settings.saved': 'Paramètres enregistrés',
      'settings.saveFailed': "Échec de l'enregistrement",
      'guest.sharedFiles': 'Fichiers partagés',
      'guest.noSharedFiles': 'Aucun fichier partagé',
      'guest.noSharedFilesHelp': "Rien n'a encore été partagé publiquement.",
      'guest.noMatches': 'Aucun fichier ne correspond à « {query} »',
      'guest.fileCount': '{files} fichier(s)',
      'guest.folderCount': '{folders} dossier(s)',
      'dashboard.noFiles': 'Aucun fichier ni dossier',
      'dashboard.noFilesHelp': 'Déposez des fichiers ici ou cliquez sur Importer',
      'dashboard.dropFiles': 'Déposez les fichiers à importer',
      'dashboard.selected': '{count} sélectionné(s)',
      'dashboard.zip': 'Zip',
      'dashboard.used': '{size} utilisé',
      'share.passwordProtected': 'Protégé par mot de passe',
      'share.enterPassword': 'Saisissez le mot de passe pour accéder à ce fichier',
      'share.unlock': 'Déverrouiller',
      'share.incorrectPassword': 'Mot de passe incorrect',
      'share.connectionError': 'Erreur de connexion',
      'share.fileNotAvailable': 'Fichier indisponible',
      'share.fileUnavailableHelp': 'Ce lien de partage a peut-être expiré ou été révoqué.',
      'share.linkCopied': 'Lien copié dans le presse-papiers',
      'share.downloads': '{count} téléchargements',
      'share.sharedFolder': 'Dossier partagé',
      'share.emptyFolder': 'Ce dossier est vide',
      'notFound.title': 'Page introuvable',
      'notFound.help': "La page demandée n'existe pas ou a été déplacée.",
      'notFound.back': "Retour à l'accueil",
    },
    ja: {
      'ui.home': 'ホーム',
      'ui.admin': '管理',
      'ui.language': '言語',
      'ui.theme': 'テーマ',
      'ui.storage': 'ストレージ',
      'ui.folder': 'フォルダ',
      'ui.upload': 'アップロード',
      'ui.refresh': '更新',
      'ui.delete': '削除',
      'ui.cancel': 'キャンセル',
      'ui.save': '保存',
      'ui.rename': '名前変更',
      'ui.move': '移動',
      'ui.copy': 'コピー',
      'ui.download': 'ダウンロード',
      'ui.directLink': '直リンク',
      'ui.createLink': 'リンク作成',
      'ui.revokeLink': 'リンク解除',
      'ui.password': 'パスワード',
      'ui.expiresInDays': '有効期限（日）',
      'ui.searchFiles': 'ファイルを検索...',
      'ui.allTypes': 'すべての種類',
      'ui.loading': '読み込み中...',
      'ui.previewUnavailable': 'このファイル形式はプレビューできません',
      'login.poweredBy': 'Yume 提供',
      'login.signIn': 'ログイン',
      'login.signingIn': 'ログイン中...',
      'login.oidcSignIn': '{provider} で続行',
      'login.oidcOnly': 'このサイトでは {provider} ログインが有効です。',
      'login.passwordPlaceholder': 'パスワードを入力',
      'login.invalidPassword': 'パスワードが正しくありません',
      'login.connectionError': '接続エラーです。もう一度お試しください。',
      'login.unauthorizedEmail': 'この {provider} アカウントは許可されていません。',
      'login.emailUnverified': '先に {provider} アカウントのメールを確認してください。',
      'login.missingEmail': '{provider} からメールアドレスが返されませんでした。',
      'login.oidcFailed': '{provider} ログインに失敗しました。もう一度お試しください。',
      'login.invalidState': 'ログインセッションの有効期限が切れました。もう一度お試しください。',
      'login.oidcMisconfigured': '{provider} の設定が正しくありません。',
      'login.oidcSessionExpired': '{provider} アカウントのログイン状態が終了しました。もう一度ログインしてください。',
      'settings.title': 'サイト設定',
      'settings.siteName': 'サイト名',
      'settings.siteNameHelp': 'ヘッダー、タイトル、公開ページに表示されます',
      'settings.iconUrl': 'アイコン URL',
      'settings.iconUrlHelp': 'ロゴ画像の URL（空欄なら標準アイコン）',
      'settings.logoBarUrl': 'ロゴバー画像 URL',
      'settings.logoBarUrlHelp': '左上に表示するヘッダーブランド画像',
      'settings.backgroundUrl': '背景画像 URL',
      'settings.backgroundUrlHelp': 'カスタム背景画像 URL（空欄なら同梱の Yume 背景）',
      'settings.language': '既定の言語',
      'settings.languageHelp': '自動は訪問者のブラウザ言語に従います',
      'settings.preview': 'プレビュー',
      'settings.enableGuest': 'ゲストページを有効化',
      'settings.enableGuestHelp': 'ホームに公開共有ファイルを表示します',
      'settings.showLogin': 'ログインボタンを表示',
      'settings.showLoginHelp': 'ゲストページに「管理」ボタンを表示します',
      'settings.saved': '設定を保存しました',
      'settings.saveFailed': '設定の保存に失敗しました',
      'guest.sharedFiles': '共有ファイル',
      'guest.noSharedFiles': '共有ファイルはありません',
      'guest.noSharedFilesHelp': 'まだ公開共有されているものはありません。',
      'guest.noMatches': '「{query}」に一致するファイルはありません',
      'guest.fileCount': '{files} 件のファイル',
      'guest.folderCount': '{folders} 件のフォルダ',
      'dashboard.noFiles': 'ファイルやフォルダはまだありません',
      'dashboard.noFilesHelp': 'ここにドロップするか、アップロードをクリックしてください',
      'dashboard.dropFiles': 'ファイルをドロップしてアップロード',
      'dashboard.selected': '{count} 件選択中',
      'dashboard.zip': 'Zip',
      'dashboard.used': '{size} 使用中',
      'share.passwordProtected': 'パスワード保護',
      'share.enterPassword': 'このファイルにアクセスするにはパスワードを入力してください',
      'share.unlock': '解除',
      'share.incorrectPassword': 'パスワードが違います',
      'share.connectionError': '接続エラー',
      'share.fileNotAvailable': 'ファイルを利用できません',
      'share.fileUnavailableHelp': 'この共有リンクは期限切れまたは解除された可能性があります。',
      'share.linkCopied': 'リンクをクリップボードにコピーしました',
      'share.downloads': '{count} ダウンロード',
      'share.sharedFolder': '共有フォルダ',
      'share.emptyFolder': 'このフォルダは空です',
      'notFound.title': 'ページが見つかりません',
      'notFound.help': 'お探しのページは存在しないか、移動されました。',
      'notFound.back': 'ホームへ戻る',
    },
    'zh-CN': {
      'ui.home': '首页',
      'ui.admin': '管理',
      'ui.language': '语言',
      'ui.theme': '主题',
      'ui.storage': '存储',
      'ui.folder': '文件夹',
      'ui.upload': '上传',
      'ui.refresh': '刷新',
      'ui.delete': '删除',
      'ui.cancel': '取消',
      'ui.save': '保存',
      'ui.rename': '重命名',
      'ui.move': '移动',
      'ui.copy': '复制',
      'ui.download': '下载',
      'ui.directLink': '直链',
      'ui.createLink': '创建链接',
      'ui.revokeLink': '撤销链接',
      'ui.password': '密码',
      'ui.expiresInDays': '有效期（天）',
      'ui.searchFiles': '搜索文件...',
      'ui.allTypes': '全部类型',
      'ui.loading': '加载中...',
      'ui.previewUnavailable': '此文件类型不支持预览',
      'login.poweredBy': '由 Yume 提供',
      'login.signIn': '登录',
      'login.signingIn': '登录中...',
      'login.oidcSignIn': '使用 {provider} 继续',
      'login.oidcOnly': '本站已启用 {provider} 登录。',
      'login.passwordPlaceholder': '输入密码',
      'login.invalidPassword': '密码错误',
      'login.connectionError': '连接错误，请重试。',
      'login.unauthorizedEmail': '此 {provider} 账号未被授权登录本站。',
      'login.emailUnverified': '请先验证你的 {provider} 账号邮箱。',
      'login.missingEmail': '{provider} 未返回邮箱地址。',
      'login.oidcFailed': '{provider} 登录失败，请重试。',
      'login.invalidState': '登录会话已过期，请重试。',
      'login.oidcMisconfigured': '{provider} 配置不正确。',
      'login.oidcSessionExpired': '你的 {provider} 账号登录状态已失效，请重新登录。',
      'settings.title': '站点设置',
      'settings.siteName': '站点名称',
      'settings.siteNameHelp': '显示在页眉、标题和公开页面中',
      'settings.iconUrl': '图标 URL',
      'settings.iconUrlHelp': '自定义 Logo 图片 URL（留空使用默认云图标）',
      'settings.logoBarUrl': 'Logo Bar 图片 URL',
      'settings.logoBarUrlHelp': '显示在左上角的页眉品牌图片',
      'settings.backgroundUrl': '背景图片 URL',
      'settings.backgroundUrlHelp': '自定义背景图片 URL（留空使用内置 Yume 背景）',
      'settings.language': '默认语言',
      'settings.languageHelp': '自动会跟随访问者浏览器语言',
      'settings.preview': '预览',
      'settings.enableGuest': '启用访客页',
      'settings.enableGuestHelp': '在首页展示公开分享文件',
      'settings.showLogin': '显示登录按钮',
      'settings.showLoginHelp': '在访客页显示“管理”按钮',
      'settings.saved': '设置已保存',
      'settings.saveFailed': '保存设置失败',
      'guest.sharedFiles': '共享文件',
      'guest.noSharedFiles': '暂无共享文件',
      'guest.noSharedFilesHelp': '目前还没有公开分享的内容。',
      'guest.noMatches': '没有匹配“{query}”的文件',
      'guest.fileCount': '{files} 个文件',
      'guest.folderCount': '{folders} 个文件夹',
      'dashboard.noFiles': '还没有文件或文件夹',
      'dashboard.noFilesHelp': '将文件拖到这里，或点击上传开始',
      'dashboard.dropFiles': '拖放文件以上传',
      'dashboard.selected': '已选择 {count} 项',
      'dashboard.zip': '压缩包',
      'dashboard.used': '已使用 {size}',
      'share.passwordProtected': '密码保护',
      'share.enterPassword': '输入密码以访问此文件',
      'share.unlock': '解锁',
      'share.incorrectPassword': '密码不正确',
      'share.connectionError': '连接错误',
      'share.fileNotAvailable': '文件不可用',
      'share.fileUnavailableHelp': '此分享链接可能已过期或被撤销。',
      'share.linkCopied': '链接已复制到剪贴板',
      'share.downloads': '{count} 次下载',
      'share.sharedFolder': '共享文件夹',
      'share.emptyFolder': '此文件夹为空',
      'notFound.title': '页面未找到',
      'notFound.help': '你要找的页面不存在，或已经移动。',
      'notFound.back': '返回首页',
    },
    'zh-TW': {
      'ui.home': '首頁',
      'ui.admin': '管理',
      'ui.language': '語言',
      'ui.theme': '主題',
      'ui.storage': '儲存',
      'ui.folder': '資料夾',
      'ui.upload': '上傳',
      'ui.refresh': '重新整理',
      'ui.delete': '刪除',
      'ui.cancel': '取消',
      'ui.save': '儲存',
      'ui.rename': '重新命名',
      'ui.move': '移動',
      'ui.copy': '複製',
      'ui.download': '下載',
      'ui.directLink': '直連',
      'ui.createLink': '建立連結',
      'ui.revokeLink': '撤銷連結',
      'ui.password': '密碼',
      'ui.expiresInDays': '有效期限（天）',
      'ui.searchFiles': '搜尋檔案...',
      'ui.allTypes': '全部類型',
      'ui.loading': '載入中...',
      'ui.previewUnavailable': '此檔案類型不支援預覽',
      'login.poweredBy': '由 Yume 提供',
      'login.signIn': '登入',
      'login.signingIn': '登入中...',
      'login.oidcSignIn': '使用 {provider} 繼續',
      'login.oidcOnly': '本站已啟用 {provider} 登入。',
      'login.passwordPlaceholder': '輸入密碼',
      'login.invalidPassword': '密碼錯誤',
      'login.connectionError': '連線錯誤，請重試。',
      'login.unauthorizedEmail': '此 {provider} 帳號未被授權登入本站。',
      'login.emailUnverified': '請先驗證你的 {provider} 帳號信箱。',
      'login.missingEmail': '{provider} 未回傳信箱地址。',
      'login.oidcFailed': '{provider} 登入失敗，請重試。',
      'login.invalidState': '登入工作階段已過期，請重試。',
      'login.oidcMisconfigured': '{provider} 設定不正確。',
      'login.oidcSessionExpired': '你的 {provider} 帳號登入狀態已失效，請重新登入。',
      'settings.title': '站點設定',
      'settings.siteName': '站點名稱',
      'settings.siteNameHelp': '顯示於頁首、標題與公開頁面',
      'settings.iconUrl': '圖示 URL',
      'settings.iconUrlHelp': '自訂 Logo 圖片 URL（留空使用預設雲端圖示）',
      'settings.logoBarUrl': 'Logo Bar 圖片 URL',
      'settings.logoBarUrlHelp': '顯示在左上角的頁首品牌圖片',
      'settings.backgroundUrl': '背景圖片 URL',
      'settings.backgroundUrlHelp': '自訂背景圖片 URL（留空使用內建 Yume 背景）',
      'settings.language': '預設語言',
      'settings.languageHelp': '自動會跟隨訪客瀏覽器語言',
      'settings.preview': '預覽',
      'settings.enableGuest': '啟用訪客頁',
      'settings.enableGuestHelp': '在首頁顯示公開分享檔案',
      'settings.showLogin': '顯示登入按鈕',
      'settings.showLoginHelp': '在訪客頁顯示「管理」按鈕',
      'settings.saved': '設定已儲存',
      'settings.saveFailed': '儲存設定失敗',
      'guest.sharedFiles': '共享檔案',
      'guest.noSharedFiles': '尚無共享檔案',
      'guest.noSharedFilesHelp': '目前還沒有公開分享的內容。',
      'guest.noMatches': '沒有符合「{query}」的檔案',
      'guest.fileCount': '{files} 個檔案',
      'guest.folderCount': '{folders} 個資料夾',
      'dashboard.noFiles': '尚無檔案或資料夾',
      'dashboard.noFilesHelp': '將檔案拖到這裡，或點擊上傳開始',
      'dashboard.dropFiles': '拖放檔案以上傳',
      'dashboard.selected': '已選取 {count} 項',
      'dashboard.zip': '壓縮檔',
      'dashboard.used': '已使用 {size}',
      'share.passwordProtected': '密碼保護',
      'share.enterPassword': '輸入密碼以存取此檔案',
      'share.unlock': '解鎖',
      'share.incorrectPassword': '密碼不正確',
      'share.connectionError': '連線錯誤',
      'share.fileNotAvailable': '檔案不可用',
      'share.fileUnavailableHelp': '此分享連結可能已過期或被撤銷。',
      'share.linkCopied': '連結已複製到剪貼簿',
      'share.downloads': '{count} 次下載',
      'share.sharedFolder': '共享資料夾',
      'share.emptyFolder': '此資料夾為空',
      'notFound.title': '找不到頁面',
      'notFound.help': '你要找的頁面不存在，或已經移動。',
      'notFound.back': '返回首頁',
    },
  };

  Object.assign(dict.en, {
    'ui.settings': 'Settings', 'ui.logout': 'Logout', 'ui.share': 'Share', 'ui.close': 'Close',
    'ui.create': 'Create', 'ui.name': 'Name', 'ui.type': 'Type', 'ui.size': 'Size',
    'ui.modified': 'Modified', 'ui.status': 'Status', 'ui.added': 'Added', 'ui.root': 'Root',
    'ui.copyLink': 'Copy link', 'ui.copyDownloadLink': 'Copy download link', 'ui.downloadFile': 'Download file',
    'ui.gridView': 'Grid view', 'ui.listView': 'List view', 'ui.moreActions': 'More actions', 'ui.previous': 'Previous', 'ui.next': 'Next',
    'type.all': 'All Types', 'type.images': 'Images', 'type.videos': 'Videos', 'type.audio': 'Audio',
    'type.documents': 'Documents', 'type.archives': 'Archives', 'type.code': 'Code', 'type.other': 'Other',
    'type.folder': 'Folder', 'status.hidden': 'hidden', 'status.guest': 'guest', 'status.shared': 'shared',
    'status.link': 'link', 'dashboard.files': '{count} files', 'dashboard.downloadCount': '{count} dl',
    'dashboard.toDestination': 'to {destination}', 'dashboard.shareFile': 'Share File',
    'dashboard.renameFile': 'Rename File', 'dashboard.newFolder': 'New Folder',
    'dashboard.folderName': 'Folder name', 'dashboard.deleteFiles': 'Delete Files',
    'dashboard.deleteFilesConfirm': 'Are you sure you want to delete {count} file(s)?',
    'dashboard.moveTo': 'Move to...', 'dashboard.movingFiles': 'Moving {count} file(s)',
    'dashboard.uploading': 'Uploading {active} / {total}', 'dashboard.clearDone': 'Clear done',
    'dashboard.uploaded': '{name} uploaded', 'dashboard.uploadFailed': 'Failed to upload {name}',
    'dashboard.refreshed': 'File list refreshed', 'dashboard.filesDeleted': '{count} file(s) deleted',
    'dashboard.filesDeleteFailed': 'Failed to delete files', 'dashboard.fileRenamed': 'File renamed',
    'dashboard.renameFailed': 'Rename failed', 'dashboard.filesMoved': '{count} file(s) moved',
    'dashboard.moveFailed': 'Move failed', 'dashboard.previewFailed': 'Failed to load preview',
    'dashboard.videoUnsupported': 'Your browser does not support video.',
    'dashboard.zipDownloaded': 'Zip downloaded', 'dashboard.zipFailed': 'Failed to download zip',
    'dashboard.folderZipDownloaded': 'Folder zip downloaded', 'dashboard.folderZipFailed': 'Failed to download folder zip',
    'folder.includeShare': 'Include in Share', 'folder.unshareGuest': 'Unshare (Guest)',
    'folder.excludeShare': 'Exclude from Share', 'folder.shareGuest': 'Share (Guest)',
    'folder.shareLink': 'Share Link', 'folder.downloadZip': 'Download ZIP',
    'folder.rename': 'Rename Folder', 'folder.delete': 'Delete Folder', 'folder.current': 'Current: {name}',
    'folder.deleteName': 'Delete folder: {name}',
    'folder.deleteWarning': 'All files and sub-folders inside will be permanently deleted.',
    'folder.passwordProtected': 'Password protected', 'folder.expires': 'Expires: {date}',
    'folder.shared': 'Folder shared', 'folder.unshared': 'Folder unshared',
    'folder.shareToggleFailed': 'Failed to toggle folder sharing', 'folder.excluded': 'Folder excluded from share',
    'folder.included': 'Folder included in share', 'folder.excludeToggleFailed': 'Failed to toggle folder exclusion',
    'folder.renamed': 'Folder renamed', 'folder.deleted': 'Folder deleted', 'folder.deleteFailed': 'Delete failed',
    'folder.filesRemoved': '{count} file(s)', 'folder.subfoldersRemoved': '{count} subfolder(s)',
    'folder.removedSummary': 'Folder deleted — removed {items}', 'folder.created': 'Folder created',
    'folder.createFailed': 'Failed to create folder', 'folder.shareLinkTitle': 'Share Folder Link',
    'folder.shareLinkCreated': 'Folder share link created', 'folder.shareLinkFailed': 'Failed to create folder share link',
    'folder.shareLinkRevoked': 'Folder share link revoked', 'folder.shareLinkRevokeFailed': 'Failed to revoke folder share link',
    'tree.excluded': 'Excluded from share', 'tree.guestShared': 'Guest shared', 'tree.inheritedShared': 'Inherited share',
    'share.passwordOptional': 'Password (optional)', 'share.noPasswordPlaceholder': 'Leave empty for no password',
    'share.neverPlaceholder': '0 = never', 'share.linkCreated': 'Share link created',
    'share.linkCreateFailed': 'Failed to create share link', 'share.linkRevoked': 'Share link revoked',
    'share.linkRevokeFailed': 'Failed to revoke link', 'share.directNotConfigured': 'R2 public direct link is not configured',
    'share.directCopied': 'Direct link copied to clipboard', 'share.directCopyFailed': 'Failed to copy direct link',
    'footer.copyright': 'Copyright', 'footer.rights': 'All Rights Reserved',
    'page.sharedFile': 'Shared File', 'page.login': 'Login'
  });

  Object.assign(dict.fr, {
    'ui.settings': 'Paramètres', 'ui.logout': 'Déconnexion', 'ui.share': 'Partager', 'ui.close': 'Fermer',
    'ui.create': 'Créer', 'ui.name': 'Nom', 'ui.type': 'Type', 'ui.size': 'Taille',
    'ui.modified': 'Modifié', 'ui.status': 'État', 'ui.added': 'Ajouté', 'ui.root': 'Racine',
    'ui.copyLink': 'Copier le lien', 'ui.copyDownloadLink': 'Copier le lien de téléchargement', 'ui.downloadFile': 'Télécharger le fichier',
    'ui.gridView': 'Vue grille', 'ui.listView': 'Vue liste', 'ui.moreActions': "Plus d'actions", 'ui.previous': 'Précédent', 'ui.next': 'Suivant',
    'type.all': 'Tous les types', 'type.images': 'Images', 'type.videos': 'Vidéos', 'type.audio': 'Audio',
    'type.documents': 'Documents', 'type.archives': 'Archives', 'type.code': 'Code', 'type.other': 'Autres',
    'type.folder': 'Dossier', 'status.hidden': 'masqué', 'status.guest': 'invité', 'status.shared': 'partagé',
    'status.link': 'lien', 'dashboard.files': '{count} fichiers', 'dashboard.downloadCount': '{count} tél.',
    'dashboard.toDestination': 'vers {destination}', 'dashboard.shareFile': 'Partager le fichier',
    'dashboard.renameFile': 'Renommer le fichier', 'dashboard.newFolder': 'Nouveau dossier',
    'dashboard.folderName': 'Nom du dossier', 'dashboard.deleteFiles': 'Supprimer les fichiers',
    'dashboard.deleteFilesConfirm': 'Voulez-vous vraiment supprimer {count} fichier(s) ?',
    'dashboard.moveTo': 'Déplacer vers...', 'dashboard.movingFiles': 'Déplacement de {count} fichier(s)',
    'dashboard.uploading': 'Importation {active} / {total}', 'dashboard.clearDone': 'Effacer les terminés',
    'dashboard.uploaded': '{name} importé', 'dashboard.uploadFailed': "Échec de l’importation de {name}",
    'dashboard.refreshed': 'Liste actualisée', 'dashboard.filesDeleted': '{count} fichier(s) supprimé(s)',
    'dashboard.filesDeleteFailed': 'Échec de la suppression', 'dashboard.fileRenamed': 'Fichier renommé',
    'dashboard.renameFailed': 'Échec du renommage', 'dashboard.filesMoved': '{count} fichier(s) déplacé(s)',
    'dashboard.moveFailed': 'Échec du déplacement', 'dashboard.previewFailed': "Échec du chargement de l’aperçu",
    'dashboard.videoUnsupported': 'Votre navigateur ne prend pas en charge la vidéo.',
    'dashboard.zipDownloaded': 'Archive téléchargée', 'dashboard.zipFailed': "Échec du téléchargement de l’archive",
    'dashboard.folderZipDownloaded': 'Archive du dossier téléchargée', 'dashboard.folderZipFailed': "Échec du téléchargement de l’archive du dossier",
    'folder.includeShare': 'Inclure dans le partage', 'folder.unshareGuest': 'Ne plus partager (invité)',
    'folder.excludeShare': 'Exclure du partage', 'folder.shareGuest': 'Partager (invité)',
    'folder.shareLink': 'Lien de partage', 'folder.downloadZip': "Télécharger l’archive ZIP",
    'folder.rename': 'Renommer le dossier', 'folder.delete': 'Supprimer le dossier', 'folder.current': 'Actuel : {name}',
    'folder.deleteName': 'Supprimer le dossier : {name}',
    'folder.deleteWarning': 'Tous les fichiers et sous-dossiers seront définitivement supprimés.',
    'folder.passwordProtected': 'Protégé par mot de passe', 'folder.expires': 'Expire : {date}',
    'folder.shared': 'Dossier partagé', 'folder.unshared': 'Partage du dossier retiré',
    'folder.shareToggleFailed': 'Échec de la modification du partage', 'folder.excluded': 'Dossier exclu du partage',
    'folder.included': 'Dossier inclus dans le partage', 'folder.excludeToggleFailed': "Échec de la modification de l’exclusion",
    'folder.renamed': 'Dossier renommé', 'folder.deleted': 'Dossier supprimé', 'folder.deleteFailed': 'Échec de la suppression',
    'folder.filesRemoved': '{count} fichier(s)', 'folder.subfoldersRemoved': '{count} sous-dossier(s)',
    'folder.removedSummary': 'Dossier supprimé — {items} retiré(s)', 'folder.created': 'Dossier créé',
    'folder.createFailed': 'Échec de la création du dossier', 'folder.shareLinkTitle': 'Partager le lien du dossier',
    'folder.shareLinkCreated': 'Lien du dossier créé', 'folder.shareLinkFailed': 'Échec de la création du lien du dossier',
    'folder.shareLinkRevoked': 'Lien du dossier révoqué', 'folder.shareLinkRevokeFailed': 'Échec de la révocation du lien du dossier',
    'tree.excluded': 'Exclu du partage', 'tree.guestShared': 'Partagé avec les invités', 'tree.inheritedShared': 'Partage hérité',
    'share.passwordOptional': 'Mot de passe (facultatif)', 'share.noPasswordPlaceholder': 'Laisser vide pour aucun mot de passe',
    'share.neverPlaceholder': '0 = jamais', 'share.linkCreated': 'Lien de partage créé',
    'share.linkCreateFailed': 'Échec de la création du lien', 'share.linkRevoked': 'Lien de partage révoqué',
    'share.linkRevokeFailed': 'Échec de la révocation du lien', 'share.directNotConfigured': "Le lien public direct R2 n’est pas configuré",
    'share.directCopied': 'Lien direct copié', 'share.directCopyFailed': 'Échec de la copie du lien direct',
    'footer.copyright': "Droits d’auteur", 'footer.rights': 'Tous droits réservés',
    'page.sharedFile': 'Fichier partagé', 'page.login': 'Connexion'
  });

  Object.assign(dict.ja, {
    'ui.settings': '設定', 'ui.logout': 'ログアウト', 'ui.share': '共有', 'ui.close': '閉じる',
    'ui.create': '作成', 'ui.name': '名前', 'ui.type': '種類', 'ui.size': 'サイズ',
    'ui.modified': '更新日時', 'ui.status': '状態', 'ui.added': '追加日時', 'ui.root': 'ルート',
    'ui.copyLink': 'リンクをコピー', 'ui.copyDownloadLink': 'ダウンロードリンクをコピー', 'ui.downloadFile': 'ファイルをダウンロード',
    'ui.gridView': 'グリッド表示', 'ui.listView': 'リスト表示', 'ui.moreActions': 'その他の操作', 'ui.previous': '前へ', 'ui.next': '次へ',
    'type.all': 'すべての種類', 'type.images': '画像', 'type.videos': '動画', 'type.audio': '音声',
    'type.documents': '文書', 'type.archives': 'アーカイブ', 'type.code': 'コード', 'type.other': 'その他',
    'type.folder': 'フォルダ', 'status.hidden': '非表示', 'status.guest': 'ゲスト', 'status.shared': '共有中',
    'status.link': 'リンク', 'dashboard.files': '{count} 件のファイル', 'dashboard.downloadCount': '{count} DL',
    'dashboard.toDestination': '{destination} へ', 'dashboard.shareFile': 'ファイルを共有',
    'dashboard.renameFile': 'ファイル名を変更', 'dashboard.newFolder': '新しいフォルダ',
    'dashboard.folderName': 'フォルダ名', 'dashboard.deleteFiles': 'ファイルを削除',
    'dashboard.deleteFilesConfirm': '{count} 件のファイルを削除しますか？',
    'dashboard.moveTo': '移動先...', 'dashboard.movingFiles': '{count} 件のファイルを移動',
    'dashboard.uploading': 'アップロード中 {active} / {total}', 'dashboard.clearDone': '完了済みを消去',
    'dashboard.uploaded': '{name} をアップロードしました', 'dashboard.uploadFailed': '{name} のアップロードに失敗しました',
    'dashboard.refreshed': 'ファイル一覧を更新しました', 'dashboard.filesDeleted': '{count} 件のファイルを削除しました',
    'dashboard.filesDeleteFailed': 'ファイルの削除に失敗しました', 'dashboard.fileRenamed': 'ファイル名を変更しました',
    'dashboard.renameFailed': '名前の変更に失敗しました', 'dashboard.filesMoved': '{count} 件のファイルを移動しました',
    'dashboard.moveFailed': '移動に失敗しました', 'dashboard.previewFailed': 'プレビューの読み込みに失敗しました',
    'dashboard.videoUnsupported': 'お使いのブラウザは動画に対応していません。',
    'dashboard.zipDownloaded': 'ZIP をダウンロードしました', 'dashboard.zipFailed': 'ZIP のダウンロードに失敗しました',
    'dashboard.folderZipDownloaded': 'フォルダの ZIP をダウンロードしました', 'dashboard.folderZipFailed': 'フォルダ ZIP のダウンロードに失敗しました',
    'folder.includeShare': '共有に含める', 'folder.unshareGuest': 'ゲスト共有を解除',
    'folder.excludeShare': '共有から除外', 'folder.shareGuest': 'ゲスト共有',
    'folder.shareLink': '共有リンク', 'folder.downloadZip': 'ZIP をダウンロード',
    'folder.rename': 'フォルダ名を変更', 'folder.delete': 'フォルダを削除', 'folder.current': '現在：{name}',
    'folder.deleteName': '削除するフォルダ：{name}',
    'folder.deleteWarning': '中のすべてのファイルとサブフォルダが完全に削除されます。',
    'folder.passwordProtected': 'パスワード保護', 'folder.expires': '有効期限：{date}',
    'folder.shared': 'フォルダを共有しました', 'folder.unshared': 'フォルダの共有を解除しました',
    'folder.shareToggleFailed': 'フォルダ共有の変更に失敗しました', 'folder.excluded': 'フォルダを共有から除外しました',
    'folder.included': 'フォルダを共有に含めました', 'folder.excludeToggleFailed': 'フォルダ除外の変更に失敗しました',
    'folder.renamed': 'フォルダ名を変更しました', 'folder.deleted': 'フォルダを削除しました', 'folder.deleteFailed': '削除に失敗しました',
    'folder.filesRemoved': '{count} 件のファイル', 'folder.subfoldersRemoved': '{count} 件のサブフォルダ',
    'folder.removedSummary': 'フォルダを削除しました（{items} を削除）', 'folder.created': 'フォルダを作成しました',
    'folder.createFailed': 'フォルダの作成に失敗しました', 'folder.shareLinkTitle': 'フォルダ共有リンク',
    'folder.shareLinkCreated': 'フォルダ共有リンクを作成しました', 'folder.shareLinkFailed': 'フォルダ共有リンクの作成に失敗しました',
    'folder.shareLinkRevoked': 'フォルダ共有リンクを解除しました', 'folder.shareLinkRevokeFailed': 'フォルダ共有リンクの解除に失敗しました',
    'tree.excluded': '共有から除外', 'tree.guestShared': 'ゲスト共有', 'tree.inheritedShared': '継承された共有',
    'share.passwordOptional': 'パスワード（任意）', 'share.noPasswordPlaceholder': 'パスワードなしの場合は空欄',
    'share.neverPlaceholder': '0 = 無期限', 'share.linkCreated': '共有リンクを作成しました',
    'share.linkCreateFailed': '共有リンクの作成に失敗しました', 'share.linkRevoked': '共有リンクを解除しました',
    'share.linkRevokeFailed': 'リンクの解除に失敗しました', 'share.directNotConfigured': 'R2 公開直リンクが設定されていません',
    'share.directCopied': '直リンクをコピーしました', 'share.directCopyFailed': '直リンクのコピーに失敗しました',
    'footer.copyright': '著作権', 'footer.rights': '無断転載を禁じます',
    'page.sharedFile': '共有ファイル', 'page.login': 'ログイン'
  });

  Object.assign(dict['zh-CN'], {
    'ui.settings': '设置', 'ui.logout': '退出登录', 'ui.share': '分享', 'ui.close': '关闭',
    'ui.create': '创建', 'ui.name': '名称', 'ui.type': '类型', 'ui.size': '大小',
    'ui.modified': '修改时间', 'ui.status': '状态', 'ui.added': '添加时间', 'ui.root': '根目录',
    'ui.copyLink': '复制链接', 'ui.copyDownloadLink': '复制下载链接', 'ui.downloadFile': '下载文件',
    'ui.gridView': '网格视图', 'ui.listView': '列表视图', 'ui.moreActions': '更多操作', 'ui.previous': '上一项', 'ui.next': '下一项',
    'type.all': '全部类型', 'type.images': '图片', 'type.videos': '视频', 'type.audio': '音频',
    'type.documents': '文档', 'type.archives': '压缩包', 'type.code': '代码', 'type.other': '其他',
    'type.folder': '文件夹', 'status.hidden': '已隐藏', 'status.guest': '访客共享', 'status.shared': '已共享',
    'status.link': '链接', 'dashboard.files': '{count} 个文件', 'dashboard.downloadCount': '{count} 次下载',
    'dashboard.toDestination': '到 {destination}', 'dashboard.shareFile': '分享文件',
    'dashboard.renameFile': '重命名文件', 'dashboard.newFolder': '新建文件夹',
    'dashboard.folderName': '文件夹名称', 'dashboard.deleteFiles': '删除文件',
    'dashboard.deleteFilesConfirm': '确定要删除 {count} 个文件吗？',
    'dashboard.moveTo': '移动到...', 'dashboard.movingFiles': '正在移动 {count} 个文件',
    'dashboard.uploading': '正在上传 {active} / {total}', 'dashboard.clearDone': '清除已完成',
    'dashboard.uploaded': '{name} 上传完成', 'dashboard.uploadFailed': '{name} 上传失败',
    'dashboard.refreshed': '文件列表已刷新', 'dashboard.filesDeleted': '已删除 {count} 个文件',
    'dashboard.filesDeleteFailed': '删除文件失败', 'dashboard.fileRenamed': '文件已重命名',
    'dashboard.renameFailed': '重命名失败', 'dashboard.filesMoved': '已移动 {count} 个文件',
    'dashboard.moveFailed': '移动失败', 'dashboard.previewFailed': '预览加载失败',
    'dashboard.videoUnsupported': '你的浏览器不支持视频播放。',
    'dashboard.zipDownloaded': '压缩包已下载', 'dashboard.zipFailed': '下载压缩包失败',
    'dashboard.folderZipDownloaded': '文件夹压缩包已下载', 'dashboard.folderZipFailed': '下载文件夹压缩包失败',
    'folder.includeShare': '包含在共享中', 'folder.unshareGuest': '取消访客共享',
    'folder.excludeShare': '从共享中排除', 'folder.shareGuest': '访客共享',
    'folder.shareLink': '分享链接', 'folder.downloadZip': '下载 ZIP',
    'folder.rename': '重命名文件夹', 'folder.delete': '删除文件夹', 'folder.current': '当前：{name}',
    'folder.deleteName': '删除文件夹：{name}',
    'folder.deleteWarning': '其中的所有文件和子文件夹都将被永久删除。',
    'folder.passwordProtected': '密码保护', 'folder.expires': '到期时间：{date}',
    'folder.shared': '文件夹已共享', 'folder.unshared': '文件夹已取消共享',
    'folder.shareToggleFailed': '切换文件夹共享状态失败', 'folder.excluded': '文件夹已从共享中排除',
    'folder.included': '文件夹已包含在共享中', 'folder.excludeToggleFailed': '切换文件夹排除状态失败',
    'folder.renamed': '文件夹已重命名', 'folder.deleted': '文件夹已删除', 'folder.deleteFailed': '删除失败',
    'folder.filesRemoved': '{count} 个文件', 'folder.subfoldersRemoved': '{count} 个子文件夹',
    'folder.removedSummary': '文件夹已删除，同时移除了 {items}', 'folder.created': '文件夹已创建',
    'folder.createFailed': '创建文件夹失败', 'folder.shareLinkTitle': '分享文件夹链接',
    'folder.shareLinkCreated': '文件夹分享链接已创建', 'folder.shareLinkFailed': '创建文件夹分享链接失败',
    'folder.shareLinkRevoked': '文件夹分享链接已撤销', 'folder.shareLinkRevokeFailed': '撤销文件夹分享链接失败',
    'tree.excluded': '已从共享中排除', 'tree.guestShared': '访客共享', 'tree.inheritedShared': '继承的共享',
    'share.passwordOptional': '密码（可选）', 'share.noPasswordPlaceholder': '留空表示不设置密码',
    'share.neverPlaceholder': '0 = 永不过期', 'share.linkCreated': '分享链接已创建',
    'share.linkCreateFailed': '创建分享链接失败', 'share.linkRevoked': '分享链接已撤销',
    'share.linkRevokeFailed': '撤销分享链接失败', 'share.directNotConfigured': '尚未配置 R2 公共直链',
    'share.directCopied': '直链已复制到剪贴板', 'share.directCopyFailed': '复制直链失败',
    'footer.copyright': '版权所有', 'footer.rights': '保留所有权利',
    'page.sharedFile': '共享文件', 'page.login': '登录'
  });

  Object.assign(dict['zh-TW'], {
    'ui.settings': '設定', 'ui.logout': '登出', 'ui.share': '分享', 'ui.close': '關閉',
    'ui.create': '建立', 'ui.name': '名稱', 'ui.type': '類型', 'ui.size': '大小',
    'ui.modified': '修改時間', 'ui.status': '狀態', 'ui.added': '加入時間', 'ui.root': '根目錄',
    'ui.copyLink': '複製連結', 'ui.copyDownloadLink': '複製下載連結', 'ui.downloadFile': '下載檔案',
    'ui.gridView': '網格檢視', 'ui.listView': '列表檢視', 'ui.moreActions': '更多操作', 'ui.previous': '上一項', 'ui.next': '下一項',
    'type.all': '全部類型', 'type.images': '圖片', 'type.videos': '影片', 'type.audio': '音訊',
    'type.documents': '文件', 'type.archives': '壓縮檔', 'type.code': '程式碼', 'type.other': '其他',
    'type.folder': '資料夾', 'status.hidden': '已隱藏', 'status.guest': '訪客分享', 'status.shared': '已分享',
    'status.link': '連結', 'dashboard.files': '{count} 個檔案', 'dashboard.downloadCount': '{count} 次下載',
    'dashboard.toDestination': '到 {destination}', 'dashboard.shareFile': '分享檔案',
    'dashboard.renameFile': '重新命名檔案', 'dashboard.newFolder': '新增資料夾',
    'dashboard.folderName': '資料夾名稱', 'dashboard.deleteFiles': '刪除檔案',
    'dashboard.deleteFilesConfirm': '確定要刪除 {count} 個檔案嗎？',
    'dashboard.moveTo': '移動到...', 'dashboard.movingFiles': '正在移動 {count} 個檔案',
    'dashboard.uploading': '正在上傳 {active} / {total}', 'dashboard.clearDone': '清除已完成',
    'dashboard.uploaded': '{name} 上傳完成', 'dashboard.uploadFailed': '{name} 上傳失敗',
    'dashboard.refreshed': '檔案列表已重新整理', 'dashboard.filesDeleted': '已刪除 {count} 個檔案',
    'dashboard.filesDeleteFailed': '刪除檔案失敗', 'dashboard.fileRenamed': '檔案已重新命名',
    'dashboard.renameFailed': '重新命名失敗', 'dashboard.filesMoved': '已移動 {count} 個檔案',
    'dashboard.moveFailed': '移動失敗', 'dashboard.previewFailed': '預覽載入失敗',
    'dashboard.videoUnsupported': '你的瀏覽器不支援影片播放。',
    'dashboard.zipDownloaded': '壓縮檔已下載', 'dashboard.zipFailed': '下載壓縮檔失敗',
    'dashboard.folderZipDownloaded': '資料夾壓縮檔已下載', 'dashboard.folderZipFailed': '下載資料夾壓縮檔失敗',
    'folder.includeShare': '包含在分享中', 'folder.unshareGuest': '取消訪客分享',
    'folder.excludeShare': '從分享中排除', 'folder.shareGuest': '訪客分享',
    'folder.shareLink': '分享連結', 'folder.downloadZip': '下載 ZIP',
    'folder.rename': '重新命名資料夾', 'folder.delete': '刪除資料夾', 'folder.current': '目前：{name}',
    'folder.deleteName': '刪除資料夾：{name}',
    'folder.deleteWarning': '其中的所有檔案和子資料夾都將被永久刪除。',
    'folder.passwordProtected': '密碼保護', 'folder.expires': '到期時間：{date}',
    'folder.shared': '資料夾已分享', 'folder.unshared': '資料夾已取消分享',
    'folder.shareToggleFailed': '切換資料夾分享狀態失敗', 'folder.excluded': '資料夾已從分享中排除',
    'folder.included': '資料夾已包含在分享中', 'folder.excludeToggleFailed': '切換資料夾排除狀態失敗',
    'folder.renamed': '資料夾已重新命名', 'folder.deleted': '資料夾已刪除', 'folder.deleteFailed': '刪除失敗',
    'folder.filesRemoved': '{count} 個檔案', 'folder.subfoldersRemoved': '{count} 個子資料夾',
    'folder.removedSummary': '資料夾已刪除，同時移除了 {items}', 'folder.created': '資料夾已建立',
    'folder.createFailed': '建立資料夾失敗', 'folder.shareLinkTitle': '分享資料夾連結',
    'folder.shareLinkCreated': '資料夾分享連結已建立', 'folder.shareLinkFailed': '建立資料夾分享連結失敗',
    'folder.shareLinkRevoked': '資料夾分享連結已撤銷', 'folder.shareLinkRevokeFailed': '撤銷資料夾分享連結失敗',
    'tree.excluded': '已從分享中排除', 'tree.guestShared': '訪客分享', 'tree.inheritedShared': '繼承的分享',
    'share.passwordOptional': '密碼（可選）', 'share.noPasswordPlaceholder': '留空表示不設定密碼',
    'share.neverPlaceholder': '0 = 永不過期', 'share.linkCreated': '分享連結已建立',
    'share.linkCreateFailed': '建立分享連結失敗', 'share.linkRevoked': '分享連結已撤銷',
    'share.linkRevokeFailed': '撤銷分享連結失敗', 'share.directNotConfigured': '尚未設定 R2 公開直連',
    'share.directCopied': '直連已複製到剪貼簿', 'share.directCopyFailed': '複製直連失敗',
    'footer.copyright': '版權所有', 'footer.rights': '保留所有權利',
    'page.sharedFile': '共享檔案', 'page.login': '登入'
  });

  Object.assign(dict.en, {
    'nav.fileManagement': 'File Management',
    'nav.clashSubscriptions': 'Clash Subscriptions',
    'ui.save': 'Save',
    'clash.title': 'Clash Subscription Publisher',
    'clash.subtitle': 'Publish YAML files as standard Clash/Mihomo provider URLs',
    'clash.encrypted': 'Encrypted URL',
    'clash.selectFiles': 'Select YAML files',
    'clash.selectAll': 'Select all',
    'clash.clearSelection': 'Clear selection',
    'clash.noFiles': 'No .yaml or .yml files found in R2',
    'clash.encryptionTitle': 'AES-256-GCM encrypted token',
    'clash.encryptionHelp': 'The URL does not expose the file ID or R2 object key.',
    'clash.expires': 'Link expiration (days)',
    'clash.expiresHelp': 'Set 0 for a link that never expires.',
    'clash.publish': 'Publish {count} subscription(s)',
    'clash.publishing': 'Publishing...',
    'clash.published': 'Published subscriptions',
    'clash.linkCount': '{count} link(s)',
    'clash.expiresAt': 'Expires: {date}',
    'clash.neverExpires': 'Never expires',
    'clash.loadFailed': 'Failed to load Clash subscriptions',
    'clash.publishedToast': 'Published {count} Clash subscription(s)',
    'clash.publishFailed': 'Failed to publish Clash subscriptions',
    'clash.revoked': 'Clash subscription revoked',
    'clash.revokeFailed': 'Failed to revoke Clash subscription',
    'clash.linkCopied': 'Clash subscription URL copied',
    'clash.copyFailed': 'Failed to copy Clash subscription URL',
    'clash.folder': 'Configuration folder',
    'clash.folderPlaceholder': '/clash',
    'clash.folderHelp': 'Only YAML files under this R2 folder and its subfolders are listed.',
    'clash.folderSaved': 'Clash configuration folder saved',
    'clash.folderSaveFailed': 'Failed to save the Clash configuration folder',
    'clash.namePlaceholder': 'Subscription name (optional)',
    'clash.searchPlaceholder': 'Search subscriptions',
    'clash.noMatches': 'No matching subscriptions',
    'document.edit': 'Edit',
    'document.save': 'Save changes',
    'document.saving': 'Saving…',
    'document.cancel': 'Cancel',
    'document.saved': 'Document saved',
    'document.saveFailed': 'Failed to save document',
    'document.editorLabel': 'Document editor',
  });

  Object.assign(dict['zh-CN'], {
    'nav.fileManagement': '文件管理',
    'nav.clashSubscriptions': 'Clash订阅',
    'ui.save': '保存',
    'clash.title': 'Clash 订阅发布',
    'clash.subtitle': '将 YAML 配置发布为标准 Clash/Mihomo 订阅链接',
    'clash.encrypted': '链接已加密',
    'clash.selectFiles': '选择 YAML 配置文件',
    'clash.selectAll': '全选',
    'clash.clearSelection': '清除选择',
    'clash.noFiles': 'R2 中没有找到 .yaml 或 .yml 文件',
    'clash.encryptionTitle': 'AES-256-GCM 加密令牌',
    'clash.encryptionHelp': '链接不会暴露文件 ID 或 R2 对象路径。',
    'clash.expires': '链接有效期（天）',
    'clash.expiresHelp': '填写 0 表示永不过期。',
    'clash.publish': '发布 {count} 个订阅',
    'clash.publishing': '发布中…',
    'clash.published': '已发布的订阅',
    'clash.linkCount': '{count} 个链接',
    'clash.expiresAt': '到期：{date}',
    'clash.neverExpires': '永不过期',
    'clash.loadFailed': '加载 Clash 订阅失败',
    'clash.publishedToast': '已发布 {count} 个 Clash 订阅',
    'clash.publishFailed': '发布 Clash 订阅失败',
    'clash.revoked': 'Clash 订阅已撤销',
    'clash.revokeFailed': '撤销 Clash 订阅失败',
    'clash.linkCopied': 'Clash 订阅链接已复制',
    'clash.copyFailed': '复制 Clash 订阅链接失败',
    'clash.folder': '配置文件夹',
    'clash.folderPlaceholder': '/clash',
    'clash.folderHelp': '只列出该 R2 文件夹及其子文件夹中的 YAML 文件。',
    'clash.folderSaved': 'Clash 配置文件夹已保存',
    'clash.folderSaveFailed': '保存 Clash 配置文件夹失败',
    'clash.namePlaceholder': '订阅名称（可选）',
    'clash.searchPlaceholder': '搜索订阅',
    'clash.noMatches': '没有匹配的订阅',
    'document.edit': '编辑',
    'document.save': '保存修改',
    'document.saving': '保存中…',
    'document.cancel': '取消',
    'document.saved': '文档已保存',
    'document.saveFailed': '保存文档失败',
    'document.editorLabel': '文档编辑器',
  });

  Object.assign(dict.fr, {
    'nav.fileManagement': 'Gestion des fichiers',
    'nav.clashSubscriptions': 'Abonnements Clash',
    'ui.save': 'Enregistrer',
    'clash.title': 'Publication d’abonnements Clash',
    'clash.subtitle': 'Publier des fichiers YAML comme liens Clash/Mihomo standard',
    'clash.encrypted': 'URL chiffrée',
    'clash.selectFiles': 'Sélectionner des fichiers YAML',
    'clash.selectAll': 'Tout sélectionner',
    'clash.clearSelection': 'Effacer la sélection',
    'clash.noFiles': 'Aucun fichier .yaml ou .yml trouvé dans R2',
    'clash.encryptionTitle': 'Jeton chiffré AES-256-GCM',
    'clash.encryptionHelp': 'L’URL n’expose ni l’ID du fichier ni la clé de l’objet R2.',
    'clash.expires': 'Expiration du lien (jours)',
    'clash.expiresHelp': 'Saisissez 0 pour un lien sans expiration.',
    'clash.publish': 'Publier {count} abonnement(s)',
    'clash.publishing': 'Publication…',
    'clash.published': 'Abonnements publiés',
    'clash.linkCount': '{count} lien(s)',
    'clash.expiresAt': 'Expire : {date}',
    'clash.neverExpires': 'N’expire jamais',
    'clash.loadFailed': 'Échec du chargement des abonnements Clash',
    'clash.publishedToast': '{count} abonnement(s) Clash publié(s)',
    'clash.publishFailed': 'Échec de la publication des abonnements Clash',
    'clash.revoked': 'Abonnement Clash révoqué',
    'clash.revokeFailed': 'Échec de la révocation de l’abonnement Clash',
    'clash.linkCopied': 'URL de l’abonnement Clash copiée',
    'clash.copyFailed': 'Échec de la copie de l’URL Clash',
    'clash.folder': 'Dossier de configuration',
    'clash.folderPlaceholder': '/clash',
    'clash.folderHelp': 'Seuls les fichiers YAML de ce dossier R2 et de ses sous-dossiers sont listés.',
    'clash.folderSaved': 'Dossier de configuration Clash enregistré',
    'clash.folderSaveFailed': 'Échec de l’enregistrement du dossier Clash',
    'clash.namePlaceholder': 'Nom de l’abonnement (facultatif)',
    'clash.searchPlaceholder': 'Rechercher des abonnements',
    'clash.noMatches': 'Aucun abonnement correspondant',
    'document.edit': 'Modifier',
    'document.save': 'Enregistrer les modifications',
    'document.saving': 'Enregistrement…',
    'document.cancel': 'Annuler',
    'document.saved': 'Document enregistré',
    'document.saveFailed': 'Échec de l’enregistrement du document',
    'document.editorLabel': 'Éditeur de document',
  });

  Object.assign(dict.ja, {
    'nav.fileManagement': 'ファイル管理',
    'nav.clashSubscriptions': 'Clash購読',
    'ui.save': '保存',
    'clash.title': 'Clash購読の公開',
    'clash.subtitle': 'YAML設定を標準Clash/Mihomo購読リンクとして公開',
    'clash.encrypted': '暗号化URL',
    'clash.selectFiles': 'YAML設定ファイルを選択',
    'clash.selectAll': 'すべて選択',
    'clash.clearSelection': '選択を解除',
    'clash.noFiles': 'R2に.yamlまたは.ymlファイルがありません',
    'clash.encryptionTitle': 'AES-256-GCM暗号化トークン',
    'clash.encryptionHelp': 'URLにはファイルIDやR2オブジェクトキーを公開しません。',
    'clash.expires': 'リンクの有効期間（日）',
    'clash.expiresHelp': '0にすると無期限になります。',
    'clash.publish': '{count}件の購読を公開',
    'clash.publishing': '公開中…',
    'clash.published': '公開済みの購読',
    'clash.linkCount': '{count}件のリンク',
    'clash.expiresAt': '有効期限：{date}',
    'clash.neverExpires': '無期限',
    'clash.loadFailed': 'Clash購読の読み込みに失敗しました',
    'clash.publishedToast': '{count}件のClash購読を公開しました',
    'clash.publishFailed': 'Clash購読の公開に失敗しました',
    'clash.revoked': 'Clash購読を取り消しました',
    'clash.revokeFailed': 'Clash購読の取り消しに失敗しました',
    'clash.linkCopied': 'Clash購読URLをコピーしました',
    'clash.copyFailed': 'Clash購読URLのコピーに失敗しました',
    'clash.folder': '設定フォルダー',
    'clash.folderPlaceholder': '/clash',
    'clash.folderHelp': 'このR2フォルダーとサブフォルダー内のYAMLだけを表示します。',
    'clash.folderSaved': 'Clash設定フォルダーを保存しました',
    'clash.folderSaveFailed': 'Clash設定フォルダーの保存に失敗しました',
    'clash.namePlaceholder': '購読名（任意）',
    'clash.searchPlaceholder': '購読を検索',
    'clash.noMatches': '一致する購読がありません',
    'document.edit': '編集',
    'document.save': '変更を保存',
    'document.saving': '保存中…',
    'document.cancel': 'キャンセル',
    'document.saved': 'ドキュメントを保存しました',
    'document.saveFailed': 'ドキュメントの保存に失敗しました',
    'document.editorLabel': 'ドキュメントエディター',
  });

  Object.assign(dict['zh-TW'], {
    'nav.fileManagement': '檔案管理',
    'nav.clashSubscriptions': 'Clash訂閱',
    'ui.save': '儲存',
    'clash.title': 'Clash 訂閱發布',
    'clash.subtitle': '將 YAML 設定發布為標準 Clash/Mihomo 訂閱連結',
    'clash.encrypted': '連結已加密',
    'clash.selectFiles': '選擇 YAML 設定檔',
    'clash.selectAll': '全選',
    'clash.clearSelection': '清除選擇',
    'clash.noFiles': 'R2 中沒有找到 .yaml 或 .yml 檔案',
    'clash.encryptionTitle': 'AES-256-GCM 加密令牌',
    'clash.encryptionHelp': '連結不會暴露檔案 ID 或 R2 物件路徑。',
    'clash.expires': '連結有效期（天）',
    'clash.expiresHelp': '填寫 0 表示永不過期。',
    'clash.publish': '發布 {count} 個訂閱',
    'clash.publishing': '發布中…',
    'clash.published': '已發布的訂閱',
    'clash.linkCount': '{count} 個連結',
    'clash.expiresAt': '到期：{date}',
    'clash.neverExpires': '永不過期',
    'clash.loadFailed': '載入 Clash 訂閱失敗',
    'clash.publishedToast': '已發布 {count} 個 Clash 訂閱',
    'clash.publishFailed': '發布 Clash 訂閱失敗',
    'clash.revoked': 'Clash 訂閱已撤銷',
    'clash.revokeFailed': '撤銷 Clash 訂閱失敗',
    'clash.linkCopied': 'Clash 訂閱連結已複製',
    'clash.copyFailed': '複製 Clash 訂閱連結失敗',
    'clash.folder': '設定檔資料夾',
    'clash.folderPlaceholder': '/clash',
    'clash.folderHelp': '只列出此 R2 資料夾及其子資料夾中的 YAML 檔案。',
    'clash.folderSaved': 'Clash 設定檔資料夾已儲存',
    'clash.folderSaveFailed': '儲存 Clash 設定檔資料夾失敗',
    'clash.namePlaceholder': '訂閱名稱（可選）',
    'clash.searchPlaceholder': '搜尋訂閱',
    'clash.noMatches': '沒有符合的訂閱',
    'document.edit': '編輯',
    'document.save': '儲存變更',
    'document.saving': '儲存中…',
    'document.cancel': '取消',
    'document.saved': '文件已儲存',
    'document.saveFailed': '儲存文件失敗',
    'document.editorLabel': '文件編輯器',
  });

  var branding = {};
  var configuredLanguage = 'auto';
  var activeLanguage = 'en';
  var observerStarted = false;

  function readJson(id) {
    try {
      var el = document.getElementById(id);
      return el ? JSON.parse(el.textContent || '{}') : {};
    } catch (_) {
      return {};
    }
  }

  function normalizeLanguage(value) {
    var raw = String(value || '').trim();
    if (!raw || raw === 'auto') return raw || null;
    var lower = raw.toLowerCase();
    if (lower === 'zh-cn' || lower === 'zh-hans' || lower === 'zh_sg') return 'zh-CN';
    if (lower === 'zh-tw' || lower === 'zh-hant' || lower === 'zh-hk') return 'zh-TW';
    if (lower.indexOf('ja') === 0) return 'ja';
    if (lower.indexOf('fr') === 0) return 'fr';
    if (lower.indexOf('en') === 0) return 'en';
    return languages.indexOf(raw) >= 0 ? raw : null;
  }

  function resolveLanguage(configured) {
    if (window.YumePreferences) {
      var hasPreference = window.YumePreferences.hasLanguagePreference();
      var choice = window.YumePreferences.getLanguageChoice();
      if (hasPreference || !configured || configured === 'auto') {
        return normalizeLanguage(window.YumePreferences.resolveLanguage(choice)) || 'en';
      }
    }
    var saved = null;
    try { saved = normalizeLanguage(localStorage.getItem('yume-language')); } catch (_) {}
    if (saved && saved !== 'auto') return saved;
    if (configured && configured !== 'auto') return configured;
    return normalizeLanguage(navigator.language) || 'en';
  }

  function getLanguageChoice() {
    if (window.YumePreferences && window.YumePreferences.hasLanguagePreference()) {
      return normalizeLanguage(window.YumePreferences.getLanguageChoice()) || 'auto';
    }
    return configuredLanguage && configuredLanguage !== 'auto' ? configuredLanguage : 'auto';
  }

  function getAutoLanguageLabel() {
    if (window.YumePreferences && window.YumePreferences.getAutoLanguageLabel) {
      return window.YumePreferences.getAutoLanguageLabel();
    }
    return {
      fr: 'Automatique (Auto)',
      ja: '自動 (Auto)',
      'zh-CN': '自动 (Auto)',
      'zh-TW': '自動 (Auto)',
    }[activeLanguage] || 'Auto';
  }

  function t(key, vars) {
    var text = (dict[activeLanguage] && dict[activeLanguage][key]) || dict.en[key] || key;
    vars = vars || {};
    return text.replace(/\{(\w+)\}/g, function (_, name) {
      return Object.prototype.hasOwnProperty.call(vars, name) ? String(vars[name]) : '';
    });
  }

  function apply(root) {
    root = root || document;
    refreshBranding();
    document.documentElement.lang = activeLanguage;
    applyBackground();
    translate(root);
    renderFooter();
    updateDocumentTitle();
    startObserver();
  }

  function updateDocumentTitle() {
    if (!document.body) return;
    var key = document.body.getAttribute('data-i18n-page');
    if (!key) return;
    var siteName = branding.siteName || 'Yume AIO Backend';
    document.title = key === 'notFound.title' ? '404 — ' + siteName : siteName + ' — ' + t(key);
  }

  function refreshBranding() {
    branding = readJson('branding-data');
    configuredLanguage = normalizeLanguage(branding.language || 'auto') || 'auto';
    activeLanguage = resolveLanguage(configuredLanguage);
  }

  function applyBackground() {
    var url = String(branding.backgroundImageUrl || '').trim();
    var image = document.querySelector('.page-background-image');
    if (image) image.src = url || '/img/yume-background.webp';
    if (url) {
      document.documentElement.style.setProperty('--page-background-image', cssUrl(url));
    } else {
      document.documentElement.style.removeProperty('--page-background-image');
    }
  }

  function cssUrl(url) {
    return 'url("' + url.replace(/["\\\n\r]/g, function (ch) {
      return '\\' + ch;
    }) + '")';
  }

  function translate(root) {
    var direct = root.nodeType === 1 && root.hasAttribute && root.hasAttribute('data-i18n') ? [root] : [];
    var textNodes = root.querySelectorAll ? root.querySelectorAll('[data-i18n]') : [];
    for (var d = 0; d < direct.length; d++) {
      direct[d].textContent = t(direct[d].getAttribute('data-i18n'));
    }
    for (var i = 0; i < textNodes.length; i++) {
      textNodes[i].textContent = t(textNodes[i].getAttribute('data-i18n'));
    }

    translateAttr(root, 'data-i18n-placeholder', 'placeholder');
    translateAttr(root, 'data-i18n-title', 'title');
    translateAttr(root, 'data-i18n-aria-label', 'aria-label');
  }

  function renderFooter() {
    if (!document.querySelectorAll) return;
    var footers = document.querySelectorAll('[data-yume-footer], #footer.site-footer');
    if (!footers.length) return;
    var currentYear = new Date().getFullYear();
    var html = activeLanguage === 'zh-CN'
      ? '<div class="power">版权所有 &copy; ' + currentYear + ' <a href="https://www.yume.zone/">美国雨梦互联网有限公司</a> 保留所有权利。本页面为在中国大陆使用而设计。</div><div id="lrc"></div>'
      : '<div class="power">Copyright &copy; ' + currentYear + ' <a href="https://www.yume.zone/">Yume Internet LLC</a>. All Rights Reserved.</div><div id="lrc"></div>';
    for (var i = 0; i < footers.length; i++) {
      footers[i].innerHTML = html;
    }
  }

  function startObserver() {
    if (observerStarted || !window.MutationObserver || !document.body) return;
    observerStarted = true;
    var observer = new MutationObserver(function (mutations) {
      for (var i = 0; i < mutations.length; i++) {
        for (var j = 0; j < mutations[i].addedNodes.length; j++) {
          var node = mutations[i].addedNodes[j];
          if (node.nodeType === 1) translate(node);
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  function translateAttr(root, source, target) {
    if (root.nodeType === 1 && root.hasAttribute && root.hasAttribute(source)) {
      root.setAttribute(target, t(root.getAttribute(source)));
    }
    var nodes = root.querySelectorAll ? root.querySelectorAll('[' + source + ']') : [];
    for (var i = 0; i < nodes.length; i++) {
      nodes[i].setAttribute(target, t(nodes[i].getAttribute(source)));
    }
  }

  function setLanguage(language, persist) {
    var choice = language;
    if (persist && window.YumePreferences) {
      choice = window.YumePreferences.setLanguageChoice(language);
    }
    var normalized = normalizeLanguage(
      window.YumePreferences ? window.YumePreferences.resolveLanguage(choice) : choice
    ) || resolveLanguage('auto');
    var normalizedChoice = normalizeLanguage(choice) || 'auto';
    activeLanguage = normalized;
    if (persist && !window.YumePreferences) {
      try { localStorage.setItem('yume-language', normalizedChoice); } catch (_) {}
    }
    apply(document);
    window.dispatchEvent(new CustomEvent('yume-language-change', {
      detail: { language: normalized, choice: normalizedChoice },
    }));
  }

  function setSiteLanguage(language) {
    configuredLanguage = normalizeLanguage(language || 'auto') || 'auto';
    branding.language = configuredLanguage;
    activeLanguage = resolveLanguage(configuredLanguage);
    document.documentElement.lang = activeLanguage;
    translate(document);
    renderFooter();
    updateDocumentTitle();
    window.dispatchEvent(new CustomEvent('yume-language-change', {
      detail: { language: activeLanguage, choice: getLanguageChoice() },
    }));
  }

  function setBackground(url) {
    branding.backgroundImageUrl = url || '';
    applyBackground();
  }

  refreshBranding();

  window.addEventListener('yume-language-preference-change', function (event) {
    var choice = event && event.detail ? event.detail.choice : null;
    setLanguage(choice || 'auto', false);
  });

  window.YumeI18n = {
    t: t,
    apply: apply,
    setLanguage: setLanguage,
    setSiteLanguage: setSiteLanguage,
    setBackground: setBackground,
    getLanguage: function () { return activeLanguage; },
    getLanguageChoice: getLanguageChoice,
    getAutoLanguageLabel: getAutoLanguageLabel,
    labels: labels,
    languages: languageOptions.slice(),
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { apply(document); });
  } else {
    apply(document);
  }
})();
