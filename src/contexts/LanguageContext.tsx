
'use client';

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type Locale = 'en' | 'pt-BR';

// Expanded translations
const translations = {
  en: {
    // Header & General
    dashboard: "Dashboard",
    newReading: "New Reading",
    credits: "Credits",
    profile: "Profile",
    logout: "Log out",
    toggleTheme: "Toggle theme",
    mysticInsights: "Mystic Insights",
    language: "Language",
    english: "English",
    portuguese: "Portuguese",
    allRightsReserved: "All rights reserved.",
    loadingMysticalSpace: "Loading your mystical space...",
    // Landing Page
    landingTitle: "Unlock the Wisdom of the Cards",
    landingSubtitle: "Mystic Insights offers AI-powered interpretations for your Tarot and Cigano card readings, guiding you on your spiritual journey with clarity and depth.",
    landingButton: "Begin Your Journey",
    login: "Login", // Short for button
    signUp: "Sign Up", // Short for button
    // Auth Layout
    authLayoutSubtitle: "Unlock the secrets of your path.",
    // Login Page
    loginTitle: "Login",
    loginDescription: "Enter your credentials to access your account.",
    emailLabel: "Email",
    passwordLabel: "Password",
    loginButton: "Login",
    dontHaveAccount: "Don't have an account?",
    signUpLink: "Sign up",
    loginSuccessTitle: "Login Successful",
    loginSuccessDescription: "Welcome back!",
    loginFailedTitle: "Login Failed",
    genericErrorDescription: "An unexpected error occurred.",
    // Signup Page
    createAccountTitle: "Create an Account",
    createAccountDescription: "Join Mystic Insights to start your journey.",
    fullNameLabel: "Full Name",
    yourNamePlaceholder: "Your Name",
    signUpButton: "Sign Up",
    alreadyHaveAccount: "Already have an account?",
    loginLink: "Log in",
    signupSuccessTitle: "Signup Successful",
    signupSuccessDescription: "Welcome to Mystic Insights!",
    signupFailedTitle: "Signup Failed",
    // App Footer
    footerText: "© {year} Mystic Insights. All rights reserved.",
    // Dashboard
    welcomeMessage: "Welcome, {name}!",
    dashboardSubtitle: "Your mystical journey continues here. Explore your insights and discover new paths.",
    newReadingCardTitle: "New Reading",
    newReadingCardDescription: "Ready for new insights? Upload your card spread.",
    startNewReadingButton: "Start a New Reading",
    yourCreditsCardTitle: "Your Credits",
    creditsRemaining: "credits remaining",
    purchaseMoreCreditsButton: "Purchase More Credits",
    helpfulTipsCardTitle: "Helpful Tips",
    tipFocusIntent: "Focus your intent before a reading.",
    tipCleanseSpace: "Cleanse your space and cards regularly.",
    tipJournalReadings: "Journal your readings for reflection.",
    recentReadingsTitle: "Recent Readings",
    noRecentReadings: "You have no recent readings.",
    startNewReadingLinkText: "new reading",
    discoverYourPathTitle: "Discover Your Path",
    discoverYourPathDescription: "Mystic Insights uses advanced AI to interpret your Tarot and Cigano card spreads, offering personalized guidance based on ancient wisdom and astrological alignments.",
    defaultSeekerName: "Seeker",
    // Credits Page
    purchaseCreditsTitle: "Purchase Credits",
    purchaseCreditsDescription: "Unlock deeper insights with more readings. Choose a credit package that suits your journey.",
    seekersPack: "Seeker's Pack",
    seekersPackDescription: "Perfect for trying out.",
    oraclesBundle: "Oracle's Bundle",
    oraclesBundleDescription: "Best value for regular users.",
    mysticsTrove: "Mystic's Trove",
    mysticsTroveDescription: "For the dedicated spiritual explorer.",
    popularBadge: "Popular",
    creditsUnit: "credits",
    purchaseNowButton: "Purchase Now",
    securePaymentsTitle: "Secure Payments",
    securePaymentsDescription: "All transactions are securely processed. Your financial information is protected.",
    purchaseInitiatedToast: "Purchase initiated for package ID: {packageId}. Payment integration TBD.",
    // New Reading Page
    newCardReadingTitle: "New Card Reading",
    newCardReadingDescription: "Upload an image of your Tarot or Cigano card spread and enter your query to receive an AI-powered interpretation.",
    uploadCardSpreadImageLabel: "Upload Card Spread Image",
    yourQuestionLabel: "Your Question or Context",
    questionPlaceholder: "E.g., 'What should I focus on in my career right now?' or 'General reading for the upcoming month.'",
    getYourReadingButton: "Get Your Reading",
    generatingInterpretationButton: "Generating Interpretation...",
    imageTooLargeTitle: "Image too large",
    imageTooLargeDescription: "Please upload an image smaller than 4MB.",
    noImageErrorTitle: "No Image",
    noImageErrorDescription: "Please upload an image of your card spread.",
    noQueryErrorTitle: "No Query",
    noQueryErrorDescription: "Please enter your question or context for the reading.",
    interpretationReadyTitle: "Interpretation Ready!",
    interpretationReadyDescription: "Your reading has been generated.",
    errorGenericTitle: "Error",
    errorGeneratingInterpretationDescription: "Failed to generate interpretation. Please try again.",
    errorOccurredCardTitle: "An Error Occurred",
    yourMysticalInterpretationTitle: "Your Mystical Interpretation",
    // Profile Page
    yourProfileTitle: "Your Profile",
    yourProfileDescription: "Manage your account details and preferences.",
    displayNameLabel: "Display Name",
    emailAddressLabel: "Email Address",
    emailChangeNotice: "Email address cannot be changed here currently.",
    saveChangesButton: "Save Changes",
    cancelButton: "Cancel",
    editProfileButton: "Edit Profile",
    profileUpdatedTitle: "Profile Updated",
    profileUpdatedDescription: "Your profile information has been saved.",
    updateFailedTitle: "Update Failed",
    updateFailedDescription: "Could not update profile.",
    // AuthGuard
    pleaseLoginToViewProfile: "Please log in to view your profile.",

  },
  'pt-BR': {
    // Header & General
    dashboard: "Painel",
    newReading: "Nova Leitura",
    credits: "Créditos",
    profile: "Perfil",
    logout: "Sair",
    toggleTheme: "Alternar tema",
    mysticInsights: "Mystic Insights", // Manter como nome da marca
    language: "Idioma",
    english: "Inglês",
    portuguese: "Português",
    allRightsReserved: "Todos os direitos reservados.",
    loadingMysticalSpace: "Carregando seu espaço místico...",
    // Landing Page
    landingTitle: "Desvende a Sabedoria das Cartas",
    landingSubtitle: "Mystic Insights oferece interpretações com IA para suas leituras de Tarot e Baralho Cigano, guiando você em sua jornada espiritual com clareza e profundidade.",
    landingButton: "Comece Sua Jornada",
    login: "Entrar", // Curto para botão
    signUp: "Cadastrar", // Curto para botão
    // Auth Layout
    authLayoutSubtitle: "Desvende os segredos do seu caminho.",
    // Login Page
    loginTitle: "Entrar",
    loginDescription: "Insira suas credenciais para acessar sua conta.",
    emailLabel: "E-mail",
    passwordLabel: "Senha",
    loginButton: "Entrar",
    dontHaveAccount: "Não tem uma conta?",
    signUpLink: "Cadastre-se",
    loginSuccessTitle: "Login Bem-sucedido",
    loginSuccessDescription: "Bem-vindo(a) de volta!",
    loginFailedTitle: "Falha no Login",
    genericErrorDescription: "Ocorreu um erro inesperado.",
    // Signup Page
    createAccountTitle: "Criar uma Conta",
    createAccountDescription: "Junte-se ao Mystic Insights para iniciar sua jornada.",
    fullNameLabel: "Nome Completo",
    yourNamePlaceholder: "Seu Nome",
    signUpButton: "Cadastrar",
    alreadyHaveAccount: "Já tem uma conta?",
    loginLink: "Faça login",
    signupSuccessTitle: "Cadastro Bem-sucedido",
    signupSuccessDescription: "Bem-vindo(a) ao Mystic Insights!",
    signupFailedTitle: "Falha no Cadastro",
    // App Footer
    footerText: "© {year} Mystic Insights. Todos os direitos reservados.",
    // Dashboard
    welcomeMessage: "Bem-vindo(a), {name}!",
    dashboardSubtitle: "Sua jornada mística continua aqui. Explore seus insights e descubra novos caminhos.",
    newReadingCardTitle: "Nova Leitura",
    newReadingCardDescription: "Pronto para novos insights? Faça o upload da sua tiragem de cartas.",
    startNewReadingButton: "Iniciar Nova Leitura",
    yourCreditsCardTitle: "Seus Créditos",
    creditsRemaining: "créditos restantes",
    purchaseMoreCreditsButton: "Comprar Mais Créditos",
    helpfulTipsCardTitle: "Dicas Úteis",
    tipFocusIntent: "Concentre sua intenção antes de uma leitura.",
    tipCleanseSpace: "Limpe seu espaço e suas cartas regularmente.",
    tipJournalReadings: "Anote suas leituras para reflexão.",
    recentReadingsTitle: "Leituras Recentes",
    noRecentReadings: "Você não possui leituras recentes.",
    startNewReadingLinkText: "nova leitura",
    discoverYourPathTitle: "Descubra Seu Caminho",
    discoverYourPathDescription: "Mystic Insights usa IA avançada para interpretar suas tiragens de Tarot e Baralho Cigano, oferecendo orientação personalizada baseada em sabedoria ancestral e alinhamentos astrológicos.",
    defaultSeekerName: "Buscador(a)",
    // Credits Page
    purchaseCreditsTitle: "Comprar Créditos",
    purchaseCreditsDescription: "Desbloqueie insights mais profundos com mais leituras. Escolha o pacote de créditos que combina com sua jornada.",
    seekersPack: "Pacote do Buscador",
    seekersPackDescription: "Perfeito para experimentar.",
    oraclesBundle: "Combo do Oráculo",
    oraclesBundleDescription: "Melhor valor para usuários regulares.",
    mysticsTrove: "Tesouro do Místico",
    mysticsTroveDescription: "Para o explorador espiritual dedicado.",
    popularBadge: "Popular",
    creditsUnit: "créditos",
    purchaseNowButton: "Comprar Agora",
    securePaymentsTitle: "Pagamentos Seguros",
    securePaymentsDescription: "Todas as transações são processadas com segurança. Suas informações financeiras estão protegidas.",
    purchaseInitiatedToast: "Compra iniciada para o pacote ID: {packageId}. Integração de pagamento pendente.",
    // New Reading Page
    newCardReadingTitle: "Nova Leitura de Cartas",
    newCardReadingDescription: "Faça o upload de uma imagem da sua tiragem de Tarot ou Baralho Cigano e insira sua pergunta para receber uma interpretação com IA.",
    uploadCardSpreadImageLabel: "Upload da Imagem da Tiragem",
    yourQuestionLabel: "Sua Pergunta ou Contexto",
    questionPlaceholder: "Ex: 'No que devo focar na minha carreira agora?' ou 'Leitura geral para o próximo mês.'",
    getYourReadingButton: "Obtenha Sua Leitura",
    generatingInterpretationButton: "Gerando Interpretação...",
    imageTooLargeTitle: "Imagem muito grande",
    imageTooLargeDescription: "Por favor, envie uma imagem menor que 4MB.",
    noImageErrorTitle: "Nenhuma Imagem",
    noImageErrorDescription: "Por favor, envie uma imagem da sua tiragem de cartas.",
    noQueryErrorTitle: "Nenhuma Pergunta",
    noQueryErrorDescription: "Por favor, insira sua pergunta ou contexto para a leitura.",
    interpretationReadyTitle: "Interpretação Pronta!",
    interpretationReadyDescription: "Sua leitura foi gerada.",
    errorGenericTitle: "Erro",
    errorGeneratingInterpretationDescription: "Falha ao gerar interpretação. Por favor, tente novamente.",
    errorOccurredCardTitle: "Ocorreu um Erro",
    yourMysticalInterpretationTitle: "Sua Interpretação Mística",
    // Profile Page
    yourProfileTitle: "Seu Perfil",
    yourProfileDescription: "Gerencie os detalhes e preferências da sua conta.",
    displayNameLabel: "Nome de Exibição",
    emailAddressLabel: "Endereço de E-mail",
    emailChangeNotice: "O endereço de e-mail não pode ser alterado aqui no momento.",
    saveChangesButton: "Salvar Alterações",
    cancelButton: "Cancelar",
    editProfileButton: "Editar Perfil",
    profileUpdatedTitle: "Perfil Atualizado",
    profileUpdatedDescription: "Suas informações de perfil foram salvas.",
    updateFailedTitle: "Falha na Atualização",
    updateFailedDescription: "Não foi possível atualizar o perfil.",
    // AuthGuard
    pleaseLoginToViewProfile: "Por favor, faça login para ver seu perfil.",
  },
};


export type TranslationKey = keyof typeof translations.en; // Use 'en' as the reference for all keys

interface LanguageContextType {
  locale: Locale;
  setLocale: (newLocale: Locale) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window !== 'undefined') {
      const storedLocale = localStorage.getItem('app-locale') as Locale | null;
      if (storedLocale && (storedLocale === 'en' || storedLocale === 'pt-BR')) {
        return storedLocale;
      }
    }
    return 'pt-BR';
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.lang = locale;
    }
  }, [locale]);
  
  const updateLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    if (typeof window !== 'undefined') {
      localStorage.setItem('app-locale', newLocale);
      document.documentElement.lang = newLocale;
    }
  }, []);

  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>): string => {
      let translation = translations[locale]?.[key] || translations.en[key] || String(key);
      if (params) {
        Object.entries(params).forEach(([paramKey, value]) => {
          translation = translation.replace(`{${paramKey}}`, String(value));
        });
      }
      return translation;
    },
    [locale]
  );

  return (
    <LanguageContext.Provider value={{ locale, setLocale: updateLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
