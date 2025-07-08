'use client';

import { useEffect, useState, type ChangeEvent, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { getAllUserProfiles, deleteUserRtdbData, type UserProfileData } from '@/services/userService';
import { adminAddCredits, getUserCredits, type UserCreditsData } from '@/services/creditService';
import { getRewardCycle, setRewardForDay, type DailyReward } from '@/services/rewardService';
import { getPromptContent, updatePromptContent, type PromptName } from '@/services/promptManagementService';
import { getDreamDictionaryEntry, updateDreamDictionaryEntry } from '@/services/dreamDictionaryService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ShieldCheck, UserPlus, Trash2, Coins, Edit, MessageSquareQuote, Gift, BookHeart } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';

interface UserWithCredits extends UserProfileData {
  credits?: UserCreditsData | null;
}

const mysticalIconNames = [
  'Gem', 'Sparkles', 'Moon', 'Sun', 'Star',
  'Crown', 'Feather', 'Key', 'Scroll', 'Eye',
  'BrainCircuit', 'Shield', 'Pyramid', 'Infinity', 'Hexagon',
  'Flower', 'Flame', 'Leaf', 'Cat', 'Bird',
  'Bot', 'Cloud', 'Dna', 'Fish', 'Ghost',
  'Grape', 'Zap', 'Pentagon', 'Rainbow', 'Heart'
];

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');

const contentForA = `A - Escrever ou ler a letra A: Boas notícias, novidades ótimas que virão de longe, através de pessoa muito querida.
ABACATE - Maduro: Esperança, dias melhores. Verde: Alguma tristeza na família, talvez uma discussão ou briga.
ABACAXI - Força e esperança no futuro. Grandes melhoras para todos. Para as jovens solteiras, um casamento à vista.
ABELHA - Mel, açúcar: Adoçar a vida, melhorar, afastar os problemas. Logo, motivos para grandes alegrias.
ABISMO - Possível preocupação, uma queda no amor ou nos negócios, mas com melhoras imediatas. Pensamento positivo e fé.
ABOBORA - Fartura, boa alimentação, dinheiro entrando. Felicidade conjugal.
ABORDAGEM - Alguém virá trazer uma boa notícia. Um bom conselho vindo de um amigo fiel. Novas amizades e talvez um romance.
ABOTOAR - Intriga se formando, inveja. Evitar confiar em todo mundo.
ABRAÇO - Visita de parente distante, novas amizades, boas notícias, reconciliação com amigos, parentes ou com o ser amado.
ABRIR (porta, janela, etc.) - Novos horizontes se abrindo, felicidade a caminho, perspectivas de promoção no emprego ou negócios.
ABRIGO - Proteção, aconchego, defesa contra o mal e a intriga.
ACENDER - Fogo, energia, esperança, vida. Um futuro melhor se descortinando, boas notícias, confiança em grandes melhoras.
ACIDENTE - Más notícias. Alguns problemas na família e entre os cônjuges. Pensar antes de falar.
AÇOUGUE - Sinal de boas melhoras, de grande confiança no futuro, no sucesso. Grande subida nos negócios e propostas de emprego.
ACROBACIA - Rapidez e facilidade para resolver problemas. Melhoras financeiras consideráveis.
AÇUCAR - Vida melhor, mais próspera e afortunada. Grandes alegrias a caminho com relação aos filhos.
ADAGA - Intriga, inveja, falsidade. Cautela com os falsos amigos.
ADEGA - Desgosto em família, problemas com os filhos. Evitar o abuso de bebidas alcoólicas.
ADEUS - Despedida, viagem a fazer em breve, mudança de residência ou de trabalho.
ADULTÉRIO - Ver alguém conhecido em adultério: Tristeza, intriga, infelicidade. Ver o cônjuge em adultério: Separação, discussão, desunião.
ADVOGADO - Possibilidade de problemas com documentos. Cautela com escrituras e certidões.
AGONIA - Algum sofrimento por vir, tristeza. Cautela com o abuso de remédios.
AGRADAR (a alguém) - Grandes alegrias, dentro e fora do lar, boas notícias, contentamento, comemoração de uma grande vitória.
AGRADECER - Pessoa interessada ou grata poderá resolver um problema. Nova amizade sincera a caminho.
AGRESSÃO - Briga, discussão, intriga, talvez uma desunião, mas sempre passageira. Cautela nos relacionamentos.
ÁGUA - Limpeza, purificação. Água corrente: Todo o mal está sendo levado para longe.
AGUARDENTE - Festa, muita alegria, contentamento. Alguém na família muito feliz devido a boas notícias.
ÁGUIA - Alguém trará boas notícias. Proteção e forças divinas diante dos problemas. Esperança e energia.
AGULHA - Problemas sendo resolvidos, dificuldades a serem superadas logo. Cautela com agulhas e crianças.
AJUDAR - Alguém sincero e interessado estará pronto para auxiliar. Visita de um parente distante que trará alegria.
ALCOVA - Casamento em breve. Adultério, infidelidade conjugal. Para os recém-casados, muita alegria.
ALEIJÃO - Sorte no jogo e na vida. Casamento duradouro e filhos sadios. Uma gravidez desejável a caminho.
ALFINETE - Prosperidade no lar, no trabalho e nos negócios. Uma boa promoção no emprego. Para os solteiros, um novo amor.
ALFORJE - Cuidado com gastos desnecessários. Poupar hoje para uma eventualidade amanhã.
ALGA - Alimentação farta, saúde, vida. Para as crianças, saúde e alegria. Para os idosos, melhoras e saúde.
ALGARISMO - Possibilidades de grandes ganhos no trabalho, negócios ou jogo. Dinheiro à vista.
ALGEMAS - Um casamento apenas de aparência ou conveniência. Possível divórcio a caminho.
ALGODÃO - Sonho muito propício. Pureza, limpeza, felicidade e alegria à vista.
ALHO - Todo o mal está sendo espantado. Amigos falsos sendo afastados. Bons fluidos para a família.
ALIANÇA - Casamento mais próximo que o esperado. Amor, felicidade e filhos sadios.
ALINHAMENTOS EM GERAL - Sonho excelente. Boa saúde, cura para as doenças, longevidade, alegrias.
ALMOÇO - Saúde e alegria, mas com moderação no comer e no beber.
ALMÍSCAR - Surpresas muito boas no amor, ser amado fiel. Sorte no jogo por três dias.
ALPENDRE - Proteção, abrigo, segurança contra o mal e a inveja.
ALTAR - Sonho excelente. Casamento bem próximo.
ALVORADA - Novas e redobradas esperanças. Confiança e fé.
AMAMENTAR - Notícias em breve de uma gravidez bem-vinda. Vida forte e feliz.
AMANHECER - O mesmo que alvorada. Grandes esperanças, vida nova, problemas resolvidos.
AMARELO - Cor que significa felicidade, paz e alegria. Sonho muito bom.
AMEIXA - Presságio ruim, alguma tristeza ou desilusão amorosa. Com calda, um novo amor à vista.
AMÊNDOAS - Afeto correspondido, amor sincero, felicidade se aproximando.
AMIGO - Ótimo sonho. Amizades sinceras, prontas a ajudar.
AMORA - Azar no jogo por três dias, depois a sorte sorrirá.
AMURADA - Proteção, obstáculo diante do mal, da intriga e da inveja.
ANÃO - Grande sorte nos negócios, investimentos e projetos. Azar no jogo.
ANCORA - Segurança, estabilidade, firmeza nos negócios e na vida conjugal.
ANDORINHA - Liberdade dos problemas e preocupações. Evitar atitudes impensadas.
ANEL - Nova amizade sincera. Pedido de casamento à vista.
ANIMAL - Em geral, é um bom sonho, traz boa sorte.
ANJO - Ótimo sonho. Paz, felicidade, bem-estar, problemas resolvidos.
ANZOL - Boas melhoras no ambiente familiar e nos negócios. Pazes entre namorados.
APÓSTOLO - Proteção divina. Amor correspondido. Solução de um grande problema.
AQUEDUTO - Uma grande ligação amorosa em breve.
ARANHA - Bicho de mau agouro, sobretudo as grandes e negras. As pequenas significam dinheiro e sucesso.
ARADO - Prosperidade moderada. Sorte relativa no jogo.
ARARA - Falsidade, intriga e inveja por parte de amigos.
ARCHOTE - Aceso: Bom agouro, luz, energia. Apagado: Mau agouro, má sorte.
ARCO - Notícia inesperada em breve. Visita de parente distante.
ARCO-ÍRIS - Sonho excelente. Bonança, calma após os problemas.
AREIA - Retorno de pessoa querida com boas notícias. Novas amizades.
ARMA BRANCA - Traição, infidelidade, intrigas.
ARMA DE FOGO - Discussão em família, briga, namoro desfeito.
ARMADURA - Proteção, segurança, força diante dos problemas.
ARMÁRIO - Poupança, evitar gastos supérfluos. Sorte no jogo por três dias.
ARRUMAR - Mudança em vista, para melhor. Promoção ou aumento de salário.
ÁRVORE - Ótimo sonho. Grandes esperanças, a situação vai melhorar.
ASNO - Com insistência e fé, tudo há de se resolver.
ASSOBIO - Alguém chegará de surpresa para ajudar. Novo amor pode acontecer.
ATAÚDE - Sonho de mau agouro. Morte na família ou fora dela.
AUTOMÓVEL - Andando: Prosperidade, sorte. Parado: Dificuldades financeiras.
AVES EM GERAL - Sonho auspicioso, liberdade, vida, beleza, felicidade.
AVIÃO - Viagem longa bem próxima.
AZEITE - Mudança de casa, grande prosperidade, encontro inesperado.
AZEITONA - Verde: Esperança e alegria. Preta: Cautela com amigos falsos.
AZUL - Sonho excelente. Felicidade. Escuro: Boas notícias. Claro: Casamento.
AZULÃO - Felicidade à vista, bom casamento.
AZULEJO - Branco: Felicidade. Colorido: Novo amor. Escuro: Cuidado com a inveja.`;

const contentForB = `BACALHAU - É sempre mau agouro, sobretudo preparado, pois representa trabalho feito.
BACIA - Cheia: muita alegria com o ser amado, o lar, e os filhos. Vazia: notícia de parente distante, visita de alguém há muito afastado.
BAILE - É sempre motivo de alegria, de felicidade, de novas e boas amizades, de simpatia. Coisas boas e alegres estão por acontecer.
BALDE - Cheio: preocupações com a família ou os amigos. Alguma discussão sem consequências. Vazio: ótimo, trabalho desfeito ou muito fraco.
BALEIA - Energias redobradas para enfrentar a luta da vida, os problemas. Força e confiança no futuro. Esquecer o pessimismo e pensar com fé.
BALSA - A solução para cada problema é encontrada mais cedo ou mais tarde. Não desanimar nunca na luta. Alguém muito apaixonado. Vida.
BANANA - Ameaça de revelação de um grande segredo, o que trará sérios aborrecimentos. Banana descascada: trabalho desfeito e inútil.
BANCO - De praça: notícia alvissareira, encontro com velho amigo. De dinheiro: sucesso nos negócios, promoção, sorte no jogo por cinco dias.
BANDEIRA - Complicações financeiras, envolvendo documentos. Todo o cuidado com documentos, papéis de justiça. Não assinar nada sem antes ler com cuidado. Cautela com falsos amigos e advogados.
BANHO - O corpo e o espírito estão sendo descarregados, limpeza, purificação. O mesmo que água corrente que representa a descarga, a limpeza.
BARALHO - Fechado: tristeza, infelicidade, problemas a caminho, inveja e intriga. Aberto: sorte no jogo e nos negócios. Amigo fiel e preocupado.
BARATA - Não é muito bom sinal. Cuidado com os falsos amigos, amigos intrigantes. Cautela também com documentos, crianças e velhos.
BARBA - Loura: felicidade e alegria a caminho. Branca: paz e muita tranqüilidade. Escura: intriga, inveja, olho grande.
BASTÃO - Os inimigos serão agredidos (castigados, justiçados) com ele. Proteção divina, segurança. Evitar preocupações desnecessárias.
BAÚ - Fechado: existe um grande segredo a esconder; poupar para o futuro, evitar gastos supérfluos. Aberto: ótimo sonho, melhoras financeiras a caminho, sorte nos negócios e no jogo, felicidade para todos.
BEBÊ - Tudo referente às crianças só pode ser bom. Significa pureza, beleza e alegria. Felicidade, novos amores, novas amizades, talvez uma gravidez benvinda.
BEBER - Água: limpeza, descarga, purificação do corpo e do espírito. Bebida alcoólica: não é de muito bom agouro, tristeza, desunião.
BECO - Entrar num: problema à vista, preocupação, trabalho sendo feito. Sair de um: ótimo sonho, trabalho desfeito, problemas sendo resolvidos.
BEIJO - Na testa: amigos sinceros, desinteressados. No rosto: o ser amado é fiel. Na boca: traição, infidelidade, adultério.
BENGALA - Alguém virá em auxílio, servirá de apoio moral e talvez até resolva alguns problemas. Alguém em dificuldades, precisando de ajuda.
BERÇO - Criança novamente. Alegria, felicidade, paz, tranquilidade. Também uma futura gravidez, perfeita sob todos os aspectos. Em geral, nascerá menina; se menino, terá vida plena e muita riqueza.
BERRO - De alegria: bom sonho, felicidade à vista. De dor: uma grande tristeza a caminho. De agonia: problema grave, doença na família.
BESOURO - Sinal de prosperidade, fartura, sucesso e boa sorte. Chances de sorte no jogo por dois dias. Uma notícia agradável surgirá.
BEZERRO - Junto da vaca, sendo amamentado: alegria no ar, a caminho. Desgarrado: problemas no lar, desunião, discussão ou briga entre parentes.
BIBELÔ - De porcelana: alegria no lar e no trabalho. Vidro: sucesso no jogo e no trabalho. De madeira: alimentação farta, uma nova residência.
BÍBLIA - Fechada: alta fé no futuro. Aberta: proteção. Luxuosa: traição.
BICO - Alguém lhe guarda um grande segredo, amigos.
BIGODE - Ver em alguém: felicidade em todos os sentidos.
BICICLETA - Negócios em bom andamento. Uma viagem curta, de bicicleta. Insistência e fé.
BOBO - Algumas dificuldades financeiras. Infidelidade conjugal. Bobo da corte: alguém está usando uma das pessoas da família, explorando, enganando.
BOCA - De dentes bem feitos: felicidade em breve. De dentes feios: tristeza. Sorrindo: um novo amor. Contorcida: desunião, infidelidade.
BODE - Falta de fé, pensamento negativo, falta de orações e conversas com Deus. Negligência para com as coisas do espírito. Há alguma influência maléfica sobre a família e os amigos mais chegados.
BOFETADA - Agressão, briga no lar, discussão entre parentes ou amigos, desentendimentos. Deve-se ter cautela com o que se diz para as pessoas a nossa volta.
BOI - Branco: felicidade completa, muitas alegrias. Castanho: boas notícias. Preto: alguma tristeza. Malhado: sorte nos negócios.
BÓIA - Salvação, libertação dos problemas, solução para as preocupações, boas notícias. Talvez uma longa viagem de navio ou lancha.
BOLA - Branca: felicidade, alegria. Colorida: sorte no jogo por três dias e sorte nos negócios. Escura: desunião, problemas na família.
BOLACHA - Fartura de alimentos, mesa farta, algum bom dinheiro a caminho. Maior cuidado com a alimentação dos velhos e das crianças.
BOLO - Simples: solução para os problemas maiores, principalmente os que envolvem o amor e o dinheiro. Confeitado: alegria, uma grande notícia a caminho, casamento, noivado, em breve.
BOLSA - Poupar para o futuro, guardar algum dinheiro para uma emergência; evitar gastos desnecessários, esbanjamento. Dinheiro a caminho.
BOLSO - Significa poupar, guardar uma reserva para o amanhã. Também pode representar uma reviravolta na vida, um projeto fracassado.
BOMBOM - É criança e criança só pode ser coisa boa: dinheiro, amor, alegria. De chocolate, ótimo sonho, pois significa felicidade completa.
BONDE - Viagem a fazer em breve, visita de um parente ou amigo há muito tempo não visto. Infelicidade nos amores, uma nova amizade.
BONÉ - Branco: alegria e felicidade para todos. Colorido: felicidades no amor, no casamento. Escuro: tristeza profunda, falsos amigos.
BONECA - De louça: intriga sendo feita, amigo falso, interesseiro. De pano: pureza, amizade sincera, um amigo virá ajudar. Que fala: evitar ficar falando da própria vida, o que sempre suscita inveja.
BORBOLETA - Escura: mau agouro, talvez uma curta onda de azar. Colorida: ótimo sonho, pois representa alegria e sorte com um novo amor.
BOTA - Longas viagens pela frente, ou por diversão, ou para resolver pequenos negócios. Maiores cuidados com os pés e as mãos.
BOTÃO - Branco: certeza de vitória quanto a um antigo problema. Colorido: alegrias no amor e com a família. Escuro: falsos amigos, problemas com dinheiro.
BOTE - A vitória chegará, mas deve-se lutar por ela, mesmo remando contra a correnteza. Pequena viagem, sobretudo por meio marítimo.
BRACELETE - Traição por parte de amigos, falsos amigos que só tem segundas intenções. Evitar a boa-fé excessiva e confiança em todo o mundo.
BRAÇO - Excelente sonho, sob todos os aspectos. Força, energia, vigor, saúde, disposição férrea para enfrentar todos os problemas e vencê-los. Coragem para tudo, sem esmorecimento. Fé no futuro.
BRANCO - Sonho excelente, alvissareiro. O branco significa pureza, amor, beleza. Estar vestido de branco: felicidade dentro em breve.
BRECHA - Quanto maior, mais significa esperança de vitória, de tudo se resolver. Estar fechando uma brecha: resolver um antigo problema.
BRIGA - Discussão dentro e fora do lar, desentendimentos, falta de compreensão. Estar assistindo a uma briga: ver uma desunião, um rompimento.
BRILHANTE - Jóia significa sempre cobiça, ganância, paixão pelos bens materiais; más notícias, tristeza, falsos amigos, problemas com dinheiro.
BROA - É trigo, matéria-prima do pão, e o trigo sempre representou o alimento, o sustento da vida, alegria, alimentação farta. Visita de pessoa muito querida e talvez um novo e grande amor.
BROCHE - Más notícias a caminho, possível desunião de amigos bem próximos, infidelidade conjugal. Cuidado especial com dinheiro e documentos.
BROTO - Garota, jovem: viagem longa, para tratar de pequenos negócios. Flor: alegria inesperada, notícia excelente por carta.
BRUXA - Mau agouro, perspectiva de azar nos negócios, trabalho sendo feito, inveja. Alguém com mau pensamento para com quem sonhou.
BÚFALO - Símbolo de força, de energia. Escuro: determinação para vencer os problemas. Branco: muito bom o sonho, felicidade e alegria.
BUQUÊ - Flor é sempre beleza e alegria. De flores comuns: alegria no casamento e com os filhos. De rosas: muita sorte no amor, afeto correspondido.
BURRO - Com insistência, fé e pensamento positivo, tudo pode ser conseguido. Burro puxando carroça: visita de parente distante.`;

export default function AdminDashboardPage() {
  const { userProfile: adminProfile } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();

  const [users, setUsers] = useState<UserWithCredits[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [selectedUserForCredits, setSelectedUserForCredits] = useState<UserWithCredits | null>(null);
  const [creditsToAdd, setCreditsToAdd] = useState<number>(0);
  const [isAddingCredits, setIsAddingCredits] = useState(false);

  const [cardReadingPrompt, setCardReadingPrompt] = useState('');
  const [dreamInterpretationPrompt, setDreamInterpretationPrompt] = useState('');
  const [isLoadingPrompts, setIsLoadingPrompts] = useState(true);
  const [isSavingCardPrompt, setIsSavingCardPrompt] = useState(false);
  const [isSavingDreamPrompt, setIsSavingDreamPrompt] = useState(false);
  
  const [rewardCycle, setRewardCycle] = useState<DailyReward[]>([]);
  const [isLoadingRewards, setIsLoadingRewards] = useState(true);
  const [editingReward, setEditingReward] = useState<DailyReward | null>(null);
  const [isSavingReward, setIsSavingReward] = useState(false);

  const [selectedDictionaryLetter, setSelectedDictionaryLetter] = useState('A');
  const [dictionaryContent, setDictionaryContent] = useState('');
  const [isLoadingDictionary, setIsLoadingDictionary] = useState(false);
  const [isSavingDictionary, setIsSavingDictionary] = useState(false);

  const fetchUsersAndCredits = useCallback(async () => {
    setIsLoadingUsers(true);
    try {
      const profiles = await getAllUserProfiles();
      const usersWithCreditsPromises = profiles.map(async (profile) => {
        const credits = await getUserCredits(profile.uid);
        return { ...profile, credits };
      });
      const usersWithCreditsData = await Promise.all(usersWithCreditsPromises);
      setUsers(usersWithCreditsData);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({ title: t('errorGenericTitle'), description: String(error) || t('genericErrorDescription'), variant: 'destructive' });
    } finally {
      setIsLoadingUsers(false);
    }
  }, [t, toast]);

  const fetchAllPrompts = useCallback(async () => {
    setIsLoadingPrompts(true);
    try {
      const [cardPrompt, dreamPrompt] = await Promise.all([
        getPromptContent('analyzeCardReading'),
        getPromptContent('interpretDream')
      ]);
      setCardReadingPrompt(cardPrompt);
      setDreamInterpretationPrompt(dreamPrompt);
    } catch (error) {
      console.error("Error fetching prompts:", error);
      toast({ title: t('errorGenericTitle'), description: t('promptLoadError'), variant: 'destructive' });
    } finally {
      setIsLoadingPrompts(false);
    }
  }, [t, toast]);

  const fetchRewardCycle = useCallback(async () => {
    setIsLoadingRewards(true);
    try {
      const cycle = await getRewardCycle();
      setRewardCycle(cycle);
    } catch (error) {
      console.error("Error fetching reward cycle:", error);
      toast({ title: t('errorGenericTitle'), description: String(error) || t('genericErrorDescription'), variant: 'destructive' });
    } finally {
      setIsLoadingRewards(false);
    }
  }, [t, toast]);

  const fetchDictionaryEntry = useCallback(async (letter: string) => {
    setIsLoadingDictionary(true);
    try {
      let content = await getDreamDictionaryEntry(letter);
      if (!content) {
        if (letter === 'A') {
            content = contentForA;
        } else if (letter === 'B') {
            content = contentForB;
        }
      }
      setDictionaryContent(content);
    } catch (error) {
      toast({ title: t('errorGenericTitle'), description: t('dictionaryFetchError'), variant: 'destructive' });
    } finally {
      setIsLoadingDictionary(false);
    }
  }, [t, toast]);

  useEffect(() => {
    if (adminProfile?.role === 'admin') {
      fetchUsersAndCredits();
      fetchAllPrompts();
      fetchRewardCycle();
      fetchDictionaryEntry(selectedDictionaryLetter);
    }
  }, [adminProfile, fetchUsersAndCredits, fetchAllPrompts, fetchRewardCycle, fetchDictionaryEntry, selectedDictionaryLetter]);


  const handleAddCredits = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForCredits || creditsToAdd <= 0) {
      toast({ title: t('errorGenericTitle'), description: "Invalid user or credit amount.", variant: 'destructive' });
      return;
    }
    setIsAddingCredits(true);
    try {
      const result = await adminAddCredits(selectedUserForCredits.uid, creditsToAdd);
      if (result.success) {
        toast({ title: t('mysticInsights'), description: t('addCreditsSuccessToast', { count: String(creditsToAdd), email: selectedUserForCredits.email || 'user' }) });
        await fetchUsersAndCredits();
        setSelectedUserForCredits(null);
        setCreditsToAdd(0);
      } else {
        toast({ title: t('errorGenericTitle'), description: result.message || t('addCreditsErrorToast', { email: selectedUserForCredits.email || 'user' }), variant: 'destructive' });
      }
    } catch (error: any) {
      toast({ title: t('errorGenericTitle'), description: error.message || t('addCreditsErrorToast', { email: selectedUserForCredits.email || 'user' }), variant: 'destructive' });
    } finally {
      setIsAddingCredits(false);
    }
  };

  const handleDeleteUser = async (uid: string, email: string | null) => {
    try {
      await deleteUserRtdbData(uid);
      toast({ title: t('mysticInsights'), description: t('deleteUserSuccessToast', { email: email || 'User' }) });
      await fetchUsersAndCredits();
    } catch (error: any) {
      toast({ title: t('errorGenericTitle'), description: error.message || t('deleteUserErrorToast', { email: email || 'User' }), variant: 'destructive' });
    }
  };

  const handleSavePrompt = async (promptName: PromptName, content: string) => {
    if (promptName === 'analyzeCardReading') setIsSavingCardPrompt(true);
    if (promptName === 'interpretDream') setIsSavingDreamPrompt(true);

    try {
      const result = await updatePromptContent(promptName, content);
      if (result.success) {
        toast({ title: t('mysticInsights'), description: t('promptSaveSuccess') });
      } else {
        toast({ title: t('errorGenericTitle'), description: result.message || t('promptSaveError'), variant: 'destructive' });
      }
    } catch (error: any) {
      toast({ title: t('errorGenericTitle'), description: error.message || t('promptSaveError'), variant: 'destructive' });
    } finally {
      if (promptName === 'analyzeCardReading') setIsSavingCardPrompt(false);
      if (promptName === 'interpretDream') setIsSavingDreamPrompt(false);
    }
  };

  const handleSaveReward = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReward) return;
    setIsSavingReward(true);
    try {
      const { day, ...rewardData } = editingReward;
      const result = await setRewardForDay(day, rewardData);
       if (result.success) {
        toast({ title: t('mysticInsights'), description: t('rewardUpdateSuccess') });
        await fetchRewardCycle();
        setEditingReward(null);
      } else {
        toast({ title: t('errorGenericTitle'), description: result.message || t('rewardUpdateError'), variant: 'destructive' });
      }
    } catch (error: any) {
       toast({ title: t('errorGenericTitle'), description: error.message || t('rewardUpdateError'), variant: 'destructive' });
    } finally {
      setIsSavingReward(false);
    }
  };

  const handleSaveDictionaryEntry = async () => {
    setIsSavingDictionary(true);
    try {
      const result = await updateDreamDictionaryEntry(selectedDictionaryLetter, dictionaryContent);
      if (result.success) {
        toast({ title: t('mysticInsights'), description: t('dictionarySaveSuccess', { letter: selectedDictionaryLetter }) });
      } else {
        toast({ title: t('errorGenericTitle'), description: result.message || t('dictionarySaveError'), variant: 'destructive' });
      }
    } catch (error: any) {
       toast({ title: t('errorGenericTitle'), description: error.message || t('dictionarySaveError'), variant: 'destructive' });
    } finally {
      setIsSavingDictionary(false);
    }
  };


  if (adminProfile?.role !== 'admin') {
    return ( 
      <div className="container mx-auto p-8 text-center">
        <p>Access Denied.</p>
      </div>
    );
  }

  const rewardTypeOptions: { value: DailyReward['type']; labelKey: 'rewardTypeCredits' | 'rewardTypeEbook' | 'rewardTypeTarotReading' }[] = [
    { value: 'credits', labelKey: 'rewardTypeCredits' },
    { value: 'ebook', labelKey: 'rewardTypeEbook' },
    { value: 'tarot_reading', labelKey: 'rewardTypeTarotReading' },
  ];

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      <Card className="shadow-xl animated-aurora-background">
        <div className="relative z-10 bg-card/80 dark:bg-card/75 backdrop-blur-md">
          <CardHeader className="p-8 sm:p-10">
            <CardTitle className="text-3xl font-serif flex items-center">
              <ShieldCheck className="h-8 w-8 mr-3 text-primary" />
              {t('adminDashboardTitle')}
            </CardTitle>
            <CardDescription>{t('adminDashboardDescription')}</CardDescription>
          </CardHeader>
        </div>
      </Card>

      {/* User Management Section */}
      <Card className="shadow-xl animated-aurora-background">
        <div className="relative z-10 bg-card/80 dark:bg-card/75 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-2xl font-serif">{t('usersTableTitle')}</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingUsers ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4 p-2">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-20" />
                  </div>
                ))}
              </div>
            ) : users.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">{t('noUsersFound')}</p>
            ) : (
              <>
                <div className="md:hidden space-y-4">
                  {users.map((user) => (
                    <Card key={user.uid} className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold">{user.displayName || 'N/A'}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${user.role === 'admin' ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                          {user.role === 'admin' ? t('roleAdmin') : t('roleUser')}
                        </span>
                      </div>
                      <div className="mt-4 pt-4 border-t flex justify-between items-center">
                        <p className="text-sm">Créditos: <span className="font-bold">{user.credits?.balance ?? t('creditsCouldNotBeFetched')}</span></p>
                        <div className="flex space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="icon" onClick={() => setSelectedUserForCredits(user)}>
                                <Coins className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                             {selectedUserForCredits?.uid === user.uid && (
                              <DialogContent>
                                <form onSubmit={handleAddCredits}>
                                  <DialogHeader>
                                    <DialogTitle>{t('addCreditsModalTitle')}</DialogTitle>
                                    <DialogDescription>
                                      {t('manageUserLabel')}: {selectedUserForCredits.email}
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                      <Label htmlFor="credits-amount" className="text-right col-span-1">
                                        {t('creditsAmountLabel')}
                                      </Label>
                                      <Input
                                        id="credits-amount"
                                        type="number"
                                        value={creditsToAdd}
                                        onChange={(e) => setCreditsToAdd(parseInt(e.target.value, 10) || 0)}
                                        className="col-span-3"
                                        min="1"
                                      />
                                    </div>
                                  </div>
                                  <DialogFooter>
                                    <DialogClose asChild>
                                      <Button variant="outline" type="button">{t('cancelButton')}</Button>
                                    </DialogClose>
                                    <Button type="submit" disabled={isAddingCredits || creditsToAdd <= 0}>
                                      {isAddingCredits && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                      {t('addCreditsSubmitButton')}
                                    </Button>
                                  </DialogFooter>
                                </form>
                              </DialogContent>
                            )}
                          </Dialog>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="icon">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>{t('confirmDeleteUserTitle')}</AlertDialogTitle>
                                <AlertDialogDescription>
                                  {t('confirmDeleteUserDescription', { email: user.email || 'this user' })}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>{t('cancelButton')}</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteUser(user.uid, user.email)}>
                                  {t('deleteUserButton')}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                <div className="hidden md:block">
                    <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>{t('userName')}</TableHead>
                        <TableHead>{t('userEmail')}</TableHead>
                        <TableHead className="text-center">{t('userRole')}</TableHead>
                        <TableHead className="text-center">{t('userCredits')}</TableHead>
                        <TableHead className="text-right">{t('userActions')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user) => (
                        <TableRow key={user.uid}>
                            <TableCell>{user.displayName || 'N/A'}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell className="text-center">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${user.role === 'admin' ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                                {user.role === 'admin' ? t('roleAdmin') : t('roleUser')}
                            </span>
                            </TableCell>
                            <TableCell className="text-center">{user.credits?.balance ?? t('creditsCouldNotBeFetched')}</TableCell>
                            <TableCell className="text-right space-x-2">
                            <Dialog>
                                <DialogTrigger asChild>
                                <Button variant="outline" size="sm" onClick={() => setSelectedUserForCredits(user)}>
                                    <Coins className="mr-1 h-4 w-4" /> {t('addCreditsButton')}
                                </Button>
                                </DialogTrigger>
                                {selectedUserForCredits?.uid === user.uid && (
                                <DialogContent>
                                    <form onSubmit={handleAddCredits}>
                                    <DialogHeader>
                                        <DialogTitle>{t('addCreditsModalTitle')}</DialogTitle>
                                        <DialogDescription>
                                        {t('manageUserLabel')}: {selectedUserForCredits.email}
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="credits-amount" className="text-right col-span-1">
                                            {t('creditsAmountLabel')}
                                        </Label>
                                        <Input
                                            id="credits-amount"
                                            type="number"
                                            value={creditsToAdd}
                                            onChange={(e) => setCreditsToAdd(parseInt(e.target.value, 10) || 0)}
                                            className="col-span-3"
                                            min="1"
                                        />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <DialogClose asChild>
                                        <Button variant="outline" type="button">{t('cancelButton')}</Button>
                                        </DialogClose>
                                        <Button type="submit" disabled={isAddingCredits || creditsToAdd <=0}>
                                        {isAddingCredits && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        {t('addCreditsSubmitButton')}
                                        </Button>
                                    </DialogFooter>
                                    </form>
                                </DialogContent>
                                )}
                            </Dialog>

                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm">
                                    <Trash2 className="mr-1 h-4 w-4" /> {t('deleteUserButton')}
                                </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>{t('confirmDeleteUserTitle')}</AlertDialogTitle>
                                    <AlertDialogDescription>
                                    {t('confirmDeleteUserDescription', { email: user.email || 'this user' })}
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>{t('cancelButton')}</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteUser(user.uid, user.email)}>
                                    {t('deleteUserButton')}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                            </TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                    </Table>
                </div>
              </>
            )}
             {isLoadingUsers && <p className="text-center text-muted-foreground py-4">{t('fetchingUsers')}</p>}
          </CardContent>
        </div>
      </Card>
      
      {/* Dream Dictionary Management Section */}
      <Card className="shadow-xl animated-aurora-background">
        <div className="relative z-10 bg-card/80 dark:bg-card/75 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-2xl font-serif flex items-center">
              <BookHeart className="h-7 w-7 mr-3 text-primary" />
              {t('dreamDictionaryManagementTitle')}
            </CardTitle>
            <CardDescription>{t('dreamDictionaryManagementDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="dictionary-letter">{t('selectLetterLabel')}</Label>
              <Select value={selectedDictionaryLetter} onValueChange={setSelectedDictionaryLetter}>
                <SelectTrigger id="dictionary-letter" className="w-[180px]">
                  <SelectValue placeholder="Selecione uma letra" />
                </SelectTrigger>
                <SelectContent>
                  {alphabet.map(letter => (
                    <SelectItem key={letter} value={letter}>Letra {letter}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="dictionary-content">{t('dictionaryContentLabel', { letter: selectedDictionaryLetter })}</Label>
              {isLoadingDictionary ? (
                <Skeleton className="h-64 w-full mt-2" />
              ) : (
                <Textarea
                  id="dictionary-content"
                  value={dictionaryContent}
                  onChange={(e) => setDictionaryContent(e.target.value)}
                  rows={20}
                  className="mt-2 font-mono text-xs"
                  placeholder={t('dictionaryContentPlaceholder', { letter: selectedDictionaryLetter })}
                  disabled={isSavingDictionary}
                />
              )}
            </div>
            
            <Button onClick={handleSaveDictionaryEntry} disabled={isSavingDictionary || isLoadingDictionary}>
              {isSavingDictionary ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isSavingDictionary ? t('savingButton') : t('saveDictionaryButton')}
            </Button>
          </CardContent>
        </div>
      </Card>


      {/* Daily Rewards Management Section */}
      <Card className="shadow-xl animated-aurora-background">
        <div className="relative z-10 bg-card/80 dark:bg-card/75 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-2xl font-serif flex items-center">
              <Gift className="h-7 w-7 mr-3 text-primary" />
              {t('manageDailyRewardsTitle')}
            </CardTitle>
            <CardDescription>{t('manageDailyRewardsDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingRewards ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
                {Array.from({ length: 30 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-lg" />)}
              </div>
            ) : (
               <Dialog onOpenChange={(open) => !open && setEditingReward(null)}>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
                  {rewardCycle.map((reward) => (
                    <DialogTrigger key={reward.day} asChild>
                      <Card 
                        onClick={() => setEditingReward(reward)}
                        className="cursor-pointer hover:border-primary transition-colors flex flex-col items-center justify-center p-2 text-center"
                      >
                        <CardHeader className="p-1">
                          <CardDescription>{t('dayLabel', {day: reward.day})}</CardDescription>
                        </CardHeader>
                        <CardContent className="p-1 flex-grow flex flex-col items-center justify-center">
                          <p className="text-sm font-semibold">{reward.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {reward.value} {t(rewardTypeOptions.find(opt => opt.value === reward.type)?.labelKey ?? 'rewardTypeCredits')}
                          </p>
                        </CardContent>
                      </Card>
                    </DialogTrigger>
                  ))}
                </div>
                {editingReward && (
                  <DialogContent>
                    <form onSubmit={handleSaveReward}>
                      <DialogHeader>
                        <DialogTitle>{t('editRewardForDay', { day: editingReward.day })}</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="space-y-1">
                          <Label htmlFor="reward-title">{t('rewardTitleLabel')}</Label>
                          <Input id="reward-title" value={editingReward.title} onChange={(e) => setEditingReward({...editingReward, title: e.target.value})} placeholder={t('rewardTitlePlaceholder')}/>
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="reward-type">{t('rewardTypeLabel')}</Label>
                          <Select
                            value={editingReward.type}
                            onValueChange={(value) => setEditingReward({ ...editingReward, type: value as DailyReward['type'] })}
                          >
                            <SelectTrigger id="reward-type">
                              <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                            <SelectContent>
                              {rewardTypeOptions.map(option => (
                                <SelectItem key={option.value} value={option.value}>
                                  {t(option.labelKey)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="reward-value">{t('rewardValueLabel')}</Label>
                          <Input id="reward-value" type="number" value={editingReward.value} onChange={(e) => setEditingReward({...editingReward, value: parseInt(e.target.value, 10) || 0})} placeholder={t('rewardValuePlaceholder')}/>
                        </div>
                         <div className="space-y-1">
                          <Label htmlFor="reward-icon">{t('rewardIconLabel', { defaultValue: 'rewardIconLabel'})}</Label>
                           <Select
                            value={editingReward.iconName}
                            onValueChange={(value) => setEditingReward({ ...editingReward, iconName: value })}
                          >
                            <SelectTrigger id="reward-icon">
                              <SelectValue placeholder="Selecione um ícone" />
                            </SelectTrigger>
                            <SelectContent>
                               <ScrollArea className="h-72">
                                {mysticalIconNames.map(iconName => (
                                  <SelectItem key={iconName} value={iconName}>
                                    {iconName}
                                  </SelectItem>
                                ))}
                              </ScrollArea>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <DialogClose asChild><Button variant="outline" type="button">{t('cancelButton')}</Button></DialogClose>
                        <Button type="submit" disabled={isSavingReward}>
                          {isSavingReward ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                          {isSavingReward ? t('savingButton') : t('saveRewardButton')}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                )}
               </Dialog>
            )}
          </CardContent>
        </div>
      </Card>

      {/* AI Prompt Management Section */}
      <Card className="shadow-xl animated-aurora-background">
        <div className="relative z-10 bg-card/80 dark:bg-card/75 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-2xl font-serif flex items-center">
              <MessageSquareQuote className="h-7 w-7 mr-3 text-primary" />
              {t('promptManagementTitle')}
            </CardTitle>
            <CardDescription>{t('promptEditingDisclaimer')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isLoadingPrompts ? (
              <div className="space-y-4">
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-8 w-1/3 mt-4" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-10 w-24" />
              </div>
            ) : (
              <>
                <div>
                  <Label htmlFor="card-reading-prompt" className="text-lg font-semibold">{t('cardReadingPromptLabel')}</Label>
                  <Textarea id="card-reading-prompt" value={cardReadingPrompt} onChange={(e) => setCardReadingPrompt(e.target.value)} rows={15} className="mt-2 mb-3 font-mono text-xs" disabled={isSavingCardPrompt} />
                  <Button onClick={() => handleSavePrompt('analyzeCardReading', cardReadingPrompt)} disabled={isSavingCardPrompt}>
                    {isSavingCardPrompt && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {t('savePromptButton')}
                  </Button>
                </div>
                <div>
                  <Label htmlFor="dream-interpretation-prompt" className="text-lg font-semibold">{t('dreamInterpretationPromptLabel')}</Label>
                  <Textarea id="dream-interpretation-prompt" value={dreamInterpretationPrompt} onChange={(e) => setDreamInterpretationPrompt(e.target.value)} rows={15} className="mt-2 mb-3 font-mono text-xs" disabled={isSavingDreamPrompt} />
                  <Button onClick={() => handleSavePrompt('interpretDream', dreamInterpretationPrompt)} disabled={isSavingDreamPrompt}>
                    {isSavingDreamPrompt && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {t('savePromptButton')}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </div>
      </Card>
    </div>
  );
}
