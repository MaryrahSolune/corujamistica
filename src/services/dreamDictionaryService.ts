
'use server';

import { rtdb } from '@/lib/firebase';
import { ref, get, set } from 'firebase/database';

const contentForA = `A - Escrever ou ler a letra A: Boas notícias, novidades ótimas que virão de longe, através de pessoa muito querida.
ABACATE - Maduro: Esperança, dias melhores. Verde: Alguma tristeza na família, talvez uma discussão ou briga.
ABACAXI - Força e esperança no futuro. Grandes melhoras para todos. Para as jovens solteiras, um casamento à vista.
ABELHA - Mel, açúcar: Adoçar a vida, melhorar, afastar os problemas. Logo, motivos para grandes alegrias.
ABISMO - Possível preocupação, uma queda no amor ou nos negócios, mas com melhoras imediatas. Pensamento positivo e fé.
ABÓBORA - Fartura, boa alimentação, dinheiro entrando. Felicidade conjugal.
ABORDAGEM - Alguém virá trazer uma boa notícia. Um bom conselho vindo de um amigo fiel. Novas amizades e talvez um romance.
ABOTOAR - Intriga se formando, inveja. Evitar confiar em todo mundo.
ABRAÇO - Visita de parente distante, novas amizades, boas notícias, reconciliação com amigos, parentes ou com o ser amado.
ABRIR (porta, janela, etc.) - Novos horizontes se abrindo, felicidade a caminho, perspectivas de promoção no emprego ou negócios.
ABRIGO - Proteção, aconchego, defesa contra o mal e a intriga.
ACENDER - Fogo, energia, esperança, vida. Um futuro melhor se descortinando, boas notícias, confiança em grandes melhoras.
ACIDENTE - Más notícias. Alguns problemas na família e entre os cônjuges. Pensar antes de falar.
AÇOUGUE - Sinal de boas melhoras, de grande confiança no futuro, no sucesso. Grande subida nos negócios e propostas de emprego.
ACROBACIA - Rapidez e facilidade para resolver problemas. Melhoras financeiras consideráveis.
AÇÚCAR - Vida melhor, mais próspera e afortunada. Grandes alegrias a caminho com relação aos filhos.
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
BACIA - Cheia: Muita alegria com o ser amado, o lar, e os filhos. Vazia: Notícia de parente distante, visita de alguém há muito afastado.
BAILE - É sempre motivo de alegria, de felicidade, de novas e boas amizades, de simpatia. Coisas boas e alegres estão por acontecer.
BALDE - Cheio: Preocupações com a família ou os amigos. Alguma discussão sem consequências. Vazio: Ótimo, trabalho desfeito ou muito fraco.
BALEIA - Energias redobradas para enfrentar a luta da vida, os problemas. Força e confiança no futuro. Esquecer o pessimismo e pensar com fé.
BALSA - A solução para cada problema é encontrada mais cedo ou mais tarde. Não desanimar nunca na luta. Alguém muito apaixonado. Vida.
BANANA - Ameaça de revelação de um grande segredo, o que trará sérios aborrecimentos. Banana descascada: trabalho desfeito e inútil.
BANCO - De praça: Notícia alvissareira, encontro com velho amigo. De dinheiro: Sucesso nos negócios, promoção, sorte no jogo por cinco dias.
BANDEIRA - Complicações financeiras, envolvendo documentos. Todo o cuidado com documentos, papéis de justiça. Não assinar nada sem antes ler com cuidado. Cautela com falsos amigos e advogados.
BANHO - O corpo e o espírito estão sendo descarregados, limpeza, purificação. O mesmo que água corrente que representa a descarga, a limpeza.
BARALHO - Fechado: Tristeza, infelicidade, problemas a caminho, inveja e intriga. Aberto: Sorte no jogo e nos negócios. Amigo fiel e preocupado.
BARATA - Não é muito bom sinal. Cuidado com os falsos amigos, amigos intrigantes. Cautela também com documentos, crianças e velhos.
BARBA - Loura: Felicidade e alegria a caminho. Branca: Paz e muita tranquilidade. Escura: Intriga, inveja, olho grande.
BASTÃO - Os inimigos serão agredidos (castigados, justiçados) com ele. Proteção divina, segurança. Evitar preocupações desnecessárias.
BAÚ - Fechado: Existe um grande segredo a esconder; poupar para o futuro, evitar gastos supérfluos. Aberto: Ótimo sonho, melhoras financeiras a caminho, sorte nos negócios e no jogo, felicidade para todos.
BEBÊ - Tudo referente às crianças só pode ser bom. Significa pureza, beleza e alegria. Felicidade, novos amores, novas amizades, talvez uma gravidez benvinda.
BEBER - Água: Limpeza, descarga, purificação do corpo e do espírito. Bebida alcoólica: Não é de muito bom agouro, tristeza, desunião.
BECO - Entrar num: Problema à vista, preocupação, trabalho sendo feito. Sair de um: Ótimo sonho, trabalho desfeito, problemas sendo resolvidos.
BEIJO - Na testa: Amigos sinceros, desinteressados. No rosto: O ser amado é fiel. Na boca: Traição, infidelidade, adultério.
BENGALA - Alguém virá em auxílio, servirá de apoio moral e talvez até resolva alguns problemas. Alguém em dificuldades, precisando de ajuda.
BERÇO - Criança novamente. Alegria, felicidade, paz, tranquilidade. Também uma futura gravidez, perfeita sob todos os aspectos. Em geral, nascerá menina; se menino, terá vida plena e muita riqueza.
BERRO - De alegria: Bom sonho, felicidade à vista. De dor: Uma grande tristeza a caminho. De agonia: Problema grave, doença na família.
BESOURO - Sinal de prosperidade, fartura, sucesso e boa sorte. Chances de sorte no jogo por dois dias. Uma notícia agradável surgirá.
BEZERRO - Junto da vaca, sendo amamentado: Alegria no ar, a caminho. Desgarrado: Problemas no lar, desunião, discussão ou briga entre parentes.
BIBELÔ - De porcelana: Alegria no lar e no trabalho. Vidro: Sucesso no jogo e no trabalho. De madeira: Alimentação farta, uma nova residência.
BÍBLIA - Fechada: Alta fé no futuro. Aberta: Proteção. Luxuosa: Traição.
BICO - Alguém lhe guarda um grande segredo, amigos.
BIGODE - Ver em alguém: Felicidade em todos os sentidos.
BICICLETA - Negócios em bom andamento. Uma viagem curta, de bicicleta. Insistência e fé.
BOBO - Algumas dificuldades financeiras. Infidelidade conjugal. Bobo da corte: Alguém está usando uma das pessoas da família, explorando, enganando.
BOCA - De dentes bem feitos: Felicidade em breve. De dentes feios: Tristeza. Sorrindo: Um novo amor. Contorcida: Desunião, infidelidade.
BODE - Falta de fé, pensamento negativo, falta de orações e conversas com Deus. Negligência para com as coisas do espírito. Há alguma influência maléfica sobre a família e os amigos mais chegados.
BOFETADA - Agressão, briga no lar, discussão entre parentes ou amigos, desentendimentos. Deve-se ter cautela com o que se diz para as pessoas a nossa volta.
BOI - Branco: Felicidade completa, muitas alegrias. Castanho: Boas notícias. Preto: Alguma tristeza. Malhado: Sorte nos negócios.
BÓIA - Salvação, libertação dos problemas, solução para as preocupações, boas notícias. Talvez uma longa viagem de navio ou lancha.
BOLA - Branca: Felicidade, alegria. Colorida: Sorte no jogo por três dias e sorte nos negócios. Escura: Desunião, problemas na família.
BOLACHA - Fartura de alimentos, mesa farta, algum bom dinheiro a caminho. Maior cuidado com a alimentação dos velhos e das crianças.
BOLO - Simples: Solução para os problemas maiores, principalmente os que envolvem o amor e o dinheiro. Confeitado: Alegria, uma grande notícia a caminho, casamento, noivado, em breve.
BOLSA - Poupar para o futuro, guardar algum dinheiro para uma emergência; evitar gastos desnecessários, esbanjamento. Dinheiro a caminho.
BOLSO - Significa poupar, guardar uma reserva para o amanhã. Também pode representar uma reviravolta na vida, um projeto fracassado.
BOMBOM - É criança e criança só pode ser coisa boa: dinheiro, amor, alegria. De chocolate, ótimo sonho, pois significa felicidade completa.
BONDE - Viagem a fazer em breve, visita de um parente ou amigo há muito tempo não visto. Infelicidade nos amores, uma nova amizade.
BONÉ - Branco: Alegria e felicidade para todos. Colorido: Felicidades no amor, no casamento. Escuro: Tristeza profunda, falsos amigos.
BONECA - De louça: Intriga sendo feita, amigo falso, interesseiro. De pano: Pureza, amizade sincera, um amigo virá ajudar. Que fala: Evitar ficar falando da própria vida, o que sempre suscita inveja.
BORBOLETA - Escura: Mau agouro, talvez uma curta onda de azar. Colorida: Ótimo sonho, pois representa alegria e sorte com um novo amor.
BOTA - Longas viagens pela frente, ou por diversão, ou para resolver pequenos negócios. Maiores cuidados com os pés e as mãos.
BOTÃO - Branco: Certeza de vitória quanto a um antigo problema. Colorido: Alegrias no amor e com a família. Escuro: Falsos amigos, problemas com dinheiro.
BOTE - A vitória chegará, mas deve-se lutar por ela, mesmo remando contra a correnteza. Pequena viagem, sobretudo por meio marítimo.
BRACELETE - Traição por parte de amigos, falsos amigos que só tem segundas intenções. Evitar a boa-fé excessiva e confiança em todo o mundo.
BRAÇO - Excelente sonho, sob todos os aspectos. Força, energia, vigor, saúde, disposição férrea para enfrentar todos os problemas e vencê-los. Coragem para tudo, sem esmorecimento. Fé no futuro.
BRANCO - Sonho excelente, alvissareiro. O branco significa pureza, amor, beleza. Estar vestido de branco: Felicidade dentro em breve.
BRECHA - Quanto maior, mais significa esperança de vitória, de tudo se resolver. Estar fechando uma brecha: Resolver um antigo problema.
BRIGA - Discussão dentro e fora do lar, desentendimentos, falta de compreensão. Estar assistindo a uma briga: Ver uma desunião, um rompimento.
BRILHANTE - Jóia significa sempre cobiça, ganância, paixão pelos bens materiais; más notícias, tristeza, falsos amigos, problemas com dinheiro.
BROA - É trigo, matéria-prima do pão, e o trigo sempre representou o alimento, o sustento da vida, alegria, alimentação farta. Visita de pessoa muito querida e talvez um novo e grande amor.
BROCHE - Más notícias a caminho, possível desunião de amigos bem próximos, infidelidade conjugal. Cuidado especial com dinheiro e documentos.
BROTO - Garota, jovem: Viagem longa, para tratar de pequenos negócios. Flor: Alegria inesperada, notícia excelente por carta.
BRUXA - Mau agouro, perspectiva de azar nos negócios, trabalho sendo feito, inveja. Alguém com mau pensamento para com quem sonhou.
BÚFALO - Símbolo de força, de energia. Escuro: Determinação para vencer os problemas. Branco: Muito bom o sonho, felicidade e alegria.
BUQUÊ - Flor é sempre beleza e alegria. De flores comuns: Alegria no casamento e com os filhos. De rosas: Muita sorte no amor, afeto correspondido.
BURRO - Com insistência, fé e pensamento positivo, tudo pode ser conseguido. Burro puxando carroça: Visita de parente distante.`;

const contentForC = `CABANA - Moradia, proteção, segurança. Defesa contra a inveja e a intriga. Talvez uma reforma na casa ou mudança de residência.
CABEÇA - Alguma doença mental na família, cuidados especiais com os cabelos, os olhos e a boca. Evitar Sol em excesso na cabeça.
CABELO - Também alguma doença mental na família. Possível assinatura de um documento importante. Grandes alegrias com os filhos em idade escolar.
CABOCLO - Ótimo sonho, sob todos os aspectos. Melhora de vida, proteção dos guias, trabalho desfeito, amigos invejosos se afastando.
CABRA - Alimentação farta, em especial para as crianças pequenas. Notícias de nascimento.
CACHIMBO - Sorte no jogo, nos negócios e no casamento. Casamento ou noivado em breve. Reconciliação de casais ou de amigos. Sorte no jogo.
CACHORRO - Amigos fiéis e desinteressados. Um grande amigo ajudará a resolver um grande problema. Visita de um amigo há muito distante.
CADEIRA - Maior cuidado com as pernas e os pés, evitar longas caminhadas; o descanso virá após a solução de um antigo problema.
CADELA - Bom sonho, sobretudo se a cadela estiver com os filhotes, amamentando-os. Reviravolta na vida para melhor, um novo amor.
CADERNO - Aberto: Boas notícias a caminho, sobretudo vindas de filhos em idade escolar. Fechado: Notícia ruim, vinda de longe, de outro estado ou país.
CAFÉ - Cru: Boas notícias, melhora de vida. Torrado: Uma notícia não ruim, mas desagradável. Feito: Trabalho sendo feito, amigo invejoso.
CAFUNÉ - Recebendo o cafuné de alguém: Um presente inesperado, ajuda de amigos ou parentes, afeto de amigos ou parentes. Fazendo cafuné em alguém: Boas novidades a caminho, um novo amor, melhoras financeiras.
CAIXA - Aberta: Prejuízos de pouca monta, coisa passageira. Fechada: Sorte no jogo por três dias; depois destes, azar por mais três dias.
CAIXÃO - Aberto: Rompimento de relações amorosas. Fechado: Alguma morte de um conhecido ou parente afastado. Algum convite para noivado.
CAJU - Dificuldades financeiras, sobretudo se a fruta estiver apodrecida. Refresco de caju: Aborrecimentos por motivos íntimos, discussão.
CAL - Satisfação de um desejo há muito alimentado e quase sem esperança. Seco: Sucesso nos negócios. Com água: Desavenças amorosas.
CALÇAS - Derrota de inimigos que tramam às escondidas. Alguém vestindo calças: Reconciliação de casais, amigos ou parentes.
CALÇADO - Longas viagens pela frente, ou por diversão, ou para tratar de negócios. Alguém pondo um calçado: Melhoras imediatas de alguma doença na família. Alguém retirando o calçado: Dinheiro à vista.
CALÇÃO - Branco: Tranquilidade no lar e no trabalho. Colorido: Acontecimento inesperado, coisa boa. Escuro: Mau presságio, mau agouro.
CALDEIRA - Fumegante: Êxitos sociais, melhoras no trabalho, promoções. Fria: Amor correspondido, novas amizades, dinheiro à vista.
CÁLICE - Cheio: Casamento próximo, noivado ou um novo amor. Vazio: Rompimento de namoro ou divórcio, discussões em família.
CAMA - Casamento à vista, com excelente lua de mel. Notícias de uma gravidez muito benvinda. Cama arrumada: Será menino. Desfeita: Menina.
CAMALEÃO - Falsos amigos, que a todo momento mudam de face, de intenções. Problemas com advogado traiçoeiro e desonesto. Cuidado com documentos.
CAMÉLIA - Muito bom presságio, pois flor é sempre um símbolo de alegria e felicidade. Casamento bem próximo. Um pedido de casamento de alguém muito apaixonado. Melhoras financeiras.
CAMELO - Grande prosperidade nos negócios, promoções no trabalho, aumento de salário. Significa também alimentação farta e ótima saúde.
CAMINHÃO - Andando: Desgosto profundo na família. Parado: Problemas financeiros e com a saúde. Com o capô aberto, com defeito: Desunião de casais.
CAMISA - Branca: Triunfo sobre inimigos ou falsos amigos. Colorida: Viagem longa, em especial para negócios. Escura: Mau presságio.
CAMPAINHA - Tocando: Morte de conhecido ou amigo. Em silêncio: Alguém muito preocupado com um problema. Com defeito: Tristeza na família.
CAMPO - Muito bom presságio. Mudança de residência em perspectiva, melhoras de alguém muito doente, sorte no jogo e nos empreendimentos.
CAMUNDONGO - Branco: Alguma boa notícia a caminho, visita de parente distante, êxito nos amores. Escuro: Alguém planeja uma traição, um falso amigo logo será desmascarado, tristeza nos amores.
CANA - Viagem inesperada, para resolver negócios pequenos ou assinar escritura. Traição de amigos, parentes ou mesmo de amantes.
CANÁRIO - Cantando: Notícias muito boas a caminho, prosperidade, perspectiva de felicidade. Em silêncio: Sérias dificuldades na família.
CANDELABRO - Aceso: Melhoras para os enfermos, visita de um velho amigo. Apagado: Traição de um suposto amigo, intriga, inveja.
CANETA - Êxito nos amores, triunfo sobre os inimigos traiçoeiros. Ver alguém escrevendo: Notícias de longe, velhas amizades que voltam.
CANHOTO - Mudança de rumo de vida, normalmente para melhor. Mudança de residência. Promoção no trabalho, melhoras financeiras, sorte no jogo.
CANIL - Felicidade bem próxima, prosperidade em todos os sentidos, sobretudo em se tratando de dinheiro. Deve-se apenas ter cautela com os animais domésticos, principalmente cães, sejam pequenos ou grandes.
CANIVETE - Aberto: Discussão e aborrecimentos, traição de um falso amigo, intriga se formando. Fechado: Bom agouro, trabalho desfeito.
CANO - Um aumento está a caminho no trabalho, melhoras financeiras, talvez até mesmo compra de uma casa ou apartamento novo.
CÃO - Pequeno: Melhoras razoáveis na vida, algum dinheiro, em especial vindo de algum jogo. Grande: Alegria, felicidade, afeto correspondido.
CAPA - Escura com fundo vermelho, muito mau presságio, pois sugere a presença de forças negativas. Cores claras: Boas perspectivas de vida.
CAPACETE - Alguém com capacete: Trabalho desfeito, alguém tramando uma traição que não dará certo. Capacete escuro: Morte próxima.
CAPELA - Pequena: Reviravolta na vida, casamento bem próximo, pedido de noivado oficial. Grande: Para os noivos e noivas, casamento feliz e com muitos filhos. Grandes notícias a caminho.
CAPOTE - De cor escura: Azar no jogo, durante cerca de três dias. Sérias dificuldades financeiras. De cor clara: Bom presságio, êxitos sociais.
CARNAVAL - Carnaval é a festa do demônio, da orgia, da luxúria. Sonho muito negativo, capaz de trazer maus fluidos para aquele que sonha e seus íntimos.
CARNE - Mau sonho, sobretudo se a carne for fresca, banhada em sangue. Preparada, seja qual for o prato, trabalho feito e intriga formada.
CARTA - Notícias que virão de longe, de parente ou amigo há muito afastado. Telegrama trazendo novidade não muito agradável.
CARVALHO - Inveja de falsos amigos, maquinações traiçoeiras de pretensos amigos. Carvalho tombado ou cortado: Êxitos nos amores e no dinheiro.
CASA - Ótimo sonho, pois significa proteção, melhoras de vida, ótimas perspectivas financeiras. Entrando numa casa: Mudança para melhor residência. Saindo de uma: Problemas com documentos.
CASACA - Perda de emprego, reviravolta na vida, até mesmo mudança de estado civil. Neste último item, a mudança é sempre para melhor.
CASAMENTO - Assistir a um: Ótimo sonho, em especial para as mães com filha em idade de se casar. Estar casando: Excelente para as noivas e os noivos.
CAVALO - Escuro: Bom presságio, elevação social, promoção no emprego, bons negócios. Branco: Somente felicidade e alegria, para todos.
CEGONHA - Para as futuras mães, excelente sonho, e é quase certo que nasça menina. Para as noivas, prole numerosa. Para os namorados, noivado em breve.
CINZA - Vitória nos empreendimentos, nos planos. Indica também namoro ou noivado desfeito, mas com fácil reconciliação. Reforma na casa em breve.
COBRA - Sonho não muito bom. Estar sendo mordido por uma: Traição de amigos, trabalho sendo feito, problemas financeiros. Cobra grande: Cautela com os falsos amigos. Cobra pequena: Desentendimentos na família e com os parentes.
COELHO - Noivado ou namoro desfeito, divórcio. Estar afagando um coelho: Melhoras financeiras, promoção no trabalho, azar no jogo.
CONCHA - Cheia: Alguma notícia referente a dinheiro a caminho, e notícia sempre boa. Vazia: Amizade desfeita devido a intrigas de terceiros.
COPO - Cheio: Novas amizades. Vazio: Tristeza na família. Com água: Possibilidades de grandes empreendimentos. Com bebida alcoólica: Desunião.
CORAÇÃO - Afeto correspondido, êxitos no amor, casamento à vista. Coração pulsando: Alguém muito apaixonado, mas tímido.
CORREDOR - Ver um corredor: Problemas pela frente que terão de ser vencidos. Estar andando por um corredor: Problemas sendo resolvidos.
CRUZ - Nua: Casamento bem próximo, um provável pedido de casamento, afeto correspondido. Com Nosso Senhor: Ótimo sonho, problemas sendo resolvidos, proteção divina, amigos leais e desinteressados.`;

const contentForD = `DADO - Estar jogando dados: Problemas com pessoas habituadas a jogar. Estar vendo um jogo de dados: Sorte no jogo, desunião na família.
DANÇA - Estar dançando: Grandes alegrias a caminho, boas notícias, tanto de perto quanto de longe. Estar vendo uma dança: Melhoras financeiras, promoção.
DEBATE - Desentendimentos na família. Ver um debate: Briga com amigos. Participar de um: Problema com parentes e com documentos importantes.
DECOLAGEM - Perspectivas de longas viagens, ou por diversão ou para negócios.
DECOTE - Usar um decote: Separação conjugal. Estar vendo um: Cônjuge infiel, falso.
DEDAL - Estar usando: Proteção divina, trabalho desfeito, coragem para enfrentar todos os problemas. Ver alguém usar um: Preocupação com amigos, problemas com parentes e amigos, alguma tristeza em família.
DEDO - Os traidores serão desmascarados e castigados. Intriga desfeita por terceiros. Alguma melhora financeira. Sorte no jogo por três dias.
DEFUNTO - Mau agouro, principalmente se o defunto for conhecido. Se parente: Tristeza profunda na família. Se amigo: Desentendimentos dentro e fora do lar.
DEGRAU - Estar subindo um: Ascensão social e financeira. Estar descendo: Problemas no trabalho, na família e com os amigos.
DENTE - Mau agouro, sobretudo se os dentes tiverem alguma enfermidade. Dentes brancos e certos: Alguma alegria dentro do lar.
DESAFIO - Desafiar alguém: Desentendimentos com amigos e parentes. Estar sendo desafiado: Grande problema de difícil solução a caminho.
DESERTO - Ver um deserto: Alguns problemas pela frente, sobretudo no trabalho ou nos negócios. Estar num deserto: Reviravolta na vida, quase sempre desagradável. Sol quente no deserto: Doença na família.
DESPEDIDA - Estar vendo uma despedida: Alguém da família fará uma longa viagem. Estar se despedindo de alguém: Amigo ou conhecido vai viajar.
DEUS - Excelente sonho, sob todos os aspectos, em especial se a pessoa que sonha está conversando com Deus. Grande proteção para as crianças.
DIA - Ensolarado, céu claro: Ótimas perspectivas de vida, alegrias e felicidade a caminho. Chuvoso, nublado: Problemas à vista.
DIABO - Péssimo sonho, sob todos os aspectos. Deve-se fazer muitas orações a Deus para que Ele afaste os maus fluidos da casa e das pessoas.
DIAMANTE - Por ser uma jóia, é um sonho não muito propício. Mas, por outro lado, por ele brilhar, irradiar luz, sugere sempre alegria e felicidade.
DINHEIRO - Bom sonho, pois representa melhoras financeiras, boas perspectivas no trabalho e nos negócios e sorte no jogo. Estar recebendo dinheiro: Grande sorte no jogo, aumento de salário.
DIVÃ - Estar deitado num: Doença na família. Ver alguém deitado num: Alguma má notícia a caminho. Ver um divã vazio: Mudança de residência.
DOCE - Doce lembra criança e criança sempre representa amor, alegria, beleza. Bom sonho, principalmente para os casais com muitos filhos.
DRAGÃO - Não é muito bom sonho, em especial se o dragão estiver cuspindo fogo. Satisfação dos desejos, algumas dificuldades sem muita importância.
DUELO - Estar assistindo a um: Aventura sentimental sem maiores consequências. Estar participando de um: Reconciliação com ente querido.
DUETO - Estar ouvindo um dueto: Ameaça de enfermidade mental em algum parente. Estar cantando em dueto: Triunfo sobre os inimigos, os falsos amigos.
DUQUE - Ser um duque: Ascensão social, melhoras financeiras, promoções no trabalho, melhores negócios. Estar vendo ou conversando com um: Novas amizades, de prestígio e bem colocadas financeiramente.`;

const contentForE = `ÉGUA - Sonho de bom presságio, é sinal de advertência contra inimigos, inveja e falsos amigos. Algumas vezes, êxitos nos negócios.
ELEFANTE - Muito bom sonho, em especial se for elefante branco, pois, segundo a lenda, os brancos sempre trazem alegrias, amor e felicidade.
EMPADA - Ver uma: Amor correspondido. Comer uma: Trabalho desfeito através do pensamento positivo. Ver alguém comer uma: Intrigas e traição.
ENTERRO - Péssimo agouro, em especial se o caixão estiver aberto. Tristeza pela frente.
ENTORNAR - Água: Reconciliação com parentes próximos. Outros líquidos: Mudança de residência.
ENTULHO - Ver monte de: Sorte no jogo, por quatro dias. Estar removendo um monte de: Problemas sendo resolvidos rapidamente. Geralmente é um sonho bom, com ótimas consequências para quem sonha e seus íntimos.
ENXADA - Estar escavando um terreno: Reviravolta na vida, para melhor. Estar preparando terreno para plantio: Alimentação farta, dinheiro à vista.
ENXERTO - De órgãos humanos: Problemas com a saúde, principalmente das pessoas mais idosas. De planta: Boas notícias, casamento próximo, êxito no amor.
ENXOTAR - Alguém conhecido de casa: Falso amigo desmascarado. Ser enxotado de uma casa: Bom sonho, indica mudança de residência para melhor.
ENXUGAR - Alguma parte do corpo: Pedido de casamento, promoção no emprego. Algum objeto, o chão da casa: Casamento muito próximo com muitos filhos.
ERVILHA - Crua: Sérias dificuldades, sobretudo por causa de intrigas. Cozida: Superação de problemas. Prato com: Dificuldades financeiras.
ESCADA - Estar subindo uma: Pedido de casamento, convite para um casamento, ascensão social, promoção no trabalho. Estar descendo uma: Rompimento passageiro de noivado, namoro ou mesmo casamento.
ESCORPIÃO - Bom sonho. Ser picado por um: A sorte vai virar e muita coisa boa acontecerá. Ver alguém ser picado: Discórdia entre amigos.
ESCRAVO - Muito bom sonho, pois representa proteção vinda de algum preto velho ou preta velha. Geralmente representa trabalho já desfeito e inútil.
ESCULTURA - Estar esculpindo alguma coisa: Vitória sobre inimigos inescrupulosos. Ver uma pessoa esculpir: Algum amigo receberá grande notícia.
ESCURIDÃO - Péssimo presságio, problemas financeiros, grandes dificuldades a caminho. Uma luz na escuridão: A solução para tudo não tardará.
ESGOTO - Prejuízos nos negócios: talvez probabilidade de uma viagem longa, para tratar de trabalho, visita de amigo distante, alguma contrariedade.
ESMALTE - Cor clara: Superação de intrigas, de maledicências. Cor escura: Acautelar-se diante de perigos ocultos, rivalidades no emprego. Cor vermelha: geralmente significa discussões em família.
ESMOLA - Dificuldades superadas, triunfo sobre os inimigos, os amigos interesseiros. Significa também árduos esforços, mas recompensados.
ESPADA - Casamento ou noivado próximo, muito próximo. Achar uma espada: Rompimento de relações, em especial as amorosas. Prejuízos nos negócios.
ESPANTALHO - Notícias bastante desagradáveis, sobretudo referentes a parente distante e há muito não visto. Sorte no jogo por três dias.
ESPANADOR - Sorte nos amores, um pedido de casamento em vista, convites para casamentos, batizados e bodas. Sorte nos negócios e no jogo.
ESPELHO - Estar se mirando num espelho: Um novo amor a caminho, melhora financeira. Ver alguém se mirando num espelho: Morte ou doença próximas.
ESPINHO - Más notícias, tanto de perto quanto de longe. Algum perigo de desastre em viagens longas. Problemas na família. Cautela com maquinações de falsos amigos, acarretando prejuízos e dificuldades.
ESTEIRA - Ver uma esteira: Grandes dificuldades, mas que serão logo superadas. Estar deitado numa esteira: Rompimento de uma velha amizade, desunião.
ESTRADA - Estar caminhando por uma estrada: Longos problemas pela frente, dificuldades a caminho. Talvez uma viagem, nem curta, nem longa.
ESTRELA - Ver uma estrela em noite nublada: Esperanças de grandes melhoras, a solução de problemas está perto. Em noite clara: Felicidade e amor.
ESTRELA-DO-MAR - Reconciliação com parentes próximos, mudança de residência para dentro em breve, regresso inesperado de um parente.
ESTRUME - Ver estrume: A sorte pode mudar para melhor, bem melhor. Pisar ou escorregar em estrume: Muita sorte, muita felicidade, amor e alegria.
EXÉRCITO - Sorte no jogo, por três dias, realização de um velho desejo. Se for exército inimigo: Traição de um falso amigo, inveja, fofoca de íntimos.`;

const contentForF = `FACA - Achar uma faca: Problemas à vista, não muito graves. Cortar-se com uma faca: Problemas à vista, estes, sim, bastante graves. Intriga e traição.
FAÍSCA - Desgostos, tanto mais profundos quanto maior for o número de faíscas. Representa também sérias dificuldades financeiras e atritos na família.
FADA - Tropeços na vida, principalmente com os filhos homens e maiores de idade. Dificuldade provocadas por calúnias de falsos amigos e parentes.
FALCÃO - Ver um falcão em voo: Viagem longa mais para negócios que para diversão.
FANTASMA - Desgosto na família, perda de emprego, má notícia referente a parente distante.
FARINHA - Sonho bastante favorável, pois indica ascensão social, ascensão econômica, promoção no emprego. Indica também alguma reforma na casa ou mesmo uma mudança em breve de residência, para melhor.
FAROL - Aceso: Indica ótimas perspectivas de vida, em especial a solução há tanto aguardada para um problema. Apagado: Mau agouro, tristeza.
FAXINA - Estar fazendo faxina na casa: Excelente sonho, os maus fluidos estão sendo varridos, levados para longe. Ver uma faxina: Um amigo em breve feliz.
FAZENDA - Maquinações de inimigos ou falsos amigos, mas que serão, cedo ou tarde, desmascarados. Muita cautela com documentos e com o que se fala da própria vida.
FECHADURA - Funcionando bem: Ótimas perspectivas de vida, sobretudo com relação a dinheiro, pagamentos atrasados. Emperrada: Sucessos amorosos.
FEIJÃO - Cru: Casamento ou noivado próximos. Preparado: Trabalho bem feito. Quanto mais elaborado o prato com feijão, pior o trabalho feito.
FEIRA - Ver uma feira: Intrigas desmascaradas, falsos amigos descobertos, calúnias esclarecidas. Estar fazendo feira: Dinheiro a caminho, alimentação farta, promoção no emprego e muita sorte nos negócios.
FEITIÇO - Não há motivos para preocupações, pois geralmente esse sonho é de bom presságio. Se vir alguma bruxa lançando o feitiço: Sorte no jogo.
FEL - Complicações sentimentais, atritos entre namorados, noivos ou cônjuges. Alguns problemas financeiros envolvendo empréstimos bancários.
FERA - Sorte no amor, no jogo; um grande ideal, mais cedo ou mais tarde, será alcançado, para a felicidade de todos. Casamento em breve.
FERRADURA - Sonho excelente, sob todos os aspectos. Sorte em todos os sentidos, sobretudo no amor, tanto maior quanto for o número de ferraduras.
FIGA - Sorte na vida e principalmente nos negócios ou emprego. Provavelmente, muito em breve, uma excelente promoção, um bom aumento de salário.
FIGO - Ao natural: Melhoras de vida, talvez mudança de residência. Cristalizado: Alguns problemas, em especial com intrigas de inimigos. Em calda: Sonho de mau agouro, pois sugere vinganças há muito esquecidas.
FILA - Ver uma fila: Amigos, parentes ou amigos em breve enfrentarão alguma dificuldade. Estar numa fila: A pessoa que sonha terá problemas pela frente.
FILHO - Filha mulher: Problemas com os filhos homens, em especial o mais velho. Filho homem: Alguns atritos com as filhas, sobretudo a mais velha.
FITA - Branca: Muita paz e tranquilidade, para todos. Colorida: Uma pequena e passageira tristeza. Escura: Provável morte de amigo ou conhecido.
FLOR - Ótimo sonho, primeiro por se tratar de flor, segundo por ser algo vindo da terra, da mãe-natureza. Felicidade e alegria sob todos os aspectos.
FLORESTA - Estar numa floresta: Tranquilidade, despreocupação. Ver uma floresta em chamas: Graves problemas a caminho, queda séria na vida.
FOGO - Ver fogo: Sorte no jogo, tanto maior quanto mais intenso for o fogo. Queimar-se com fogo: Problemas sérios dentro em breve, envolvendo escrituras e documentos bancários. Cautela com fósforos, isqueiros, etc.
FOLHA - Folha de árvore, planta: Desavenças por questão de dinheiro, rivalidades no emprego. Folha de papel: Problemas com documentos.
FRUTAS EM GERAL - Sonho muito bom. Sorte no jogo e no trabalho. Frutas grandes, como melancia, jaca representam rápida ascensão social e financeira.
FUMAÇA - Satisfação plena de um desejo há muito acalentado. Prosperidade, um amor correspondido, um provável casamento na família, em especial com a filha mais velha.
FUNERAL - Péssimo sonho. Se for funeral de alguém conhecido: Morte ou doença na família. Alguém desconhecido: Morte de um amigo ou conhecido.
FUNIL - Estar enchendo algo com um funil: Prosperidade para todos na família. Ver um funil: Infidelidade conjugal; geralmente o homem é o culpado.
FUZIL - Ver um fuzil: Viagem inesperada, geralmente em companhia dos filhos. Estar empunhando um fuzil: Desilusão amorosa, infidelidade conjugal, aborrecimentos passageiros, em especial com os filhos.`;

const contentForG = `GADO - Em grande quantidade: Muita sorte no jogo e êxitos nos amores. Em pouca quantidade: Casamento próximo, uma novidade agradável a caminho.
GAIOLA - Ver uma gaiola: Algum amigo ou conhecido envolvido com problemas de justiça. Estar dentro de uma gaiola: Graves problemas à vista.
GALINHA - Ver uma galinha ciscando: Bom sonho; boas notícias a caminho, visita de parente distante. Galinha preparada: Falsos amigos preparando traição.
GANCHO - Não é muito bom sonho, sobretudo se houver alguma carne pendurada no gancho.
GANGORRA - Ver uma gangorra: Problemas à vista. Estar numa gangorra: Graves dificuldades.
GARFO - Ver um: Fluidos negativos na casa, no trabalho, muita inveja e mau olhado de falsos amigos. Estar comendo com um: Alimentação farta, boa saúde para todos, embora represente também desavenças no lar.
GARRAFA - Bom sonho, sobretudo se for grande o número de garrafas. Cheia: Sorte no jogo por três dias. Vazia: Sorte nos amores e nos negócios.
GATO - Geralmente, não é bom presságio, visto que o gato sempre representa a traição, a infidelidade. Pode ser alguma traição de amigos falsos.
GAVETA - Aberta: Desilusão amorosa. Fechada: Um novo amor a caminho. Cheia: Alguma viagem por motivo desagradável. Vazia: Alguma tristeza na família.
GELO - Aborrecimentos passageiros, em especial com o filho mais velho. Pode ser também sorte no jogo, se o gelo for muito grande, como um iceberg.
GIGANTE - Se for do sexo masculino: Afeto correspondido. Se for do feminino: Uma boa notícia a caminho. Mais de um gigante: Aumento da família.
GIRAFA - Talvez, complicações com a justiça, envolvendo documentos importantes. Ver uma girafa comendo: Grande sucesso nos empreendimentos. Uma girafa de pescoço abaixado: Melhoria de posição econômica.
GLOBO - O mundo é redondo: o que se faz aqui, se paga ali adiante. Os inimigos serão justiçados, o bem praticado será recompensado, um problema resolvido.
GRAMA - Ver uma grande extensão de: Melhoras financeiras, elevação social, promoção no trabalho. Ver pequena extensão de: Problemas familiares.
GRAVATA - Clara: Casamento, noivado ou batizado. Colorida: Uma comemoração para celebrar um grande acontecimento. Escura: Doença ou morte.
GRUTA - Estar saindo de: Solução de um problema. Estar entrando numa: Dificuldade pela frente. Estar em uma: A solução dos problemas demorará um pouco.
GUARDA-CHUVA - Aberto: Proteção divina. Fechado: Notícia inesperada e desagradável. Estar com ele dentro de casa: Mau agouro, péssima novidades.
GUARDANAPO - Todo branco: Paz e tranquilidade no lar. Colorido e/ou bordado, enfeitado: Calúnia que será logo, logo, desmascarada. Estar limpando a boca com um: Os falsos amigos logo serão afastados.`;

const contentForH = `HARPA - Ouvir uma: Viagem próxima. Estar tocando uma: Doença passageira, de fácil cura. Geralmente, harpa significa ótimas novidades nos negócios.
HÉLICE - Ver uma hélice parada: As melhoras de vida ainda demorarão para vir, mas virão. Ver hélice girando: Bom presságio, amores correspondidos.
HORIZONTE - Se não houver nuvens no céu, é um excelente sonho, pois revela paz e tranquilidade. Com nuvens no céu: Sérios problemas pela frente.
HOSPITAL - Ver um: Êxito nos negócios. Estar num: Doença, grave ou passageira, na família.
HOTEL - Ver um: Alguma viagem pela frente, por motivo desagradável. Estar num: Viagem próxima.
HOSPÍCIO - Ver um: Grande sorte no jogo, nos negócios, aumento de salário, promoções. Estar num: Doença mental na família ou na de amigos. Sair de um: Solução de um problema bem próxima.`;

const contentForI = `IEMANJÁ - Excelente sonho, sob todos os aspectos. Iemanjá é pureza, é força, é a rainha do mar. Ótimas notícias pela frente e grandes melhoras de vida.
IGREJA - Estar numa: Proteção divina. Estar saindo de uma: Esquecimento das coisas de Deus. Com uma grande escadaria: Um excelente casamento em breve.
ÍNDIO - Muito pintado: Sérios desentendimentos com membros da família e com os amigos. Sem pintura alguma: Harmonia e compreensão no lar e com os amigos.
INFERNO - Ver o inferno: Dificuldades financeiras. Estar no inferno: Muito mau presságio.
INSETO - Pegar um: Sorte no jogo. Matar um: Sorte nos negócios. Afugentar um: Maré de azar.
INUNDAÇÃO - Boas perspectivas de vida, êxito nos negócios, no amor, promoções no trabalho, casamento ou noivado próximo. Ver-se tragado pela inundação: Intrigas e calúnias de falsos amigos.`;

const contentForJ = `JACA - Ver uma: Rápida ascensão social e financeira. Estar comendo uma: Alguns problemas de saúde para a pessoa que sonha. Cuidado com a alimentação.
JACARÉ - Boas notícias a caminho; alguma viagem, longa ou curta, por via marítima, para resolver assuntos de pequena monta.
JANELA - Fechada: Desavenças na família, com os amigos e até mesmo discussão no emprego. Aberta: Grande prosperidade para todos e sorte no jogo.
JARDIM - Dificuldades de pequena proporção, sobretudo dizendo respeito a documentos.
JOGO - Ver um jogo: Sorte no jogo; desunião da família, sobretudo se for jogo de dados ou de cartas. Estar jogando: Dificuldades.
JOIA - Não é de bom presságio, pois jóias sempre representam a ganância, a cobiça, a ambição desmedida. Deve-se ter maior cautela com os objetos preciosos, pois correm riscos de perder-se ou ser roubados.`;

const contentForL = `LABIRINTO - Ver um: Sorte no jogo. Estar num, sem achar a saída: Graves problemas pela frente. Estar num, achando a saída: Solução para um antigo problema.
LABORATÓRIO - Estar trabalhando num: Com trabalho, determinação e fé, todos os problemas serão resolvidos. Ver alguém trabalhando num: Trabalho sendo feito.
LAÇO - Laçar alguém: Amor correspondido, casamento para muito breve. Estar sendo laçado por alguém: Calúnias e intrigas de falsos amigos.
LADEIRA - Subir uma: Ascensão social. Descer uma: Queda na vida, nas finanças.
LAGARTA - Sorte, muita sorte, no jogo, no trabalho, nos negócios e no amor.
LAGO - Prosperidade, melhoras financeiras, dinheiro inesperado que virá resolver muitos problemas. Se a pessoa sonhar que está nadando no lago: Ótimo sonho, pois representa grande triunfo sobre os inimigos.
LAMA - As dificuldades serão resolvidas mais cedo do que se imagina. Perspectiva de uma árdua luta, mas que terá final vitorioso.
LÂMINA - Ver uma: Desavença na família. Cortar-se com uma: Rivalidade no trabalho, intriga e inveja. Homem barbeando-se com uma: Felicidade no amor.
LÂMPADA - Apagada: Tristeza na família. Acesa: Afeto correspondido, solução de um problema. Quebrada: Trabalho desfeito, calúnia desmentida.
LANÇA - Grande sucesso nos amores. Para os homens: Casamento em breve. Para as mulheres: as casadas, futura gravidez; as solteiras, um pedido de casamento.
LÁPIS - Preto: Sérias preocupações de ordem monetária, com algumas dívidas a pagar. Colorido, sobretudo azul: Viagem próxima e aventurosa.
LAR - Estar fora do lar: Desentendimento na família, discussões, até mesmo separação ou divórcio. Estar dentro do lar: Harmonia na família, grande compreensão entre os membros da família.
LARANJA - Verde: Rompimento de relações amorosas. Madura: Amor correspondido. Seleta: Infidelidade. Lima: Amor sincero e fiel, em especial para os casados.
LAVAR - Roupa: Graves aborrecimentos. Algum cômodo da casa: Perigo vencido, maus fluidos afastados do lar e da família. O próprio corpo: Descarga.
LEÃO - Ver um: Perigo à vista. Lutar com um: Os problemas devem ser enfrentados com coragem. Matar um: O perigo foi ou será vencido.
LEBRE - Para o homem: Liderança no emprego e na família. Para a mulher: Problemas de saúde, intrigas amorosas, inveja, infidelidade conjugal.
LEITE - Fresco: Viagens a terras distantes, dinheiro inesperado, alimentação farta. Azedo: Ameaça grave, desentendimentos entre amigos.
LEITO - Ver alguém deitado num: Doença de pessoa próxima, em especial algum parente. Estar deitado num: Problemas de saúde para a pessoa que sonha. De hospital: Enfermidade grave na família.
LENÇO - Branco: Partida para uma longa viagem de um amigo ou parente muito querido. Colorido: Regresso de pessoa ausente, uma viagem curta.
LENÇOL - Branco: Intrigas amorosas, infidelidade conjugal, falsos amigos, um amor não muito sincero. De cor: Futura gravidez benvinda.
LEQUE - Aberto: Notícia surpreendente, dentro em breve, capaz de dar uma reviravolta na vida de quem sonha. Fechado: Morte de parente distante.
LIGA - Geralmente, é de mau agouro, mas, em algumas ocasiões, pode ser um símbolo favorável, capaz de atrair dinheiro, sorte nos negócios e no amor.
LIMÃO - Verde: Indica saúde boa para quem sonha e para seus entes queridos. Amarelo: Notícia muito boa a caminho, para felicidade de todos.
LÍRIO - Muito bom sonho, principalmente para as moças solteiras, pois representa um feliz matrimônio para muito em breve. Para as casadas: uma ótima gravidez, e talvez nasçam gêmeos.
LIVRO - Fechado: Problemas na escola com os filhos menores. Aberto: Boas notícias através dos filhos menores, uma formatura muito em breve.
LIXA - De madeira: Viagens longas, para resolver negócios, ou mesmo assuntos de herança. De unhas: Maior cuidado com os pés e as mãos.
LUA - Nova: Melhoras financeiras. Quarto crescente: Ascensão social. Quarto minguante: Problemas na família. Cheia: Boa sorte em tudo.
LUTO - Mau agouro, sobretudo se é a pessoa que sonha quem está vestida de luto. Morte de alguém muito próximo, doença de alguém distante.
LUVA - Branca: Casamento ou noivado à vista. De cor: Ascensão social, consideráveis melhoras econômicas. Escura: Tristeza com os amigos e parentes.
LUZ - Sonho mais que propício, sobretudo para as mulheres grávidas, pois significa um parto rápido e muito feliz. Geralmente, nascerá menina. Se for menino, terá vocação para a Economia e os grandes negócios.`;

const contentForM = `MAÇÃ - Verde: Desgostos com parentes e amigos, alguma intriga, alguém em inveja. Madura: Bom presságio, melhoras em questões de dinheiro.
MACACO - Grande: Indica promoção no trabalho, reconciliação amorosa. Pequeno: Dificuldades sentimentais, sobretudo entre os noivos.
MACHADO - Normalmente, indica que o mal está sendo afastado para longe. Em algumas ocasiões, pode significar grande sorte no jogo.
MÃE - Sonho perfeito, excelente, maravilhoso mesmo. Paz, tranquilidade e felicidade para todos.
MALA - Aberta: Visita de parente distante. Fechada: Uma viagem em breve.
MANTEIGA - Dura, gelada: Prejuízos nos negócios, problemas no emprego, dívidas a pagar. Mole: Re-estabelecimento de pessoa doente, realização de um negócio lucrativo ou mesma reviravolta na vida.
MAR - Calmo: Notícias que virão de longe e serão bastante agradáveis. Furioso: Problemas graves à vista, que só serão resolvidos com muita calma.
MARIDO - Grande prosperidade nos negócios, sobretudo se o marido estiver de terno e gravata. Com roupas esporte: Sorte no jogo.
MARTELO - Maquinações de falsos e interesseiros amigos, para uma traição. Cautela ao lidar com pessoas estranhas. Não falar muito da própria vida.
MÁSCARA - Engraçada: Boas notícias a caminho. Assustadora: Dificuldades financeiras, alguns desentendimentos com amigos que se vivem elogiando.
MEDALHA - Vendo-se a parte da frente: Viagens longas, com motivos mais que agradáveis. Vendo-se o verso: Um amigo ou conhecido tem duas caras.
MEDO - Estar com medo: Desavenças na família, com os amigos e até mesmo no emprego. Cautela com o relacionamento com as pessoas. Fazer medo a alguém: Tristeza na família, problemas de dinheiro.
MEIA - Branca: Muita tranquilidade no lar. De cor: Notícia auspiciosa a respeito de dinheiro ou trabalho. Escura: Discórdia de amigos.
MEL - Boas notícias, sobretudo referente a venda e compra de casa, a mudança de residência e a negócios lucrativos. Perfeita saúde para as crianças.
MELANCIA - Êxitos nos negócios, sorte no jogo e muito êxito nos amores. Representa também que alguém muito apaixonado está morrendo por esse amor.
MISSA - Assistir a uma missa: Regresso de um parente há muito afastado, possibilidades de mudança de residência. Estar rezando uma missa: Prejuízos nos negócios, demissão de um emprego.
MITRA - Ver uma mitra: Proteção divina, segurança no lar e no emprego. Estar usando uma mitra: Boas novidades a respeito de trabalho.
MOBÍLIA - Sonho muito favorável, em especial para os noivos com data marcada para o casamento, pois indica casamento longo, feliz e com muitos filhos.
MOCHO - Mau agouro, mau presságio, ainda mais se o mocho estiver dentro de casa. Cautela com as crianças e os velhos, maior cuidado consigo mesmo.
MOEDA - Vendo-se a parte da frente: Viagem longa, por motivos agradáveis. Vendo-se o verso: Traição por parte de um velho amigo da família.
MOINHO - Ver um moinho por fora: Atraso na vida. Ver um moinho por dentro: Discórdia entre amigos. Normalmente, o moinho pode representar alguma doença não muito grave na família, em especial com os velhos.
MONTANHA - Estar subindo uma montanha: Grande prosperidade, ascensão social, promoção no emprego. Estar descendo: Problemas graves pela frente.
MORDAÇA - Estar amordaçado: Problemas na família e com dinheiro. Cuidado com documentos. Estar amordaçando alguém: Boas notícias que virão de longe.
MORTE - Normalmente, não é bom presságio, sobretudo se virmos a morte (uma caveira, a foice, a capa longa). Se for um cadáver: Sérios problemas na casa.
MOSCA - Matar uma mosca pode significar sorte nos negócios ou azar no jogo. Capturar uma mosca: Ótimo sonho, pois representa casamento feliz.
MUDANÇA - Assistir a uma mudança: Um falso amigo cometerá uma traição. Se a mudança estiver saindo de casa de quem sonha: Problemas com a casa, dívidas.
MURO - Estar pulando um muro: Grandes problemas sendo resolvidos dentro de muito pouco tempo. Estar barrado por um muro: Dificuldades muito sérias pela frente e de difícil resolução. Geralmente, pode ser sorte no amor.`;

const contentForN = `NABO - Geralmente, é um ótimo sonho, sobretudo para as senhoras grávidas, pois sugere um parto feliz e um bebê saudável. Em 70 por cento dos casos, será menina.
NADAR - Ver alguém nadar: Sorte no jogo e nos negócios. Estar nadando: Promoção no emprego, melhoras financeiras, problemas sendo resolvidos rapidamente.
NARIZ - Bom sonho, auspicioso. Assoar o nariz significa mudança de residência. Ver alguém assoar o nariz: Amigos falsos, interesseiros.
NASCIMENTO - Ótimo sonho, sucesso financeiro, êxitos nos amores, realização de um velho sonho e de cuja realização se tinha muita dúvida.
NATA - Alguém na família está para adoecer, mas será enfermidade passageira.
NAUFRÁGIO - Ver um naufrágio pode significar melhoras financeiras, prosperidade, mas também desentendimentos no lar. Ser um náufrago: Falsos amigos tramando traição, intrigas. Alguém muito invejoso.
NAVALHA - Ver uma navalha: Sorte no jogo. Cortar-se com uma navalha: Discórdia entre amigos. Cortar alguém com uma navalha: Discussões sérias no lar.
NAVIO - Ver um navio: Viagem bem próxima. Estar viajando de navio: Problemas com os filhos. Descer de um navio: Um problema afinal teve sua solução.
NECROTÉRIO - Estar num necrotério: Alguém na família doente, mas doença passageira. Estar morto num necrotério: Alguém doente muito grave na família.
NEGRO - Cor negra bom presságio, sobretudo para os homens de negócios. Homem negro: Felicidade conjugal. Mulher negra: Uma gravidez feliz e normal.
NENÉM - Recém-nascido: Felicidade completa para todos, alegria em todos os sentidos. Sendo amamentado: Alimentação farta. Com alguns meses: Dinheiro à vista.
NEVE - Neve caindo significa dinheiro à vista, realização de um negócio lucrativo e promoção no trabalho. Estar deitado na neve: Um novo amor, sincero e afetuoso. Jogar bolas de neve: Grande sucesso amoroso.
NEVOEIRO - Ver um nevoeiro: Graves problemas pela frente, de difícil solução. Estar perdido num nevoeiro: Dificuldades continuarão por algum tempo.
NINHO - Ver um ninho com filhotes: Nova residência, para melhor. Estar fazendo um ninho: Excelente para os noivos, pois indica casamento longo e feliz.
NÓ - Estar dando um nó: A própria pessoa que sonha está dificultando a vida de si mesma. Desfazer um nó: Problema difícil afinal solucionado.
NÓDOA - Em roupa clara: Dificuldades no emprego, normalmente geradas por rivalidades de colegas. Em roupa escura: Cautela com estranhos, com pessoas muito sorridentes.
NOITE - Muito escura, sem Lua: Graves problemas financeiros pela frente, e envolvendo documentos. Clara, com Lua: Melhoras de saúde, mas não totais.
NOTA - De dinheiro: Sorte no jogo, nos negócios, uma promoção ou aumento de salário no emprego. Recado, lembrete: Advertência contra falsos amigos, que só agem movidos por interesses, por segundas intenções.
NOVELO - De linha: Problemas difíceis de resolver. De lã: Graves dificuldades pela frente. De barbante: Alguma morte, talvez entre a família.
NOZ - Fechada: Trabalho feito por pessoa invejosa e muito intrigante. Quebrada: Trabalho desfeito, inútil. Perigo muito grande já passou.
NUDEZ - De mulher: Noivado à vista, com casamento logo em seguida. De homem: Infidelidade conjugal. Homem e mulher juntos: Desejos insatisfeitos de quem sonha.
NÚMERO - Possibilidades de grandes ganhos, seja no trabalho, nos negócios ou no jogo. Para maiores detalhes, ver algarismos.
NÚPCIAS - Se for mulher quem sonha: Casamento bem próximo, ou um pedido de casamento em breve. Se for homem: Problemas nos negócios.
NUVEM - Branca: Prosperidade, sobretudo nos negócios; um negócio muito lucrativo será realizado em breve. Escura: Perspectiva de mudança no ambiente familiar; problemas na família, discussão e desentendimentos.`;

const contentForO = `ÓCULOS - Transparentes: Boas notícias, amigos fiéis prontos a ajudar no possível. Escuros: A pessoa que sonha está cega para as falsas amizades e más companhias.
OLHOS - Escuros: Amor sincero. Castanhos: Amor correspondido. Azul: Pessoa amada muito ciumenta e insegura. Verdes: Traição, infidelidade, levianidade.
ONÇA - Sorte no amor, no jogo; um grande ideal, mais cedo ou mais tarde, será alcançado, para a felicidade de todos. Casamento em breve.
ONDA - Fraca: Dificuldades financeiras pela frente, mas serão passageiras e sem importância. Forte: Graves problemas a caminho, de difícil solução.
ORAÇÃO - Sonho muito bom, sobretudo se é a pessoa que sonha quem está orando.
ORELHA - De mulher: Tristeza a caminho e grande, em especial com os filhos homens. De homem: Felicidade a caminho, em especial com as filhas moças. Pequena: A felicidade é grande, assim como a tristeza.
ÓRGÃO - Órgão do corpo: Notícia alvissareira. Se for um órgão doente, problemas com a família. Instrumento musical: Um casamento breve, muito breve.
ORQUESTRA - Ver tocar uma: Prosperidade financeira, em especial os homens solteiros. Estar tocando numa: Noivado à vista, solução de um velho problema.
ORVALHO - Um excelente sonho, de muito bom presságio, pois indica pureza, limpeza. Normalmente, para as moças solteiras, representa um feliz matrimônio.
OSSO - Ver um esqueleto completo é sinal de doença grave na família, talvez seguida de morte. Ver um osso apenas: Sorte no jogo e nos amores.
OURO - Péssimo sonho, mau agouro. Cautela com falsos amigos, com documentos importantes, sobretudo escrituras, certidões e papéis bancários.
OVO - Fresco: Uma grande notícia a caminho. Podre: Dificuldades no emprego. Ovos fritos, preparados: Infidelidade conjugal. Ovo cozido: Discussão em família. Ovo aberto, deixando ver a gema: Trabalho desfeito.`;

const contentForP = `PÁ - Sonho desfavorável, pois sugere morte, enterro, sepultura. Deve-se ter maior cuidado com as crianças de colo, os velhos e os enfermos.
PADRE - Muito bom sonho, sobretudo se o padre estiver preparado para rezar uma missa. Padre rezando missa: Felicidade dentro e fora do lar.
PAI - Sonho mais que propício, representando proteção divina, prosperidade e ótimos negócios. Estar tomando bênção ao pai: Grandes alegrias a caminho.
PALÁCIO - Sair de um: Dinheiro à vista. Entrar em um: Azar no jogo e nos negócios.
PALHAÇO - Ver um palhaço só: Alegria na família. No circo: Prosperidade financeira.
PALITO - De fósforo: Maledicências, amigos invejosos, alguém que frequenta a casa é falso e intrigante. De dentes: Desavenças entre amigos no trabalho. Quebrado: Bom sonho, pois indica que um perigo grande já passou.
PANELA - Vazia: Um problema de dinheiro será resolvido quando menos se esperar. Cheia: Alimentação farta, mesa farta, saúde para as crianças.
PÃO - Muito bom sonho, sobretudo se o pão estiver fresco, estalando. Se for dormido, haverá alguma notícia alegre dentro em breve, tanto de longe quanto de perto.
PAPA - O mesmo que padre, sendo que sonhar com papa é bem melhor que com padre ou qualquer outra personalidade eclesiástica, devido à sua posição suprema.
PARTES SEXUAIS - Sonho que revela desejos ocultos. Órgão feminino: Carência de amor, de prazer. Órgãos masculinos: Violento desejo, ânsia insaciável.
PÁSSARO - Normalmente, é um sonho favorável, por se tratar de aves. Sendo pássaro pequeno, representa liberdade, vida, beleza e felicidade.
PÉ - Uma longa viagem pela frente, ou por motivos de negócios, ou para diversão. Pé defeituoso: Mau agouro, maré de azar, mas que logo terminará. Pé com alguma enfermidade: Desavenças no ambiente de trabalho.
PEDRA - Grande: Alguém trará um problema que precisará ser resolvido sem demora. Pequena: Felicidade conjugal, alegrias com os filhos e os pais.
PEDRAS PRECIOSAS EM GERAL - Mau agouro, mau presságio. Pedras preciosas sempre representaram a ganância humana, a cobiça violenta, que pode até levar à morte.
PEIXE - Cru, ainda vivo: Boas notícias, no tocante a melhoras financeiras e a mudança de residência. Preparado: Não é um sonho muito favorável.
PENTE - Novo, limpo: Visita de parente distante ou então visita de um amigo há muito afastado. Pente usado: Discórdia com amigos e parentes.
PERNA - Uma longa viagem em breve, mais precisamente para tratar de negócios, como compra e venda de imóveis, receber uma herança ou mesmo empreendimento lucrativo.
PÉROLA - Alguém está muito preocupado com problemas de família. Cautela com documentos importantes. Se a pessoa que sonha pensa em fazer empréstimos em bancos, é aconselhável desistir. O sonho não é bom presságio.
PIANO - Estar tocando piano: Grandes planos para o futuro, sorte nos amores. Estar ouvindo um piano: Amor correspondido, noivado à vista.
PIMENTA - Crua: Problemas referentes aos filhos menores, sobretudo em idade escolar. Cozida ou em prato feito: Esperanças de resolver um problema.
PINCEL - Estar vendo alguém pintar com pincel: Amor correspondido. Estar pintando com pincel: Amor não correspondido, mas um outro surgirá, para sempre.
PIRÂMIDE - Ver uma pirâmide: Tristeza no trabalho e com os amigos. Entrar numa pirâmide: Proteção divina. Sair de uma pirâmide: Sorte no jogo.
POÇO - Sem água: Problemas à vista, alguma morte na família, tristeza por um velho amigo. Com água: Sorte nos negócios, no jogo, novidade muito boa.
PONTE - Estar atravessando uma ponte: Melhoras financeiras, um problema será resolvido em breve. Ver uma ponte ser construída: Um novo horizonte está se descortinando. Ver uma ponte ruir: Intrigas e inveja.
PORCO - Vivo: Vitória sobre os inimigos, os falsos amigos, que só têm segundas intenções. Assado: Dificuldades financeiras, e problemas também nos negócios.
PORTA - Aberta: Afinal, a tão esperada solução para um problema muito antigo. Fechada: Desavenças na família, partida de um ente querido para uma longa viagem.
PRAIA - Ver uma praia: Prosperidade no lar, no trabalho e nos negócios. Estar numa praia, se bronzeando: Melhoras vagarosas para todos.
PRETO - Cor preta: Bom presságio, sobretudo para os homens de negócios. Homem preto: Felicidade conjugal. Mulher preta: Uma gravidez feliz e normal.
PRÍNCIPE - Para as moças solteiras: Ótimo sonho, pois indica ou um casamento em breve, ou um grande amor. Se quem sonha é mulher casada, uma tentação de amor a caminho.
PULSEIRA - Usar uma pulseira: Casamento para muito breve, sobretudo se for moça quem sonha. Ver uma pulseira: Sorte no jogo, no amor e nos negócios. Ver alguém usando uma pulseira: Um novo emprego.`;

const contentForQ = `QUADRILHA - De bandidos: Muitos amigos falsos em volta da pessoa que sonha. De São João: Ótimo sonho, pois indica felicidade e alegria.
QUADRO - Pintar um quadro: Sonho há muito acalentado afinal realizado. Ver o próprio rosto retratado num quadro: Problemas de saúde.
QUADRÚPEDE - Qualquer animal quadrúpede representa realização de desejos e felicidade, sobretudo os cavalos, os bois e os cachorros.
QUARESMA - Ótimo sonho, indicador de grandes prosperidades no lar e nos negócios. Realização de um empreendimento bastante lucrativo.
QUARENTENA - Problemas de saúde, principalmente com as pessoas mais idosas.
QUARTEL - Estar num quartel: Muitas dificuldades pela frente, sobretudo com o filho mais velho. Sair de um quartel: Solução de problemas. Entrar num quartel: Alguns problemas envolvendo justiça.
QUARTZO - Reviravolta na vida, para melhor; alguma mudança de residência; carta ou telegrama trazendo boa notícia dentro dos próximos cinco dias.
QUATI - Muito bom sonho. Representa uma grande mudança na vida de quem sonha, e uma mudança para melhor. Maior alegria no lar e promoção no emprego.
QUEBRAR - Uma janela, um vidro qualquer: Problemas graves com dinheiro. Ver alguém quebrar: Inimizades no trabalho, frustração de planos.
QUEDA - Ver alguém cair de um lugar alto: Algum amigo ou parente sofrerá uma grande perda. Estar caindo: Ascensão social e econômica.
QUEIJO - Fresco, sobretudo de Minas, ótimo sonho, pois indica resolução de problemas, dificuldades superadas. Podre: Mau agouro, infelicidade no casamento.
QUEIMADA - Realizar uma queimada significa inveja de falsos amigos, inimigos preparando ciladas perigosas. Ver uma queimada: Discussão dentro e fora do lar, algum parente sofrendo por motivos de doença.
QUEIMAR - Inveja de falsos amigos, inimigos preparando ciladas perigosas. Maiores detalhes, vide QUEIMADA.
QUIABO - Cru: Sonho auspicioso. Cozido: Problemas referentes a dinheiro e a documentos. Frito: Trabalho desfeito, calúnia desmentida.
QUIBE - Geralmente, indica bom presságio, principalmente para a pessoa que sonha. Essa sorte pode estender-se para as pessoas mais íntimas daquela que sonha.
QUIOSQUE - Ver um quiosque: Amor correspondido. Fazer compras num quiosque: Alimentação farta, mesa farta, saúde para crianças e pessoas idosas.
QUIROMANTE - Ver uma quiromante: Azar no jogo e nos negócios. Consultar-se com uma quiromante: Bom sonho, e é quase certo que as previsões no sonho se realizem.
QUITANDA - Ver uma quitanda: Amor correspondido. Fazer compras numa quitanda: Problemas financeiros passageiros, podendo ser resolvidos com a ajuda de um velho amigo ou um parente distante.`;

const contentForR = `RAIO - Ver um raio no céu: Intrigas de velhos inimigos. Ser atingido por um raio: Graves dificuldades pela frente, com sérias consequências.
RAIZ - Ver uma raiz: Mudança de residência, para melhor. Estar comendo uma raiz, realização de um antigo desejo, sobretudo de ordem sexual.
RAMALHETE - Flor é sempre beleza e alegria. De flores comuns: Alegrias no casamento e com os filhos. De rosas: Muita sorte no amor, afeto correspondido.
RAMO - Boas notícias a caminho, assim como uma visita totalmente inesperada e que trará algumas alegrias, mas logo em seguida sérios aborrecimentos.
RAPADURA - Comer rapadura: Sorte no jogo. Ver alguém comer: Tristeza na família.
RAPOSA - Caçar uma raposa indica sorte nos negócios, ascensão social e econômica. Ver uma raposa morta: Inimigos traiçoeiros e ladinos vencidos. Ver uma raposa: Falsos amigos com segundas intenções.
RASGAR - Estar rasgando alguma coisa: Problemas financeiros na família. Ver alguém rasgar alguma coisa: Tristeza com amigos e parentes.
RATO - Ver um rato: Amigos traiçoeiros tramam alguma cilada. Caçar um rato e capturá-lo: Boas notícias a caminho, sobretudo vindas de longe.
REBANHO - Bovino: Felicidade conjugal, longevidade, casamento longo e com muitos filhos. De ovelhas: Prosperidade no emprego e nos negócios.
RECÉM-NASCIDO - Excelente sonho, sob todos os aspectos. Felicidade no lar, no casamento, negócios lucrativos, sorte no jogo, proposta de emprego, etc.
REDE - Ver uma rede: Intrigas perigosas, calúnias. Ver alguém numa rede: Um amigo ou parente envolvido com problemas. Estar numa rede: Dificuldades a caminho.
REFEIÇÃO - Preparar uma refeição, para si ou para outros: Cautela com a própria saúde. Ver alguém fazer uma refeição: Notícia de morte a caminho. Fazer uma refeição: Perigo de morte na família.
REI - Sonhar que se é rei: Boas notícias no tocante a dinheiro ou empreendimentos. Ver um rei: Cilada de amigos interesseiros.
RELÓGIO - Funcionando: Esperanças de melhoras. Quebrado: Péssimo agouro, grandes dificuldades pela frente. Despertando: Quem sonha está meio alheio a sua realidade.
REMÉDIO - Cautela com as crianças e as pessoas mais idosas, sobretudo as da família. Risco de alguma enfermidade dentro e fora do lar.
RIO - Ver um rio manso, tranquilo: Paz e confiança no futuro, muita tranquilidade a caminho. Rio caudaloso: Problemas pequenos e graves pela frente.
ROCHEDO - Ver o mar batendo forte num rochedo: Proteção divina, muita força interior. Ver o mar quebrando um rochedo: Maus fluidos na casa, que enfraquecem a todos.
ROSÁRIO - Muito bom presságio, pois indica várias coisas boas: um casamento próximo, um pedido de matrimônio, uma gravidez benvinda e feliz, sorte no jogo e nos negócios, boas notícias há muito esperadas.`;

const contentForS = `SACO - Vazio: Partida para uma viagem de um amigo muito querido. Cheio: Dinheiro à vista, seja através dos negócios, seja através do jogo.
SAIA - Branca: Casamento muito próximo. De cor: Alegrias inesperadas na família. Escura: Talvez alguma morte, dentro ou fora do lar.
SAL - Comer sal: Sorte, muita sorte, em tudo. Ver alguém comer sal: Um amigo, conhecido ou parente receberá uma grande notícia e ficará feliz.
SANFONA - Tocar uma: Dificuldades superadas. Ver alguém tocar uma: Amor correspondido.
SANGUE - Ver o sangue de alguém: Morte de um amigo. Ver o próprio sangue: Morte na família.
SAPATO - Sonho bastante favorável, indicador de prosperidade econômica, ascensão social, em especial para o chefe da casa; talvez uma viagem longa, por navio, para tratar de negócios.
SAPO - Ver um sapo vivo, numa lagoa, num lago: Notícias otimistas, amigos fiéis prontos a ajudar. Ver um sapo morto: Falsos amigos.
SEIOS - Se for homem quem sonha: Furioso desejo sexual, com sinais de dependência psicológica. Se for mulher: Anseios maternais, frustração sexual.
SELVA - Ver uma selva: Dificuldades à vista, mas que serão logo superadas. Estar numa selva: Problemas graves, de difícil solução.
SINO - Ver um sino parado: Melhoras consideráveis em alguém muito doente. Ver um sino tocando: Casamento em breve; talvez desavenças com um parente.
SOL - Ótimo presságio, sobretudo se o céu estiver completamente limpo, azul puro. Significa grandes notícias na família.
SOMBRA - Ver a sombra de alguém: Dificuldades financeiras. Ver a própria sombra: Bom sonho, amor correspondido. Estar sendo seguido por uma sombra que não é a nossa: Trabalho feito, intriga, inveja.`;

const contentForT = `TALHER - Ver um: Fluidos negativos nos negócios, na casa, no trabalho, muita inveja e mau olhado de falsos amigos. Para maiores detalhes, vede GARFO.
TAMANCO - Ver alguém usando tamancos: Algum amigo ou parente distante envolvido com problemas de dinheiro. Usar um: Falsos amigos.
TAMBOR - Estar tocando um tambor: Bom sonho, sobretudo se o som for bem forte. Ver alguém tocando um tambor: Sorte nos amores e nos negócios.
TAPETE - Geralmente, não é um sonho favorável, de bom presságio. No máximo, pode representar uma mudança de residência, tanto para melhor como para pior.
TARTARUGA - Desilusão amorosa, mas logo surgirá um outro amor mais sincero.
TERRA - Possivelmente, algumas complicações com a Justiça. Por outro lado, terra representa a mãe-natureza, Deus, e isso é indicativo de felicidade. Terra com letra maiúscula, planeta: Os inimigos serão castigados.
TESOURA - Sonho favorável. Ser cortado por uma tesoura: A sorte vai mudar e alguma coisa ocorrerá. Ver alguém sendo cortado com tesoura: Desavenças na família.
TIGRE - Sorte no amor, no jogo, um grande ideal, cedo ou tarde, será alcançado. Para maiores detalhes, vede FERA.
TIJOLO - Vitória sobre inimigos inescrupulosos, intrigas vencidas, calúnias desmentidas e falsos amigos totalmente desmascarados.
TINTA - Péssimo agouro; problemas econômicos, grandes dificuldades pela frente. Tinta azul ou branca: A solução para um problema não demorará.
TOURO - Prejuízos nos negócios; talvez chance de longa viagem, para tratar de negócios, visita de parente distante, algum aborrecimento.
TRIGO - Superação de tristeza, de dificuldades, e de intrigas também. Acautelar-se diante de perigos, de amigos muito sorridentes e cheios de elogios. Há indicação também de rivalidades no emprego.`;

const contentForU = `UMBIGO - Bom sonho. Amigos fiéis e desinteressados. Um grande amigo ou parente próximo ajudará a solucionar um antigo problema.
UNHA - Maior cuidado com os pés, as pernas e as mãos, para evitar qualquer doença infecciosa ou não. Uma longa viagem dentro em breve.
URINA - Sonho favorável, sobretudo se a pessoa que sonha estiver urinando. Reviravolta na vida para bem melhor, com prosperidade financeira.
URNA - Aberta: Boas notícias a caminho. Fechada: Notícia ruim, vinda de longe.
URSO - Boas notícias, melhoras de vida; algum amigo falso trama uma traição.
URUBU - Muito mau agouro, embora tenha algumas variações agradáveis, como receber um presente inesperado de um parente distante, ajuda de amigos e parentes, afeto de amigos e parentes.
UVA - Prejuízos de pouca monta; coisa passageira, com a qual não se deve se preocupar.`;

const contentForV = `VACA - Longas viagens pela frente, ou por diversão, ou para cuidar de alguns negócios. Ver uma vaca pastando: Melhoras imediatas de algum doente na família, sobretudo os mais idosos.
VARANDA - Derrota de inimigos que tramam às escondidas. Logo, logo, notícias de reconciliação de um casal, amigos ou parentes.
VASSOURA - Satisfação de um desejo há muito tempo alimentado. Sorte no jogo.
VEADO - Dificuldades financeiras a caminho; depois, talvez haja uma sorte nos negócios.
VELA - Muito bom presságio, embora a crença popular indique luto na família, morte próxima de um amigo ou amiga. Significa também casamento bem próximo ou então, no mínimo, um pedido de casamento.
VERMELHO - Afeto correspondido, êxito nos amores, um casamento à vista. Estar vestido de vermelho: Maus fluidos na casa.
VINHO - Noivado ou namoro desfeito. Notícias de um divórcio de amigos. Estar tomando vinho: Melhoras financeiras, alegrias no lar e no trabalho.
VULCÃO - Extinto: Novas amizades, sucesso no amor. Em erupção: Problemas sendo resolvidos, trabalho desfeito, calúnia desmentida.`;

const contentForX = `XADREZ - Desentendimento na família e com os amigos. Alguém anda preparando armadilhas para a pessoa que sonha. Falsos amigos.
XAROPE - Possibilidades de longas viagens, para trabalho ou por passatempo.
XÍCARA - Estar se utilizando de uma: Proteção divina, trabalho desfeito, disposição para enfrentar todas as dificuldades. Ver alguém se utilizar de uma: Preocupação com os amigos mais chegados.`;

const contentForZ = `ZEBRA - Mau agouro, principalmente se a zebra estiver pastando. Se tocar na zebra, tristeza profunda na família, desentendimento dentro e fora do lar.
ZEBU - Acinzentado: Melhoras financeiras, e bem depressa. Escuro: Problemas no trabalho, na família e com os amigos. Cautela com a alimentação.
ZERO - Felicidade em todos os sentidos, maior quanto maior for o número de zeros. Sorte no jogo e realização de algum negócio lucrativo.
ZURRO - Bom sonho, pois representa grandes melhoras financeiras, boas perspectivas no trabalho e nos negócios e sorte no jogo, por três dias. Em algumas ocasiões, pode indicar casamento feliz.`;

const dictionaryData: Record<string, string> = {
    'A': contentForA, 'B': contentForB, 'C': contentForC, 'D': contentForD,
    'E': contentForE, 'F': contentForF, 'G': contentForG, 'H': contentForH,
    'I': contentForI, 'J': contentForJ, 'L': contentForL, 'M': contentForM,
    'N': contentForN, 'O': contentForO, 'P': contentForP, 'Q': contentForQ,
    'R': contentForR, 'S': contentForS, 'T': contentForT, 'U': contentForU,
    'V': contentForV, 'X': contentForX, 'Z': contentForZ,
};

/**
 * Fetches the content for a single letter from the dream dictionary.
 * First, it tries to fetch from Firebase RTDB. If not found, falls back to local data.
 * @param letter The letter to fetch (e.g., 'A').
 * @returns A promise that resolves to the content string or an empty string if not found.
 */
export async function getDreamDictionaryEntry(letter: string): Promise<string> {
  const letterRegex = /^[A-Z]$/;
  if (!letterRegex.test(letter)) {
    console.error('Invalid letter requested from dream dictionary.');
    return '';
  }
  const entryRef = ref(rtdb, `dreamDictionary/${letter}`);
  try {
    const snapshot = await get(entryRef);
    if (snapshot.exists() && snapshot.val()) {
        return snapshot.val();
    }
    // Fallback to local data if RTDB is empty for that letter
    return dictionaryData[letter] || '';
  } catch (error) {
    console.error(`Error fetching dream dictionary entry for '${letter}' from RTDB:`, error);
    // Fallback to local data on error
    return dictionaryData[letter] || '';
  }
}

/**
 * Searches the dream dictionary for specific keywords and returns their definitions.
 * This version normalizes text to handle accents and case-insensitivity.
 * @param keywords An array of keywords to look for.
 * @returns A formatted string containing the definitions of found keywords.
 */
export async function getDictionaryEntriesForKeywords(keywords: string[]): Promise<string> {
  if (!keywords || keywords.length === 0) {
    return "Nenhum símbolo-chave foi extraído do sonho para consulta.";
  }

  const normalizeString = (str: string) =>
    str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();

  const normalizedKeywords = keywords.map(normalizeString);

  const uniqueLetters = [...new Set(
    normalizedKeywords
      .map(k => k.charAt(0).toUpperCase())
      .filter(l => /^[A-Z]$/.test(l))
  )];

  if (uniqueLetters.length === 0) {
    return "Nenhum símbolo-chave válido foi extraído para consulta no dicionário.";
  }

  const letterPromises = uniqueLetters.map(letter => getDreamDictionaryEntry(letter));
  const letterContents = await Promise.all(letterPromises);
  
  const fullDictionaryText = letterContents.join('\n');
  const foundDefinitions = new Set<string>();

  const dictionaryLines = fullDictionaryText.split('\n').map(l => l.trim()).filter(Boolean);

  normalizedKeywords.forEach(keyword => {
    for (const line of dictionaryLines) {
        const lineParts = line.split(' - ');
        if (lineParts.length < 2) continue; // Skip malformed lines

        const lineStartOriginal = lineParts[0];
        const lineStartNormalized = normalizeString(lineStartOriginal);
        
        // This is a more robust check. It verifies if the normalized line starts with the normalized keyword.
        // This handles cases like "LEBRE" matching "LEBRE - ..."
        if (lineStartNormalized === keyword) {
            foundDefinitions.add(line);
            break; 
        }
    }
  });


  if (foundDefinitions.size === 0) {
    return "Nenhum dos símbolos do seu sonho foi encontrado em nosso Livro dos Sonhos. A interpretação seguirá o conhecimento geral do Profeta.";
  }

  return `Considerando os símbolos do seu sonho, aqui estão os significados encontrados no Livro dos Sonhos para sua referência:\n\n${Array.from(foundDefinitions).join('\n')}`;
}

/**
 * Admin function to add or update the content for a specific letter in the dream dictionary.
 * The letter must be a single uppercase character.
 * @param letter The letter to update (e.g., 'A', 'B').
 * @param content The full text content for that letter's entry.
 * @returns An object indicating success or failure.
 */
export async function updateDreamDictionaryEntry(letter: string, content: string): Promise<{ success: boolean, message: string }> {
  const letterRegex = /^[A-Z]$/;
  if (!letterRegex.test(letter)) {
    return { success: false, message: 'Invalid letter. Must be a single uppercase character.' };
  }

  const entryRef = ref(rtdb, `dreamDictionary/${letter}`);
  try {
    await set(entryRef, content);
    return { success: true, message: `Dream dictionary entry for letter '${letter}' updated successfully.` };
  } catch (error: any) {
    console.error(`Error updating dictionary entry for letter '${letter}':`, error);
    return { success: false, message: error.message || 'An unknown error occurred.' };
  }
}
