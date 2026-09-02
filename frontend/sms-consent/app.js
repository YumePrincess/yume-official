(function () {
    'use strict';

    var preferences = window.YumePreferences;
    var translations = {
        en: {
            brandName: 'Yume Official', siteNavigation: 'Site navigation', pricing: 'Pricing', terms: 'Terms', privacy: 'Privacy', privacyPolicy: 'Privacy Policy', termsOfService: 'Terms of Service', backHome: 'Back to home',
            selectLanguage: 'Select language', selectTheme: 'Select theme', language: 'Language', theme: 'Theme', languageAuto: 'Auto',
            themeAuto: 'Auto', themeDark: 'Dark', themeLight: 'Light', eyebrow: 'Twilio A2P 10DLC · Call to Action', titleLead: 'Yume Official',
            titleAccent: 'SMS Opt-In Flow', subtitle: 'A public, reviewable example of the campaign details and the consent experience.', demoOnly: 'Public representation of the SMS consent flow used in the Yume Official website and mobile application.',
            reviewableTitle: 'Built for a clear review', reviewableCopy: 'This public page makes the brand, message purpose, consent language, message frequency, rates notice, STOP/HELP instructions, and policy links visible in one place.',
            demoFlow: 'Consent flow', stepReview: 'Review details', stepConsent: 'Choose consent', stepComplete: 'See confirmation', sectionKicker: 'Campaign submission',
            detailsTitle: 'Campaign details', fieldCount: 'Review fields', campaignDescription: 'Campaign description', copy: 'Copy', senderNumber: 'Campaign sending number',
            replaceBeforeSubmit: 'Replace before submission', senderNumberNote: 'This public representation does not invent a sender number. Enter the actual Twilio number assigned to the Campaign before using this page as production evidence.',
            sampleMessages: 'Sample messages', sampleMessagesHint: '2–5 examples · brand and opt-out language included', sample1: 'Sample message #1', sample2: 'Sample message #2', sample3: 'Sample message #3', sample4: 'Sample message #4', sample5: 'Sample message #5',
            contentFlags: 'Select any content your messages may contain', embeddedLinks: 'Embedded links', embeddedLinksNote: 'Sample #3 contains the public Yume URL.', phoneNumbers: 'Phone numbers', phoneNumbersNote: 'No phone number is included in the sample messages.',
            directLending: 'Content related to direct lending or other loan arrangement', ageGated: 'Age-gated content as defined by carrier and CTIA guidelines', ctiaGuidelines: 'CTIA guidelines',
            privacyLink: "Provide link to the Campaign's privacy policy", smsPrivacyNote: 'Mobile information and SMS consent information will not be shared with third parties or affiliates for marketing or promotional purposes.',
            termsLink: "Provide link to Campaign's terms of service", termsLinkNote: 'The SMS disclosures and opt-out instructions are also available in the public terms.', messageFlow: 'How do end-users consent to receive messages?',
            optInKeywords: 'List all opt-in keywords', optInKeywordsNote: 'No text-to-join flow is used on this public consent page.', optInMessage: 'What is the opt-in message?', optOutKeywords: 'List all opt-out keywords', optOutMessage: 'What is the opt-out message?', helpKeywords: 'List all help keywords', helpMessage: 'What is the help message?',
            publicExample: 'Public opt-in example or screenshot', publicExampleNote: 'This is the canonical public page for the website CTA and the shared consent pattern.', websiteMethod: 'Website', websiteMethodCopy: 'Users provide or add a mobile phone number to their Yume Official account and see the separate, unchecked consent checkbox beside the CTA.', mobileAppMethod: 'Mobile application', mobileAppMethodCopy: 'The mobile application uses the same separate, unchecked consent step when a user provides or adds a mobile phone number to the account.',
            ctaTitle: 'Try the public CTA', optional: 'Optional', ctaIntro: 'The consent request is explicit and optional. The primary action remains available when SMS consent is not selected.', mobileNumber: 'Mobile phone number', phonePlaceholder: '[客服电话已脱敏]', phoneNote: 'Used only to illustrate the field in this public consent flow. No number is stored or submitted.',
            consentLabel: 'Yes, send me Yume Official account and service updates by text.', consentDisclosure: 'By checking this box, you agree to receive transactional and account-related SMS messages from Yume Official, including one-time verification codes, account status notifications, security alerts, account verification updates, and account application status notifications. Message frequency varies based on account activity. Message and data rates may apply. Reply STOP to opt out or HELP for help. Consent to receive SMS messages is not a condition of purchase or use of our services. See our Terms of Service and Privacy Policy.',
            continue: 'Continue', continueWithoutSms: 'Continue without SMS', readyStatus: 'Ready for your choice. This page will not send a message.', demoOptedIn: 'Flow complete: SMS consent was selected. No message was sent.', demoWithoutSms: 'Flow complete: you continued without SMS consent.', phoneRequired: 'Enter a phone number to continue with SMS consent, or choose “Continue without SMS”.',
            finalCheckKicker: 'Before you submit', registrationTitle: 'Registration check', confirmation: 'I confirm the information entered here is ready to submit for review.', submitRegistration: 'Submit registration', checkErrors: 'Check for errors', registrationReady: 'This public page is informational. No registration will be submitted.',
            senderMissing: 'Add the actual Twilio Campaign sending number before submission.', confirmationMissing: 'Confirm that the Campaign information is ready before submission.', errorsFound: 'Review needed: ', readyToSubmit: 'The visible fields are complete for this public representation. No registration was submitted.',
            sideKicker: 'CTA essentials', principlesTitle: 'Make the choice easy to understand.', principleBrand: 'The brand is named in every sample message.', principlePurpose: 'The message purpose and frequency are stated before consent.', principleRates: 'Message and data rates may apply is visible.', principleStopHelp: 'STOP and HELP instructions are adjacent to the CTA.', principlePolicies: 'Privacy and Terms links are public and easy to reach.', sideNote: 'Use your actual sender number, real consent implementation, and production policy URLs when preparing the final Campaign submission.', copied: 'Copied', copyFailed: 'Copy unavailable'
        },
        'zh-cn': {
            brandName: 'Yume Official', siteNavigation: '站点导航', pricing: '价格', terms: '条款', privacy: '隐私政策', backHome: '返回首页', selectLanguage: '选择语言', selectTheme: '选择主题', language: '语言', theme: '主题', languageAuto: '自动', themeAuto: '自动', themeDark: '深色', themeLight: '浅色',
            eyebrow: 'Twilio A2P 10DLC · 行动号召 CTA', titleLead: 'Yume Official', titleAccent: '短信 Campaign', subtitle: '公开、可审核的 Campaign 资料和短信同意流程示例。', demoOnly: '仅供演示 · 不会发送短信', reviewableTitle: '让审核一目了然', reviewableCopy: '此静态页面集中展示品牌、消息用途、同意文案、发送频率、资费提示、STOP/HELP 指令以及政策链接。', demoFlow: '演示流程', stepReview: '查看资料', stepConsent: '选择同意方式', stepComplete: '查看确认结果', sectionKicker: 'Campaign 提交', detailsTitle: 'Campaign 详细资料', fieldCount: '审核字段', campaignDescription: 'Campaign 描述', copy: '复制', senderNumber: 'Campaign 发送号码', replaceBeforeSubmit: '提交前替换', senderNumberNote: '演示页不会虚构发送号码。将 Campaign 实际分配的 Twilio 号码填入后，再作为生产审核凭证使用。', sampleMessages: '样例短信', sampleMessagesHint: '2–5 条示例 · 每条包含品牌和退订说明', sample1: '样例短信 #1', sample2: '样例短信 #2', sample3: '样例短信 #3', sample4: '样例短信 #4', sample5: '样例短信 #5', contentFlags: '请选择消息可能包含的内容', embeddedLinks: '内嵌链接', embeddedLinksNote: '样例 #3 包含 Yume 公共网址。', phoneNumbers: '电话号码', phoneNumbersNote: '样例短信中不包含电话号码。', directLending: '与直接贷款或其他贷款安排有关的内容', ageGated: '运营商及 CTIA 指南定义的年龄限制内容', ctiaGuidelines: 'CTIA 指南', privacyLink: 'Campaign 隐私政策链接', smsPrivacyNote: '手机信息及 SMS 同意信息不会为营销或推广目的与第三方或关联方共享。', termsLink: 'Campaign 服务条款链接', termsLinkNote: '短信披露和退订说明也已包含在公开条款中。', messageFlow: '最终用户如何同意接收消息？', optInKeywords: '列出所有加入关键词', optInKeywordsNote: '本演示不使用短信关键词加入流程。', optInMessage: '加入后的提示消息', optOutKeywords: '列出所有退订关键词', optOutMessage: '退订后的提示消息', helpKeywords: '列出所有帮助关键词', helpMessage: '帮助提示消息', ctaTitle: '体验公开 CTA', optional: '可选', ctaIntro: '短信同意请求明确且可选。未选择 SMS 同意时，主要操作仍然可继续。', mobileNumber: '手机号码', phonePlaceholder: '[客服电话已脱敏]', phoneNote: '仅用于展示静态演示中的输入框，不会保存或提交号码。', consentLabel: '是的，通过短信向我发送 Yume Official 账户和服务更新。', consentDisclosure: '勾选此框即表示同意接收 Yume Official 关于账户和服务更新的周期性短信。发送频率可能不同。可能产生消息和数据费用。是否同意接收短信不是购买或使用服务的条件。回复 STOP 退订，回复 HELP 获取帮助。', continue: '继续', continueWithoutSms: '不订阅短信并继续', readyStatus: '请做出选择。本页面不会发送短信。', demoOptedIn: '演示完成：已选择短信同意。没有发送短信。', demoWithoutSms: '演示完成：已选择不订阅短信并继续。', phoneRequired: '请填写演示用手机号码以继续订阅短信，或选择“不订阅短信并继续”。', finalCheckKicker: '提交之前', registrationTitle: '注册检查', confirmation: '我确认此处填写的信息已准备好提交审核。', submitRegistration: '提交注册', checkErrors: '检查错误', registrationReady: '这是一个静态演示，不会提交注册。', senderMissing: '提交前请填入实际的 Twilio Campaign 发送号码。', confirmationMissing: '提交前请确认 Campaign 信息已经准备好。', errorsFound: '需要检查：', readyToSubmit: '此演示所需的可见字段已完成，没有提交任何注册。', sideKicker: 'CTA 要点', principlesTitle: '让用户轻松理解自己的选择。', principleBrand: '每条样例短信都明确写出品牌名称。', principlePurpose: '在取得同意前说明消息用途和发送频率。', principleRates: '清晰展示可能产生消息和数据费用。', principleStopHelp: 'CTA 附近同时提供 STOP 和 HELP 说明。', principlePolicies: '隐私政策和条款链接公开且易于访问。', sideNote: '准备最终 Campaign 提交时，请使用真实发送号码、真实同意实现和生产环境政策 URL。', copied: '已复制', copyFailed: '无法复制'
        },
        'zh-tw': {
            brandName: 'Yume Official', siteNavigation: '網站導覽', pricing: '價格', terms: '條款', privacy: '隱私政策', backHome: '返回首頁', selectLanguage: '選擇語言', selectTheme: '選擇主題', language: '語言', theme: '主題', languageAuto: '自動', themeAuto: '自動', themeDark: '深色', themeLight: '淺色', eyebrow: 'Twilio A2P 10DLC · 行動號召 CTA', titleLead: 'Yume Official', titleAccent: '簡訊 Campaign', subtitle: '公開、可供審核的 Campaign 資料與簡訊同意流程範例。', demoOnly: '僅供示範 · 不會傳送簡訊', reviewableTitle: '讓審核一目了然', reviewableCopy: '此靜態頁面集中展示品牌、訊息用途、同意文案、傳送頻率、資費提示、STOP/HELP 指令與政策連結。', demoFlow: '示範流程', stepReview: '檢視資料', stepConsent: '選擇同意方式', stepComplete: '查看確認結果', sectionKicker: 'Campaign 提交', detailsTitle: 'Campaign 詳細資料', fieldCount: '審核欄位', campaignDescription: 'Campaign 描述', copy: '複製', senderNumber: 'Campaign 傳送號碼', replaceBeforeSubmit: '提交前替換', senderNumberNote: '示範頁不會虛構傳送號碼。請填入 Campaign 實際分配的 Twilio 號碼後，再作為正式審核憑證使用。', sampleMessages: '範例簡訊', sampleMessagesHint: '2–5 則範例 · 每則包含品牌與退訂說明', sample1: '範例簡訊 #1', sample2: '範例簡訊 #2', sample3: '範例簡訊 #3', sample4: '範例簡訊 #4', sample5: '範例簡訊 #5', contentFlags: '請選擇訊息可能包含的內容', embeddedLinks: '內嵌連結', embeddedLinksNote: '範例 #3 包含 Yume 公開網址。', phoneNumbers: '電話號碼', phoneNumbersNote: '範例簡訊中不包含電話號碼。', directLending: '與直接貸款或其他貸款安排有關的內容', ageGated: '電信商及 CTIA 指南定義的年齡限制內容', ctiaGuidelines: 'CTIA 指南', privacyLink: 'Campaign 隱私政策連結', smsPrivacyNote: '手機資訊及 SMS 同意資訊不會為行銷或推廣目的與第三方或關係企業分享。', termsLink: 'Campaign 服務條款連結', termsLinkNote: '簡訊揭露與退訂說明也已包含在公開條款中。', messageFlow: '終端使用者如何同意接收訊息？', optInKeywords: '列出所有加入關鍵字', optInKeywordsNote: '本示範不使用簡訊關鍵字加入流程。', optInMessage: '加入後的提示訊息', optOutKeywords: '列出所有退訂關鍵字', optOutMessage: '退訂後的提示訊息', helpKeywords: '列出所有說明關鍵字', helpMessage: '說明提示訊息', ctaTitle: '體驗公開 CTA', optional: '可選', ctaIntro: '簡訊同意請求清楚且可選。未選擇 SMS 同意時，主要操作仍可繼續。', mobileNumber: '手機號碼', phonePlaceholder: '[客服电话已脱敏]', phoneNote: '僅用於展示靜態示範中的輸入框，不會儲存或提交號碼。', consentLabel: '是的，透過簡訊傳送 Yume Official 帳戶與服務更新給我。', consentDisclosure: '勾選此框即表示同意接收 Yume Official 關於帳戶與服務更新的週期性簡訊。傳送頻率可能不同。可能產生訊息與數據費用。同意接收簡訊不是購買或使用服務的條件。回覆 STOP 退訂，回覆 HELP 取得協助。', continue: '繼續', continueWithoutSms: '不訂閱簡訊並繼續', readyStatus: '請做出選擇。本頁面不會傳送簡訊。', demoOptedIn: '示範完成：已選擇簡訊同意。沒有傳送簡訊。', demoWithoutSms: '示範完成：已選擇不訂閱簡訊並繼續。', phoneRequired: '請填寫示範用手機號碼以繼續訂閱簡訊，或選擇「不訂閱簡訊並繼續」。', finalCheckKicker: '提交前', registrationTitle: '註冊檢查', confirmation: '我確認此處填寫的資訊已準備好提交審核。', submitRegistration: '提交註冊', checkErrors: '檢查錯誤', registrationReady: '這是一個靜態示範，不會提交註冊。', senderMissing: '提交前請填入實際的 Twilio Campaign 傳送號碼。', confirmationMissing: '提交前請確認 Campaign 資訊已準備好。', errorsFound: '需要檢查：', readyToSubmit: '此示範所需的可見欄位已完成，沒有提交任何註冊。', sideKicker: 'CTA 要點', principlesTitle: '讓使用者輕鬆理解自己的選擇。', principleBrand: '每則範例簡訊都明確寫出品牌名稱。', principlePurpose: '在取得同意前說明訊息用途與傳送頻率。', principleRates: '清楚展示可能產生訊息與數據費用。', principleStopHelp: 'CTA 附近同時提供 STOP 與 HELP 說明。', principlePolicies: '隱私政策與條款連結公開且容易存取。', sideNote: '準備最終 Campaign 提交時，請使用真實傳送號碼、真實同意實作與正式環境政策 URL。', copied: '已複製', copyFailed: '無法複製'
        },
        fr: {
            brandName: 'Yume Official', siteNavigation: 'Navigation du site', pricing: 'Tarifs', terms: 'Conditions', privacy: 'Confidentialité', backHome: "Retour à l’accueil", selectLanguage: 'Choisir la langue', selectTheme: 'Choisir le thème', language: 'Langue', theme: 'Thème', languageAuto: 'Automatique', themeAuto: 'Automatique', themeDark: 'Sombre', themeLight: 'Clair', eyebrow: 'Twilio A2P 10DLC · Appel à l’action', titleLead: 'Yume Official', titleAccent: 'Campagne SMS', subtitle: 'Un exemple public et vérifiable des informations de campagne et du parcours de consentement.', demoOnly: 'Démonstration · aucun SMS envoyé', reviewableTitle: 'Conçu pour un contrôle clair', reviewableCopy: 'Cette page statique rassemble la marque, la finalité des messages, le consentement, la fréquence, les tarifs, les instructions STOP/HELP et les liens des politiques.', demoFlow: 'Parcours de démonstration', stepReview: 'Vérifier les détails', stepConsent: 'Choisir le consentement', stepComplete: 'Voir la confirmation', sectionKicker: 'Soumission de campagne', detailsTitle: 'Détails de la campagne', fieldCount: 'Champs de contrôle', campaignDescription: 'Description de la campagne', copy: 'Copier', senderNumber: "Numéro d’envoi de la campagne", replaceBeforeSubmit: 'À remplacer avant l’envoi', senderNumberNote: 'Cette démonstration n’invente pas de numéro. Saisissez le numéro Twilio réel attribué à la campagne avant toute utilisation en production.', sampleMessages: 'Exemples de messages', sampleMessagesHint: '2 à 5 exemples · marque et désinscription incluses', sample1: 'Exemple de message n°1', sample2: 'Exemple de message n°2', sample3: 'Exemple de message n°3', sample4: 'Exemple de message n°4', sample5: 'Exemple de message n°5', contentFlags: 'Sélectionnez les contenus possibles', embeddedLinks: 'Liens intégrés', embeddedLinksNote: "L’exemple n°3 contient l’URL publique de Yume.", phoneNumbers: 'Numéros de téléphone', phoneNumbersNote: 'Aucun numéro de téléphone dans les exemples.', directLending: 'Contenu lié au prêt direct ou à un autre arrangement de prêt', ageGated: 'Contenu soumis à une limite d’âge selon les directives des opérateurs et de la CTIA', ctiaGuidelines: 'Directives CTIA', privacyLink: 'Lien vers la politique de confidentialité de la campagne', smsPrivacyNote: 'Les informations mobiles et le consentement SMS ne seront pas partagés avec des tiers ou des affiliés à des fins marketing ou promotionnelles.', termsLink: 'Lien vers les conditions de service de la campagne', termsLinkNote: 'Les informations SMS et les instructions de désinscription figurent aussi dans les conditions publiques.', messageFlow: 'Comment les utilisateurs consentent-ils à recevoir les messages ?', optInKeywords: 'Mots-clés d’inscription', optInKeywordsNote: 'Cette démonstration n’utilise pas d’inscription par SMS.', optInMessage: 'Message d’inscription', optOutKeywords: 'Mots-clés de désinscription', optOutMessage: 'Message de désinscription', helpKeywords: 'Mots-clés d’aide', helpMessage: 'Message d’aide', ctaTitle: 'Tester l’appel à l’action public', optional: 'Facultatif', ctaIntro: 'La demande de consentement est explicite et facultative. L’action principale reste disponible sans consentement SMS.', mobileNumber: 'Numéro de téléphone mobile', phonePlaceholder: '[客服电话已脱敏]', phoneNote: 'Utilisé uniquement pour illustrer ce champ. Aucun numéro n’est enregistré ni envoyé.', consentLabel: 'Oui, envoyez-moi les mises à jour de compte et de service de Yume Official par SMS.', consentDisclosure: 'En cochant cette case, j’accepte de recevoir des SMS récurrents de Yume Official concernant mon compte et les mises à jour de service. La fréquence varie. Des frais de messages et de données peuvent s’appliquer. Le consentement n’est pas une condition d’achat ou d’utilisation. Répondez STOP pour vous désinscrire et HELP pour obtenir de l’aide.', continue: 'Continuer', continueWithoutSms: 'Continuer sans SMS', readyStatus: 'Faites votre choix. Cette page n’enverra aucun message.', demoOptedIn: 'Démonstration terminée : consentement SMS sélectionné. Aucun message envoyé.', demoWithoutSms: 'Démonstration terminée : vous avez continué sans consentement SMS.', phoneRequired: 'Saisissez un numéro de démonstration pour continuer avec le consentement SMS, ou choisissez « Continuer sans SMS ».', finalCheckKicker: 'Avant l’envoi', registrationTitle: 'Vérification de l’inscription', confirmation: 'Je confirme que les informations sont prêtes à être soumises pour examen.', submitRegistration: 'Soumettre l’inscription', checkErrors: 'Vérifier les erreurs', registrationReady: 'Ceci est une démonstration statique. Aucune inscription ne sera envoyée.', senderMissing: 'Ajoutez le numéro Twilio réel de la campagne avant l’envoi.', confirmationMissing: 'Confirmez que les informations sont prêtes avant l’envoi.', errorsFound: 'À vérifier : ', readyToSubmit: 'Les champs visibles sont complets pour cette démonstration. Aucune inscription n’a été envoyée.', sideKicker: 'Essentiels CTA', principlesTitle: 'Rendez le choix facile à comprendre.', principleBrand: 'La marque figure dans chaque exemple.', principlePurpose: 'La finalité et la fréquence sont indiquées avant le consentement.', principleRates: 'La mention des frais de messages et de données est visible.', principleStopHelp: 'Les instructions STOP et HELP sont proches de l’appel à l’action.', principlePolicies: 'Les liens Confidentialité et Conditions sont publics et accessibles.', sideNote: 'Pour la soumission finale, utilisez le vrai numéro d’envoi, le vrai mécanisme de consentement et les URL de production.', copied: 'Copié', copyFailed: 'Copie indisponible'
        },
        ja: {
            brandName: 'Yume Official', siteNavigation: 'サイトナビゲーション', pricing: '料金', terms: '利用規約', privacy: 'プライバシー', backHome: 'ホームに戻る', selectLanguage: '言語を選択', selectTheme: 'テーマを選択', language: '言語', theme: 'テーマ', languageAuto: '自動', themeAuto: '自動', themeDark: 'ダーク', themeLight: 'ライト', eyebrow: 'Twilio A2P 10DLC · CTA', titleLead: 'Yume Official', titleAccent: 'SMS キャンペーン', subtitle: 'キャンペーン情報と同意フローを公開・確認できるサンプルです。', demoOnly: 'デモのみ · SMS は送信されません', reviewableTitle: '確認しやすい構成', reviewableCopy: 'ブランド、メッセージの目的、同意文、頻度、料金表示、STOP/HELP の案内、ポリシーへのリンクを一か所で確認できます。', demoFlow: 'デモの流れ', stepReview: '詳細を確認', stepConsent: '同意を選択', stepComplete: '確認結果を見る', sectionKicker: 'Campaign の登録', detailsTitle: 'Campaign の詳細', fieldCount: '確認項目', campaignDescription: 'Campaign の説明', copy: 'コピー', senderNumber: 'Campaign の送信番号', replaceBeforeSubmit: '送信前に置き換え', senderNumberNote: 'このデモでは送信番号を作成していません。本番で使用する前に、Campaign に割り当てられた実際の Twilio 番号を入力してください。', sampleMessages: 'サンプルメッセージ', sampleMessagesHint: '2～5 件 · ブランド名とオプトアウト案内を含む', sample1: 'サンプルメッセージ #1', sample2: 'サンプルメッセージ #2', sample3: 'サンプルメッセージ #3', sample4: 'サンプルメッセージ #4', sample5: 'サンプルメッセージ #5', contentFlags: 'メッセージに含まれる可能性のある内容', embeddedLinks: '埋め込みリンク', embeddedLinksNote: 'サンプル #3 に Yume の公開 URL が含まれます。', phoneNumbers: '電話番号', phoneNumbersNote: 'サンプルには電話番号を含めていません。', directLending: '直接貸付などのローン契約に関する内容', ageGated: '通信事業者および CTIA ガイドラインで定義される年齢制限コンテンツ', ctiaGuidelines: 'CTIA ガイドライン', privacyLink: 'Campaign のプライバシーポリシーへのリンク', smsPrivacyNote: '携帯情報および SMS の同意情報を、マーケティングまたはプロモーション目的で第三者や関連会社と共有することはありません。', termsLink: 'Campaign の利用規約へのリンク', termsLinkNote: 'SMS に関する開示とオプトアウト方法は公開規約にも記載されています。', messageFlow: 'エンドユーザーはどのようにメッセージ受信に同意しますか？', optInKeywords: 'オプトインキーワード', optInKeywordsNote: 'このデモでは SMS キーワードによる登録を使用しません。', optInMessage: 'オプトインメッセージ', optOutKeywords: 'オプトアウトキーワード', optOutMessage: 'オプトアウトメッセージ', helpKeywords: 'ヘルプキーワード', helpMessage: 'ヘルプメッセージ', ctaTitle: '公開 CTA を試す', optional: '任意', ctaIntro: '同意の依頼は明確かつ任意です。SMS に同意しなくても主要操作を続けられます。', mobileNumber: '携帯電話番号', phonePlaceholder: '[客服电话已脱敏]', phoneNote: '静的デモで入力欄を示すためだけに使用します。番号は保存・送信されません。', consentLabel: 'Yume Official のアカウントとサービス更新を SMS で受け取る。', consentDisclosure: 'このボックスを選択すると、アカウントおよびサービス更新に関する Yume Official の定期 SMS に同意したことになります。頻度は変動します。メッセージおよびデータ料金がかかる場合があります。SMS への同意は購入またはサービス利用の条件ではありません。停止するには STOP、ヘルプには HELP と返信してください。', continue: '続ける', continueWithoutSms: 'SMS なしで続ける', readyStatus: '選択してください。このページから SMS は送信されません。', demoOptedIn: 'デモ完了：SMS への同意を選択しました。メッセージは送信されていません。', demoWithoutSms: 'デモ完了：SMS に同意せず続行しました。', phoneRequired: 'SMS 同意で続けるにはデモ用の電話番号を入力するか、「SMS なしで続ける」を選択してください。', finalCheckKicker: '送信前に', registrationTitle: '登録内容の確認', confirmation: '入力内容を確認し、審査に提出できる状態であることを確認します。', submitRegistration: '登録を送信', checkErrors: 'エラーを確認', registrationReady: '静的デモです。登録は送信されません。', senderMissing: '送信前に実際の Twilio Campaign 送信番号を追加してください。', confirmationMissing: '送信前に Campaign 情報の準備ができていることを確認してください。', errorsFound: '確認が必要です：', readyToSubmit: 'このデモに必要な表示項目は完了しています。登録は送信されていません。', sideKicker: 'CTA の要点', principlesTitle: '選択内容をわかりやすくする。', principleBrand: 'すべてのサンプルにブランド名を記載しています。', principlePurpose: '同意前に目的と頻度を明示しています。', principleRates: 'メッセージ・データ料金の可能性を表示しています。', principleStopHelp: 'CTA の近くに STOP と HELP の案内があります。', principlePolicies: 'プライバシーと利用規約に公開リンクしています。', sideNote: '最終 Campaign の提出には、実際の送信番号、実際の同意処理、本番ポリシー URL を使用してください。', copied: 'コピーしました', copyFailed: 'コピーできません'
        }
    };

    var complianceTranslations = {
        en: {
            titleAccent: 'SMS Opt-In Flow', demoOnly: 'Public representation of the SMS consent flow used in the Yume Official website and mobile application.', reviewableCopy: 'This public page makes the brand, message purpose, consent language, message frequency, rates notice, STOP/HELP instructions, and policy links visible in one place.', demoFlow: 'Consent flow', senderNumberNote: 'This public representation does not invent a sender number. Enter the actual Twilio number assigned to the Campaign before using this page as production evidence.', optInKeywordsNote: 'No text-to-join flow is used on this public consent page.', phoneNote: 'Used only to illustrate the field in this public consent flow. No number is stored or submitted.', demoOptedIn: 'Flow complete: SMS consent was selected. No message was sent.', demoWithoutSms: 'Flow complete: you continued without SMS consent.', phoneRequired: 'Enter a phone number to continue with SMS consent, or choose “Continue without SMS”.', registrationReady: 'This public page is informational. No registration will be submitted.', readyToSubmit: 'The visible fields are complete for this public representation. No registration was submitted.',
            privacyPolicy: 'Privacy Policy', termsOfService: 'Terms of Service',
            publicExample: 'Public opt-in example or screenshot', publicExampleNote: 'This is the canonical public page for the website CTA and the shared consent pattern.',
            websiteMethod: 'Website', websiteMethodCopy: 'Users provide or add a mobile phone number to their Yume Official account and see the separate, unchecked consent checkbox beside the CTA.',
            mobileAppMethod: 'Mobile application', mobileAppMethodCopy: 'The mobile application uses the same separate, unchecked consent step when a user provides or adds a mobile phone number to the account.',
            consentDisclosure: 'By checking this box, you agree to receive transactional and account-related SMS messages from Yume Official, including one-time verification codes, account status notifications, security alerts, account verification updates, and account application status notifications. Message frequency varies based on account activity. Message and data rates may apply. Reply STOP to opt out or HELP for help. Consent to receive SMS messages is not a condition of purchase or use of our services. See our Terms of Service and Privacy Policy.'
        },
        'zh-cn': {
            titleAccent: '短信同意流程', demoOnly: 'Yume Official 网站和移动应用所使用的 SMS 同意流程公开展示。', reviewableCopy: '此公开页面集中展示品牌、消息用途、同意文案、消息频率、资费提示、STOP/HELP 指令以及政策链接。', demoFlow: '同意流程', senderNumberNote: '此公开页面不会虚构发送号码。将 Campaign 实际分配的 Twilio 号码填入后，再作为生产审核凭证使用。', optInKeywordsNote: '此公开同意页面不使用短信关键词加入流程。', phoneNote: '仅用于展示此公开同意流程中的输入框，不会保存或提交号码。', demoOptedIn: '流程完成：已选择 SMS 同意。没有发送消息。', demoWithoutSms: '流程完成：已选择不接收 SMS 并继续。', phoneRequired: '请填写手机号码以继续 SMS 同意，或选择“不订阅短信并继续”。', registrationReady: '此公开页面仅供查看。不会提交注册。', readyToSubmit: '此公开展示所需的可见字段已完成。没有提交注册。',
            privacyPolicy: '隐私政策', termsOfService: '服务条款', publicExample: '公开加入示例或截图', publicExampleNote: '这是网站 CTA 和共享同意模式的规范公开页面。', websiteMethod: '网站', websiteMethodCopy: '用户向 Yume Official 账号提供或添加手机号码后，会在 CTA 旁看到单独且默认未勾选的同意框。', mobileAppMethod: '移动应用', mobileAppMethodCopy: '移动应用在用户提供或添加手机号码时使用同样单独、默认未勾选的同意步骤。', consentDisclosure: '勾选此框即表示您同意接收 Yume Official 发送的交易和账号相关短信，包括一次性验证码、账号状态通知、安全提醒、账号验证更新和账号申请状态通知。消息频率因账号活动而异。可能产生消息和数据费用。回复 STOP 退订或回复 HELP 获取帮助。是否同意接收短信不是购买或使用我们服务的条件。请参阅我们的服务条款和隐私政策。'
        },
        'zh-tw': {
            titleAccent: '簡訊同意流程', demoOnly: 'Yume Official 網站與行動應用程式所使用的 SMS 同意流程公開展示。', reviewableCopy: '此公開頁面集中展示品牌、訊息用途、同意文案、訊息頻率、資費提示、STOP/HELP 指令與政策連結。', demoFlow: '同意流程', senderNumberNote: '此公開頁面不會虛構傳送號碼。請填入 Campaign 實際分配的 Twilio 號碼後，再作為正式審核憑證使用。', optInKeywordsNote: '此公開同意頁面不使用簡訊關鍵字加入流程。', phoneNote: '僅用於展示此公開同意流程中的輸入框，不會儲存或提交號碼。', demoOptedIn: '流程完成：已選擇 SMS 同意。沒有傳送訊息。', demoWithoutSms: '流程完成：已選擇不接收 SMS 並繼續。', phoneRequired: '請填寫手機號碼以繼續 SMS 同意，或選擇「不訂閱簡訊並繼續」。', registrationReady: '此公開頁面僅供查看。不會提交註冊。', readyToSubmit: '此公開展示所需的可見欄位已完成。沒有提交註冊。',
            privacyPolicy: '隱私政策', termsOfService: '服務條款', publicExample: '公開加入範例或截圖', publicExampleNote: '這是網站 CTA 與共用同意模式的正式公開頁面。', websiteMethod: '網站', websiteMethodCopy: '使用者向 Yume Official 帳戶提供或新增手機號碼後，會在 CTA 旁看到獨立且預設未勾選的同意框。', mobileAppMethod: '行動應用程式', mobileAppMethodCopy: '行動應用程式在使用者提供或新增手機號碼時，使用相同獨立且預設未勾選的同意步驟。', consentDisclosure: '勾選此框即表示您同意接收 Yume Official 發送的交易和帳戶相關簡訊，包括一次性驗證碼、帳戶狀態通知、安全提醒、帳戶驗證更新和帳戶申請狀態通知。訊息頻率會依帳戶活動而異。可能產生訊息與資料費用。回覆 STOP 退訂或回覆 HELP 取得協助。是否同意接收簡訊不是購買或使用我們服務的條件。請參閱我們的服務條款和隱私政策。'
        },
        fr: {
            titleAccent: 'Parcours d’opt-in SMS', demoOnly: 'Représentation publique du parcours de consentement SMS utilisé sur le site web et dans l’application mobile de Yume Official.', reviewableCopy: 'Cette page publique rassemble la marque, la finalité des messages, le consentement, la fréquence, les tarifs, les instructions STOP/HELP et les liens des politiques.', demoFlow: 'Parcours de consentement', senderNumberNote: 'Cette représentation publique n’invente pas de numéro. Saisissez le numéro Twilio réel attribué à la campagne avant toute utilisation en production.', optInKeywordsNote: 'Cette page publique de consentement n’utilise pas d’inscription par mot-clé SMS.', phoneNote: 'Utilisé uniquement pour illustrer ce parcours public. Aucun numéro n’est enregistré ni envoyé.', demoOptedIn: 'Parcours terminé : le consentement SMS a été sélectionné. Aucun SMS n’a été envoyé.', demoWithoutSms: 'Parcours terminé : vous avez continué sans consentement SMS.', phoneRequired: 'Saisissez un numéro pour continuer avec le consentement SMS ou choisissez « Continuer sans SMS ».', registrationReady: 'Cette page publique est informative. Aucune inscription ne sera envoyée.', readyToSubmit: 'Les champs visibles de cette représentation publique sont complets. Aucune inscription n’a été envoyée.',
            privacyPolicy: 'Politique de confidentialité', termsOfService: 'Conditions de service', publicExample: 'Exemple public d’opt-in ou capture d’écran', publicExampleNote: 'Il s’agit de la page publique de référence pour le CTA web et le parcours de consentement partagé.', websiteMethod: 'Site web', websiteMethodCopy: 'Les utilisateurs ajoutent leur numéro mobile à leur compte Yume Official et voient la case de consentement séparée, décochée par défaut, à côté du CTA.', mobileAppMethod: 'Application mobile', mobileAppMethodCopy: 'L’application mobile utilise la même étape de consentement séparée et décochée par défaut lorsque l’utilisateur ajoute son numéro mobile.', consentDisclosure: 'En cochant cette case, vous acceptez de recevoir des SMS transactionnels et liés au compte de Yume Official, notamment des codes de vérification à usage unique, des notifications d’état du compte, des alertes de sécurité, des mises à jour de vérification et des notifications d’état de demande. La fréquence varie selon l’activité du compte. Des frais de messages et de données peuvent s’appliquer. Répondez STOP pour vous désinscrire ou HELP pour obtenir de l’aide. Le consentement SMS n’est pas une condition d’achat ou d’utilisation de nos services. Consultez nos Conditions de service et notre Politique de confidentialité.'
        },
        ja: {
            titleAccent: 'SMS オプトインフロー', demoOnly: 'Yume Official のウェブサイトとモバイルアプリで使用される SMS 同意フローの公開表示です。', reviewableCopy: 'この公開ページには、ブランド、メッセージの目的、同意文、頻度、料金に関する案内、STOP/HELP の指示、ポリシーへのリンクがまとめて表示されます。', demoFlow: '同意フロー', senderNumberNote: 'この公開表示では送信番号を作成していません。本番で使用する前に、Campaign に割り当てられた実際の Twilio 番号を入力してください。', optInKeywordsNote: 'この公開同意ページでは SMS キーワードによる登録を使用しません。', phoneNote: 'この公開同意フローの入力欄を示すためだけに使用します。番号は保存・送信されません。', demoOptedIn: 'フロー完了：SMS への同意を選択しました。メッセージは送信されていません。', demoWithoutSms: 'フロー完了：SMS に同意せず続行しました。', phoneRequired: 'SMS 同意で続けるには電話番号を入力するか、「SMS なしで続ける」を選択してください。', registrationReady: 'この公開ページは情報提供用です。登録は送信されません。', readyToSubmit: 'この公開表示に必要な項目は完了しています。登録は送信されていません。',
            privacyPolicy: 'プライバシーポリシー', termsOfService: '利用規約', publicExample: '公開オプトイン例またはスクリーンショット', publicExampleNote: 'ウェブ CTA と共通の同意フローを確認できる正式な公開ページです。', websiteMethod: 'ウェブサイト', websiteMethodCopy: 'ユーザーが Yume Official アカウントに携帯電話番号を提供または追加すると、CTA の横に独立した未選択の同意チェックボックスが表示されます。', mobileAppMethod: 'モバイルアプリ', mobileAppMethodCopy: 'モバイルアプリでも、携帯電話番号を提供または追加する際に同じ独立した未選択の同意手順を使用します。', consentDisclosure: 'このボックスを選択すると、Yume Official から取引およびアカウントに関する SMS を受信することに同意したものとします。SMS には、一回限りの認証コード、アカウント状態の通知、セキュリティアラート、アカウント認証の更新、アカウント申請状況の通知などが含まれます。メッセージの頻度はアカウントの利用状況によって変わります。メッセージおよびデータ料金がかかる場合があります。停止するには STOP、ヘルプには HELP と返信してください。SMS への同意は購入またはサービス利用の条件ではありません。利用規約とプライバシーポリシーをご確認ください。'
        }
    };

    var currentChoice = preferences.getLanguageChoice();
    var currentLanguage = preferences.resolveLanguage(currentChoice);
    var currentTheme = preferences.getThemeChoice();

    function t(key) {
        return (complianceTranslations[currentLanguage] && complianceTranslations[currentLanguage][key]) || (translations[currentLanguage] && translations[currentLanguage][key]) || complianceTranslations.en[key] || translations.en[key] || key;
    }

    function setTextContent() {
        document.querySelectorAll('[data-i18n]').forEach(function (element) {
            var key = element.getAttribute('data-i18n');
            element.textContent = t(key);
        });
        document.querySelectorAll('[data-i18n-placeholder]').forEach(function (element) {
            element.setAttribute('placeholder', t(element.getAttribute('data-i18n-placeholder')));
        });
        document.querySelectorAll('[data-i18n-aria-label]').forEach(function (element) {
            element.setAttribute('aria-label', t(element.getAttribute('data-i18n-aria-label')));
        });
        document.title = t('brandName') + ' · ' + t('titleAccent');
    }

    function syncLanguageMenu() {
        document.querySelectorAll('[data-language-choice]').forEach(function (option) {
            var isCurrent = option.getAttribute('data-language-choice') === currentChoice;
            option.setAttribute('aria-checked', String(isCurrent));
        });
    }

    function syncThemeMenu() {
        document.querySelectorAll('[data-theme-choice]').forEach(function (option) {
            var isCurrent = option.getAttribute('data-theme-choice') === currentTheme;
            option.setAttribute('aria-checked', String(isCurrent));
        });
    }

    function renderLanguage() {
        currentLanguage = preferences.resolveLanguage(currentChoice);
        document.documentElement.lang = currentLanguage;
        setTextContent();
        syncLanguageMenu();
    }

    function setStatus(element, key, status) {
        element.textContent = t(key);
        element.dataset.status = status || '';
    }

    function setStep(step) {
        document.querySelectorAll('[data-step-indicator]').forEach(function (indicator) {
            indicator.classList.toggle('is-current', indicator.getAttribute('data-step-indicator') === String(step));
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
                renderLanguage();
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

    function setupCopyButtons() {
        document.querySelectorAll('[data-copy-target]').forEach(function (button) {
            button.addEventListener('click', async function () {
                var target = document.getElementById(button.getAttribute('data-copy-target'));
                if (!target) return;

                try {
                    await navigator.clipboard.writeText(target.value || target.textContent || '');
                    button.textContent = t('copied');
                } catch (error) {
                    button.textContent = t('copyFailed');
                }

                window.setTimeout(function () {
                    button.textContent = t('copy');
                }, 1400);
            });
        });
    }

    function setupCtaDemo() {
        var form = document.getElementById('sms-demo-form');
        var phone = document.getElementById('demo-phone');
        var consent = document.getElementById('sms-consent');
        var status = document.getElementById('demo-status');
        var withoutSms = document.getElementById('continue-without');

        form.addEventListener('submit', function (event) {
            event.preventDefault();
            setStep(3);
            if (consent.checked && !phone.value.trim()) {
                setStatus(status, 'phoneRequired', 'error');
                phone.focus();
                return;
            }
            setStatus(status, consent.checked ? 'demoOptedIn' : 'demoWithoutSms', 'success');
        });

        withoutSms.addEventListener('click', function () {
            setStep(3);
            setStatus(status, 'demoWithoutSms', 'success');
        });

        consent.addEventListener('change', function () {
            setStep(2);
            setStatus(status, 'readyStatus', '');
        });
    }

    function setupRegistrationCheck() {
        var sender = document.getElementById('sender-number');
        var confirmation = document.getElementById('registration-confirmation');
        var status = document.getElementById('registration-status');

        function checkFields() {
            var errors = [];
            if (!sender.value.trim()) errors.push(t('senderMissing'));
            if (!confirmation.checked) errors.push(t('confirmationMissing'));
            return errors;
        }

        document.getElementById('check-errors').addEventListener('click', function () {
            var errors = checkFields();
            if (errors.length) {
                setStatus(status, 'errorsFound', 'error');
                status.textContent = t('errorsFound') + errors.join(' ');
                return;
            }
            setStatus(status, 'readyToSubmit', 'success');
        });

        document.getElementById('submit-registration').addEventListener('click', function () {
            var errors = checkFields();
            if (errors.length) {
                setStatus(status, 'errorsFound', 'error');
                status.textContent = t('errorsFound') + errors.join(' ');
                return;
            }
            setStatus(status, 'readyToSubmit', 'success');
        });
    }

    document.getElementById('current-year').textContent = String(new Date().getFullYear());
    preferences.applyTheme(currentTheme);
    syncThemeMenu();
    renderLanguage();
    setupPreferenceMenus();
    setupCopyButtons();
    setupCtaDemo();
    setupRegistrationCheck();
})();
