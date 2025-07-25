
'use client';

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// 1. Types
export type Locale = 'en' | 'pt-BR';

// Manually list all known translation keys for type safety.
// In a larger app, this might be auto-generated from JSON files.
export type TranslationKey =
  | 'mysticInsights'
  | 'authLayoutSubtitle'
  | 'loadingMysticalSpace'
  | 'language'
  | 'toggleTheme'
  | 'profile'
  | 'dashboard'
  | 'newReading'
  | 'dreamInterpretation'
  | 'credits'
  | 'logout'
  | 'footerText'
  | 'adminPanel'
  | 'login'
  | 'signUp'
  | 'loginTitle'
  | 'loginDescription'
  | 'emailLabel'
  | 'passwordLabel'
  | 'loginButton'
  | 'dontHaveAccount'
  | 'signUpLink'
  | 'loginSuccessTitle'
  | 'loginSuccessDescription'
  | 'loginFailedTitle'
  | 'genericErrorDescription'
  | 'createAccountTitle'
  | 'createAccountDescription'
  | 'fullNameLabel'
  | 'yourNamePlaceholder'
  | 'signUpButton'
  | 'alreadyHaveAccount'
  | 'loginLink'
  | 'signupSuccessTitle'
  | 'signupSuccessDescription'
  | 'emailAlreadyInUseErrorDescription'
  | 'signupFailedTitle'
  | 'pleaseLoginToViewProfile'
  | 'yourProfileTitle'
  | 'yourProfileDescription'
  | 'displayNameLabel'
  | 'emailAddressLabel'
  | 'emailChangeNotice'
  | 'saveChangesButton'
  | 'cancelButton'
  | 'editProfileButton'
  | 'profileUpdatedTitle'
  | 'profileUpdatedDescription'
  | 'updateFailedTitle'
  | 'updateFailedDescription'
  | 'welcomeMessage' // Params: { name: string }
  | 'dashboardSubtitle'
  | 'newReadingCardTitle'
  | 'newReadingCardDescription'
  | 'startNewReadingButton'
  | 'dreamInterpretationCardDescription'
  | 'interpretDreamButton'
  | 'yourCreditsCardTitle'
  | 'creditsRemaining'
  | 'purchaseMoreCreditsButton'
  | 'dailyGiftTitle'
  | 'claimYourDailyGift' // Params: { count: string }
  | 'dailyGiftClaimed'
  | 'nextGiftIn' // Params: { time: string }
  | 'comeBackTomorrow'
  | 'claimingButton'
  | 'claimNowButton'
  | 'dailyGiftSuccessToastTitle'
  | 'dailyGiftSuccessToastDescription' // Params: { count: string }
  | 'dailyGiftErrorToastTitle'
  | 'dailyGiftCooldownError' // Params: { time: string }
  | 'dailyGiftGenericError'
  | 'recentReadingsTitle'
  | 'noRecentReadings'
  | 'noRecentReadingsPrompt_start'
  | 'noRecentReadingsPrompt_link'
  | 'noRecentReadingsPrompt_end'
  | 'viewReadingButton'
  | 'tarotReadingType'
  | 'dreamInterpretationType'
  | 'discoverYourPathTitle'
  | 'discoverYourPathDescription'
  | 'defaultSeekerName'
  | 'authErrorTitle'
  | 'mustBeLoggedInToInterpret'
  | 'insufficientCreditsTitle'
  | 'insufficientCreditsForDreamDescription'
  | 'noDreamErrorTitle'
  | 'noDreamErrorDescription'
  | 'dreamDescriptionTooShortError'
  | 'creditDeductionFailedError'
  | 'dreamInterpretationReadyTitle'
  | 'dreamInterpretationReadyDescription'
  | 'errorGeneratingInterpretationDescription'
  | 'errorGenericTitle'
  | 'errorOccurredCardTitle'
  | 'yourPropheticInterpretationTitle'
  | 'dreamInterpretationTitle' // Already present
  | 'dreamInterpretationDescription' // Already present
  | 'creditsAvailable' // Params: { count: number }
  | 'yourDreamLabel'
  | 'dreamPlaceholder'
  | 'generatingDreamInterpretationButton'
  | 'getDreamInterpretationButton'
  | 'dreamIllustrationAlt' // Params: { number: number }
  | 'mustBeLoggedInToRead'
  | 'insufficientCreditsDescription'
  | 'noImageErrorTitle'
  | 'noImageErrorDescription'
  | 'noQueryErrorTitle'
  | 'noQueryErrorDescription'
  | 'interpretationReadyTitle'
  | 'interpretationReadyDescription'
  | 'newCardReadingTitle'
  | 'newCardReadingDescription'
  | 'uploadCardSpreadImageLabel'
  | 'cardSpreadPreviewAlt'
  | 'yourQuestionLabel'
  | 'questionPlaceholder'
  | 'generatingInterpretationButton'
  | 'getYourReadingButton'
  | 'yourMysticalInterpretationTitle'
  | 'yourVisualBlessingTitle'
  | 'summaryImageAlt'
  | 'imageTooLargeTitle'
  | 'imageTooLargeDescription'
  | 'changeProfilePictureLabel'
  | 'tarotReadingDetailsTitle'
  | 'dreamInterpretationDetailsTitle'
  | 'readingPerformedOn' // Params: { date: string }
  | 'cardSpreadImageTitle'
  | 'interpretationTitle'
  | 'readingNotFoundError'
  | 'errorFetchingReading'
  | 'mustBeLoggedInToViewReading'
  | 'backToDashboardButton'
  | 'readingNotFound'
  | 'timestampProcessing'
  | 'landingTitle'
  | 'landingSubtitle'
  | 'landingButton'
  | 'howItWorksTitle'
  | 'howItWorksSubtitle'
  | 'howItWorksUploadTitle'
  | 'howItWorksUploadDescription'
  | 'howItWorksQueryTitle'
  | 'howItWorksQueryDescription'
  | 'howItWorksRevealTitle'
  | 'howItWorksRevealDescription'
  | 'discoverMagicTitle'
  | 'discoverMagicSubtitle'
  | 'benefitAITitle'
  | 'benefitAIDescription'
  | 'benefitPersonalizationTitle'
  | 'benefitPersonalizationDescription'
  | 'benefitGuidanceTitle'
  | 'benefitGuidanceDescription'
  | 'testimonialsTitle'
  | 'testimonialsSubtitle'
  | 'testimonial1Quote'
  | 'testimonial1Name'
  | 'testimonial1Role'
  | 'testimonial2Quote'
  | 'testimonial2Name'
  | 'testimonial2Role'
  | 'mysticalGalleryTitle'
  | 'mysticalGallerySubtitle'
  | 'finalCTATitle'
  | 'finalCTASubtitle'
  | 'finalCTAButton'
  | 'landingImageAlt'
  | 'gifPlaceholderAlt'
  | 'adminDashboardTitle'
  | 'adminDashboardDescription'
  | 'usersTableTitle'
  | 'noUsersFound'
  | 'userName'
  | 'userEmail'
  | 'userRole'
  | 'userCredits'
  | 'userActions'
  | 'roleAdmin'
  | 'roleUser'
  | 'creditsCouldNotBeFetched'
  | 'addCreditsButton'
  | 'addCreditsModalTitle'
  | 'manageUserLabel'
  | 'creditsAmountLabel'
  | 'addCreditsSubmitButton'
  | 'deleteUserButton'
  | 'confirmDeleteUserTitle'
  | 'confirmDeleteUserDescription' // Params: { email: string }
  | 'fetchingUsers'
  | 'promptManagementTitle'
  | 'promptEditingDisclaimer'
  | 'cardReadingPromptLabel'
  | 'dreamInterpretationPromptLabel' // Already present
  | 'savePromptButton'
  | 'addCreditsSuccessToast' // Params: { count: string, email: string }
  | 'addCreditsErrorToast' // Params: { email: string }
  | 'deleteUserSuccessToast' // Params: { email: string }
  | 'deleteUserErrorToast' // Params: { email: string }
  | 'promptSaveSuccess'
  | 'promptSaveError'
  | 'promptLoadError'
  | 'purchaseCreditsTitle'
  | 'purchaseCreditsDescription'
  | 'freeTrialPack'
  | 'freeTrialPackDescription'
  | 'seekersPack'
  | 'seekersPackDescription'
  | 'oraclesBundle'
  | 'oraclesBundleDescription'
  | 'mysticsTrove'
  | 'mysticsTroveDescription'
  | 'popularBadge'
  | 'creditsUnit'
  | 'getItNowButton'
  | 'purchaseNowButton'
  | 'securePaymentsTitle'
  | 'securePaymentsDescription'
  | 'purchaseInitiatedToast' // Params: { packageId: string }
  | 'freeCreditClaimedToast' // Params: { count: string }
  | 'freeCreditAlreadyClaimedToast'
  | 'freeCreditClaimFailedToast'
  | 'ourOraclesTitle'
  | 'ourOraclesSubtitle'
  | 'missionIntuitionTitle'
  | 'missionIntuitionDescription'
  | 'missionPrecisionTitle'
  | 'missionPrecisionDescription'
  | 'missionConnectionTitle'
  | 'freeCreditAlreadyClaimedButton'
  | 'satisfiedClientsLabel'
  | 'orSeparator'
  | 'dailyRewardsTitle'
  | 'dailyRewardsSubtitle'
  | 'dayLabel'
  | 'claimedStatus'
  | 'claimStatus'
  | 'lockedStatus'
  | 'rewardTrack'
  | 'comeBackIn'
  | 'rewardOf'
  | 'claimRewardButton'
  | 'rewardClaimedSuccessTitle'
  | 'rewardClaimedSuccessDescription'
  | 'rewardClaimErrorTitle'
  | 'rewardClaimErrorCooldown'
  | 'rewardClaimErrorGeneric'
  | 'manageDailyRewardsTitle'
  | 'manageDailyRewardsDescription'
  | 'editRewardForDay'
  | 'rewardTitleLabel'
  | 'rewardTitlePlaceholder'
  | 'rewardTypeLabel'
  | 'rewardTypeCredits'
  | 'rewardTypeEbook'
  | 'rewardTypeTarotReading'
  | 'rewardValueLabel'
  | 'rewardValuePlaceholder'
  | 'rewardIconLabel'
  | 'saveRewardButton'
  | 'savingButton'
  | 'rewardUpdateSuccess'
  | 'rewardUpdateError'
  | 'loadingRewards'
  | 'dailyTreasuresTitle'
  | 'dailyTreasuresSubtitle'
  | 'prizeCreditsTitle'
  | 'prizeCreditsDescription'
  | 'prizeEbooksTitle'
  | 'prizeEbooksDescription'
  | 'prizeDigitalTarotTitle'
  | 'prizeDigitalTarotDescription'
  | 'prizePhysicalTarotTitle'
  | 'prizePhysicalTarotDescription'
  | 'prizeImageAlt'
  | 'chooseFileButton'
  | 'noFileChosenText'
  | 'rememberMeLabel'
  | 'dreamDictionaryManagementTitle'
  | 'dreamDictionaryManagementDescription'
  | 'selectLetterLabel'
  | 'dictionaryContentLabel'
  | 'dictionaryContentPlaceholder'
  | 'saveDictionaryButton'
  | 'dictionaryFetchError'
  | 'dictionarySaveSuccess'
  | 'dictionarySaveError'
  | 'dreamDictionaryInterpretationTitle'
  | 'specialPrizeNoticeTitle'
  | 'specialPrizeNoticeDescription'
  | 'whatsappMode'
  | 'whatsappModeTitle'
  | 'whatsappModeDescription'
  | 'whatsappEnableLabel'
  | 'whatsappEnableDescription'
  | 'whatsappPhoneNumberLabel'
  | 'whatsappPhoneNumberDescription'
  | 'whatsappFrequencyLabel'
  | 'whatsappFrequencyDescription'
  | 'whatsappFrequency3h'
  | 'whatsappFrequency6h'
  | 'whatsappFrequency9h'
  | 'whatsappFrequencyDaily'
  | 'whatsappFrequencyWeekly'
  | 'whatsappCreditUsageTitle'
  | 'whatsappCreditUsageDescription'
  | 'whatsappSettingsSavedTitle'
  | 'whatsappSettingsSavedDescription'
  | 'whatsappInvalidPhoneNumber'
  | 'oghamOracle'
  | 'oghamOracleDescription'
  | 'oghamOracleTitle'
  | 'oghamOraclePageTitle'
  | 'oghamOraclePageDescription'
  | 'oghamReadingType'
  | 'oghamInterpretationTitle'
  | 'getYourOghamReadingButton'
  | 'generatingOghamReadingButton'
  | 'lerOghamButton'
  | 'chooseOghamStickLabel'
  | 'oghamConsultingTrees'
  | 'oghamDoAnotherReading'
  | 'oghamYourChosenLetter'
  | 'oghamTreeImageAlt'
  | 'oghamAdviceVisual'
  | 'oghamAdviceImageAlt'
  | 'oghamMysticalTreeAlt'
  | 'yidamsPath'
  | 'yidamsPathTitle'
  | 'yidamsPathDescription'
  | 'discoverYourYidamButton'
  | 'yidamsPageTitle'
  | 'yidamsPageDescription'
  | 'yidamsBirthDateLabel'
  | 'yidamsBirthDatePlaceholder'
  | 'yidamsRevealButton'
  | 'yidamsRevealingButton'
  | 'yidamsYourDeityIs'
  | 'yidamsMantraLabel'
  | 'yidamsCharacteristicsLabel'
  | 'yidamsImageAlt'
  | 'yidamsErrorDate'
  | 'yidamsErrorGenerating'
  | 'yidamsSuccessToast'
  | 'dreamDictionaryTitle'
  | 'searchInDictionaryLabel'
  | 'searchInDictionaryPlaceholder'
  | 'noResultsFoundForQuery'
  | 'mesaRealTitle'
  | 'mesaRealDescription'
  ;

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

const translationsData: Record<Locale, Record<TranslationKey, string>> = {
  'en': {
    mysticInsights: 'Coruja Mística',
    authLayoutSubtitle: 'Unveil the secrets of your path with AI-powered Tarot and Dream interpretations.',
    loadingMysticalSpace: 'Loading your mystical space...',
    language: 'Language',
    toggleTheme: 'Toggle theme',
    profile: 'Profile',
    dashboard: 'Dashboard',
    newReading: 'New Reading',
    dreamInterpretation: 'Interpret Dream',
    credits: 'Credits',
    logout: 'Logout',
    footerText: '© {year} Coruja Mística. All rights reserved.',
    adminPanel: 'Admin Panel',
    login: 'Login',
    signUp: 'Sign Up',
    loginTitle: 'Welcome Back',
    loginDescription: 'Enter your credentials to access your mystical dashboard.',
    emailLabel: 'Email',
    passwordLabel: 'Password',
    loginButton: 'Login',
    dontHaveAccount: "Don't have an account?",
    signUpLink: 'Sign up here',
    loginSuccessTitle: 'Login Successful',
    loginSuccessDescription: 'Welcome back to Coruja Mística!',
    loginFailedTitle: 'Login Failed',
    genericErrorDescription: 'An unexpected error occurred. Please try again.',
    createAccountTitle: 'Create Your Account',
    createAccountDescription: 'Join Coruja Mística and start your journey of discovery.',
    fullNameLabel: 'Full Name',
    yourNamePlaceholder: 'Your Name',
    signUpButton: 'Sign Up',
    alreadyHaveAccount: 'Already have an account?',
    loginLink: 'Login here',
    signupSuccessTitle: 'Account Created!',
    signupSuccessDescription: "You're all set! Redirecting to your dashboard...",
    emailAlreadyInUseErrorDescription: 'This email is already in use. Please try another or login.',
    signupFailedTitle: 'Signup Failed',
    pleaseLoginToViewProfile: 'Please login to view your profile.',
    yourProfileTitle: 'Your Profile',
    yourProfileDescription: 'Manage your account details.',
    displayNameLabel: 'Display Name',
    emailAddressLabel: 'Email Address',
    emailChangeNotice: 'Email address cannot be changed here.',
    saveChangesButton: 'Save Changes',
    cancelButton: 'Cancel',
    editProfileButton: 'Edit Profile',
    profileUpdatedTitle: 'Profile Updated',
    profileUpdatedDescription: 'Your profile details have been saved.',
    updateFailedTitle: 'Update Failed',
    updateFailedDescription: 'Could not update your profile. Please try again.',
    welcomeMessage: 'Welcome, {name}!',
    dashboardSubtitle: 'Your personal space for mystical exploration and insights.',
    newReadingCardTitle: 'New Card Reading',
    newReadingCardDescription: 'Upload your card spread and ask your question to the oracle.',
    startNewReadingButton: 'Start New Reading',
    dreamInterpretationCardDescription: 'Uncover the hidden messages in your dreams.',
    interpretDreamButton: 'Interpret Dream',
    yourCreditsCardTitle: 'Your Credits',
    creditsRemaining: 'credits remaining to unlock insights.',
    purchaseMoreCreditsButton: 'Purchase More Credits',
    dailyGiftTitle: 'Daily Gift',
    claimYourDailyGift: 'Claim your {count} free daily credits!',
    dailyGiftClaimed: 'Daily gift claimed.',
    nextGiftIn: 'Next gift in: {time}',
    comeBackTomorrow: 'Come back tomorrow for more!',
    claimingButton: 'Claiming...',
    claimNowButton: 'Claim Now',
    dailyGiftSuccessToastTitle: 'Gift Claimed!',
    dailyGiftSuccessToastDescription: 'You received {count} free credits!',
    dailyGiftErrorToastTitle: 'Gift Error',
    dailyGiftCooldownError: 'You can claim your next gift in {time}.',
    dailyGiftGenericError: 'Could not claim daily gift. Please try again later.',
    recentReadingsTitle: 'Recent Readings',
    noRecentReadings: 'No recent readings found.',
    noRecentReadingsPrompt_start: 'Start a',
    noRecentReadingsPrompt_link: 'new reading',
    noRecentReadingsPrompt_end: 'or interpret a dream to see your insights here.',
    viewReadingButton: 'View',
    tarotReadingType: 'Tarot Reading',
    dreamInterpretationType: 'Dream Interpretation',
    discoverYourPathTitle: 'Discover Your Path',
    discoverYourPathDescription: 'Let the cards and stars guide your journey. Our AI-powered interpretations offer a modern take on ancient wisdom.',
    defaultSeekerName: 'Seeker',
    authErrorTitle: 'Authentication Error',
    mustBeLoggedInToInterpret: 'You must be logged in to interpret a dream.',
    insufficientCreditsTitle: 'Insufficient Credits',
    insufficientCreditsForDreamDescription: 'You need at least 1 credit to interpret a dream. Please purchase more.',
    noDreamErrorTitle: 'No Dream Provided',
    noDreamErrorDescription: 'Please describe your dream to get an interpretation.',
    dreamDescriptionTooShortError: 'Dream description must be at least 10 characters long.',
    creditDeductionFailedError: 'Failed to deduct credit. Please try again.',
    dreamInterpretationReadyTitle: 'Interpretation Ready!',
    dreamInterpretationReadyDescription: 'Your dream interpretation has been generated.',
    errorGeneratingInterpretationDescription: 'An error occurred while generating the interpretation.',
    errorGenericTitle: 'An Error Occurred',
    errorOccurredCardTitle: 'Error',
    yourPropheticInterpretationTitle: 'Your Prophetic Interpretation',
    dreamInterpretationTitle: 'Dream Interpretation',
    dreamInterpretationDescription: 'Describe your dream and let the Prophet unveil its meaning.',
    creditsAvailable: '({count} credits available)',
    yourDreamLabel: 'Your Dream',
    dreamPlaceholder: 'Last night I dreamt of a flying serpent over a calm sea...',
    generatingDreamInterpretationButton: 'Generating Interpretation...',
    getDreamInterpretationButton: 'Get Interpretation',
    dreamIllustrationAlt: 'Dream illustration {number}',
    mustBeLoggedInToRead: 'You must be logged in to request a reading.',
    insufficientCreditsDescription: 'You need at least 1 credit for a reading. Please purchase more.',
    noImageErrorTitle: 'No Image Selected',
    noImageErrorDescription: 'Please upload an image of your card spread.',
    noQueryErrorTitle: 'No Question Asked',
    noQueryErrorDescription: 'Please enter your question for the oracle.',
    interpretationReadyTitle: 'Interpretation Ready!',
    interpretationReadyDescription: 'Your card reading interpretation has been generated.',
    newCardReadingTitle: 'New Card Reading',
    newCardReadingDescription: 'Upload your card spread, ask your question, and receive a mystical interpretation.',
    uploadCardSpreadImageLabel: 'Upload Card Spread Image',
    cardSpreadPreviewAlt: 'Card spread preview',
    yourQuestionLabel: 'Your Question',
    questionPlaceholder: 'What do the cards say about my current path?',
    generatingInterpretationButton: 'Generating Interpretation...',
    getYourReadingButton: 'Get Your Reading',
    yourMysticalInterpretationTitle: 'Your Mystical Interpretation',
    yourVisualBlessingTitle: 'Your Visual Blessing',
    summaryImageAlt: 'AI generated summary image for your reading',
    imageTooLargeTitle: "Image Too Large",
    imageTooLargeDescription: "Please upload an image smaller than 2MB.",
    changeProfilePictureLabel: 'Change profile picture',
    tarotReadingDetailsTitle: "Tarot Reading Details",
    dreamInterpretationDetailsTitle: "Dream Interpretation Details",
    readingPerformedOn: "Reading performed on: {date}",
    cardSpreadImageTitle: "Your Card Spread",
    interpretationTitle: "Interpretation",
    readingNotFoundError: "The requested reading was not found.",
    errorFetchingReading: "An error occurred while fetching your reading.",
    mustBeLoggedInToViewReading: "You must be logged in to view this reading.",
    backToDashboardButton: "Back to Dashboard",
    readingNotFound: "Reading not found.",
    timestampProcessing: "Processing timestamp...",
    landingTitle: "Unveil Your Destiny",
    landingSubtitle: "",
    landingButton: "Start Your Journey",
    howItWorksTitle: "How It Works",
    howItWorksSubtitle: "Simple steps to your personalized mystical insights.",
    howItWorksUploadTitle: "1. Upload Your Cards",
    howItWorksUploadDescription: "Take a clear photo of your Tarot or Cigano card spread.",
    howItWorksQueryTitle: "2. Ask Your Question",
    howItWorksQueryDescription: "Frame your query or describe the context for the reading.",
    howItWorksRevealTitle: "3. Receive Your Insight",
    howItWorksRevealDescription: "Our AI oracle provides a detailed, personalized interpretation.",
    discoverMagicTitle: "Discover the Magic",
    discoverMagicSubtitle: "Experience the unique blend of ancient wisdom and modern technology.",
    benefitAITitle: "AI-Powered Wisdom",
    benefitAIDescription: "Leveraging advanced AI trained by seasoned mystics to provide deep, nuanced interpretations.",
    benefitPersonalizationTitle: "Truly Personal",
    benefitPersonalizationDescription: "Interpretations tailored to your specific card spread and question.",
    benefitGuidanceTitle: "Spiritual Guidance",
    benefitGuidanceDescription: "Gain clarity and direction for your life's path, relationships, and decisions.",
    testimonialsTitle: "Words from Our Seekers",
    testimonialsSubtitle: "Hear what others have discovered on their journey with Coruja Mística.",
    testimonial1Quote: "The AI's interpretation was incredibly accurate and insightful. It felt like talking to a real fortune teller!",
    testimonial1Name: "Juliana S.",
    testimonial1Role: "Spiritual Seeker",
    testimonial2Quote: "I was skeptical at first, but the dream analysis was spot on and helped me understand a recurring dream.",
    testimonial2Name: "Ricardo M.",
    testimonial2Role: "Curious Explorer",
    mysticalGalleryTitle: "Mystical Visions",
    mysticalGallerySubtitle: "Immerse yourself in the symbolic imagery that inspires our oracle.",
    finalCTATitle: "Ready to Illuminate Your Path?",
    finalCTASubtitle: "Join thousands of seekers who have found clarity and guidance. Your first insights await.",
    finalCTAButton: "Create Your Account Now",
    landingImageAlt: "Mystical woman with smoke effect, representing the oracle",
    gifPlaceholderAlt: "Mystical animated GIF",
    adminDashboardTitle: 'Admin Dashboard',
    adminDashboardDescription: 'Manage users, credits, and application settings.',
    usersTableTitle: 'User Management',
    noUsersFound: 'No users found in the mystical realm yet.',
    userName: 'Name',
    userEmail: 'Email',
    userRole: 'Role',
    userCredits: 'Credits',
    userActions: 'Actions',
    roleAdmin: 'Admin',
    roleUser: 'User',
    creditsCouldNotBeFetched: 'N/A',
    addCreditsButton: 'Credits',
    addCreditsModalTitle: 'Add Credits',
    manageUserLabel: 'User',
    creditsAmountLabel: 'Amount',
    addCreditsSubmitButton: 'Add Credits',
    deleteUserButton: 'Delete',
    confirmDeleteUserTitle: 'Confirm Deletion',
    confirmDeleteUserDescription: 'Are you sure you want to remove all data for {email}? This action cannot be undone.',
    fetchingUsers: 'Fetching users from the astral plane...',
    promptManagementTitle: 'AI Prompt Management',
    promptEditingDisclaimer: 'Caution: Editing these prompts directly affects AI responses. Ensure you understand the prompt structure.',
    cardReadingPromptLabel: 'Card Reading Prompt (analyzeCardReading)',
    dreamInterpretationPromptLabel: 'Dream Interpretation Prompt (interpretDream)',
    savePromptButton: 'Save Prompt',
    addCreditsSuccessToast: '{count} credits added to {email}.',
    addCreditsErrorToast: 'Failed to add credits for {email}.',
    deleteUserSuccessToast: 'User data for {email} has been removed.',
    deleteUserErrorToast: 'Failed to remove user data for {email}.',
    promptSaveSuccess: 'AI prompt saved successfully.',
    promptSaveError: 'Failed to save AI prompt.',
    promptLoadError: 'Could not load AI prompts.',
    purchaseCreditsTitle: 'Purchase Credits',
    purchaseCreditsDescription: 'Unlock deeper insights and continue your mystical journey by purchasing additional credits. Each credit allows for one powerful interpretation.',
    freeTrialPack: "Free Trial",
    freeTrialPackDescription: "A taste of the mystic for new seekers.",
    seekersPack: "Seeker's Pack",
    seekersPackDescription: "Perfect for a few insightful readings.",
    oraclesBundle: "Oracle's Bundle",
    oraclesBundleDescription: "Our most popular choice for ongoing guidance.",
    mysticsTrove: "Mystic's Trove",
    mysticsTroveDescription: "For the dedicated seeker of wisdom.",
    popularBadge: "POPULAR",
    creditsUnit: "Credits",
    getItNowButton: "Get It Now!",
    purchaseNowButton: "Purchase Now",
    securePaymentsTitle: "Secure & Encrypted Payments",
    securePaymentsDescription: "Your transactions are protected with the highest security standards. We accept all major credit cards and PayPal.",
    purchaseInitiatedToast: "Purchase for package ID {packageId} initiated (Simulation).",
    freeCreditClaimedToast: "{count} free credit(s) claimed successfully!",
    freeCreditAlreadyClaimedToast: "You have already claimed your free trial credit.",
    freeCreditClaimFailedToast: "Failed to claim free credit. Please try again later.",
    ourOraclesTitle: "Our Oracles",
    ourOraclesSubtitle: "Explore the wisdom of the Cards, Dreams, Ogham, and Yidams.",
    missionIntuitionTitle: "Your Tarot",
    missionIntuitionDescription: "Upload your tarot spread to get a mystical interpretation.",
    missionPrecisionTitle: "Dream Interpretation",
    missionPrecisionDescription: "Describe your detailed dream to get a prophetic interpretation.",
    missionConnectionTitle: 'Coruja Mística', // Corrected
    freeCreditAlreadyClaimedButton: "Already Claimed",
    satisfiedClientsLabel: "Satisfied clients",
    orSeparator: "OR",
    dailyRewardsTitle: "Reward Calendar",
    dailyRewardsSubtitle: "Claim your reward every day to advance on the track!",
    dayLabel: "Day {day}",
    claimedStatus: "Claimed",
    claimStatus: "Claim",
    lockedStatus: "Locked",
    rewardTrack: "Reward Track",
    comeBackIn: "Come back in {time}",
    rewardOf: "Reward of Day {day}",
    claimRewardButton: "Claim Reward",
    rewardClaimedSuccessTitle: "Reward Claimed!",
    rewardClaimedSuccessDescription: "You received: {reward}!",
    rewardClaimErrorTitle: "Claim Error",
    rewardClaimErrorCooldown: "You can claim the next reward tomorrow.",
    rewardClaimErrorGeneric: "Could not claim the reward. Please try again.",
    manageDailyRewardsTitle: "Manage Daily Rewards",
    manageDailyRewardsDescription: "Configure the 30-day reward cycle for all users.",
    editRewardForDay: "Edit Reward for Day {day}",
    rewardTitleLabel: "Reward Title",
    rewardTitlePlaceholder: "E.g., Blessing of the Sun",
    rewardTypeLabel: "Reward Type",
    rewardTypeCredits: "Credits",
    rewardTypeEbook: "Digital Ebook",
    rewardTypeTarotReading: "Tarot Reading",
    rewardValueLabel: "Value (Amount)",
    rewardValuePlaceholder: "E.g., 5",
    rewardIconLabel: "Icon",
    saveRewardButton: "Save Reward",
    savingButton: "Saving...",
    rewardUpdateSuccess: "Reward updated successfully.",
    rewardUpdateError: "Failed to update reward.",
    loadingRewards: "Loading reward cycle...",
    dailyTreasuresTitle: "Discover the Daily Treasures",
    dailyTreasuresSubtitle: "Every day, a new opportunity to win gifts that enrich your spiritual journey.",
    prizeCreditsTitle: "Mystical Credits",
    prizeCreditsDescription: "Accumulate credits to unlock tarot and dream interpretations whenever you need them. Your main currency for wisdom.",
    prizeEbooksTitle: "Exclusive E-books",
    prizeEbooksDescription: "Gain access to e-books on esotericism, tarot guides, and spiritual deepening, written by experts.",
    prizeDigitalTarotTitle: "Digital Tarot",
    prizeDigitalTarotDescription: "Gain access to digital Tarot models, like high-resolution PDFs, ready for you to print and create your own deck.",
    prizePhysicalTarotTitle: "Physical Tarots",
    prizePhysicalTarotDescription: "You can win beautifully illustrated physical tarot decks, sent directly to your home as a special prize.",
    prizeImageAlt: "Prize image: {prizeName}",
    chooseFileButton: 'Upload File',
    noFileChosenText: 'No file chosen',
    rememberMeLabel: 'Remember me',
    dreamDictionaryManagementTitle: 'Dream Dictionary Management',
    dreamDictionaryManagementDescription: 'Manage the content for the dream interpretation AI. The AI will use this as its primary source.',
    selectLetterLabel: 'Select Letter',
    dictionaryContentLabel: 'Content for Letter {letter}',
    dictionaryContentPlaceholder: 'Enter the dictionary content for the letter {letter}...',
    saveDictionaryButton: 'Save Dictionary Entry',
    dictionaryFetchError: 'Could not fetch dictionary entry.',
    dictionarySaveSuccess: 'Successfully saved dictionary for letter {letter}.',
    dictionarySaveError: 'Failed to save dictionary entry.',
    dreamDictionaryInterpretationTitle: "Dream Dictionary Interpretation",
    specialPrizeNoticeTitle: "Special Prize!",
    specialPrizeNoticeDescription: "Complete the 30-day cycle to win a surprise!",
    whatsappMode: "WhatsApp Mode",
    whatsappModeTitle: "WhatsApp Mode",
    whatsappModeDescription: "Activate to receive daily forecasts and interpret your dreams directly through WhatsApp.",
    whatsappEnableLabel: "Enable WhatsApp Mode",
    whatsappEnableDescription: "Receive insights and interact with the oracle via WhatsApp.",
    whatsappPhoneNumberLabel: "Your WhatsApp Number",
    whatsappPhoneNumberDescription: "Enter your number with the country code (e.g., +14155552671).",
    whatsappFrequencyLabel: "Forecast Frequency",
    whatsappFrequencyDescription: "Choose how often you want to receive the 'Daily Forecast'.",
    whatsappFrequency3h: "Every 3 hours",
    whatsappFrequency6h: "Every 6 hours",
    whatsappFrequency9h: "Every 9 hours",
    whatsappFrequencyDaily: "Once a day",
    whatsappFrequencyWeekly: "Once a week",
    whatsappCreditUsageTitle: "Credit Usage",
    whatsappCreditUsageDescription: "Each dream interpretation requested via WhatsApp will consume one credit, just like on the platform.",
    whatsappSettingsSavedTitle: "Settings Saved",
    whatsappSettingsSavedDescription: "Your WhatsApp preferences have been updated.",
    whatsappInvalidPhoneNumber: "Please enter a valid phone number.",
    oghamOracle: "Ogham Oracle",
    oghamOracleDescription: "Vibrate with the frequency of the Sacred Trees and begin your Spiritual Discovery.",
    oghamOracleTitle: "OGHAM Druid Oracle",
    oghamOraclePageTitle: "Ogham Oracle",
    oghamOraclePageDescription: "Connect with the ancient wisdom of the trees. Ask your question and receive guidance from the Ogham oracle.",
    oghamReadingType: "Ogham Reading",
    oghamInterpretationTitle: "Your Ogham Reading",
    getYourOghamReadingButton: "Get Ogham Reading",
    generatingOghamReadingButton: "Generating Reading...",
    lerOghamButton: "Read OGHAM",
    chooseOghamStickLabel: "Choose an Ogham stick to reveal your destiny.",
    oghamConsultingTrees: "Consulting the trees...",
    oghamDoAnotherReading: "Do Another Reading",
    oghamYourChosenLetter: "Your chosen letter: {letter} ({symbol})",
    oghamTreeImageAlt: "Image of the {letter} tree",
    oghamAdviceVisual: "A Visual Sigil for Your Path",
    oghamAdviceImageAlt: "Image representing Merlin's advice",
    oghamMysticalTreeAlt: "Mystical tree",
    yidamsPath: 'Caminho dos Yidams',
    yidamsPathTitle: 'Path of the Yidams',
    yidamsPathDescription: 'Choose a sacred symbol to discover the deity that guides your journey.',
    discoverYourYidamButton: 'Discover your Yidam',
    yidamsPageTitle: 'Path of the Yidams',
    yidamsPageDescription: 'Write your question and choose a sacred symbol to reveal the spiritual deity that resonates with your essence.',
    yidamsBirthDateLabel: 'Your Birth Date',
    yidamsBirthDatePlaceholder: 'DD/MM/YYYY',
    yidamsRevealButton: 'Reveal my Yidam',
    yidamsRevealingButton: 'Revealing...',
    yidamsYourDeityIs: 'Your deity is',
    yidamsMantraLabel: 'Mantra',
    yidamsCharacteristicsLabel: 'Characteristics',
    yidamsImageAlt: 'Image of the Yidam {name}',
    yidamsErrorDate: 'Please enter a valid birth date.',
    yidamsErrorGenerating: 'An error occurred while revealing your Yidam.',
    yidamsSuccessToast: 'Your Yidam has been revealed!',
    dreamDictionaryTitle: 'Dicionário de Sonhos',
    searchInDictionaryLabel: 'Buscar palavra',
    searchInDictionaryPlaceholder: 'Buscar na letra {letter}...',
    noResultsFoundForQuery: 'Nenhum resultado para "{query}".',
    mesaRealTitle: "Mesa Real Online",
    mesaRealDescription: "Todas as áreas da sua vida reveladas no Baralho Cigano de 36 cartas.",
  },
  'pt-BR': {
    mysticInsights: 'Coruja Mística',
    authLayoutSubtitle: 'Desvende os segredos do seu caminho com interpretações de Tarot e Sonhos por IA.',
    loadingMysticalSpace: 'Carregando seu espaço místico...',
    language: 'Idioma',
    toggleTheme: 'Alternar tema',
    profile: 'Perfil',
    dashboard: 'Painel',
    newReading: 'Nova Leitura',
    dreamInterpretation: 'Interpretar Sonho',
    credits: 'Créditos',
    logout: 'Sair',
    footerText: '© {year} Coruja Mística. Todos os direitos reservados.',
    adminPanel: 'Painel Admin',
    login: 'Entrar',
    signUp: 'Cadastrar',
    loginTitle: 'Bem-vindo(a) de Volta',
    loginDescription: 'Insira suas credenciais para acessar seu painel místico.',
    emailLabel: 'E-mail',
    passwordLabel: 'Senha',
    loginButton: 'Entrar',
    dontHaveAccount: 'Não tem uma conta?',
    signUpLink: 'Cadastre-se aqui',
    loginSuccessTitle: 'Login Bem-sucedido',
    loginSuccessDescription: 'Bem-vindo(a) de volta à Coruja Mística!',
    loginFailedTitle: 'Falha no Login',
    genericErrorDescription: 'Ocorreu um erro inesperado. Por favor, tente novamente.',
    createAccountTitle: 'Crie Sua Conta',
    createAccountDescription: 'Junte-se à Coruja Mística e comece sua jornada de descobertas.',
    fullNameLabel: 'Nome Completo',
    yourNamePlaceholder: 'Seu Nome',
    signUpButton: 'Cadastrar',
    alreadyHaveAccount: 'Já tem uma conta?',
    loginLink: 'Entre aqui',
    signupSuccessTitle: 'Conta Criada!',
    signupSuccessDescription: 'Tudo pronto! Redirecionando para o seu painel...',
    emailAlreadyInUseErrorDescription: 'Este e-mail já está em uso. Por favor, tente outro ou faça login.',
    signupFailedTitle: 'Falha no Cadastro',
    pleaseLoginToViewProfile: 'Por favor, faça login para ver seu perfil.',
    yourProfileTitle: 'Seu Perfil',
    yourProfileDescription: 'Gerencie os detalhes da sua conta.',
    displayNameLabel: 'Nome de Exibição',
    emailAddressLabel: 'Endereço de E-mail',
    emailChangeNotice: 'O endereço de e-mail não pode ser alterado aqui.',
    saveChangesButton: 'Salvar Alterações',
    cancelButton: 'Cancelar',
    editProfileButton: 'Editar Perfil',
    profileUpdatedTitle: 'Perfil Atualizado',
    profileUpdatedDescription: 'Os detalhes do seu perfil foram salvos.',
    updateFailedTitle: 'Falha na Atualização',
    updateFailedDescription: 'Não foi possível atualizar seu perfil. Por favor, tente novamente.',
    welcomeMessage: 'Bem-vindo(a), {name}!',
    dashboardSubtitle: 'Seu espaço pessoal para exploração mística e insights.',
    newReadingCardTitle: 'Nova Leitura de Cartas',
    newReadingCardDescription: 'Envie sua tiragem de cartas e faça sua pergunta ao oráculo.',
    startNewReadingButton: 'Iniciar Nova Leitura',
    dreamInterpretationCardDescription: 'Descubra as mensagens ocultas em seus sonhos.',
    interpretDreamButton: 'Interpretar Sonho',
    yourCreditsCardTitle: 'Seus Créditos',
    creditsRemaining: 'créditos restantes para desvendar insights.',
    purchaseMoreCreditsButton: 'Comprar Mais Créditos',
    dailyGiftTitle: 'Presente Diário',
    claimYourDailyGift: 'Resgate seus {count} créditos diários grátis!',
    dailyGiftClaimed: 'Presente diário resgatado.',
    nextGiftIn: 'Próximo presente em: {time}',
    comeBackTomorrow: 'Volte amanhã para mais!',
    claimingButton: 'Resgatando...',
    claimNowButton: 'Resgatar Agora',
    dailyGiftSuccessToastTitle: 'Presente Resgatado!',
    dailyGiftSuccessToastDescription: 'Você recebeu {count} créditos grátis!',
    dailyGiftErrorToastTitle: 'Erro no Presente',
    dailyGiftCooldownError: 'Você poderá resgatar seu próximo presente em {time}.',
    dailyGiftGenericError: 'Não foi possível resgatar o presente diário. Tente novamente mais tarde.',
    recentReadingsTitle: 'Leituras Recentes',
    noRecentReadings: 'Nenhuma leitura recente encontrada.',
    noRecentReadingsPrompt_start: 'Inicie uma',
    noRecentReadingsPrompt_link: 'nova leitura',
    noRecentReadingsPrompt_end: 'ou interprete um sonho para ver seus insights aqui.',
    viewReadingButton: 'Ver',
    tarotReadingType: 'Leitura de Tarot',
    dreamInterpretationType: 'Interpretação de Sonho',
    discoverYourPathTitle: 'Desvende seu Destino',
    discoverYourPathDescription: 'Deixe as cartas e estrelas guiarem sua jornada. Nossas interpretações por IA oferecem uma visão moderna da sabedoria ancestral.',
    defaultSeekerName: 'Consulente',
    authErrorTitle: 'Erro de Autenticação',
    mustBeLoggedInToInterpret: 'Você precisa estar logado para interpretar um sonho.',
    insufficientCreditsTitle: 'Créditos Insuficientes',
    insufficientCreditsForDreamDescription: 'Você precisa de pelo menos 1 crédito para interpretar um sonho. Por favor, compre mais.',
    noDreamErrorTitle: 'Nenhum Sonho Fornecido',
    noDreamErrorDescription: 'Por favor, descreva seu sonho para obter uma interpretação.',
    dreamDescriptionTooShortError: 'A descrição do sonho deve ter pelo menos 10 caracteres.',
    creditDeductionFailedError: 'Falha ao deduzir crédito. Por favor, tente novamente.',
    dreamInterpretationReadyTitle: 'Interpretação Pronta!',
    dreamInterpretationReadyDescription: 'Sua interpretação de sonho foi gerada.',
    errorGeneratingInterpretationDescription: 'Ocorreu um erro ao gerar a interpretação.',
    errorGenericTitle: 'Ocorreu um Erro',
    errorOccurredCardTitle: 'Erro',
    yourPropheticInterpretationTitle: 'Sua Interpretação Profética',
    dreamInterpretationTitle: 'Dicionário de Sonhos',
    dreamInterpretationDescription: 'Descreva seu sonho e deixe o Profeta desvendar seu significado.',
    creditsAvailable: '({count} créditos disponíveis)',
    yourDreamLabel: 'Seu Sonho',
    dreamPlaceholder: 'Ontem à noite sonhei com uma serpente voadora sobre um mar calmo...',
    generatingDreamInterpretationButton: 'Gerando Interpretação...',
    getDreamInterpretationButton: 'Obter Interpretação',
    dreamIllustrationAlt: 'Ilustração do sonho {number}',
    mustBeLoggedInToRead: 'Você precisa estar logado para solicitar uma leitura.',
    insufficientCreditsDescription: 'Você precisa de pelo menos 1 crédito para uma leitura. Por favor, compre mais.',
    noImageErrorTitle: 'Nenhuma Imagem Selecionada',
    noImageErrorDescription: 'Por favor, envie uma imagem da sua tiragem de cartas.',
    noQueryErrorTitle: 'Nenhuma Pergunta Feita',
    noQueryErrorDescription: 'Por favor, insira sua pergunta para o oráculo.',
    interpretationReadyTitle: 'Interpretação Pronta!',
    interpretationReadyDescription: 'Sua interpretação da leitura de cartas foi gerada.',
    newCardReadingTitle: 'Nova Leitura de Cartas',
    newCardReadingDescription: 'Envie sua tiragem, faça sua pergunta e receba uma interpretação mística.',
    uploadCardSpreadImageLabel: 'Enviar Imagem da Tiragem',
    cardSpreadPreviewAlt: 'Prévia da tiragem de cartas',
    yourQuestionLabel: 'Sua Pergunta',
    questionPlaceholder: 'O que as cartas dizem sobre meu caminho atual?',
    generatingInterpretationButton: 'Gerando Interpretação...',
    getYourReadingButton: 'Obter Sua Leitura',
    yourMysticalInterpretationTitle: 'Sua Interpretação Mística',
    yourVisualBlessingTitle: 'Sua Bênção Visual',
    summaryImageAlt: 'Imagem resumo gerada por IA para sua leitura',
    imageTooLargeTitle: "Imagem Muito Grande",
    imageTooLargeDescription: "Por favor, envie uma imagem menor que 2MB.",
    changeProfilePictureLabel: 'Alterar foto de perfil',
    tarotReadingDetailsTitle: "Detalhes da Leitura de Tarot",
    dreamInterpretationDetailsTitle: "Detalhes da Interpretação de Sonho",
    readingPerformedOn: "Leitura realizada em: {date}",
    cardSpreadImageTitle: "Sua Tiragem de Cartas",
    interpretationTitle: "Interpretação",
    readingNotFoundError: "A leitura solicitada não foi encontrada.",
    errorFetchingReading: "Ocorreu um erro ao buscar sua leitura.",
    mustBeLoggedInToViewReading: "Você precisa estar logado para ver esta leitura.",
    backToDashboardButton: "Voltar ao Painel",
    readingNotFound: "Leitura não encontrada.",
    timestampProcessing: "Processando data...",
    landingTitle: "Desvende seu Destino",
    landingSubtitle: "",
    landingButton: "Iniciar sua Jornada",
    howItWorksTitle: "Como Funciona",
    howItWorksSubtitle: "Passos simples para seus insights místicos personalizados.",
    howItWorksUploadTitle: "1. Envie Suas Cartas",
    howItWorksUploadDescription: "Tire uma foto nítida da sua tiragem de Tarot ou Baralho Cigano.",
    howItWorksQueryTitle: "2. Faça Sua Pergunta",
    howItWorksQueryDescription: "Formule sua dúvida ou descreva o contexto para a leitura.",
    howItWorksRevealTitle: "3. Receba Seu Insight",
    howItWorksRevealDescription: "Nosso oráculo de IA fornece uma interpretação detalhada e personalizada.",
    discoverMagicTitle: "Descubra a Magia",
    discoverMagicSubtitle: "Experimente a combinação única de sabedoria ancestral e tecnologia moderna.",
    benefitAITitle: "Sabedoria por IA",
    benefitAIDescription: "Utilizando IA avançada treinada por místicos experientes para fornecer interpretações profundas.",
    benefitPersonalizationTitle: "Verdadeiramente Pessoal",
    benefitPersonalizationDescription: "Interpretações adaptadas à sua tiragem de cartas e pergunta específica.",
    benefitGuidanceTitle: "Orientação Espiritual",
    benefitGuidanceDescription: "Ganhe clareza e direção para seu caminho de vida, relacionamentos e decisões.",
    testimonialsTitle: "Palavras de Nossos Consulentes",
    testimonialsSubtitle: "Veja o que outros descobriram em sua jornada com a Coruja Mística.",
    testimonial1Quote: "A interpretação da IA foi incrivelmente precisa e perspicaz. Parecia que eu estava falando com uma cartomante de verdade!",
    testimonial1Name: "Juliana S.",
    testimonial1Role: "Buscadora Espiritual",
    testimonial2Quote: "Eu estava cético no início, mas a análise do sonho foi certeira e me ajudou a entender um sonho recorrente.",
    testimonial2Name: "Ricardo M.",
    testimonial2Role: "Explorador Curioso",
    mysticalGalleryTitle: "Visões Místicas",
    mysticalGallerySubtitle: "Mergulhe nas imagens simbólicas que inspiram nosso oráculo.",
    finalCTATitle: "Pronto para Iluminar Seu Caminho?",
    finalCTASubtitle: "Junte-se a milhares de consulentes que encontraram clareza e orientação. Seus primeiros insights o aguardam.",
    finalCTAButton: "Crie Sua Conta Agora",
    landingImageAlt: "Mulher mística com efeito de fumaça, representando o oráculo",
    gifPlaceholderAlt: "GIF animado místico",
    adminDashboardTitle: 'Painel do Administrador',
    adminDashboardDescription: 'Gerenciar usuários, créditos e configurações do aplicativo.',
    usersTableTitle: 'Gerenciamento de Usuários',
    noUsersFound: 'Nenhum usuário encontrado no reino místico ainda.',
    userName: 'Nome',
    userEmail: 'E-mail',
    userRole: 'Função',
    userCredits: 'Créditos',
    userActions: 'Ações',
    roleAdmin: 'Admin',
    roleUser: 'Usuário',
    creditsCouldNotBeFetched: 'N/D',
    addCreditsButton: 'Créditos',
    addCreditsModalTitle: 'Adicionar Créditos',
    manageUserLabel: 'Usuário',
    creditsAmountLabel: 'Quantidade',
    addCreditsSubmitButton: 'Adicionar Créditos',
    deleteUserButton: 'Excluir',
    confirmDeleteUserTitle: 'Confirmar Exclusão',
    confirmDeleteUserDescription: 'Tem certeza de que deseja remover todos os dados de {email}? Esta ação não pode ser desfeita.',
    fetchingUsers: 'Buscando usuários no plano astral...',
    promptManagementTitle: 'Gerenciamento de Prompts da IA',
    promptEditingDisclaimer: 'Cuidado: Editar esses prompts afeta diretamente as respostas da IA. Certifique-se de entender a estrutura do prompt.',
    cardReadingPromptLabel: 'Prompt Leitura de Cartas (analyzeCardReading)',
    dreamInterpretationPromptLabel: 'Prompt Interpretação de Sonhos (interpretDream)',
    savePromptButton: 'Salvar Prompt',
    addCreditsSuccessToast: '{count} créditos adicionados a {email}.',
    addCreditsErrorToast: 'Falha ao adicionar créditos para {email}.',
    deleteUserSuccessToast: 'Dados do usuário {email} foram removidos.',
    deleteUserErrorToast: 'Falha ao remover dados do usuário {email}.',
    promptSaveSuccess: 'Prompt da IA salvo com sucesso.',
    promptSaveError: 'Falha ao salvar o prompt da IA.',
    promptLoadError: 'Não foi possível carregar os prompts da IA.',
    purchaseCreditsTitle: 'Comprar Créditos',
    purchaseCreditsDescription: 'Desvende insights mais profundos e continue sua jornada mística comprando créditos adicionais. Cada crédito permite uma interpretação poderosa.',
    freeTrialPack: "Teste Grátis",
    freeTrialPackDescription: "Uma amostra do místico para novos consulentes.",
    seekersPack: "Pacote do Buscador",
    seekersPackDescription: "Perfeito para algumas leituras perspicazes.",
    oraclesBundle: "Combo do Oráculo",
    oraclesBundleDescription: "Nossa escolha mais popular para orientação contínua.",
    mysticsTrove: "Tesouro do Místico",
    mysticsTroveDescription: "Para o buscador dedicado de sabedoria.",
    popularBadge: "POPULAR",
    creditsUnit: "Créditos",
    getItNowButton: "Obter Agora!",
    purchaseNowButton: "Comprar Agora",
    securePaymentsTitle: "Pagamentos Seguros e Criptografados",
    securePaymentsDescription: "Suas transações são protegidas com os mais altos padrões de segurança. Aceitamos os principais cartões de crédito e PayPal.",
    purchaseInitiatedToast: "Compra do pacote ID {packageId} iniciada (Simulação).",
    freeCreditClaimedToast: "{count} crédito(s) grátis resgatados com sucesso!",
    freeCreditAlreadyClaimedToast: "Você já resgatou seus créditos de teste gratuitos deste mês.",
    freeCreditClaimFailedToast: "Falha ao resgatar crédito gratuito. Tente novamente mais tarde.",
    ourOraclesTitle: "Nossos Oráculos",
    ourOraclesSubtitle: "Explore a sabedoria das Cartas, Sonhos, Ogham e Yidams.",
    missionIntuitionTitle: 'Seu Tarôt',
    missionIntuitionDescription: 'Carregue sua tiragem de tarô para obter a interpretação mística.',
    missionPrecisionTitle: 'Interpretação de Sonhos',
    missionPrecisionDescription: 'descreva seu sonho detalhado para obter interpretação profética',
    missionConnectionTitle: 'Conexão da Alma', // Corrigido
    freeCreditAlreadyClaimedButton: "Já Resgatado",
    satisfiedClientsLabel: "Clientes Satisfeitos",
    orSeparator: "OU",
    dailyRewardsTitle: "Calendário de Recompensas",
    dailyRewardsSubtitle: "Resgate seu prêmio todos os dias para avançar na trilha!",
    dayLabel: "Dia {day}",
    claimedStatus: "Resgatado",
    claimStatus: "Resgatar",
    lockedStatus: "Bloqueado",
    rewardTrack: "Trilha de Recompensas",
    comeBackIn: "Volte em {time}",
    rewardOf: "Recompensa do Dia {day}",
    claimRewardButton: "Resgatar Recompensa",
    rewardClaimedSuccessTitle: "Recompensa Resgatada!",
    rewardClaimedSuccessDescription: "Você recebeu: {reward}!",
    rewardClaimErrorTitle: "Erro ao Resgatar",
    rewardClaimErrorCooldown: "Você poderá resgatar a próxima recompensa amanhã.",
    rewardClaimErrorGeneric: "Não foi possível resgatar a recompensa. Tente novamente.",
    manageDailyRewardsTitle: "Gerenciar Recompensas Diárias",
    manageDailyRewardsDescription: "Configure o ciclo de 30 dias de recompensas para todos os usuários.",
    editRewardForDay: "Editar Recompensa do Dia {day}",
    rewardTitleLabel: "Título da Recompensa",
    rewardTitlePlaceholder: "Ex: Bênção do Sol",
    rewardTypeLabel: "Tipo de Recompensa",
    rewardTypeCredits: "Créditos",
    rewardTypeEbook: "Ebook Digital",
    rewardTypeTarotReading: "Leitura de Tarot",
    rewardValueLabel: "Valor (Quantidade)",
    rewardValuePlaceholder: "Ex: 5",
    rewardIconLabel: "Ícone",
    saveRewardButton: "Salvar Recompensa",
    savingButton: "Salvando...",
    rewardUpdateSuccess: "Recompensa atualizada com sucesso.",
    rewardUpdateError: "Falha ao atualizar a recompensa.",
    loadingRewards: "Carregando ciclo de recompensas...",
    dailyTreasuresTitle: "Descubra os Tesouros Diários",
    dailyTreasuresSubtitle: "A cada dia, uma nova oportunidade de ganhar presentes que enriquecem sua jornada espiritual.",
    prizeCreditsTitle: "Créditos Místicos",
    prizeCreditsDescription: "Acumule créditos para desvendar interpretações de tarô e sonhos sempre que precisar. Sua principal moeda para a sabedoria.",
    prizeEbooksTitle: "E-books Exclusivos",
    prizeEbooksDescription: "Ganhe acesso a e-books sobre esoterismo, guias de tarô e aprofundamentos espirituais, escritos por especialistas.",
    prizeDigitalTarotTitle: "Tarot Digital",
    prizeDigitalTarotDescription: "Ganhe acesso a modelos de Tarô em formato digital, como PDFs de alta resolução, prontos para você imprimir e montar seu próprio baralho.",
    prizePhysicalTarotTitle: "Tarôs Físicos",
    prizePhysicalTarotDescription: "Você poderá ganhar baralhos de tarô físicos, belamente ilustrados, enviados diretamente para sua casa como um prêmio especial.",
    prizeImageAlt: "Imagem do prêmio: {prizeName}",
    chooseFileButton: 'Carregar Arquivo',
    noFileChosenText: 'Nenhum arquivo escolhido',
    rememberMeLabel: 'Lembrar-me',
    dreamDictionaryManagementTitle: 'Gerenciador do Dicionário de Sonhos',
    dreamDictionaryManagementDescription: 'Gerencie o conteúdo para a IA de interpretação de sonhos. A IA usará isso como sua fonte primária.',
    selectLetterLabel: 'Selecione a Letra',
    dictionaryContentLabel: 'Conteúdo para a Letra {letter}',
    dictionaryContentPlaceholder: 'Insira o conteúdo do dicionário para a letra {letter}...',
    saveDictionaryButton: 'Salvar Dicionário',
    dictionaryFetchError: 'Não foi possível buscar a entrada do dicionário.',
    dictionarySaveSuccess: 'Dicionário para a letra {letter} salvo com sucesso.',
    dictionarySaveError: 'Falha ao salvar a entrada do dicionário.',
    dreamDictionaryInterpretationTitle: "Interpretação do Livro dos Sonhos",
    specialPrizeNoticeTitle: "Prêmio Especial!",
    specialPrizeNoticeDescription: "Complete o ciclo de 30 dias para ganhar uma surpresa!",
    whatsappMode: "Modo WhatsApp",
    whatsappModeTitle: "Modo WhatsApp",
    whatsappModeDescription: "Ative para receber previsões diárias e interpretar seus sonhos diretamente pelo WhatsApp.",
    whatsappEnableLabel: "Ativar Modo WhatsApp",
    whatsappEnableDescription: "Receba insights e interaja com o oráculo via WhatsApp.",
    whatsappPhoneNumberLabel: "Seu número de WhatsApp",
    whatsappPhoneNumberDescription: "Insira seu número com o código do país (ex: +5511999998888).",
    whatsappFrequencyLabel: "Frequência das Previsões",
    whatsappFrequencyDescription: "Escolha com que frequência deseja receber a 'Previsão do dia'.",
    whatsappFrequency3h: "A cada 3 horas",
    whatsappFrequency6h: "A cada 6 horas",
    whatsappFrequency9h: "A cada 9 horas",
    whatsappFrequencyDaily: "Uma vez por dia",
    whatsappFrequencyWeekly: "Uma vez por semana",
    whatsappCreditUsageTitle: "Uso de Créditos",
    whatsappCreditUsageDescription: "Cada interpretação de sonho solicitada pelo WhatsApp consumirá um crédito, assim como na plataforma.",
    whatsappSettingsSavedTitle: "Configurações Salvas",
    whatsappSettingsSavedDescription: "Suas preferências do WhatsApp foram atualizadas.",
    whatsappInvalidPhoneNumber: "Por favor, insira um número de telefone válido.",
    oghamOracle: "Oráculo de Ogham",
    oghamOracleDescription: "Vibre na frequência das Árvores Sagradas e inicie sua Descoberta Espiritual.",
    oghamOracleTitle: "OGHAM Oráculo Druída",
    oghamOraclePageTitle: "Oráculo de Ogham",
    oghamOraclePageDescription: "Conecte-se com a sabedoria ancestral das árvores. Faça sua pergunta e receba orientação do oráculo Ogham.",
    oghamReadingType: "Leitura de Ogham",
    oghamInterpretationTitle: "Sua Leitura Ogham",
    getYourOghamReadingButton: "Receber Leitura Ogham",
    generatingOghamReadingButton: "Gerando Leitura...",
    lerOghamButton: "Ler OGHAM",
    chooseOghamStickLabel: "Escolha um galho de Ogham para revelar seu destino.",
    oghamConsultingTrees: "Consultando as árvores...",
    oghamDoAnotherReading: "Fazer Outra Leitura",
    oghamYourChosenLetter: "Sua letra sorteada: {letter} ({symbol})",
    oghamTreeImageAlt: "Imagem da árvore {letter}",
    oghamAdviceVisual: "Um Sigilo Visual para seu Caminho",
    oghamAdviceImageAlt: "Imagem representando o conselho de Merlin",
    oghamMysticalTreeAlt: "Árvore mística",
    yidamsPath: 'Caminho dos Yidams',
    yidamsPathTitle: 'Caminho dos Yidams',
    yidamsPathDescription: 'Escolha um símbolo sagrado para descobrir a divindade que guia sua jornada.',
    discoverYourYidamButton: 'Descobrir seu Yidam',
    yidamsPageTitle: 'Caminho dos Yidams',
    yidamsPageDescription: 'Escreva sua pergunta e escolha um símbolo sagrado para revelar a divindade espiritual que ressoa com sua essência.',
    yidamsBirthDateLabel: 'Sua Data de Nascimento',
    yidamsBirthDatePlaceholder: 'DD/MM/AAAA',
    yidamsRevealButton: 'Revelar meu Yidam',
    yidamsRevealingButton: 'Revelando...',
    yidamsYourDeityIs: 'Sua divindade é',
    yidamsMantraLabel: 'Mantra',
    yidamsCharacteristicsLabel: 'Características',
    yidamsImageAlt: 'Imagem do Yidam {name}',
    yidamsErrorDate: 'Por favor, insira uma data de nascimento válida.',
    yidamsErrorGenerating: 'Ocorreu um erro ao revelar seu Yidam.',
    yidamsSuccessToast: 'Seu Yidam foi revelado!',
    dreamDictionaryTitle: 'Dicionário de Sonhos',
    searchInDictionaryLabel: 'Buscar palavra',
    searchInDictionaryPlaceholder: 'Buscar na letra {letter}...',
    noResultsFoundForQuery: 'Nenhum resultado para "{query}".',
    mesaRealTitle: "Mesa Real Online",
    mesaRealDescription: "Todas as áreas da sua vida reveladas no Baralho Cigano de 36 cartas.",
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocaleState] = useState<Locale>('pt-BR');
  const [currentTranslations, setCurrentTranslations] = useState<Record<TranslationKey, string>>(() => translationsData['pt-BR']);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    let initialLocale: Locale = 'pt-BR';
    const storedLocale = typeof window !== 'undefined' ? localStorage.getItem('locale') as Locale | null : null;

    if (storedLocale && translationsData[storedLocale]) {
      initialLocale = storedLocale;
    } else if (typeof navigator !== 'undefined') {
      const browserLang = navigator.language.slice(0, 2); // Get 'en' from 'en-US'
      if (browserLang === 'en' && translationsData.hasOwnProperty('en')) {
        initialLocale = 'en';
      }
    }
    
    setLocaleState(initialLocale);
    setCurrentTranslations(translationsData[initialLocale]);
    setIsInitialized(true);
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    if (translationsData[newLocale]) {
      setLocaleState(newLocale);
      setCurrentTranslations(translationsData[newLocale]);
      if (typeof window !== 'undefined') {
        localStorage.setItem('locale', newLocale);
      }
    }
  }, []);

  const t = useCallback((key: TranslationKey, params?: Record<string, string | number>): string => {
    if (!isInitialized && typeof window !== 'undefined') { 
        const storedLocale = localStorage.getItem('locale') as Locale | null;
        const initialLoadLocale = storedLocale && translationsData[storedLocale] ? storedLocale : 'pt-BR';
        let fallbackTranslation = translationsData[initialLoadLocale]?.[key] || key;
        if (params) {
            Object.keys(params).forEach(paramKey => {
                fallbackTranslation = fallbackTranslation.replace(`{${paramKey}}`, String(params[paramKey]));
            });
        }
        return fallbackTranslation;
    }
    
    let translation = currentTranslations[key] || key;
    if (params) {
      Object.keys(params).forEach(paramKey => {
        translation = translation.replace(`{${paramKey}}`, String(params[paramKey]));
      });
    }
    return translation;
  }, [currentTranslations, isInitialized]);

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
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

    


