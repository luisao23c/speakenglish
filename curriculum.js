// 220-level English curriculum
// Stages: Pre-A1(1-22), A1(23-55), A2(56-88), B1(89-121), B2(122-165), C1(166-198), C2(199-220)
// Exam levels: 11,22,33,44,55,66,77,88,99,110,121,132,143,154,165,176,187,198,209,220

const EXAMS = new Set([11,22,33,44,55,66,77,88,99,110,121,132,143,154,165,176,187,198,209,220]);
const CERT_EXAMS = new Set([22,55,88,121,165,198,220]);

const STAGES = [
  { name: 'Pre-A1', from: 1, to: 22 },
  { name: 'A1', from: 23, to: 55 },
  { name: 'A2', from: 56, to: 88 },
  { name: 'B1', from: 89, to: 121 },
  { name: 'B2', from: 122, to: 165 },
  { name: 'C1', from: 166, to: 198 },
  { name: 'C2', from: 199, to: 220 },
];

// Level topics: [title, description, vocab keywords]
const LEVELS_RAW = [
  // === PRE-A1 (1-22) ===
  // Block 1: Primer contacto (1-10)
  [1, 'Saludos y despedidas', 'Primer contacto con el ingles', ['hello','hi','goodbye','bye','good morning','good night','see you','thank you','please','sorry'], 'Comunicacion'],
  [2, 'Frases de supervivencia', 'Instrucciones de clase', ['yes','no','excuse me','I dont understand','can you repeat','what','ok','thanks'], 'Comunicacion'],
  [3, 'El alfabeto', 'Nombres de las letras', ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'], 'Pronunciacion'],
  [4, 'Deletreo y sonidos', 'Relacion letras-sonidos', ['spell','say','pronounce','sound','letter','name','call','write','read','speak'], 'Pronunciacion'],
  [5, 'Numeros 0-100', 'Contar en ingles', ['zero','one','two','three','four','five','six','seven','eight','nine','ten','twenty','thirty','forty','fifty','hundred'], 'Vocabulario'],
  [6, 'Pronombres personales', 'Sujetos basicos', ['I','you','he','she','it','we','they','me','him','her','us','them'], 'Gramatica'],
  [7, 'Verbo to be (afirmativo)', 'Oraciones con am/is/are', ['I am','you are','he is','she is','it is','we are','they am'], 'Gramatica'],
  [8, 'Contracciones to be', "I'm you're he's she's it's we're they're", ['I am','I\'m','you are','you\'re','he is','he\'s'], 'Gramatica'],
  [9, 'Articulos a y an', 'Indefinidos', ['a','an','the','book','apple','egg','umbrella','hour','university'], 'Gramatica'],
  [10, 'Oracion afirmativa', 'Orden basico SVO', ['subject','verb','object','I am','she likes','we have','they want','he eats'], 'Sintaxis'],
  // Block 2: Identidad (12-21)
  [12, 'To be negativo', 'No soy, no es', ['I am not','you are not','he is not','she is not','is not','are not','arent','isnt'], 'Gramatica'],
  [13, 'Preguntas si/no con to be', 'Are you? Is he?', ['are you','is he','is she','am I','is it','are they','yes I am','no he isnt'], 'Gramatica'],
  [14, 'Preguntas con what who where how', 'Informacion', ['what is','who is','where is','how are','what color','where are','who are','how old'], 'Gramatica'],
  [15, 'Presentacion personal', 'Intercambio de info', ['my name is','I am from','I am years old','I live in','nice to meet you','I like'], 'Comunicacion'],
  [16, 'Paises y nacionalidades', 'De donde eres', ['Mexico','USA','Spain','Colombia','Argentina','American','Spanish','Mexican','language','English'], 'Vocabulario'],
  [17, 'Profesiones y trabajo', 'Que haces', ['teacher','doctor','engineer','student','nurse','farmer','driver','chef','work','office'], 'Vocabulario'],
  [18, 'Adjetivos posesivos', 'My your his her', ['my','your','his','her','its','our','their','my name','your house','his car'], 'Gramatica'],
  [19, 'Posesion con apostrofo', "Tom's Maria's", ["Tom's","Maria's","the teacher's","my sister's","the dog's","children's"], 'Gramatica'],
  [20, 'La familia', 'Relaciones', ['mother','father','sister','brother','son','daughter','grandmother','grandfather','family','baby'], 'Vocabulario'],
  [21, 'Demostrativos', 'This that these those', ['this','that','these','those','this is','that is','these are','those are'], 'Gramatica'],
  // Block 3: Objetos y posesiones (23-32)
  [23, 'Plurales regulares', 'Terminaciones -s -es', ['cats','dogs','boxes','buses','watches','babies','potatoes','tomatoes','heroes','lives'], 'Gramatica'],
  [24, 'Plurales irregulares', 'Formas especiales', ['children','men','women','feet','teeth','mice','geese','sheep','fish','people'], 'Gramatica'],
  [25, 'Have y has', 'Posesion', ['I have','you have','he has','she has','we have','they have','I dont have','she doesnt have'], 'Gramatica'],
  [26, 'Have got has got', 'Alternativa posesiva', ['I have got','she has got','have you got','has he got','I havent got','hasnt got'], 'Gramatica'],
  [27, 'Orden de adjetivos', 'Posicion correcta', ['big red house','small beautiful garden','nice old Italian','first two','all the'], 'Sintaxis'],
  [28, 'Apariencia fisica', 'Como se ve', ['tall','short','thin','fat','young','old','beautiful','handsome','hair','eyes'], 'Vocabulario'],
  [29, 'Personalidad', 'Caracter', ['nice','kind','funny','serious','quiet','shy','brave','lazy','smart','friendly'], 'Vocabulario'],
  [30, 'Numeros grandes', 'Telefonos direcciones precios', ['phone','address','price','number','dollars','cents','cost','pay','call','number'], 'Vocabulario'],
  [31, 'Numeros ordinales y fechas', 'First second third', ['first','second','third','fourth','fifth','January','March','birthday','date','year'], 'Vocabulario'],
  [32, 'La hora y horarios', 'Que hora es', ['time','oclock','half past','quarter past','morning','afternoon','evening','appointment','schedule'], 'Comunicacion'],
  // Block 4: Presente simple (34-43)
  [34, 'Presente simple afirmativo', 'I work she works', ['I work','you work','he works','she works','it works','we work','they work','every day'], 'Gramatica'],
  [35, 'Tercera persona -s', 'Terminaciones -s -es -ies', ['works','plays','watches','studies','eats','drinks','goes','does','washes','fixes'], 'Gramatica'],
  [36, 'Presente simple negativo', 'Dont doesnt', ['I dont work','he doesnt work','she doesnt like','we dont have','they dont know'], 'Gramatica'],
  [37, 'Preguntas con do y does', 'Si/no questions', ['do you','does he','does she','do they','do we','does it','do I'], 'Gramatica'],
  [38, 'Preguntas informativas', 'Wh-questions en presente', ['what do','where does','when do','how does','why does','who does'], 'Gramatica'],
  [39, 'Adverbios de frecuencia', 'Always sometimes never', ['always','usually','often','sometimes','rarely','never','every day','often'], 'Gramatica'],
  [40, 'Rutinas diarias', 'Actividades habituales', ['wake up','get up','eat breakfast','go to work','come home','take a shower','go to bed','sleep'], 'Vocabulario'],
  [41, 'Preposiciones de tiempo', 'In on at', ['in the morning','on Monday','at night','in January','on my birthday','at 3 oclock'], 'Gramatica'],
  [42, 'Pronombres de objeto', 'Me you him her us them', ['me','you','him','her','it','us','them','give me','tell him','show her'], 'Gramatica'],
  [43, 'Gustos y preferencias', 'Like love hate prefer', ['I like','I love','I hate','I prefer','I enjoy','I dont like','Do you like'], 'Gramatica'],
  // Block 5: Lugares habilidades (45-54)
  [45, 'There is there are', 'Existencia', ['there is','there are','there isnt','there arent','is there','are there','a lot of'], 'Gramatica'],
  [46, 'Preposiciones de lugar', 'In on under near', ['in','on','under','behind','next to','between','in front of','near','above','below'], 'Gramatica'],
  [47, 'Habitaciones y muebles', 'Casa', ['kitchen','bedroom','bathroom','living room','dining room','sofa','table','chair','bed','lamp'], 'Vocabulario'],
  [48, 'Lugares de la ciudad', 'Direcciones', ['hospital','school','park','store','restaurant','bank','post office','turn left','go straight','next to'], 'Vocabulario'],
  [49, 'Can y can', 'Habilidades', ['I can','she can','we can','I cant','he cant','can you','can she','swim','drive','play'], 'Gramatica'],
  [50, 'Permisos y peticiones', 'Can I? Can you?', ['Can I','Can you','Could I','Could you','please','sorry','thank you','help me'], 'Comunicacion'],
  [51, 'Imperativos', 'Ordenes e instrucciones', ['stop','go','come','sit down','stand up','look','listen','dont touch','open','close'], 'Gramatica'],
  [52, 'Presente continuo afirmativo', 'I am working', ['I am','you are','he is','she is','working','eating','going','coming','right now','now'], 'Gramatica'],
  [53, 'Presente continuo negativo e interrogativo', 'Questions and negatives', ['I am not','he isnt','are you','is she','what are you doing','where are they'], 'Gramatica'],
  [54, 'Simple vs continuo', 'Diferencia', ['always','now','usually','at the moment','right now','every day','this week','temporary'], 'Gramatica'],
  // === A2 (56-88) ===
  // Block 6: Cantidades y pasado (56-65)
  [56, 'Contables e incontables', 'Tipos de sustantivos', ['water','bread','rice','money','information','advice','an apple','two books','some water'], 'Gramatica'],
  [57, 'Some any no', 'Uso correcto', ['some','any','no','some water','any questions','no money','somebody','anything','nothing'], 'Gramatica'],
  [58, 'Cuantificadores', 'Much many a lot', ['much','many','a lot of','a few','a little','several','plenty of','enough'], 'Gramatica'],
  [59, 'How much y how many', 'Preguntas de cantidad', ['how much','how many','How much does it cost','How many people','a lot','not many'], 'Gramatica'],
  [60, 'Comida y restaurantes', 'Pedir comida', ['menu','order','bill','waiter','I would like','can I have','table for two','delicious'], 'Comunicacion'],
  [61, 'Pasado to be', 'Was y were', ['I was','you were','he was','she was','it was','we were','they were','wasnt','werent'], 'Gramatica'],
  [62, 'Pasado simple regular', 'Verbos regulares', ['worked','played','watched','lived','wanted','needed','asked','called','walked','talked'], 'Gramatica'],
  [63, 'Pronunciacion -ed', 'Terminaciones /t/ /d/ /id/', ['worked','played','wanted','needed','walked','called','asked','talked','lived','watched'], 'Pronunciacion'],
  [64, 'Verbos irregulares pasado', 'Formas especiales', ['went','came','ate','drank','saw','had','was','were','did','made','took','gave','said'], 'Gramatica'],
  [65, 'Pasado negativo e interrogativo', 'Didnt y Did', ['I didnt','he didnt','she didnt','did you','did he','did she','did they','What did'], 'Gramatica'],
  // Block 7: Narracion y comparacion (67-76)
  [67, 'Expresiones de tiempo pasado', 'Ago last yesterday', ['ago','last','yesterday','in 2020','last week','last month','two years ago','long ago'], 'Gramatica'],
  [68, 'Secuenciadores narrativos', 'Primero luego', ['first','then','after that','next','finally','before','while','during','in the end'], 'Discurso'],
  [69, 'Pasado continuo', 'I was working', ['I was working','she was sleeping','they were talking','was he','were they','while','when'], 'Gramatica'],
  [70, 'Pasado simple vs continuo', 'Interrupcion', ['when','while','I was cooking when','she was reading and','suddenly','at that moment'], 'Gramatica'],
  [71, 'Could para pasado', 'Habilidad y peticiones', ['I could','she could','I couldnt','could you','Could I','couldnt','When I was young I could'], 'Gramatica'],
  [72, 'Comparativos', 'Mas grande que', ['bigger','smaller','more beautiful','taller than','more expensive than','less','better','worse'], 'Gramatica'],
  [73, 'Superlativos', 'El mas grande', ['the biggest','the smallest','the most beautiful','the tallest','the best','the worst'], 'Gramatica'],
  [74, 'Igualdad y comparacion', 'As as less least', ['as tall as','not as big as','the same as','similar to','different from'], 'Gramatica'],
  [75, 'Too y enough', 'Demasiado y suficiente', ['too hot','too expensive','enough money','old enough','big enough','too much','too many'], 'Gramatica'],
  [76, 'Consejos con should', 'Deberias', ['should','shouldnt','you should','I think you should','maybe you should','you shouldnt'], 'Gramatica'],
  // Block 8: Futuro y experiencias (78-87)
  [78, 'Obligacion y necesidad', 'Must have to', ['must','have to','mustnt','dont have to','you must','I have to','is it necessary'], 'Gramatica'],
  [79, 'Futuro con going to', 'Planes e intenciones', ['I am going to','she is going to','we are going to','Are you going to','plans','intention'], 'Gramatica'],
  [80, 'Futuro con will', 'Predicciones y promesas', ['I will','she will','we will','I wont','Will you','I promise','prediction','decision'], 'Gramatica'],
  [81, 'Presente continuo para futuro', 'Acuerdos', ['I am meeting','we are having','she is coming','Are you doing','tonight','tomorrow','next week'], 'Gramatica'],
  [82, 'Comparacion de futuros', 'When to use each', ['going to','will','present continuous','plan','prediction','arrangement','spontaneous'], 'Gramatica'],
  [83, 'Presente perfecto formacion', 'Participios', ['I have worked','she has gone','we have seen','have you','has he','been','done','eaten'], 'Gramatica'],
  [84, 'Experiencias ever never', 'Have you ever?', ['ever','never','Have you ever','I have never','she has ever','once','twice','many times'], 'Gramatica'],
  [85, 'Just already yet', 'Acciones recientes', ['just','already','yet','I have just','she has already','have you yet','not yet','already'], 'Gramatica'],
  [86, 'For y since', 'Duracion', ['for','since','for two hours','since Monday','for a long time','since 2020','how long'], 'Gramatica'],
  [87, 'Presente perfecto vs pasado', 'Diferencia clave', ['ever','never','already','yesterday','last week','in 2020','since','for'], 'Gramatica'],
  // === B1 (89-121) ===
  // Block 9: Condiciones y conexiones (89-98)
  [89, 'Condicional cero', 'Hechos generales', ['if','when','zero conditional','If you heat water','it boils','generally','always'], 'Gramatica'],
  [90, 'Primer condicional', 'Posibilidades reales', ['If I go','I will','If she studies','she will pass','first conditional','real possibility'], 'Gramatica'],
  [91, 'Clasulas futuras', 'Unless when until', ['unless','when','until','before','as soon as','after','by the time','once'], 'Gramatica'],
  [92, 'Oraciones relativas definitorias', 'Who which that where', ['who','which','that','where','the man who','the book which','the place where'], 'Gramatica'],
  [93, 'Gerundio e infinitivo', 'Patrones frecuentes', ['enjoy doing','want to do','I like swimming','she decided to','finish doing','plan to'], 'Gramatica'],
  [94, 'Presente perfecto continuo', 'I have been working', ['have been','has been','I have been working','for','since','how long','still'], 'Gramatica'],
  [95, 'Perfecto simple vs continuo', 'Enfoque', ['I have read','I have been reading','result','duration','completed','ongoing'], 'Gramatica'],
  [96, 'Used to y would', 'Habitos pasados', ['used to','would','I used to play','she used to live','would always','didnt use to'], 'Gramatica'],
  [97, 'Pasado perfecto', 'I had worked', ['had','had not','hadnt','before','after','by the time','already'], 'Gramatica'],
  [98, 'Phrasal verbs cotidianos', 'Verbos compuestos', ['get up','turn off','look for','give up','find out','put on','take off','turn on'], 'Vocabulario'],
  // Block 10: Hipotesis pasiva indirecto (100-109)
  [100, 'Voz pasiva presente', 'It is made', ['is made','are built','is done','is written','is taught','by','was','were'], 'Gramatica'],
  [101, 'Voz pasiva pasado', 'It was made', ['was made','were built','was done','was written','was taught','by','were'], 'Gramatica'],
  [102, 'Segundo condicional', 'Situaciones hipoteticas', ['If I were','I would','she would','If I had','I would travel','second conditional','unreal'], 'Gramatica'],
  [103, 'Posibilidad con modales', 'May might could', ['may','might','could','It may rain','she might be','he could have','perhaps'], 'Gramatica'],
  [104, 'Deduccion presente', 'Must might cant', ['must be','might be','cant be','She must be','It cant be','He might be','probably'], 'Gramatica'],
  [105, 'Estilo indirecto afirmaciones', 'He said that', ['said','told','He said that','She told me','reported speech','that','changes'], 'Gramatica'],
  [106, 'Estilo indirecto preguntas', 'He asked if', ['asked','wondered','He asked if','She wanted to know','indirect question','if','whether'], 'Gramatica'],
  [107, 'Estilo indirecto ordenes', 'He told me to', ['told','ordered','asked','He told me to','She asked me not to','reported commands'], 'Gramatica'],
  [108, 'Preguntas indirectas', 'Lenguaje educado', ['Could you tell me','I wonder','Do you know','Would you mind','Could you please','polite'], 'Comunicacion'],
  [109, 'Question tags', 'Entonacion', ['isnt it','doesnt she','arent they','did he','cant we','wont you','tag questions'], 'Gramatica'],
  // Block 11: Comunicacion independiente (111-120)
  [111, 'Articulos avanzados', 'The zero article', ['the','a','an','zero article','generalization','institutions','geographic'], 'Gramatica'],
  [112, 'Formas debiles y enlace', 'Pronunciacion natural', ['weak forms','linking','schwa','stress','rhythm','connected speech'], 'Pronunciacion'],
  [113, 'Conectores avanzados', 'Cohesion', ['although','however','therefore','furthermore','nevertheless','consequently','in addition'], 'Discurso'],
  [114, 'Estructura de parrafos', 'Idea apoyo conclusion', ['topic sentence','supporting details','conclusion','paragraph','coherence','cohesion'], 'Escritura'],
  [115, 'Mensajes informales', 'Correos casuales', ['Hey','What is up','Thanks','See you','Cheers','Best','informal','friendly'], 'Escritura'],
  [116, 'Correos formales basicos', 'Solicitudes', ['Dear','Sincerely','I am writing to','I would like to','formal','request','complaint'], 'Escritura'],
  [117, 'Comprension lectora', 'Estrategias de lectura', ['skimming','scanning','inference','main idea','detail','vocabulary','context'], 'Lectura'],
  [118, 'Comprension auditiva', 'Listening skills', ['gist','specific details','note-taking','prediction','inference','listening'], 'Audicion'],
  [119, 'Texto de opinion', 'Estructura argumentativa', ['I believe','in my opinion','for example','in conclusion','I think','reason'], 'Escritura'],
  [120, 'Turnos y autocorreccion', 'Habla natural', ['Sorry','I mean','Let me rephrase','What I mean is','actually','turn-taking'], 'Conversacion'],
  // === B2 (122-165) ===
  // Block 12: Tiempos avanzados (122-131)
  [122, 'Contraste de tiempos narrativos', 'Uso correcto de cada tiempo', ['present simple','present continuous','past simple','past continuous','present perfect','future'], 'Gramatica'],
  [123, 'Pasado perfecto continuo', 'I had been working', ['had been','I had been working','before','when','duration','exhausted'], 'Gramatica'],
  [124, 'Futuro continuo', 'I will be working', ['will be','will be doing','at this time tomorrow','next year','will be happening'], 'Gramatica'],
  [125, 'Futuro perfecto', 'I will have finished', ['will have','will have done','by next week','by 2030','by the time','completed'], 'Gramatica'],
  [126, 'Tercer condicional', 'Regret about past', ['If I had','I would have','she would have','If they had studied','they would have passed'], 'Gramatica'],
  [127, 'Condicionales mixtos', 'Combinaciones', ['If I had studied','I would be','If she were','she would have','mixed conditionals','past+present'], 'Gramatica'],
  [128, 'Wish e if only', 'Deseos y arrepentimientos', ['I wish','If only','I wish I were','I wish I had','I wish I could','regret'], 'Gramatica'],
  [129, 'Would rather e Its time', 'Preferencias', ['would rather','Id rather','its time','high time','would prefer','sooner'], 'Gramatica'],
  [130, 'Deducciones pasadas', 'Modales perfectos', ['must have','might have','could have','should have','cant have','may have'], 'Gramatica'],
  [131, 'Critica y oportunidades perdidas', 'Modales perfectos II', ['should have done','could have done','might have done','If only I had','regret'], 'Gramatica'],
  // Block 13: Pasiva y clausulas (133-142)
  [133, 'Voz pasiva todos los tiempos', 'Mastery', ['is done','was done','will be done','has been done','being done','had been done'], 'Gramatica'],
  [134, 'Pasiva con modales e infinitivos', 'Can be done must be done', ['can be done','must be done','should be done','needs to be done','to be done'], 'Gramatica'],
  [135, 'Pasiva impersonal', 'It is believed', ['It is believed','He is thought to','It is said','She is known','impersonal'], 'Gramatica'],
  [136, 'Causativa', 'Have something done', ['I had my car fixed','she got her hair cut','have something done','get something done'], 'Gramatica'],
  [137, 'Verbos de reporte', 'Patrones', ['said','told','explained','claimed','suggested','insisted','denied','admitted'], 'Gramatica'],
  [138, 'Estilo indirecto avanzado', 'Excepciones temporales', ['he said','she told me','backshift','no change','direct','indirect','reported'], 'Gramatica'],
  [139, 'Relativas no definitorias', 'Comas que agregan info', ['who','which','that','whose','where','non-defining','extra information'], 'Gramatica'],
  [140, 'Relativas reducidas', 'Participios', ['the man standing','the book written','the house built','being','having','reduced'], 'Gramatica'],
  [141, 'Clasulas de participio', 'Having done being done', ['Having finished','Being tired','Having seen','Seen from above','participle clauses'], 'Gramatica'],
  [142, 'Frases hendidas', 'Cleft sentences', ['It was John who','What I need is','The thing is','It is important that','cleft'], 'Gramatica'],
  // Block 14: Gramatica y lexico B2 (144-153)
  [144, 'Inversion negativa', 'Never have I', ['Never have I','Not only','Hardly','Seldom','Rarely','No sooner','inversion'], 'Gramatica'],
  [145, 'Inversion condicional sin if', 'Had I known', ['Had I','Were she','Should you','If not for','Were it not','conditional inversion'], 'Gramatica'],
  [146, 'Articulos avanzados', 'Generalizacion instituciones', ['the','a','an','zero','institutions','geographic','generalization','abstract'], 'Gramatica'],
  [147, 'Determinantes avanzados', 'Both neither either', ['both','neither','either','all','none','each','every','several','enough'], 'Gramatica'],
  [148, 'Clausulas nominales', 'That what whether', ['that','what','whether','I think that','The fact is','I wonder whether','noun clause'], 'Gramatica'],
  [149, 'Gerundio vs infinitivo avanzado', 'Cambios de significado', ['stop to','stop doing','remember to','remember doing','try to','try doing'], 'Gramatica'],
  [150, 'Preposiciones dependientes', 'Verbos y adjetivos', ['depend on','consist of','interested in','good at','afraid of','sorry about'], 'Vocabulario'],
  [151, 'Phrasal verbs avanzados', 'Separables e inseparables', ['put up with','get away with','make up for','look forward to','come across'], 'Vocabulario'],
  [152, 'Formacion de palabras', 'Prefijos sufijos', ['un','re','dis','pre','mis','tion','ment','ness','ful','less','able'], 'Vocabulario'],
  [153, 'Colocaciones', 'Combinaciones naturales', ['make a decision','do homework','heavy rain','strong wind','fast food','deep sleep'], 'Vocabulario'],
  // Block 15: Produccion y comprension B2 (155-164)
  [155, 'Cohesion textual', 'Referencias y cadenas', ['cohesion','reference','substitution','ellipsis','lexical chains','texture'], 'Discurso'],
  [156, 'Conectores avanzados', 'Contraste concesion causa', ['although','even though','whereas','nevertheless','consequently','in order to'], 'Discurso'],
  [157, 'Ensayo argumentativo', 'Tesis y contraargumento', ['thesis statement','argument','counterargument','evidence','conclusion','essay'], 'Escritura'],
  [158, 'Correspondencia formal', 'Cartas diplomaticas', ['Dear Sir','I am writing regarding','I look forward to','formal','diplomatic'], 'Escritura'],
  [159, 'Informes', 'Report writing', ['report','findings','recommendations','executive summary','data','conclusion'], 'Escritura'],
  [160, 'Propuestas', 'Project proposals', ['proposal','objective','methodology','budget','timeline','expected results'], 'Escritura'],
  [161, 'Articulos y resenas', 'Diferentes audiencias', ['article','review','audience','tone','style','publication','critical'], 'Escritura'],
  [162, 'Comprension lectora avanzada', 'Actitud intencion', ['attitude','intention','implied opinion','text structure','rhetoric','discourse'], 'Lectura'],
  [163, 'Listening avanzado', 'Habla rapida', ['fast speech','implicit details','note-taking','accent','register','listening strategies'], 'Audicion'],
  [164, 'Debate y negociacion', 'Comunicacion oral', ['debate','negotiate','speculate','compare','contrasting','persuade'], 'Conversacion'],
  // === C1 (166-198) ===
  // Block 16: Gramatica avanzada (166-175)
  [166, 'Eleccion verbal avanzada', 'Tiempo y aspecto', ['aspect','tense selection','narrative','descriptive','formal','register'], 'Gramatica'],
  [167, 'Modalidad avanzada', 'Epistemica deontica dinamica', ['epistemic','deontic','dynamic','may well','might as well','ought to'], 'Gramatica'],
  [168, 'Hedging y boosting', 'Atenuacion e intensificacion', ['perhaps','it seems','apparently','obviously','clearly','undoubtedly'], 'Discurso'],
  [169, 'Nominalizacion', 'Escritura academica', ['nominalization','decision','implementation','investigation','development','analysis'], 'Escritura'],
  [170, 'Grupos nominales complejos', 'Estructura', ['noun phrase','modifier','qualifier','determiner','complement','pre-modification'], 'Gramatica'],
  [171, 'Adverbios avanzados', 'Posicion y significado', ['adverb position','scope','focus','sentence adverbials','conjunctive','disjunct'], 'Gramatica'],
  [172, 'Elipsis y sustitucion', 'Reduccion', ['ellipsis','substitution','one','so','not','do','pro-form','avoidance'], 'Gramatica'],
  [173, 'Fronting y topicalizacion', 'Reorden', ['fronting','topicalization','object fronting','adverbial fronting','emphasis'], 'Gramatica'],
  [174, 'Estructuras de foco', 'Contraste y enfasis', ['focus','contrastive','cleft','pseudo-cleft','emphatic','marked order'], 'Gramatica'],
  [175, 'Puntuacion avanzada', 'Oraciones complejas', ['semicolon','colon','dash','parenthetical','appositive','complex sentences'], 'Escritura'],
  // Block 17: Lexico y pragmatica (177-186)
  [177, 'Precision semantica', 'Sinonimos y connotacion', ['connotation','denotation','synonym','nuance','register','precision'], 'Vocabulario'],
  [178, 'Colocaciones avanzadas', 'Bloques lexicos', ['collocation','lexical bundle','formulaic','fixed expression','prefabricated'], 'Vocabulario'],
  [179, 'Expresiones idiomáticas', 'Formula fija', ['idiom','fixed expression','formulaic language','colloquial','proverb'], 'Vocabulario'],
  [180, 'Metaforas', 'Lenguaje figurado', ['metaphor','figurative','literal','analogy','extended metaphor','imagery'], 'Vocabulario'],
  [181, 'Registros', 'Formal neutral informal', ['formal','neutral','informal','colloquial','slang','register','appropriacy'], 'Registro'],
  [182, 'Pragmatica avanzada', 'Cortesia e indirectividad', ['politeness','indirectness','face','implicature','speech act','illocutionary'], 'Pragmatica'],
  [183, 'Marcadores discursivos', 'Orales y escritos', ['discourse marker','filler','connective','transition','hesitation marker'], 'Discurso'],
  [184, 'Parafrasis', 'Reformulacion sin distortion', ['paraphrase','rephrase','restatement','synonym substitution','reformulation'], 'Escritura'],
  [185, 'Resumen de fuentes', 'Comprension y escritura', ['summary','source','synthesis','abstract','gist','key points'], 'Escritura'],
  [186, 'Sintesis de multiples fuentes', 'Varias fuentes', ['synthesis','multiple sources','integration','cross-reference','comparison'], 'Escritura'],
  // Block 18: Academico y profesional C1 (188-197)
  [188, 'Ensayo academico avanzado', 'Argumentativo', ['thesis','argument','evidence','literature review','methodology','conclusion'], 'Escritura'],
  [189, 'Resena critica', 'Academica o cultural', ['critical review','analysis','evaluation','strengths','weaknesses','recommendation'], 'Escritura'],
  [190, 'Informe de investigacion', 'Academico', ['research report','abstract','findings','discussion','references','appendix'], 'Escritura'],
  [191, 'Resumen ejecutivo', 'Propuesta profesional', ['executive summary','proposal','stakeholders','objectives','budget','ROI'], 'Escritura'],
  [192, 'Presentaciones persuasivas', 'Oral academico', ['persuasive','audience','signposting','rhetorical question','call to action'], 'Expresion oral'],
  [193, 'Negociacion y mediacion', 'Profesional', ['negotiate','mediate','compromise','facilitate','conflict resolution','agreement'], 'Comunicacion'],
  [194, 'Textos academicos complejos', 'Significado implicito', ['implied','implicit','inference','subtext','connotation','reading between lines'], 'Lectura'],
  [195, 'Conferencias y debates', 'Variados acentos', ['conference','lecture','debate','accent','dialect','register','audience'], 'Audicion'],
  [196, 'Entonacion avanzada', 'Acento nuclear', ['intonation','nuclear stress','tone','attitude','posture','rhetorical'], 'Pronunciacion'],
  [197, 'Fluidez espontanea', 'Reparacion natural', ['fluency','spontaneous','repair','reformulation','hesitation','natural speech'], 'Conversacion'],
  // === C2 (199-220) ===
  // Block 19: Precision extrema (199-208)
  [199, 'Matices semanticos', 'Gradacion y restriccion', ['nuance','gradation','restriction','connotation','shade of meaning','precision'], 'Semantica'],
  [200, 'Contrafactualidad avanzada', 'Condicionales complejos', ['counterfactual','conditional','hypothetical','subjunctive','irrealis','were to'], 'Gramatica'],
  [201, 'Negacion compleja', 'Alcance interpretativo', ['negation','scope','double negation','litotes','understatement','negative polarity'], 'Gramatica'],
  [202, 'Sintaxis marcada', 'Literaria y formal', ['marked syntax','inversion','ellipsis','fronting','literary','formal','stylistic'], 'Gramatica'],
  [203, 'Presuposiciones e implicaturas', 'Intenciones indirectas', ['presupposition','implicature','implication','conversational','Gricean','indirect'], 'Pragmatica'],
  [204, 'Ironia y sarcasmo', 'Retoques retoricos', ['irony','sarcasm','euphemism','hyperbole','understatement','rhetorical'], 'Pragmatica'],
  [205, 'Persuasion retorica', 'Estructura y audiencia', ['rhetoric','persuasion','audience adaptation','pathos','ethos','logos'], 'Retorica'],
  [206, 'Pensamiento critico', 'Falacias y analisis', ['fallacy','bias','propaganda','critical analysis','discourse','ideology'], 'Pensamiento'],
  [207, 'Edicion avanzada', 'Estilo y correccion', ['editing','style','cohesion','rhythm','voice','tone','stylistic correction'], 'Edicion'],
  [208, 'Mediacion linguistica', 'Interferencia traduccion', ['mediation','interference','translation','functional equivalence','reformulation'], 'Mediacion'],
  // Block 20: Maestria linguistica (210-219)
  [210, 'Inglés global', 'Dialectos y variacion', ['dialect','accent','sociolect','regional','variety','global English','World English'], 'Sociolingüistica'],
  [211, 'Literatura inglesa', 'Estilo e intertextualidad', ['literature','symbolism','style','intertextuality','close reading','literary criticism'], 'Literatura'],
  [212, 'Inglés cientifico-tecnico', 'Discurso especializado', ['technical','scientific','statistical','jargon','specialized','discipline'], 'Inglés especializado'],
  [213, 'Inglés juridico-administrativo', 'Lenguaje claro', ['legal','administrative','plain language','regulation','contract','compliance'], 'Inglés especializado'],
  [214, 'Síntesis académica avanzada', 'Citación y plagio', ['citation','referencing','plagiarism','attribution','paraphrase','academic integrity'], 'Inglés académico'],
  [215, 'Presentaciones de alto riesgo', 'Respuestas a preguntas', ['presentation','Q&A','under pressure','extemporaneous','poise','expertise'], 'Expresión oral'],
  [216, 'Mediación oral avanzada', 'Interpretación consecutiva', ['interpretation','consecutive','summary','oral mediation','simultaneous','reproduction'], 'Mediación oral'],
  [217, 'Escritura creativa', 'Voz narrativa', ['creative writing','narrative voice','dialogue','tone','style','genre','fiction'], 'Escritura creativa'],
  [218, 'Adaptación de contenido', 'Especialistas y público general', ['adaptation','audience','register','simplification','technicality','accessibility'], 'Comunicación avanzada'],
  [219, 'Proyecto final', 'Integracion completa', ['research','writing','presentation','defense','oral','project','integration'], 'Proyecto'],
];

// Build LEVEL_PATH from raw data, adding missing exam levels
var _rawMap = {};
LEVELS_RAW.forEach(function(item) { _rawMap[item[0]] = item; });
var LEVEL_PATH = [];
for (var i = 1; i <= 220; i++) {
  if (_rawMap[i]) {
    var item = _rawMap[i];
    LEVEL_PATH.push({ id: i, title: item[1], desc: item[2], type: 'vocab', vocab: item[3] || [], category: item[4] || 'General', stage: getStage(i), xpNeeded: 0 });
  } else if (EXAMS.has(i)) {
    var stageName = getStage(i);
    var examLabel = CERT_EXAMS.has(i) ? 'EXAMEN CERTIFICACION ' + stageName : 'EXAMEN BLOQUE ' + i;
    LEVEL_PATH.push({ id: i, title: examLabel, desc: 'Evaluacion del bloque ' + stageName, type: 'exam', vocab: [], category: 'Examen', stage: stageName, xpNeeded: 0 });
  }
}

function getStage(id) {
  for (var i = 0; i < STAGES.length; i++) {
    if (id >= STAGES[i].from && id <= STAGES[i].to) return STAGES[i].name;
  }
  return 'Unknown';
}

function getLevelInfo(id) {
  var lvl = LEVEL_PATH.find(function(l) { return l.id === id; });
  if (!lvl) return null;
  return {
    title: lvl.title,
    desc: lvl.desc,
    type: lvl.type,
    category: lvl.category,
    stage: lvl.stage,
    isExam: lvl.type === 'exam',
    isCertExam: CERT_EXAMS.has(id)
  };
}

function getStageLevels(stageName) {
  return LEVEL_PATH.filter(function(l) { return l.stage === stageName; });
}

module.exports = { LEVEL_PATH, EXAMS, CERT_EXAMS, STAGES, getLevelInfo, getStageLevels };
