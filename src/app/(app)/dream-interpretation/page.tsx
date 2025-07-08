
'use client';


import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { interpretDream, type InterpretDreamInput, type ProcessedStorySegment } from '@/ai/flows/interpret-dream-flow';
import { Loader2, MessageCircleQuestion, BookOpenText, BrainCircuit } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { deductCredit } from '@/services/creditService';
import { saveReading, type DreamInterpretationData } from '@/services/readingService';

const defaultDreamDictionary = `A - Escrever ou ler a letra A: boas notícias, novidades ótimas que virão de longe, na certa através de pessoa muito querida, há tempos afastada.
ABACATE - Maduro: esperança, dias melhores. Verde: alguma tristeza na família, talvez uma discussão ou briga entre parentes.
ABACAXI - Força e esperança no futuro. Grandes melhoras para todos, sem exceção. Para as jovens solteiras, um casamento à vista.
ABELHA - Mel, açúcar: adoçar a vida, melhorar a vida, afastar os problemas. Logo, logo, motivos para grandes alegrias e risos.
ABISMO - Possível preocupação, uma queda no amor ou nos negócios, mas com melhoras imediatas. Pensamento positivo e muita fé no amanhã.
ABÓBORA - Fartura, boa alimentação, dinheiro pelas portas da frente. Felicidade conjugal.
ABORDAGEM - Alguém virá trazer uma boa notícia. Um bom conselho vindo de um amigo fiel e sincero. Novas amizades e talvez um romance.
ABOTOAR - Intriga se formando, inveja; talvez um trabalho sendo feito por alguém invejoso. Evitar confiar em todo mundo. Evitar ter muita boa-fé.
ABRAÇO - Visita de parente distante, novas amizades, boas notícias, reconciliação com amigos, parentes ou com o ser amado. Esquecer o que passou e vida nova.
ABRIR - (porta, janela, etc.) - Novos horizontes estão se abrindo, felicidade a caminho, perspectivas de promoção no emprego ou nos negócios.
ABRIGO - Proteção, aconchego, defesa contra o mal e a intriga. Cuidado com as portas e janelas de casa, para assegurar a paz no lar.
ACENDER - Fogo, energia, esperança, vida. Um futuro melhor está se descortinando, boas notícias, confiança em grandes melhoras. Os jovens noivos devem cuidar do enxoval, pois o casamento não demora.
ACIDENTE - Más notícias, tanto vindas de longe quanto de perto. Alguns problemas na família e entre os cônjuges. Pensar antes de dizer o que deseja.
AÇOUGUE - Sinal de boas melhoras, de grande confiança no futuro, no sucesso. Grande subida nos negócios e propostas de emprego.
ACROBACIA - Rapidez quanto a resolver os problemas, facilidade na solução desses problemas. Melhoras financeiras consideráveis.
AÇÚCAR - Vida melhor, mais próspera, mais afortunada. Grandes alegrias a caminho; novidades excelentes com relação aos filhos e filhas.
ADAGA - Intriga, inveja, falsidade, língua afiada dos invejosos. Cautela com os falsos amigos, pois algum poderá se tornar um traidor.
ADEGA - Desgosto em família, problemas com os filhos, deve-se ter maior cuidado com as crianças e os velhos, sobretudo quanto a bebidas alcoólicas. Mesmo os adultos, evitar o abuso da bebida.
ADEUS - Despedida, viagem a fazer em breve, talvez partida de um parente ou amigo para uma viagem, mudança de residência ou de trabalho.
ADULTÉRIO - Ver alguém conhecido em adultério: tristeza, intriga, infelicidade conjugal. Ver o cônjuge em adultério: separação, discussão, desunião.
ADVOGADO - Possibilidades de ver um, consultar-se com um, problemas com um. Cautela com documentos, importantes ou não, em especial escrituras e certidões.
AGONIA - Algum sofrimento por vir, tristeza, cuidado com crianças e velhos, cautela com o abuso de remédios, tônicos, vitaminas e etc.
AGRADAR (a alguém) - Grandes alegrias, dentro e fora do lar, boas notícias em geral, contentamento, comemoração de uma grande vitória.
AGRADECER - Pessoa interessada e/ou grata poderá resolver um problema. Nova amizade a caminho, sincera. Não esquecer a quem devemos favores. Gratidão.
AGRESSÃO - Briga, discussão, intriga, talvez uma desunião, mas sempre passageira. Cautela ao relacionar-se com amigos e parentes, para evitar desentendimentos.
ÁGUA - Limpeza, purificação, corpo e alma sendo descarregados. Água corrente: todo o mal está sendo levado para longe.
AGUARDENTE - Festa, muita alegria, contentamento. Alguém na família muito feliz, devido a boas notícias no amor, no trabalho ou nos negócios.
ÁGUIA - Alguém de longe ou de perto trará boas notícias, proteção e forças divinas diante dos problemas. Esperança e energia. Pensamento positivo.
AGULHA - Problemas sendo costurados (resolvidos), dificuldades a serem resolvidas logo, logo. Cautela com agulhas e alfinetes com crianças.
AJUDAR - Alguém de fora sincero e interessado, estará pronto para auxiliar no que for possível. Alguém de fora a caminho com boas notícias. Visita de um parente distante que trará alegria.
ALCOVA - Casamento para dentro em breve, noivado também. Adultério, infidelidade conjugal. Para os recém-casados, muita alegria e felicidade.
ALEIJÃO - Sorte no jogo, na vida, em todos os problemas. Casamento duradouro e filhos sadios, perfeitos. Uma gravidez desejável a caminho.
ALFINETE - Prosperidade no lar, no trabalho e nos negócios. Uma boa promoção no emprego a caminho. Para os solteiros, um novo amor, sincero.
ALFORJE - Cuidado com os gastos desnecessários, supérfluos. Poupar hoje para uma eventualidade amanhã. Guardar o dinheiro para um futuro melhor.
ALGA - Alimentação farta, saúde, vida. Para as crianças, saúde, alegria e bom crescimento. Para os idosos: melhoras consideráveis e saúde.
ALGARISMO - Possibilidades de grandes ganhos, seja no trabalho, nos negócios ou no jogo. Dinheiro à vista. Quanto mais algarismos, mais dinheiro, em especial se forem pares. Ímpares alguma tristeza passageira.
ALGEMAS - Um casamento apenas de aparência, de conveniência; alguém quer libertar-se de uma união. Um possível divórcio a caminho.
ALGODÃO - Sonho muito propício, pois algodão é pureza, limpeza. Felicidade e alegria à vista, no lar, no casamento e nos negócios.
ALHO - Todo o mal está sendo espantado, levado para longe. Amigos falsos também estão sendo afastados. Bons fluidos para toda a família.
ALIANÇA - Casamento mais próximo que o esperado. Para os noivos e noivas, amor e felicidade no casamento, filhos sadios e fidelidade conjugal.
ALINHAMENTOS EM GERAL - Sonho excelente, sob todos os aspectos. Boa saúde, cura para as doenças, longevidade, alegrias dentro e fora do lar.
ALMOÇO - Saúde e alegria, mas deve-se ter moderação no comer e no beber. Maior cuidado com a alimentação das crianças e dos idosos. Vida melhor.
ALMÍSCAR - Surpresas muito boas no amor, ser amado fiel e sincero, sorte no jogo durante três dias consecutivos, bons amigos virão ajudar.
ALPENDRE - Proteção, abrigo, segurança contra o mal, a inveja e o mau olhado. Futuras obras na casa, alguma pequena reforma.
ALTAR - Sonho excelente, ótimas perspectivas. Casamento bem próximo. As noivas tratem do enxoval; para elas, bom casamentos e filhos sadios e bonitos.
ALVORADA - Também sonho excelente. Novas e redobradas esperanças. Embora a noite seja escura e fria, o dia sempre traz a luz. Confiança e fé.
AMAMENTAR - Notícias em breve de uma gravidez benvinda e sadia; vida forte e feliz. Para as mulheres que amamentam, cuidado com os seios e a alimentação.
AMANHECER - O mesmo que alvorada, nascer do dia: grandes esperanças em dias melhores e mais felizes, vida nova, problemas resolvidos, felicidade geral e muita alegria. Restabelecimento para os enfermos.
AMARELO - Esta cor, no Oriente, significa felicidade, paz e alegria. Sonho muito bom, sob todos os aspectos. Tudo se resolverá a seu tempo.
AMEIXA - Presságio ruim, alguma tristeza, alguma ilusão amorosa. Com calda, um novo amor à vista, algumas melhoras no emprego.
AMÊNDOAS - Afeto correspondido, amor sincero, o amor se aproximando a passos largos para só trazer felicidade e alegria.
AMIGO - Ótimo sonho. Amizades sinceras, prontas a ajudar, sempre interessadas. Alguém de fora trará boas notícias há muito tempo aguardadas.
AMORA - Azar no jogo, por três dias. Depois, certamente, a sorte sorrirá e talvez haja um bom prêmio. Cuidado com crianças muito pequenas.
AMURADA - Proteção, um obstáculo, um escudo, diante do mal, da intriga e da inveja. Haverá solução para todos os problemas. Bom também guardar algum dinheiro para uma emergência, uma eventualidade.
ANÃO - Grande sorte nos negócios, investimentos e projetos. Por outro lado, azar no jogo. Felicidade na família, em especial com os filhos.
ÂNCORA - Segurança, estabilidade, firmeza nos negócios, na vida conjugal e com os parentes e amigos. Convite para um batizado a caminho.
ANDORINHA - Liberdade dos problemas, das preocupações. Viagem breve, sobretudo durante o verão. Evitar atitudes impensadas, precipitadas.
ANEL - Uma nova amizade, sincera e desinteressada, surgirá a qualquer momento; um pedido de casamento à vista, com excelentes consequências.
ANIMAL - Em geral, é um bom sonho, pois os animais trazem boa sorte, em tudo. Poucos são os que trazem o azar. Animais pequenos, são grande felicidade.
ANJO - Ótimo sonho, sob todos os aspectos. Paz, felicidade, bem estar, todo o mal está sendo afastado, problemas logo serão resolvidos, amigos fiéis, fidelidade conjugal. Uma criança trará uma ótima notícia.
ANZOL - Boas melhoras no ambiente familiar e nos negócios. Namorados e noivos brigados farão as pazes dentro em breve. Cautela no jogo.
APÓSTOLO - Proteção divina. Amor correspondido com sinceridade e ternura. Solução de um grande problema a caminho. Fé no Senhor e no futuro.
AQUEDUTO - Uma grande ligação amorosa em breve, propícia ao casamento. Poupar ao máximo para uma eventualidade. Pequena preocupação sem muita importância.
ARANHA - Bicho de mau agouro, sobretudo as grandes e negras. As pequenas e inofensivas, geralmente, significam dinheiro e sucesso profissional.
ARADO - Prosperidade moderada nos negócios e no trabalho. Sorte relativa no jogo. Uma notícia a caminho. Cautela com as despesas.
ARARA - Alguma falsidade da parte de amigos, alguma intriga e inveja. Maior cuidado com o próprio corpo, a própria aparência. Moderação na bebida e no jogo. Harmonia no lar e entre os parentes.
ARCHOTE - Aceso: bom agouro, luz, energia, grandes esperanças em todos os sentidos. Apagado: mau agouro, má sorte, doença repentina na família.
ARCO - Notícia inesperada dentro em breve. Visita de parente distante, que será motivo de alegria e satisfação. Cautela com documentos e assinaturas.
ARCO-ÍRIS - Sonho excelente, sob todos os aspectos. Bonança, calma, após os problemas e as preocupações. Alegria. Uma nova vida está se formando.
AREIA - Retorno de pessoa querida com boas notícias. Alguém com saudade e preocupado. Novas amizades sinceras e desinteressadas.
ARMA BRANCA - Traição por parte de um amigo, infidelidade conjugal, Intrigas envolvendo dinheiro e documentos. Evitar excessiva boa-fé.
ARMA DE FOGO - Discussão em família, briga com estranhos, namoro ou noivado desfeito, alguma desunião. Evitar ao máximo qualquer briga ou rixa, pois a tendência é surgirem graves resultados.
ARMADURA - Proteção, segurança, força imbatível diante dos problemas. Cura repentina para os enfermos, saúde excelente para as crianças.
ARMÁRIO - Poupança, evitar gastos com coisas supérfluas, evitar o desperdício. Sorte no jogo por três dias consecutivos, sobretudo na sexta-feira.
ARRUMAR - Mudança em vista, para melhor. Talvez uma boa sorte no jogo, o que propiciará a mudança. Uma promoção ou aumento de salário.
ÁRVORE - Ótimo sonho, com excelentes consequências. Grandes esperanças, a situação vai melhorar em todos os aspectos. Fé e confiança no futuro.
ASNO - Com insistência, determinação, fé e pensamentos positivos, tudo há de se resolver. Uma viagem em breve, curta ou longa. Aumento de salário a caminho.
ASSOBIO - Alguém chegará de surpresa para ajudar, um novo amor pode acontecer quando menos se esperar. Máxima cautela com objetos cortantes, sobretudo nas mãos de crianças. Restabelecimento de um enfermo.
ATAÚDE - Sonho de mau agouro, principalmente se o ataúde estiver fechado. Alguma morte, na família ou fora dela. Todo o cuidado é pouco.
AUTOMÓVEL - Andando: Prosperidade, sorte nos negócios, promoção no emprego. Parado: dificuldades financeiras, problemas na família e com os amigos.
AVES EM GERAL - Normalmente, é um sonho auspicioso, sobretudo se forem aves pequenas. Significa liberdade, vida, beleza e felicidade.
AVIÃO - Viagem longa bem próxima, seja para diversão, seja para tratar de negócios. Deve-se poupar para a viagem. Evitar também sonhar alto, fazendo planos absurdos.
AZEITE - Mudança de casa, grande prosperidade a caminho, encontro inesperado com pessoa muito querida. Dinheiro virá do pagamento de uma dívida.
AZEITONA - Verde: esperança e muita alegria. Sorte nos negócios, aumento de salário e sorte no jogo também, por dois dias. Preta: cautela com amigos muito sorridentes e cheios de elogios. Podem ser falsos.
AZUL - Sonho excelente. Ótimas perspectivas de vida; azul é a cor da felicidade. Escuro: boas notícias a caminho. Claro: casamento e felicidade.
AZULÃO - Felicidade à vista, muito breve. Um bom e feliz casamento se realizará dentro em pouco. Fidelidade conjugal e amigos Sinceros.
AZULEJO - Branco: felicidade e alegria. Colorido: Um novo amor, um casamento há muito esperado. Escuro: cuidado com a inveja e a intriga.`;


export default function DreamInterpretationPage() {
  const [dreamDescription, setDreamDescription] = useState<string>('');
  const [dreamDictionary, setDreamDictionary] = useState<string>(defaultDreamDictionary);
  const [storySegments, setStorySegments] = useState<ProcessedStorySegment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { t } = useLanguage();
  const { currentUser, userCredits, refreshCredits } = useAuth();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!currentUser) {
      toast({ title: t('authErrorTitle'), description: t('mustBeLoggedInToInterpret'), variant: 'destructive' });
      return;
    }
    if (!userCredits || userCredits.balance < 1) {
      toast({ title: t('insufficientCreditsTitle'), description: t('insufficientCreditsForDreamDescription'), variant: 'destructive' });
      return;
    }
    if (!dreamDescription.trim()) {
      toast({ title: t('noDreamErrorTitle'), description: t('noDreamErrorDescription'), variant: 'destructive' });
      return;
    }
    if (dreamDescription.trim().length < 10) {
      toast({ title: t('errorGenericTitle'), description: t('dreamDescriptionTooShortError'), variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    setStorySegments([]);
    setError(null);

    try {
      // 1. Deduct credit
      const deductResult = await deductCredit(currentUser.uid);
      if (!deductResult.success) {
        throw new Error(deductResult.message || t('creditDeductionFailedError'));
      }
      refreshCredits();

      // 2. Interpret dream
      const input: InterpretDreamInput = { 
        dreamDescription,
        dreamDictionaryContent: dreamDictionary,
      };
      const result = await interpretDream(input);
      setStorySegments(result || []);

      // 3. Save dream interpretation
      if (result && result.length > 0) {
        const dreamToSave: Omit<DreamInterpretationData, 'interpretationTimestamp'> = {
          type: 'dream',
          dreamDescription: dreamDescription,
          interpretationSegments: result,
        };
        await saveReading(currentUser.uid, dreamToSave);
      }
      
      toast({ title: t('dreamInterpretationReadyTitle'), description: t('dreamInterpretationReadyDescription') });
    } catch (err: any) {
      console.error('Error interpreting dream:', err);
      const errorMessage = err.message || t('errorGeneratingInterpretationDescription');
      setError(errorMessage);
      toast({ title: t('errorGenericTitle'), description: errorMessage, variant: 'destructive' });
      // TODO: Consider refunding credit if interpretation fails after deduction.
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen">
      <div
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage: `url('/img/lu.gif')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />
      <div className="container mx-auto p-4 sm:p-6 lg:p-8 relative z-0">
        <div className="max-w-2xl mx-auto animated-aurora-background rounded-xl mb-8">
          <Card className="relative z-10 bg-black/30 dark:bg-black/50 backdrop-blur-md shadow-xl">
            <CardHeader>
              <CardTitle className="text-3xl font-serif flex items-center text-primary-foreground dark:text-primary-foreground">
                <MessageCircleQuestion className="h-8 w-8 mr-3 text-primary" />
                {t('dreamInterpretationTitle')}
              </CardTitle>
              <CardDescription className="text-muted-foreground dark:text-slate-300">
                {t('dreamInterpretationDescription')} {userCredits && t('creditsAvailable', { count: userCredits.balance })}
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="dream-description" className="text-lg text-primary-foreground dark:text-primary-foreground">{t('yourDreamLabel')}</Label>
                  <Textarea
                    id="dream-description"
                    value={dreamDescription}
                    onChange={(e) => setDreamDescription(e.target.value)}
                    placeholder={t('dreamPlaceholder')}
                    rows={6}
                    className="resize-none bg-background/80 dark:bg-background/70"
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dream-dictionary" className="text-lg text-primary-foreground dark:text-primary-foreground">
                    Dicionário de Sonhos (Opcional)
                  </Label>
                  <Textarea
                    id="dream-dictionary"
                    value={dreamDictionary}
                    onChange={(e) => setDreamDictionary(e.target.value)}
                    placeholder={'Cole aqui o conteúdo do seu dicionário de sonhos. Ex: "Água: Emoções, inconsciente..."'}
                    rows={8}
                    className="resize-none bg-background/80 dark:bg-background/70 font-mono text-xs"
                    disabled={isLoading}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  type="submit"
                  className="w-full text-lg py-6"
                  disabled={
                    isLoading ||
                    !dreamDescription.trim() || 
                    dreamDescription.trim().length < 10 || 
                    (userCredits && userCredits.balance < 1) || !!error // Use !!error to ensure it's a boolean
                  }
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      {t('generatingDreamInterpretationButton')}
                    </>
                  ) : (
                    <>
                      <BrainCircuit className="mr-2 h-5 w-5" />
                      {t('getDreamInterpretationButton')}
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>

        {error && (
          <div className="max-w-2xl mx-auto mt-8 animated-aurora-background rounded-lg">
            <Card className="relative z-10 bg-destructive/90 dark:bg-destructive/85 backdrop-blur-md shadow-lg border-destructive">
              <CardHeader>
                <CardTitle className="text-destructive-foreground font-serif">{t('errorOccurredCardTitle')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-destructive-foreground">{error}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {storySegments.length > 0 && !isLoading && (
          <div className="max-w-2xl mx-auto mt-8 animated-aurora-background rounded-lg">
            <Card className="shadow-2xl bg-black/30 dark:bg-black/50 backdrop-blur-md relative z-10">
              <CardHeader>
                <CardTitle className="text-2xl font-serif flex items-center text-primary-foreground dark:text-primary-foreground">
                  <BookOpenText className="h-7 w-7 mr-3 text-accent" />
                  {t('yourPropheticInterpretationTitle')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {storySegments.map((segment, index) => (
                  <div key={index}>
                    {segment.type === 'text' && segment.content && (
                      <p className="prose-base lg:prose-lg dark:prose-invert max-w-none whitespace-pre-wrap text-gray-200 dark:text-gray-100 leading-relaxed text-justify">
                        {segment.content}
                      </p>
                    )}
                    {segment.type === 'image' && segment.dataUri && (
                      <div className="my-4 rounded-lg overflow-hidden shadow-lg animated-aurora-background">
                        <Image
                          src={segment.dataUri}
                          alt={t('dreamIllustrationAlt', { number: index + 1 })+`: ${segment.alt || 'Dream illustration'}`}
                          width={500} 
                          height={300}
                          className="w-full h-auto object-contain relative z-10 bg-black/10"
                          data-ai-hint="dream scene abstract"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
      <img src="/img/olho.gif" alt="Olho místico" className="mt-8 mx-auto block max-w-full h-auto" />
    </div>
  );
}
