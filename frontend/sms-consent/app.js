(function () {
    'use strict';

    var preferences = window.YumePreferences;
    var translations = {
        en: {
            brandName: 'Yume Official', siteNavigation: 'Site navigation', pricing: 'Pricing', terms: 'Terms', privacy: 'Privacy', backHome: 'Back to home',
            selectLanguage: 'Select language', selectTheme: 'Select theme', language: 'Language', theme: 'Theme', languageAuto: 'Auto', themeAuto: 'Auto', themeDark: 'Dark', themeLight: 'Light',
            eyebrow: 'SMS Notifications', pageTitle: 'Yume Official SMS Notifications', intro: 'Manage the SMS notifications you receive from Yume Official.', sectionKicker: 'SMS Notifications', notificationsTitle: 'SMS Notifications',
            description: 'Enter your mobile phone number to receive transactional and account-related SMS messages from Yume Official.', phoneLabel: 'Mobile phone number', phonePlaceholder: 'Phone Number',
            consentText: 'I agree to receive transactional and account-related SMS messages from Yume Official, including one-time verification codes, account status notifications, security alerts, account verification updates, and application status notifications.',
            disclosure: 'Message frequency varies based on account activity. Message and data rates may apply. Reply STOP to opt out or HELP for help. Consent to receive SMS messages is not a condition of purchase or use of Yume Official services.',
            privacyPolicy: 'Privacy Policy', termsOfService: 'Terms of Service', save: 'Save SMS Preferences', continueNote: 'You may continue using Yume Official without opting in to SMS notifications.',
            savedEnabled: 'Your SMS notification preference has been saved on this device.', savedDisabled: 'SMS notifications are turned off for this device.', phoneRequired: 'Enter your mobile phone number to save your SMS preference.'
        },
        'zh-cn': {
            brandName: 'Yume Official', siteNavigation: '站点导航', pricing: '价格', terms: '条款', privacy: '隐私政策', backHome: '返回首页', selectLanguage: '选择语言', selectTheme: '选择主题', language: '语言', theme: '主题', languageAuto: '自动', themeAuto: '自动', themeDark: '深色', themeLight: '浅色',
            eyebrow: '短信通知', pageTitle: 'Yume Official 短信通知', intro: '管理您从 Yume Official 接收的短信通知。', sectionKicker: '短信通知', notificationsTitle: '短信通知', description: '输入您的手机号码，以接收 Yume Official 发送的交易和账号相关短信。', phoneLabel: '手机号码', phonePlaceholder: '手机号码', consentText: '我同意接收 Yume Official 发送的交易和账号相关短信，包括一次性验证码、账号状态通知、安全提醒、账号验证更新和申请状态通知。', disclosure: '消息频率因账号活动而异。可能产生消息和数据费用。回复 STOP 退订或回复 HELP 获取帮助。是否同意接收短信不是购买或使用 Yume Official 服务的条件。', privacyPolicy: '隐私政策', termsOfService: '服务条款', save: '保存短信偏好', continueNote: '您可以继续使用 Yume Official，无需同意接收短信。', savedEnabled: '您的短信通知偏好已保存在此设备上。', savedDisabled: '此设备已关闭短信通知。', phoneRequired: '请输入手机号码以保存短信偏好。'
        },
        'zh-tw': {
            brandName: 'Yume Official', siteNavigation: '網站導覽', pricing: '價格', terms: '條款', privacy: '隱私政策', backHome: '返回首頁', selectLanguage: '選擇語言', selectTheme: '選擇主題', language: '語言', theme: '主題', languageAuto: '自動', themeAuto: '自動', themeDark: '深色', themeLight: '淺色',
            eyebrow: '簡訊通知', pageTitle: 'Yume Official 簡訊通知', intro: '管理您從 Yume Official 接收的簡訊通知。', sectionKicker: '簡訊通知', notificationsTitle: '簡訊通知', description: '輸入您的手機號碼，以接收 Yume Official 發送的交易和帳戶相關簡訊。', phoneLabel: '手機號碼', phonePlaceholder: '手機號碼', consentText: '我同意接收 Yume Official 發送的交易和帳戶相關簡訊，包括一次性驗證碼、帳戶狀態通知、安全提醒、帳戶驗證更新和申請狀態通知。', disclosure: '訊息頻率會依帳戶活動而異。可能產生訊息與資料費用。回覆 STOP 退訂或回覆 HELP 取得協助。同意接收簡訊不是購買或使用 Yume Official 服務的條件。', privacyPolicy: '隱私政策', termsOfService: '服務條款', save: '儲存簡訊偏好設定', continueNote: '您可以繼續使用 Yume Official，無須同意接收簡訊。', savedEnabled: '您的簡訊通知偏好設定已儲存在此裝置上。', savedDisabled: '此裝置已關閉簡訊通知。', phoneRequired: '請輸入手機號碼以儲存簡訊偏好設定。'
        },
        fr: {
            brandName: 'Yume Official', siteNavigation: 'Navigation du site', pricing: 'Tarifs', terms: 'Conditions', privacy: 'Confidentialité', backHome: "Retour à l’accueil", selectLanguage: 'Choisir la langue', selectTheme: 'Choisir le thème', language: 'Langue', theme: 'Thème', languageAuto: 'Automatique', themeAuto: 'Automatique', themeDark: 'Sombre', themeLight: 'Clair',
            eyebrow: 'Notifications SMS', pageTitle: 'Notifications SMS de Yume Official', intro: 'Gérez les notifications SMS que vous recevez de Yume Official.', sectionKicker: 'Notifications SMS', notificationsTitle: 'Notifications SMS', description: 'Saisissez votre numéro de téléphone mobile pour recevoir les SMS transactionnels et liés au compte de Yume Official.', phoneLabel: 'Numéro de téléphone mobile', phonePlaceholder: 'Numéro de téléphone', consentText: 'J’accepte de recevoir les SMS transactionnels et liés au compte de Yume Official, notamment les codes de vérification à usage unique, les notifications d’état du compte, les alertes de sécurité, les mises à jour de vérification du compte et les notifications d’état de demande.', disclosure: 'La fréquence varie selon l’activité du compte. Des frais de messages et de données peuvent s’appliquer. Répondez STOP pour vous désinscrire ou HELP pour obtenir de l’aide. Le consentement SMS n’est pas une condition d’achat ou d’utilisation des services de Yume Official.', privacyPolicy: 'Politique de confidentialité', termsOfService: 'Conditions de service', save: 'Enregistrer les préférences SMS', continueNote: 'Vous pouvez continuer à utiliser Yume Official sans accepter les notifications SMS.', savedEnabled: 'Votre préférence de notifications SMS a été enregistrée sur cet appareil.', savedDisabled: 'Les notifications SMS sont désactivées sur cet appareil.', phoneRequired: 'Saisissez votre numéro de téléphone mobile pour enregistrer votre préférence SMS.'
        },
        ja: {
            brandName: 'Yume Official', siteNavigation: 'サイトナビゲーション', pricing: '料金', terms: '利用規約', privacy: 'プライバシー', backHome: 'ホームに戻る', selectLanguage: '言語を選択', selectTheme: 'テーマを選択', language: '言語', theme: 'テーマ', languageAuto: '自動', themeAuto: '自動', themeDark: 'ダーク', themeLight: 'ライト',
            eyebrow: 'SMS 通知', pageTitle: 'Yume Official SMS 通知', intro: 'Yume Official から受け取る SMS 通知を管理します。', sectionKicker: 'SMS 通知', notificationsTitle: 'SMS 通知', description: '携帯電話番号を入力すると、Yume Official から取引およびアカウントに関する SMS を受信できます。', phoneLabel: '携帯電話番号', phonePlaceholder: '電話番号', consentText: 'Yume Official から取引およびアカウントに関する SMS を受信することに同意します。SMS には、一回限りの認証コード、アカウント状態の通知、セキュリティアラート、アカウント認証の更新、申請状況の通知などが含まれます。', disclosure: 'メッセージの頻度はアカウントの利用状況によって変わります。メッセージおよびデータ料金がかかる場合があります。停止するには STOP、ヘルプには HELP と返信してください。SMS への同意は Yume Official のサービスの購入または利用の条件ではありません。', privacyPolicy: 'プライバシーポリシー', termsOfService: '利用規約', save: 'SMS 通知の設定を保存', continueNote: 'SMS 通知に同意しなくても、Yume Official を引き続き利用できます。', savedEnabled: 'SMS 通知の設定をこのデバイスに保存しました。', savedDisabled: 'このデバイスでは SMS 通知をオフにしました。', phoneRequired: 'SMS 通知の設定を保存するには携帯電話番号を入力してください。'
        }
    };

    var currentChoice = preferences.getLanguageChoice();
    var currentLanguage = preferences.resolveLanguage(currentChoice);
    var currentTheme = preferences.getThemeChoice();

    function t(key) {
        return (translations[currentLanguage] && translations[currentLanguage][key]) || translations.en[key] || key;
    }

    function setTextContent() {
        document.querySelectorAll('[data-i18n]').forEach(function (element) {
            element.textContent = t(element.getAttribute('data-i18n'));
        });
        document.querySelectorAll('[data-i18n-placeholder]').forEach(function (element) {
            element.setAttribute('placeholder', t(element.getAttribute('data-i18n-placeholder')));
        });
        document.querySelectorAll('[data-i18n-aria-label]').forEach(function (element) {
            element.setAttribute('aria-label', t(element.getAttribute('data-i18n-aria-label')));
        });
        document.title = t('pageTitle');
    }

    function syncLanguageMenu() {
        document.querySelectorAll('[data-language-choice]').forEach(function (option) {
            option.setAttribute('aria-checked', String(option.getAttribute('data-language-choice') === currentChoice));
        });
    }

    function syncThemeMenu() {
        document.querySelectorAll('[data-theme-choice]').forEach(function (option) {
            option.setAttribute('aria-checked', String(option.getAttribute('data-theme-choice') === currentTheme));
        });
    }

    function closePreferenceMenus() {
        document.querySelectorAll('[data-preference-menu].is-open').forEach(function (menu) {
            menu.classList.remove('is-open');
            var trigger = menu.querySelector('[data-preference-trigger]');
            if (trigger) trigger.setAttribute('aria-expanded', 'false');
        });
    }

    function setupPreferenceMenus() {
        document.querySelectorAll('[data-preference-trigger]').forEach(function (trigger) {
            trigger.addEventListener('click', function () {
                var menu = trigger.closest('[data-preference-menu]');
                var shouldOpen = !menu.classList.contains('is-open');
                closePreferenceMenus();
                if (shouldOpen) {
                    menu.classList.add('is-open');
                    trigger.setAttribute('aria-expanded', 'true');
                }
            });
        });

        document.querySelectorAll('[data-language-choice]').forEach(function (option) {
            option.addEventListener('click', function () {
                currentChoice = preferences.setLanguageChoice(option.getAttribute('data-language-choice'));
                currentLanguage = preferences.resolveLanguage(currentChoice);
                document.documentElement.lang = currentLanguage;
                setTextContent();
                syncLanguageMenu();
                closePreferenceMenus();
            });
        });

        document.querySelectorAll('[data-theme-choice]').forEach(function (option) {
            option.addEventListener('click', function () {
                currentTheme = preferences.setThemeChoice(option.getAttribute('data-theme-choice'));
                preferences.applyTheme(currentTheme);
                syncThemeMenu();
                closePreferenceMenus();
            });
        });

        document.addEventListener('click', function (event) {
            if (!event.target.closest('[data-preference-menu]')) closePreferenceMenus();
        });
        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape') closePreferenceMenus();
        });
    }

    function setupPreferencesForm() {
        var form = document.getElementById('sms-preferences-form');
        var phone = document.getElementById('sms-phone');
        var consent = document.getElementById('sms-consent');
        var status = document.getElementById('preference-status');

        form.addEventListener('submit', function (event) {
            event.preventDefault();
            if (!form.checkValidity()) {
                form.reportValidity();
                status.hidden = false;
                status.dataset.status = 'error';
                status.textContent = t('phoneRequired');
                return;
            }

            try {
                window.localStorage.setItem('yume-sms-preference', consent.checked ? 'enabled' : 'disabled');
            } catch (error) {
                // The page remains usable when browser storage is unavailable.
            }

            status.hidden = false;
            status.dataset.status = 'success';
            status.textContent = t(consent.checked ? 'savedEnabled' : 'savedDisabled');
        });
    }

    preferences.applyTheme(currentTheme);
    document.documentElement.lang = currentLanguage;
    document.getElementById('current-year').textContent = String(new Date().getFullYear());
    setTextContent();
    syncLanguageMenu();
    syncThemeMenu();
    setupPreferenceMenus();
    setupPreferencesForm();
})();
