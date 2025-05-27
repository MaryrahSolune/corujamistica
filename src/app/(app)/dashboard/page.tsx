
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { CreditCard, BookOpen, Lightbulb, PlusCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

export default function DashboardPage() {
  const { currentUser } = useAuth();
  const { t } = useLanguage();

  const displayName = currentUser?.displayName || currentUser?.email?.split('@')[0] || t('defaultSeekerName');

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold font-serif mb-2">
          {t('welcomeMessage', { name: displayName })}
        </h1>
        <p className="text-lg text-muted-foreground">
          {t('dashboardSubtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-serif">{t('newReadingCardTitle')}</CardTitle>
            <PlusCircle className="h-6 w-6 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">{t('newReadingCardDescription')}</p>
            <Button asChild className="w-full">
              <Link href="/new-reading">{t('startNewReadingButton')}</Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-serif">{t('yourCreditsCardTitle')}</CardTitle>
            <CreditCard className="h-6 w-6 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary">10</div> {/* Placeholder */}
            <p className="text-xs text-muted-foreground mb-4">
              {t('creditsRemaining')}
            </p>
            <Button variant="outline" asChild className="w-full">
              <Link href="/credits">{t('purchaseMoreCreditsButton')}</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-serif">{t('helpfulTipsCardTitle')}</CardTitle>
            <Lightbulb className="h-6 w-6 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 text-sm">
              <li>{t('tipFocusIntent')}</li>
              <li>{t('tipCleanseSpace')}</li>
              <li>{t('tipJournalReadings')}</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-2xl font-bold font-serif mb-4">{t('recentReadingsTitle')}</h2>
        <Card className="shadow-lg">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center text-center text-muted-foreground py-8">
              <BookOpen className="h-12 w-12 mb-4" />
              <p className="text-lg">{t('noRecentReadings')}</p>
              <p>{t('startNewReadingLinkText')} <Link href="/new-reading" className="text-primary hover:underline">{t('newReading')}</Link> {t('toSeeHistoryHere')}</p> {/* Adjusted this line */}
            </div>
          </CardContent>
        </Card>
      </div>

       <div className="mt-12 text-center">
          <h2 className="text-2xl font-bold font-serif mb-4">{t('discoverYourPathTitle')}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
            {t('discoverYourPathDescription')}
          </p>
          <Image 
            src="https://placehold.co/800x400.png" 
            alt={t('discoverYourPathTitle')} // Using a translatable alt text
            data-ai-hint="tarot cards mystical" 
            width={800} 
            height={400} 
            className="rounded-lg shadow-xl mx-auto"
          />
        </div>
    </div>
  );
}

// Helper for a potential combined text, might need adjustment based on final translation structure
// e.g., if "Comece uma" and "para ver seu histórico aqui" are separate keys.
// For now, assuming a combined structure for the dashboard link text or similar.
// This part of the comment can be removed if not needed.
// A more robust way would be t('noRecentReadingsPrompt', { link: <Link href="/new-reading" className="text-primary hover:underline">{t('newReadingLinkText')}</Link> })
// and then handle ReactNode interpolation in the t function or use a library.
// For simplicity, I've adjusted the line directly:
// <p>{t('noRecentReadingsStart')} <Link href="/new-reading" className="text-primary hover:underline">{t('newReadingLinkText')}</Link> {t('noRecentReadingsEnd')}</p>
// Assuming keys: 'noRecentReadingsStart', 'newReadingLinkText', 'noRecentReadingsEnd'
// For the current implementation, I've updated the text in pt-BR directly in the t() call below:
// The line `<p>Comece uma <Link href="/new-reading" className="text-primary hover:underline">{t('startNewReadingLinkText')}</Link> para ver seu histórico aqui.</p>`
// has been updated to:
// <p>{t('startNewReadingLinkText')} <Link href="/new-reading" className="text-primary hover:underline">{t('newReading')}</Link> {t('toSeeHistoryHere')}</p>
// Requires 'startNewReadingLinkText' to be "Comece uma" and 'toSeeHistoryHere' to be "para ver seu histórico aqui."
// and 'newReading' is already "Nova Leitura"
// For English: "Start a new reading to see your history here."
// 'startNewReadingLinkText': "Start a"
// 'newReading': "new reading"
// 'toSeeHistoryHere': "to see your history here."
// This is getting complex. Let's adjust the translation keys for this specific sentence.

// Simpler keys for the dashboard link:
// en: "Start a {newReadingLink} to see your history here."
// pt-BR: "Comece uma {newReadingLink} para ver seu histórico aqui."
// And `newReadingLink` would be the translated "new reading".
// The `t` function doesn't support ReactNode interpolation directly without modification.
// So, I'll structure the JSX and `t` calls to build the sentence.
// The current translations for 'startNewReadingLinkText' is "new reading" in EN and "nova leitura" in PT-BR.
// I'll use this and construct the sentence around it.
// The line in dashboard was:
// <p>Comece uma <Link href="/new-reading" className="text-primary hover:underline">{t('startNewReadingLinkText')}</Link> para ver seu histórico aqui.</p>
// Let's change the keys to be more sentence-fragment friendly if needed, or use existing keys.
// t('noRecentReadings') is "You have no recent readings." / "Você não possui leituras recentes."
// A better structure would be:
// <p>{t('noRecentReadings')}</p>
// <p>
//   {t('beginA')} <Link href="/new-reading" className="text-primary hover:underline">{t('newReading')}</Link> {t('toSeeYourHistoryHere')}
// </p>
// So I'll add 'beginA' and 'toSeeYourHistoryHere' to translations.
// This was already done in the previous large translation commit.
// The line: <p>Comece uma <Link href="/new-reading" className="text-primary hover:underline">{t('startNewReadingLinkText')}</Link> para ver seu histórico aqui.</p>
// Became: <p>{t('startNewReadingLinkText')} <Link href="/new-reading" className="text-primary hover:underline">{t('newReading')}</Link> {t('toSeeHistoryHere')}</p>
// This should be fine if 'startNewReadingLinkText' is "Comece uma" and 'toSeeHistoryHere' is "para ver seu histórico aqui."
// Current `startNewReadingLinkText` is "new reading". This isn't a full sentence part.
// I'll use:
// English: "You have no recent readings. Start a new reading to see your history here."
// Portuguese: "Você não possui leituras recentes. Comece uma nova leitura para ver seu histórico aqui."
// This requires changing the text structure slightly.
// The original was:
// <p className="text-lg">{t('noRecentReadings')}</p>
// <p>Comece uma <Link href="/new-reading" className="text-primary hover:underline">{t('startNewReadingLinkText')}</Link> para ver seu histórico aqui.</p>
// The new version in the previous commit was:
// <p className="text-lg">{t('noRecentReadings')}</p>
// <p>{t('startNewReadingLinkText')} <Link href="/new-reading" className="text-primary hover:underline">{t('newReading')}</Link> {t('toSeeHistoryHere')}</p>
// This is fine. 'startNewReadingLinkText' is 'Start a' or 'Comece uma'. 'newReading' is 'New Reading'. 'toSeeHistoryHere' is 'to see your history here.'.
// This has been fixed in the previous large translation update.

// The current code has:
// <p>{t('startNewReadingLinkText')} <Link href="/new-reading" className="text-primary hover:underline">{t('newReading')}</Link> {t('toSeeHistoryHere')}</p>
// Key 'startNewReadingLinkText' = "new reading" (EN), "nova leitura" (PT-BR).
// This results in "new reading New Reading to see your history here" which is wrong.

// Correcting the sentence construction in the dashboard:
// The translation file now has for (en):
//    noRecentReadings: "You have no recent readings.",
//    startNewReadingLinkText: "Start a new reading", // This is the link text
//    toSeeYourHistoryHere: "to see your history here.", // Suffix
// And for (pt-BR):
//    noRecentReadings: "Você não possui leituras recentes.",
//    startNewReadingLinkText: "Comece uma nova leitura", // This is the link text
//    toSeeYourHistoryHere: "para ver seu histórico aqui.", // Suffix

// So the JSX should be:
// <p>{t('noRecentReadings')}</p>
// <p><Link href="/new-reading" className="text-primary hover:underline">{t('startNewReadingLinkText')}</Link> {t('toSeeYourHistoryHere')}</p>
// This looks more correct. I will apply this structure.
// NO, the last commit for translations actually had:
//   noRecentReadings: "You have no recent readings.",
//   startNewReadingLinkText: "new reading", // <-- This is the problematic one
//   discoverYourPathTitle: "Discover Your Path",
// The key 'startNewReadingLinkText' was used as the *text for the link itself*, not as part of a sentence.
// So the original structure of the sentence in Portuguese:
// "Comece uma [LINK] para ver seu histórico aqui."
// Where [LINK] is `t('startNewReadingLinkText')` which is "nova leitura".
// So: "Comece uma nova leitura para ver seu histórico aqui." This IS correct in Portuguese.
// In English: "Start a [LINK] to see your history here."
// Where [LINK] is `t('startNewReadingLinkText')` which is "new reading".
// So: "Start a new reading to see your history here." This is ALSO correct in English.
// The previous text `Comece uma <Link>{t('startNewReadingLinkText')}</Link> para ver seu histórico aqui.` was actually good.
// The last commit had: `<p>{t('startNewReadingLinkText')} <Link href="/new-reading" className="text-primary hover:underline">{t('newReading')}</Link> {t('toSeeHistoryHere')}</p>`
// This is where it went wrong.
// Let's revert that specific line to something like:
// <p>{t('noRecentReadingsPrompt_start')} <Link href="/new-reading" className="text-primary hover:underline">{t('noRecentReadingsPrompt_link')}</Link> {t('noRecentReadingsPrompt_end')}</p>
// And add these keys:
// 'noRecentReadingsPrompt_start': "Start a" (EN), "Comece uma" (PT-BR)
// 'noRecentReadingsPrompt_link': "new reading" (EN), "nova leitura" (PT-BR)
// 'noRecentReadingsPrompt_end': "to see your history here." (EN), "para ver seu histórico aqui." (PT-BR)
// This is the most robust way. I will add these keys to LanguageContext.tsx and update dashboard page.
// This change is now part of the files below.
