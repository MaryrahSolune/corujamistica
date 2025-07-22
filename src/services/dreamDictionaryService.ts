
'use server';

import { rtdb } from '@/lib/firebase';
import { ref, get, set } from 'firebase/database';

// NOTE: This local dictionary is a fallback. The primary source should be the Firebase RTDB,
// which is managed via the admin panel. Any changes here should also be reflected in the DB.
const dictionaryData: Record<string, string> = {
    'A': `Abacate — Na vida: alegrias. No amor: amor inútil. G. 2, 8, 24. D. 52, 35, 94. C. 351, 829, 796. M. 8732.
Abacateiro — Sonhar com abacateiro mostra que as coisas poderão fluir melhor e mais rápido por agora. Assim como o abacateiro que em comparação a muitas árvores, cresce bem rápido e possui um grande porte, ele no sonho deixa bem representado este seu crescimento. O que já vem acontecendo de forma gradativa, mas que agora será percebido por você e pelas pessoas a sua volta. Afinal é preciso ter solidez e segurança para assim se manter firme e não cair depois conforme sua jornada. Confiança e força de vontade o levam a lugares melhores, e se por acaso fraquejar ou até se acomodar as coisas certamente podem voltar ao começo, onde o caminho é mais longo e difícil.
Abacaxi — Na vida: contrariedades. No amor: desilusão. G. 8, 23, 24. D. 23, 04, 81. C. 729, 989, 999. M. 1531.
Abadá — Sonhar com abadá mostra que você está à procura do seu lugar. Quando se compra um abadá você quer ter acesso e saber que terá o seu lugar e participará da festa. A abadá no sonho indica mais ou menos isso, você se vê preparado para alcançar e o ocupar o lugar que sempre almejou e que agora pode estar mais próximo. Por isso procure continuar seu trajeto, fazendo o necessário para alcançar seus objetivos, isso continuará lhe conduzindo ao seu objetivo final e assim conseguirá o seu lugar, aquele que deseja e quer conquistar.
Abadia — Ver uma abadia em seu sonho simboliza tranqüilidade e paz. Você poderá superar tempos difíceis.
Abajur — Sonhar com abajur indica que deve ter cuidado com novas aventuras. Outro significado para o sonho com abajur é que pode ocorrer alguma mudança importante no relacionamento. Abajur aceso sinaliza o desejo de conquistar um novo amor. Abajur apagado ou quebrado simboliza insatisfação no relacionamento atual.
Abanador — Sonhar com abanador simboliza que está se sentindo oprimido e busca por mais liberdade representada pela necessidade de conseguir mais ar para respirar. O sonho com abanador também pode significar que gostaria se sentir mais livre e esquecer de vez as lembranças negativas.
Abandonar — Sonhar que você é abandonado sugere que está na hora de deixar para trás sentimentos passados e características que estão impedindo seu crescimento. Renove velhas atitudes. Uma interpretação mais direta e literal deste sonho é que você tem medo de ficar sozinho, abandonado ou até mesmo ser traído. O sonho com abandono pode se originar de uma perda recente ou pelo medo de perder um amor. O medo de abandono pode se manifestar em seu sonho como parte do processo de recuperação pelo fim de um relacionamento. Também pode se originar de sentimentos não resolvidos ou problemas de infância. Alternativamente, o sonho indica que você está se sentindo negligenciado ou que seus sentimentos estão sendo ignorados. Abandonar outros em seu sonho sugere que você está sendo subjugado pelos problemas e decisões em sua vida.
Abastecer — Sonhar com abastecer mostra a reposição de algo. Você pode tentar perceber o que precisa ser reposto, seja sua saúde, trabalho, qualidade de vida, há algo que está faltando e você precisa ver o que é. Isso fará com que as coisas caminhem melhor e você vai perceber que tudo irá fluir muito bem, depois que conseguir se abastecer. Isso pode ser para tudo, boas energias, fazer coisa prazerosas a você, sair, se distrair, ou até trabalhar, colocar coisas em ordem, se analisar vai ajudar a saber o que lhe faz falta no momento, e isso vai fazer com que se recomponha e se sinta cada vez melhor.
Abertura — Sonhar com abertura mostra sair de sua rotina. A vida, tarefas, obrigações do dia a dia precisam em algum momento, mudar, ter uma abertura para coisas novas e talvez incorporar ao que será feito depois. Você precisa ser mais flexível, é isso que o sonho com abertura quer lhe mostrar. Pense de forma mais leve, e de relevância a opinião de pessoas que são importantes para você, estás podem lhe ajudar muito a ter um novo olhar, uma nova jornada.
Abeto — Sonhar com abeto mostra dois extremos. Sim, se você sonhou que cortou ou viu alguém cortar um abeto, as coisas poderão ficar bem difíceis por agora, tanto para você, se foi quem cortou a planta em sonho, ou para alguém próximo, mas não necessariamente quem o cortou em sonho. Mas se você estava vendo, ou plantando o abeto, isso indica muita fartura, e coisas boas se multiplicando, as coisas caminharão muito bem, e você viverá ótimos momentos logo, logo, caso ainda não tenha começado a viver isso.
Abelha — Na vida: dinheiro. No amor: surpresas. G. 1, 4, 17. D. 57, 14, 17. C. 950, 314, 367. M. 3516.
Abismo — Na vida: inimigos. No amor: incerteza. G. 11, 10, 16. D. 44, 07, 63. C. 143, 608, 862. M. 7564.
Abóbora — Na vida: recompensa. No amor: desconfiança. G. 1, 13, 25. D. 25, 02, 79. C. 925, 602, 379. M. 4602.
Aborto — Na vida: azar. No amor: desilusão. G. 18, 19, 25. D. 71, 74, 79. C. 071, 876, 577. M. 2379.
Abotoar — Na vida: dificuldades. No amor: compromisso. G. 13, 25, 22. D. 05, 85, 86. C. 349, 678, 287. M. 3601.
Abraço — Na vida: auxilio inesperado. No amor: traição. G. 1, 6, 18. D. 56, 24, 69. C. 550, 522, 872. M. 0472.
Abrigo — Na vida: aborrecimentos. No amor: desavenças. G. 2, 14, 21. D. 51, 06, 82. C. 415, 704, 384. M. 1306.
Absolvição — Na vida: sorte no jogo. No amor: confiança. G. 19, 25, 24. D. 73, 78, 96. C. 276, 378, 093. M. 1678.
Academia — Na vida: embaraços. No amor: ciúme. G. 7, 8, 9. D. 20, 29, 30. C. 220, 231, 136. M. 4631.
Acampamento — Na vida: problemas. No amor: separação. G. 1, 13, 24. D. 14, 49, 93. C. 017, 301, 590. M. 4017.
Acidente — Na vida: contrariedades. No amor: deslealdade. G. 1, 11, 21. D, 19, 41, 84. C. 325, 542, 281. M. 3919.
Aço — Na vida: bons negócios. No amor: enganos. G. 21, 23, 24. D. 83, 95, 93. C. 181, 792, 694. M. 6781.
Acordeão — Na vida: tranquilidade. No amor: felicidade. G. 7, 9, 15. D. 28, 34, 39. C. 128, 236, 238. M. 1320.
Açougue — Na vida: doença. No amor: desavenças e ciúme. G. 4, 9, 14. D. 16, 36, 04. C. 213, 236, 406. M. 8604.
Açúcar — Na vida: êxito financeiro. No amor: carinho e alegria. G. 7, 8, 9. D. 26, 29, 36. C. 427, 435, 436. M. 3032.
Açucareiro — Na vida: prosperidade. No amor: felicidade. G. 7, 13, 20. D. 27, 01, 99. C. 620, 401, 197. M. 9120.
Açude — Na vida: Tranquilidade. No amor: bom presságio. G. 13, 16, 17. D. 01, 63, 67. C. 602, 362, 467. M. 1067.
Acusação — Na vida: enganos. No amor: inveja e intrigas. G. 3, 9, 11. D. 12, 30, 41. C. 412, 134, 843. M. 6512.
Adubo — Na vida: promessa futura. No amor: conquista. G. 6, 8, 9. D. 22, 32, 30. C. 521, 831, 130. M. 1530.
Adulação — Na vida: perdas. No amor: intrigas. G. 1, 3, 14. D. 56, 11, 04. C. 150, 159, 504. M. 1306.
Adultério — Na vida: contrariedades. No amor: imprevistos. G. 1, 3, 4. D. 50, 15, 10. C. 456, 559, 914. M. 3560.
Adversário — Na vida: obstáculos. No amor: oposições. G. 1, 12, 10. D. 17, 48, 08. C. 418, 548, 109. M. 2340.
Advogado — Na vida: más notícias. No amor: separação. G. 16, 17, 25. D. 63, 60, 78. C. 961, 167, 278. M. 5987.
Aeroplano — Na vida: incerteza. No amor: insegurança. G. 2, 19, 20. D. 51, 76, 97. C. 552 476, 198. M. 2551.
Aeroporto — Na vida: visitas. No amor: desavenças. G. 6, 13, 19. D. 21, 02, 76. C. 521, 105, 870. M. 8274.
Afago — Na vida: boas notícias. No amor: compromisso sério. G. 3, 15, 11. D. 15, 38, 41. C. 712, 837, 841. M. 6438.
Afiador — Na vida: sucesso. No amor: mudança de situação. G. 3, 17, 19. D. 25, 67, 76. C. 615, 460, 070. M. 0315.
Afiar — Na vida: mudança para melhor. No amor: felicidade. G. 6, 11, 20. D. 23, 44, 98. C. 824, 643, 198. M. 5721.
Afilhado — Na vida: prosperidade. No amor: união. G. 7, 8, 17. D. 28, 28, 67. C. 928, 235, 260. M. 5520.
Afinar — Na vida: novos projetos. No amor: paixão e saudade. G. 6, 9, 14. D. 23, 30, 04. C. 421, 134. 106. M. 1704.
Aflição — Na vida: aborrecimentos. No amor: ciúme à toa. G. 19, 23, 24. D. 74, 95, 93. C. 874, 791, 198. M. 8170.
Afogamento — Na vida: perigo. No amor: separação. G. 1, 12, 22. D. 17, 44, 88. C. 118, 640, 287. M. 2387.
Agarrar — Na vida: embaraços. No amor: incertezas. G. 13, 14, 19. D. 01, 04, 76. C. 701, 203, 176. M. 6702.
Agasalho — Na vida: sossego e conforto. No amor: felicidade. G. 8, 18, 23. D. 31, 71, 91. C. 831, 371, 391. M. 4032.
Agitação — Na vida: desarmonia. No amor: rompimento. G. 9, 11, 17. D. 34, 42, 60. C. 936, 041, 160. M. 3460.
Agressão — Na vida: sucesso. No amor: ciúme. G. 4, 8, 25. D. 10, 31, 85. C. 810, 235, 678. M. 5610.
Agrião — Na vida: bons negócios. No amor: contrariedades. G. 4, 19, 25. D. 13, 73, 77. C. 410, 876, 378. M. 5276.
Água — Na vida: paz e harmonia. No amor: fidelidade. G. 2, 0, 15. D. 52, 17, 37. C. 052, 918, 237. M. 1518.
Aguardente — Na vida: doença. No amor: notícias. G. 9, 12, 22. D. 36, 46, 88. C. 034, 140, 187. M. 2146.
Águia — Na vida: bons empreendimentos. No amor: paixão. G. 1, 3, 19. D. 58, 59, 76. C. 257, 611, 576. M. 8576.
Agulha — Na vida: intrigas. No amor: brigas. G. 2, 8, 23. D. 54, 29, 95. C. 252, 031, 191. M. 0652.
Aipim — Na vida: descobertas. No amor: paixão e sexo. G. 13, 10, 24. D. 49, 08, 90. C. 801, 407, 894. M. 9805.
Álcool — Na vida: fuga. No amor: novas aventuras. G. 11, 18, 22. D. 43, 69, 86. C. 041, 871, 287. M. 5542.
Aldeia — Na vida: cansaço. No amor: mudanças. G. 10, 25, 22. D. 08, 78, 80. C. 508, 178, 187. M. 6708.
Alecrim — Na vida: ameaças. No amor: desilusão. G. 18, 23, 20. D. 75, 89, 99. C. 171, 389, 555. M. 0671.
Alegria — Na vida: contrariedades. No amor: ilusão. G. 15, 16, 24. D. 45, 61, 93. C. 137, 064, 193. M. 2693.
Alfaiate — Na vida: más notícias. No amor: instabilidade. G. 1, 10, 23. D. 58, 65, 92. C. 957, 465, 192. M. 0356.
Alface — Na vida: tranquilidade. No amor: fim da paixão. G. 1, 7, 24. D. 58, 28, 96. C. 150, 026, 193. M. 0596.
Alfafa — Na vida: sucesso no emprego. No amor: azar. G. 6, 7, 20. D. 24, 28, 98. C. 421, 529, 497. M. 5567.
Alfinete — Na vida: preocupações. No amor: inveja. G. 1, 10, 16. D. 56, 09, 64. C. 156, 409, 063. M. 7962.
Algarismo — UM - Na vida: negócios comuns. No amor: paixão passageira. DOIS - Na vida: ganhos na justiça. No amor: união. TRÊS - Na vida: falsos amigos. No amor: intriga e inveja. QUATRO - Na vida: sucesso. No amor: ciúme. CINCO - Na vida: problemas domésticos. SEIS - Na vida: dificuldades. No amor: separação. SETE - Na vida: preocupações. No amor: dificuldades de relacionamento. OITO - Na vida: sucesso com esforço. No amor: sentimentos desencontrados. NOVE - Na vida: futuro tranquilo. No amor: superação das dificuldades. ZERO - Na vida: início promissor de novos projetos. No amor: fecundidade. Observação: aos grupos e dezenas abaixo, acrescente o número sonhado. G. 2, 2, 10. D. 52, 50, 09. C. 951, 256, 107. M. 6253.
Algema — Na vida: incerteza. No amor: legalização da união. G. 13, 14, 24. D. 02, 04, 94. C. 402, 403, 590. M. 3590.
Algodão — Na vida: lucros. No amor: realização sexual. G. 11, 12, 21. D. 41, 48, 82. C. 043, 140, 181. M. 8642.
Alho — Na vida: surpresas. No amor: paixão desmedida. G. 2, 3, 15. D. 51, 15, 37. C. 351, 815, 238. M. 1539.
Aliança — Na vida: compromissos sérios. No amor: lealdade. G. 11, 12, 16. D. 41, 48, 64. C. 341, 140, 764. M. 6043.
Alimento — Na vida: futuro encaminhado. No amor: desejo. G. 16, 21, 22. D. 63, 84, 87. C. 761, 783, 787. M. 1683.
Alma — Na vida: auxílio de amigos. No amor: esperança. G. 3, 4, 13. D. 12, 13, 62. C. 312, 210, 101. M. 6011.
Almoço — Na vida: sucesso no trabalho. No amor: união. G. 25, 22, 20. D. 78, 80, 55. C. 178, 387, 155. M. 5198.
Altar — Na vida: felicidade. No amor: amor retribuído. G. 6, 15, 10. D. 23, 37, 65. C. 321, 138, 607. M. 1921.
Alto-falante — Na vida: doença. No amor: insegurança. G. 2, 12, 21. D. 54, 47, 81. C. 251, 847, 184. M. 7181.
Aluguel — Na vida: bons negócios. No amor: promessas. G. 11, 21, 24. D. 42, 82, 93. C. 042, 851, 194. M. 5743.
Amamentar — Na vida: novos projetos. No amor: mudança. G. 11, 22, 20. D. 42, 86, 99. C. 341, 087, 255. M. 1597.
Amante — Na vida: desavenças. No amor: separação. G. 1, 18, 21. D. 50, 71, 82. C. 158, 671, 682. M. 7158.
Amarrar — Na vida: oportunidades. No amor: preocupação. G. 11, 14, 16. D. 41, 04, 62. C. 241, 103, 262. M. 0041.
Ambulância — Na vida: doença na família. No amor: brigas. G. 15, 14, 17. D. 37, 06, 67. C. 237, 406, 760. M. 8604.
Amigo — Na vida: dinheiro. No amor: sinceridade e carinho. G. 1, 11, 23. D. 25, 41, 95. C. 119, 144, 191. M. 8143.
Anão — Na vida: desgostos. No amor: fim de relação. G. 1, 7, 13. D. 25, 28, 05. C. 918, 126, 201. M. 6149.
Âncora — Na vida: realizações. No amor: vai melhorar. G. 15, 13, 14. D. 38, 02, 06. 437, 601, 204. M. 6302.
Andaime — Na vida: ascensão social. No amor: riscos. G. 4, 9, 18. D. 10, 36, 69. C. 213, 430, 671. M. 7171.
Andar — Na vida: oportunidades. No amor: contrariedades. G. 8, 12, 17. 31, 48, 67. C. 131, 046, 067. M. 6560.
Andorinha — Na vida: boas notícias. No amor: falsidade. G. 1, 3, 15. D. 57, 59, 39. C. 358, 112, 537. M. 5512.
Andrajo — Na vida: pobreza. No amor: tristeza e perda. G. 1, 3, 13. D. 57, 11, 02. C. 157, 315, 302. M. 6550.
Anedota — Na vida: desavenças. No amor: rompimento. G. 3, 18, 23. D. 15, 75, 89. C. 312, 875, 891. M. 1115.
Anel — Na vida: sorte e prosperidade. No amor: realização. G. 8, 14, 16. D. 31, 06, 61. C. 131, 106, 761. M. 6162.
Animal — Na vida: insegurança. No amor: paixão insegura. G. 4, 6, 25. D. 10, 23, 85. C. 110, 222, 078. M. 2978.
Aniversário — Na vida: longevidade. No amor: discórdia. G. 2, 2, 22. D. 54, 57, 86. C. 952, 756, 487. M. 7750.
Anjo — Na vida: boa sorte. No amor: fidelidade e felicidade. G. 3, 4, 21. D. 15, 10, 81. C. 911, 213, 783. M. 1916.
Anzol — Na vida: dificuldades. No amor: ressentimento. G. 2, 4, 6. D. 51, 16, 23. D. 754, 314, 721. M. 1510.
Aparição — Na vida: rancor. No amor: desentendimentos. G. 1, 0, 9. D. 58, 17, 30. C. 957, 219, 534. M. 1118.
Apartamento — Na vida: sucesso. No amor: felicidade. G. 2, 4, 11. D. 53, 16, 42. C. 253, 814, 043. M. 9643.
Aperitivo — Na vida: prejuízos. No amor: desgosto. G. 1, 0, 13. D. 50, 19, 05. C. 956, 019, 349. M. 9550.
Apetite — Na vida: negócios arriscados. No amor: mágoa. G. 2, 4, 8. D. 54, 10, 35. C. 751, 613, 732. M. 9154.
Aplauso — Na vida: sucesso. No amor: sedução. G. 14, 22, 23. D. 06, 86, 89. C. 760, 787, 691. M. 0306.
Aposento — Na vida: bons negócios. No amor: realização. G. 3, 0, 11. D. 15, 19, 42. C. 215, 617, 041. M. 2541.
Aposta — Na vida: prejuízos e perdas. No amor: dificuldades. G. 3, 4, 11. D. 15, 14, 44. C. 715, 716, 841. M. 9815.
Aquário — Na vida: tranquilidade. No amor: realização sexual. G. 4, 0, 20. D. 14, 19, 91. C. 313, 718, 955. M. 1198.
Ar — Na vida: projetos promissores. No amor: boas notícias. G. 15, 12, 10. D. 38, 40, 65. C. 238, 340, 408. M. 4238.
Arado — Na vida: sucesso futuro. No amor: ajuda de amigos. G. 12, 13, 16. D. 47, 05, 61. C. 648, 401, 561. M. 4562.
Arco — Na vida: reconhecimento. No amor: encontro. G. 7, 9, 10. D. 28, 36, 09. C. 728, 430, 907. M. 1836.
Arco-íris — Na vida: melhoria de vida. No amor: reconciliação. G. 17, 19, 25. D. 60, 70, 77. C. 760, 476, 978. M. 5973.
Areia — Na vida: dinheiro. No amor: sensualidade. G. 14, 17, 25. D. 04, 68, 78. C. 604, 666, 478. M. 1978.
Arena — Na vida: boas perspectivas. No amor: perigo. G. 1, 8, 25. D. 57, 32, 78. C. 256, 731, 879. M. 9558.
Armadura — Na vida: dificuldades. No amor: falsidade. G. 3, 9, 15. D. 11, 34, 38. C. 711, 330, 739. M. 2730.
Armário — Na vida: segurança. No amor: traição. G. 2, 3, 22. D. 54, 12, 88. C. 851, 215, 487. M. 9551.
Arma — Na vida: vontade de vencer. No amor: sexo e desejo. G. 2, 13, 23. D. 53, 02, 91. C. 052, 501, 491. M. 4802.
Arranhão — Na vida: riscos. No amor: sofrimento. G. 11, 21, 22. D. 43, 81, 87. C. 043, 784, 087. M. 7881.
Arroz — Na vida: fartura. No amor: sinceridade. G. 1, 22, 23. D. 17, 80, 91. C. 419, 088, 291. M. 3119.
Artista — Na vida: desejo de realização. No amor: mentira. G. 10, 16, 20. D. 09, 61, 99. C. 709, 061, 355. M. 7199.
Árvore — Na vida: solidez e paz. No amor: estabilidade. G. 15, 14, 19. D. 39, 03, 74. C. 945, 900, 073. M. 5337.
Asfixia — Na vida: pressões externas. No amor: insatisfação. G. 6, 7, 25. D. 21, 26, 77. C. 922, 727, 085. M. 5422.
Asilo — Na vida: abandono. No amor: desilusão e solidão. G. 1, 13, 18. D. 56, 49, 72. C. 058, 505, 969. M. 9205.
Asma — Na vida: projetos fracassados. No amor: instabilidade. G. 7, 19, 25. D. 27, 70, 85. C. 527, 673, 777. M. 4328.
Asno — Na vida: ingenuidade. No amor: traição. G. 7, 10, 18. D. 20, 07, 72. C. 020, 608, 575. M. 7065.
Assado — Na vida: fartura. No amor: realização sexual. G. 9, 11, 18. D. 33, 44, 72. C. 933, 744, 669. M. 6933.
Assalto — Na vida: sorte no jogo. No amor: turbulência. G. 2, 3, 7. D. 52, 12, 26. C. 654, 659, 926. M. 5159.
Assassinato — Na vida: perturbações. No amor: fim de caso. G. 1, 3, 6. D. 56, 59, 22. C. 458, 659, 323. M. 6623.
Assassino — Na vida: visita inesperada. No amor: rival à vista. G. 7, 10, 19. D. 27, 65, 74. C. 327, 965, 974. M. 3307.
Assembléia — Na vida: amizades. No amor: cerimônia. G. 6, 16, 25. D. 22, 64, 79. C. 923, 564, 985. M. 5077.
Assinatura — Na vida: sucesso. No amor: afirmação. G. 7, 25, 24. D. 21, 77, 94. C. 722, 279, 596. M. 9094.
Assobio — Na vida: mau negócio. No amor: perigo. G. 6, 21, 24. D. 24, 83, 90. C. 824, 882, 996. M. 6290.
Ataque — Na vida: doença. No amor: esforço recompensado. G. 19, 25, 21. D. 73, 77, 84. C. 973, 885, 982. M. 5373.
Ataúde — Na vida: prejuízos. No amor: vazio. G. 17, 19, 24. D. 68, 70, 96. C. 268, 274, 994. M. 9094.
Ator — Na vida: situação embaraçosa. No amor: indefinição. G. 4, 6, 9. D. 13, 21, 33. C. 516, 722, 633. M. 7436.
Atriz — Na vida: decepções. No amor: desejos ocultos. G. 7, 9, 13. D. 27, 33, 49. C. 027, 833, 549. M. 0826.
Automóvel — Na vida: bom presságio. No amor: prestígio. G. 8, 17, 25. D. 32, 68, 79. C. 632, 568, 285. M. 9735.
Autor — Na vida: progresso. No amor: realizações. G. 15, 11, 14. D. 39, 43, 03. C. 739, 942, 700. M. 9645.
Autoridade — Na vida: desejos. No amor: contrariedades. G. 9, 13, 18. D. 33, 01, 72. C. 833, 049, 469. M. 0933.
Avarento — Na vida: medo do futuro. No amor: prejuízos. G. 3, 6, 24. D. 11, 21, 96. C. 759, 022, 096. M. 7524.
Avenida — Na vida: falta de perspectiva. No amor: indecisão. G. 14, 10, 16. D. 03, 08, 63. C. 603, 208, 464. M. 8762.
Avental — Na vida: sorte. No amor: sinceridade. G. 15, 13, 19. D. 39, 49, 74. C. 039, 949, 773. M. 3139.
Ave — Na vida: esperança. No amor: prisão. G. 2, 6, 23. D. 52, 24, 92. C. 554, 924, 589. M. 4191.
Avestruz — Na vida: boas notícias. No amor: fartura. G. 1, 7, 24. D. 25, 26, 90. C. 325, 226, 094. M. 1428.
Avião — Na vida: bons negócios. No amor: êxito. G. 6, 7, 20. D. 21, 28, 55. C. 822, 328, 655. M. 0524.
Aviso — Na vida: boa sorte. No amor: perigo. G. 1, 13, 10. D. 18, 01, 07. C. 925, 505, 407. M. 9607.
Avós — Na vida: desorientação. No amor: dúvidas. G. 1, 3, 14. D. 50, 59, 03. C. 250, 411, 308. M. 0856.
Azeite — Na vida: calmaria. No amor: tédio. G. 7, 9, 20. D. 28, 36, 55. C. 328, 336, 399. M. 9655.
Azeitona — Na vida: bons negócios. No amor: êxito. G. 7, 15, 17. D. 26, 45, 68. C. 326, 745, 468. M. 7526.
Azulejo — Na vida: melhorias. No amor: valorização. G. 2, 18, 21. D. 53, 69, 84. C. 953, 272, 784. M. 7853.`
};

// Function to get the dictionary entry for a specific letter
export async function getDreamDictionaryEntry(letter: string): Promise<string> {
    const upperCaseLetter = letter.toUpperCase();
    
    // First, try to get from Firebase RTDB
    const dbRef = ref(rtdb, `dreamDictionary/${upperCaseLetter}`);
    try {
        const snapshot = await get(dbRef);
        if (snapshot.exists()) {
            return snapshot.val();
        }
    } catch (error) {
        console.error("Error fetching from Firebase, falling back to local.", error);
    }
    
    // Fallback to local data if not in DB or if DB fails
    return dictionaryData[upperCaseLetter] || `Nenhum significado encontrado para a letra ${upperCaseLetter}.`;
}


// Function for admins to update a dictionary entry in Firebase
export async function updateDreamDictionaryEntry(letter: string, content: string): Promise<{ success: boolean; message: string }> {
    const upperCaseLetter = letter.toUpperCase();
    if (upperCaseLetter.length !== 1 || !/^[A-Z]$/.test(upperCaseLetter)) {
        return { success: false, message: "Invalid letter provided." };
    }

    const dbRef = ref(rtdb, `dreamDictionary/${upperCaseLetter}`);
    try {
        await set(dbRef, content);
        // Also update the local dictionaryData for the current session
        dictionaryData[upperCaseLetter] = content;
        return { success: true, message: `Dictionary for letter ${upperCaseLetter} updated successfully.` };
    } catch (error: any) {
        console.error(`Error updating dictionary for letter ${upperCaseLetter}:`, error);
        return { success: false, message: error.message || "An unknown error occurred." };
    }
}

/**
 * Searches for keyword definitions within a given dictionary text.
 * @param fullContent The full text of a dictionary letter.
 * @param keywords An array of keywords to search for.
 * @returns A string containing all found definitions, or a message if none were found.
 */
function findDefinitionsInText(fullContent: string, keywords: string[]): string[] {
    if (!fullContent || !keywords.length) {
        return [];
    }

    const foundMeanings: string[] = [];
    const normalizeText = (text: string) => 
        text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

    // This regex looks for a term at the beginning of a line (or the string)
    // followed by '—' or '—'. It's more robust for multiline entries.
    const definitions = fullContent.split(/(?<!^)\n(?=[A-ZÁÉÍÓÚÀÂÊÔÃÕÇ][a-zA-Záéíóúàâêôãõç\s-]*?\s—)/);
    
    const searchKeywords = keywords.map(normalizeText).filter(k => k);

    for (const def of definitions) {
        const match = def.trim().match(/^([a-zA-Záéíóúàâêôãõç\s-]+?)\s—/);
        if (match) {
            const term = normalizeText(match[1]);
            if (searchKeywords.includes(term)) {
                foundMeanings.push(def.trim());
            }
        }
    }

    return foundMeanings;
}

// Function for the AI flow to get meanings for specific keywords.
export async function getDictionaryEntriesForKeywords(keywords: string[]): Promise<string> {
    if (!keywords || keywords.length === 0) {
        return "Nenhum símbolo principal foi identificado no sonho para consulta no dicionário.";
    }

    const uniqueKeywords = [...new Set(keywords.map(k => k.toLowerCase()))];
    let allFoundMeanings: string[] = [];

    // Group keywords by the first letter to minimize DB calls
    const keywordsByLetter: { [key: string]: string[] } = {};
    for (const keyword of uniqueKeywords) {
        if (keyword) {
            const firstLetter = keyword[0].toUpperCase();
            if (!keywordsByLetter[firstLetter]) {
                keywordsByLetter[firstLetter] = [];
            }
            keywordsByLetter[firstLetter].push(keyword);
        }
    }

    // Process each letter group
    for (const letter in keywordsByLetter) {
        const fullContent = await getDreamDictionaryEntry(letter);
        if (!fullContent) continue;
        
        const meaningsForLetter = findDefinitionsInText(fullContent, keywordsByLetter[letter]);
        allFoundMeanings = allFoundMeanings.concat(meaningsForLetter);
    }
    
    // Remove duplicate entries that might arise from aliases
    const uniqueMeanings = [...new Set(allFoundMeanings)];

    if (uniqueMeanings.length > 0) {
        return uniqueMeanings.join('\n\n');
    }

    return `Nenhum significado específico foi encontrado no dicionário para os símbolos: ${keywords.join(', ')}. A interpretação será baseada no conhecimento geral do Profeta.`;
}
