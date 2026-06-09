export const WORDS = [
  // ══════════════════════════════════════════════
  // 자연 (25 words)
  // ══════════════════════════════════════════════

  // rain (3)
  {id:'rain_cloud',     word:'구름',   syllables:['구','름'],       category:'자연', sceneId:'rain',    emoji:'☁️',  hint:'하늘에 떠 있는 것',               hotspot:{x:0.55,y:0.18,r:0.12}},
  {id:'rain_raindrop',  word:'빗방울', syllables:['빗','방','울'],   category:'자연', sceneId:'rain',    emoji:'💧',  hint:'비가 올 때 떨어져요',             hotspot:{x:0.75,y:0.52,r:0.09}},
  {id:'rain_rainbow',   word:'무지개', syllables:['무','지','개'],   category:'자연', sceneId:'rain',    emoji:'🌈',  hint:'비 온 뒤 하늘에 떠요',            hotspot:{x:0.40,y:0.20,r:0.14}},

  // forest (3)
  {id:'forest_tree',    word:'나무',   syllables:['나','무'],         category:'자연', sceneId:'forest',  emoji:'🌳',  hint:'숲에 있는 큰 식물',              hotspot:{x:0.30,y:0.45,r:0.15}},
  {id:'forest_dew',     word:'이슬',   syllables:['이','슬'],         category:'자연', sceneId:'forest',  emoji:'💦',  hint:'아침에 풀잎에 맺혀요',           hotspot:{x:0.68,y:0.78,r:0.08}},
  {id:'forest_leaf',    word:'나뭇잎', syllables:['나','뭇','잎'],   category:'자연', sceneId:'forest',  emoji:'🍃',  hint:'나무에 달린 초록 잎',             hotspot:{x:0.50,y:0.30,r:0.10}},

  // sea (3)
  {id:'sea_sea',        word:'바다',   syllables:['바','다'],         category:'자연', sceneId:'sea',     emoji:'🌊',  hint:'넓고 파란 물',                   hotspot:{x:0.50,y:0.60,r:0.15}},
  {id:'sea_wave',       word:'파도',   syllables:['파','도'],         category:'자연', sceneId:'sea',     emoji:'🌊',  hint:'바다에서 일렁여요',              hotspot:{x:0.30,y:0.70,r:0.10}},
  {id:'sea_shell',      word:'조개',   syllables:['조','개'],         category:'자연', sceneId:'sea',     emoji:'🐚',  hint:'바닷가에서 주워요',              hotspot:{x:0.70,y:0.85,r:0.09}},

  // meadow (2)
  {id:'meadow_wind',    word:'바람',   syllables:['바','람'],         category:'자연', sceneId:'meadow',  emoji:'💨',  hint:'눈에 안 보이지만 느껴요',        hotspot:{x:0.20,y:0.30,r:0.10}},
  {id:'meadow_flower',  word:'꽃송이', syllables:['꽃','송','이'],   category:'자연', sceneId:'meadow',  emoji:'🌸',  hint:'예쁜 꽃이 피어 있어요',          hotspot:{x:0.60,y:0.55,r:0.10}},

  // sky (4)
  {id:'sky_sky',        word:'하늘',   syllables:['하','늘'],         category:'자연', sceneId:'sky',     emoji:'⛅',  hint:'위를 올려다봐요',                hotspot:{x:0.50,y:0.20,r:0.15}},
  {id:'sky_sunset',     word:'노을',   syllables:['노','을'],         category:'자연', sceneId:'sky',     emoji:'🌅',  hint:'저녁 하늘이 빨개요',             hotspot:{x:0.75,y:0.35,r:0.12}},
  {id:'sky_shower',     word:'소나기', syllables:['소','나','기'],   category:'자연', sceneId:'sky',     emoji:'🌦️', hint:'갑자기 왔다 가는 비',            hotspot:{x:0.30,y:0.55,r:0.10}},
  {id:'sky_sunlight',   word:'햇살',   syllables:['햇','살'],         category:'자연', sceneId:'sky',     emoji:'🌞',  hint:'햇빛이 쏟아져 내려요',          hotspot:{x:0.60,y:0.15,r:0.10}},

  // winter (4)
  {id:'winter_snowflake',word:'눈송이',syllables:['눈','송','이'],   category:'자연', sceneId:'winter',  emoji:'❄️',  hint:'하늘에서 내리는 하얀 것',        hotspot:{x:0.50,y:0.30,r:0.10}},
  {id:'winter_icicle',  word:'고드름', syllables:['고','드','름'],   category:'자연', sceneId:'winter',  emoji:'🧊',  hint:'처마 끝에 매달린 얼음',          hotspot:{x:0.30,y:0.25,r:0.09}},
  {id:'winter_ice',     word:'얼음',   syllables:['얼','음'],         category:'자연', sceneId:'winter',  emoji:'🧊',  hint:'물이 꽁꽁 얼어요',              hotspot:{x:0.55,y:0.70,r:0.10}},
  {id:'winter_frost',   word:'서리',   syllables:['서','리'],         category:'자연', sceneId:'winter',  emoji:'🌨️', hint:'풀잎에 하얗게 맺혀요',          hotspot:{x:0.70,y:0.60,r:0.10}},

  // mountain (3)
  {id:'mountain_pebble',word:'돌멩이', syllables:['돌','멩','이'],   category:'자연', sceneId:'mountain',emoji:'🪨',  hint:'작고 둥근 돌',                   hotspot:{x:0.45,y:0.80,r:0.09}},
  {id:'mountain_mist',  word:'안개',   syllables:['안','개'],         category:'자연', sceneId:'mountain',emoji:'🌫️', hint:'뿌연 흰 연기처럼 보여요',        hotspot:{x:0.50,y:0.40,r:0.12}},
  {id:'mountain_pinecone',word:'솔방울',syllables:['솔','방','울'],  category:'자연', sceneId:'mountain',emoji:'🌲',  hint:'소나무에 달리는 씨앗',           hotspot:{x:0.25,y:0.65,r:0.09}},

  // river (2)
  {id:'river_stream',   word:'개울',   syllables:['개','울'],         category:'자연', sceneId:'river',   emoji:'💧',  hint:'작고 맑은 물줄기',               hotspot:{x:0.50,y:0.60,r:0.15}},
  {id:'river_ripple',   word:'물결',   syllables:['물','결'],         category:'자연', sceneId:'river',   emoji:'🌊',  hint:'물이 출렁거려요',               hotspot:{x:0.35,y:0.55,r:0.10}},

  // garden (2)
  {id:'garden_sprout',  word:'새싹',   syllables:['새','싹'],         category:'자연', sceneId:'garden',  emoji:'🌱',  hint:'씨앗에서 처음 나오는 것',        hotspot:{x:0.35,y:0.65,r:0.09}},
  {id:'garden_seed',    word:'씨앗',   syllables:['씨','앗'],         category:'자연', sceneId:'garden',  emoji:'🫘',  hint:'심으면 꽃이나 나무가 돼요',      hotspot:{x:0.65,y:0.78,r:0.08}},

  // night (2)
  {id:'night_star',     word:'별빛',   syllables:['별','빛'],         category:'자연', sceneId:'night',   emoji:'⭐',  hint:'밤하늘에 반짝여요',              hotspot:{x:0.55,y:0.30,r:0.10}},
  {id:'night_moon',     word:'달빛',   syllables:['달','빛'],         category:'자연', sceneId:'night',   emoji:'🌙',  hint:'달이 비추는 빛',                hotspot:{x:0.30,y:0.25,r:0.10}},

  // ══════════════════════════════════════════════
  // 동물 (22 words)
  // ══════════════════════════════════════════════

  // farm (4)
  {id:'farm_puppy',     word:'강아지', syllables:['강','아','지'],   category:'동물', sceneId:'farm',    emoji:'🐶',  hint:'멍멍 짖어요',                    hotspot:{x:0.65,y:0.70,r:0.10}},
  {id:'farm_chick',     word:'병아리', syllables:['병','아','리'],   category:'동물', sceneId:'farm',    emoji:'🐥',  hint:'삐약삐약 귀여워요',              hotspot:{x:0.30,y:0.75,r:0.09}},
  {id:'farm_calf',      word:'송아지', syllables:['송','아','지'],   category:'동물', sceneId:'farm',    emoji:'🐄',  hint:'음매 하고 울어요',               hotspot:{x:0.50,y:0.60,r:0.12}},
  {id:'farm_foal',      word:'망아지', syllables:['망','아','지'],   category:'동물', sceneId:'farm',    emoji:'🐴',  hint:'히힝 뛰어다녀요',               hotspot:{x:0.25,y:0.55,r:0.12}},

  // meadow (3)
  {id:'meadow_butterfly',word:'나비',  syllables:['나','비'],         category:'동물', sceneId:'meadow',  emoji:'🦋',  hint:'꽃에서 꽃으로 날아요',           hotspot:{x:0.65,y:0.35,r:0.09}},
  {id:'meadow_dragonfly',word:'잠자리',syllables:['잠','자','리'],   category:'동물', sceneId:'meadow',  emoji:'🦗',  hint:'하늘을 날아다녀요',              hotspot:{x:0.40,y:0.25,r:0.08}},
  {id:'meadow_grasshopper',word:'메뚜기',syllables:['메','뚜','기'],  category:'동물', sceneId:'meadow',  emoji:'🦗',  hint:'풀밭에서 폴짝폴짝 뛰어요',       hotspot:{x:0.35,y:0.60,r:0.09}},

  // forest (4)
  {id:'forest_squirrel',word:'다람쥐', syllables:['다','람','쥐'],   category:'동물', sceneId:'forest',  emoji:'🐿️', hint:'도토리를 모아요',               hotspot:{x:0.55,y:0.68,r:0.09}},
  {id:'forest_rabbit',  word:'토끼',   syllables:['토','끼'],         category:'동물', sceneId:'forest',  emoji:'🐰',  hint:'귀가 길고 깡충깡충',             hotspot:{x:0.75,y:0.72,r:0.09}},
  {id:'forest_mole',    word:'두더지', syllables:['두','더','지'],   category:'동물', sceneId:'forest',  emoji:'🐾',  hint:'땅을 파고 다녀요',              hotspot:{x:0.65,y:0.82,r:0.09}},
  {id:'forest_hedgehog',word:'고슴도치',syllables:['고','슴','도','치'],category:'동물',sceneId:'forest', emoji:'🦔',  hint:'몸에 뾰족한 가시가 있어요',      hotspot:{x:0.45,y:0.75,r:0.10}},
  {id:'forest_fox',     word:'여우',   syllables:['여','우'],         category:'동물', sceneId:'forest',  emoji:'🦊',  hint:'꼬리가 크고 영리해요',          hotspot:{x:0.35,y:0.55,r:0.10}},

  // pond (5)
  {id:'pond_frog',      word:'개구리', syllables:['개','구','리'],   category:'동물', sceneId:'pond',    emoji:'🐸',  hint:'개굴개굴 울어요',               hotspot:{x:0.35,y:0.72,r:0.10}},
  {id:'pond_sparrow',   word:'참새',   syllables:['참','새'],         category:'동물', sceneId:'pond',    emoji:'🐦',  hint:'짹짹 울어요',                   hotspot:{x:0.70,y:0.25,r:0.09}},
  {id:'pond_turtle',    word:'거북이', syllables:['거','북','이'],   category:'동물', sceneId:'pond',    emoji:'🐢',  hint:'등껍데기를 지고 다녀요',         hotspot:{x:0.55,y:0.78,r:0.10}},
  {id:'pond_snail',     word:'달팽이', syllables:['달','팽','이'],   category:'동물', sceneId:'pond',    emoji:'🐌',  hint:'껍데기를 지고 느리게 기어요',    hotspot:{x:0.40,y:0.80,r:0.09}},
  {id:'pond_tadpole',   word:'올챙이', syllables:['올','챙','이'],   category:'동물', sceneId:'pond',    emoji:'🐸',  hint:'개구리가 되기 전 모습',          hotspot:{x:0.60,y:0.70,r:0.09}},

  // morning (1)
  {id:'morning_cat',    word:'고양이', syllables:['고','양','이'],   category:'동물', sceneId:'morning', emoji:'🐱',  hint:'야옹 울어요',                    hotspot:{x:0.70,y:0.65,r:0.10}},

  // river (2)
  {id:'river_otter',    word:'수달',   syllables:['수','달'],         category:'동물', sceneId:'river',   emoji:'🦦',  hint:'물에서 헤엄을 잘 쳐요',          hotspot:{x:0.60,y:0.55,r:0.10}},
  {id:'river_crayfish', word:'가재',   syllables:['가','재'],         category:'동물', sceneId:'river',   emoji:'🦞',  hint:'개울에 사는 작은 새우',          hotspot:{x:0.25,y:0.75,r:0.09}},

  // garden (1)
  {id:'garden_earthworm',word:'지렁이',syllables:['지','렁','이'],   category:'동물', sceneId:'garden',  emoji:'🪱',  hint:'땅 속에 살아요',                hotspot:{x:0.55,y:0.85,r:0.08}},

  // night (1)
  {id:'night_firefly',  word:'반딧불', syllables:['반','딧','불'],   category:'동물', sceneId:'night',   emoji:'✨',  hint:'밤에 빛을 내는 곤충',            hotspot:{x:0.35,y:0.50,r:0.09}},

  // ══════════════════════════════════════════════
  // 일상 (26 words)
  // ══════════════════════════════════════════════

  // rain (1)
  {id:'rain_umbrella',  word:'우산',   syllables:['우','산'],         category:'일상', sceneId:'rain',    emoji:'☂️',  hint:'비 올 때 쓰는 것',              hotspot:{x:0.30,y:0.68,r:0.10}},

  // morning (5)
  {id:'morning_bag',    word:'가방',   syllables:['가','방'],         category:'일상', sceneId:'morning', emoji:'🎒',  hint:'학교 갈 때 메요',               hotspot:{x:0.35,y:0.55,r:0.10}},
  {id:'morning_blanket',word:'이불',   syllables:['이','불'],         category:'일상', sceneId:'morning', emoji:'🛏️', hint:'잘 때 덮어요',                  hotspot:{x:0.55,y:0.45,r:0.12}},
  {id:'morning_pillow', word:'베개',   syllables:['베','개'],         category:'일상', sceneId:'morning', emoji:'😴',  hint:'머리를 베고 자요',              hotspot:{x:0.40,y:0.30,r:0.09}},
  {id:'morning_soap',   word:'비누',   syllables:['비','누'],         category:'일상', sceneId:'morning', emoji:'🧼',  hint:'손 씻을 때 써요',               hotspot:{x:0.25,y:0.70,r:0.09}},
  {id:'morning_iron',   word:'다리미', syllables:['다','리','미'],   category:'일상', sceneId:'morning', emoji:'👔',  hint:'옷의 주름을 펴요',              hotspot:{x:0.60,y:0.65,r:0.09}},

  // playground (6)
  {id:'playground_shoes',word:'신발',  syllables:['신','발'],         category:'일상', sceneId:'playground',emoji:'👟',hint:'발에 신어요',                  hotspot:{x:0.65,y:0.80,r:0.09}},
  {id:'playground_swing',word:'그네',  syllables:['그','네'],         category:'일상', sceneId:'playground',emoji:'🌟',hint:'앞뒤로 흔들어요',              hotspot:{x:0.25,y:0.50,r:0.10}},
  {id:'playground_seesaw',word:'시소', syllables:['시','소'],         category:'일상', sceneId:'playground',emoji:'⚖️',hint:'올라갔다 내려가요',            hotspot:{x:0.55,y:0.65,r:0.11}},
  {id:'playground_sand', word:'모래',  syllables:['모','래'],         category:'일상', sceneId:'playground',emoji:'🏖️',hint:'손으로 쥐면 술술 빠져요',      hotspot:{x:0.75,y:0.82,r:0.10}},
  {id:'playground_balloon',word:'풍선',syllables:['풍','선'],         category:'일상', sceneId:'playground',emoji:'🎈',hint:'바람을 넣으면 커져요',         hotspot:{x:0.40,y:0.30,r:0.10}},
  {id:'playground_jumprope',word:'줄넘기',syllables:['줄','넘','기'], category:'일상', sceneId:'playground',emoji:'🪢',hint:'줄을 넘어요',                 hotspot:{x:0.50,y:0.55,r:0.10}},

  // classroom (4)
  {id:'classroom_eraser',word:'지우개',syllables:['지','우','개'],   category:'일상', sceneId:'classroom',emoji:'📝',  hint:'틀린 글자를 지워요',            hotspot:{x:0.60,y:0.55,r:0.08}},
  {id:'classroom_pencil_case',word:'필통',syllables:['필','통'],     category:'일상', sceneId:'classroom',emoji:'✏️',  hint:'연필을 넣어요',                hotspot:{x:0.35,y:0.45,r:0.09}},
  {id:'classroom_scissors',word:'가위', syllables:['가','위'],        category:'일상', sceneId:'classroom',emoji:'✂️',  hint:'종이를 잘라요',                hotspot:{x:0.70,y:0.45,r:0.09}},
  {id:'classroom_paint', word:'물감',  syllables:['물','감'],         category:'일상', sceneId:'classroom',emoji:'🎨',  hint:'그림을 그릴 때 써요',          hotspot:{x:0.30,y:0.40,r:0.09}},

  // kitchen (5)
  {id:'kitchen_spoon',  word:'숟가락', syllables:['숟','가','락'],   category:'일상', sceneId:'kitchen', emoji:'🥄',  hint:'국을 떠먹어요',                 hotspot:{x:0.35,y:0.60,r:0.09}},
  {id:'kitchen_pot',    word:'냄비',   syllables:['냄','비'],         category:'일상', sceneId:'kitchen', emoji:'🍲',  hint:'음식을 끓여요',                 hotspot:{x:0.55,y:0.50,r:0.12}},
  {id:'kitchen_basket', word:'바구니', syllables:['바','구','니'],   category:'일상', sceneId:'kitchen', emoji:'🧺',  hint:'물건을 담아요',                 hotspot:{x:0.70,y:0.70,r:0.10}},
  {id:'kitchen_bowl',   word:'그릇',   syllables:['그','릇'],         category:'일상', sceneId:'kitchen', emoji:'🍽️', hint:'음식을 담는 것',                hotspot:{x:0.50,y:0.65,r:0.09}},
  {id:'kitchen_lid',    word:'뚜껑',   syllables:['뚜','껑'],         category:'일상', sceneId:'kitchen', emoji:'🍳',  hint:'냄비나 그릇을 덮어요',          hotspot:{x:0.25,y:0.45,r:0.09}},

  // market (3)
  {id:'market_basket',  word:'소쿠리', syllables:['소','쿠','리'],   category:'일상', sceneId:'market',  emoji:'🧺',  hint:'둥글고 넓은 바구니',            hotspot:{x:0.45,y:0.65,r:0.10}},
  {id:'market_cotton_candy',word:'솜사탕',syllables:['솜','사','탕'],category:'일상', sceneId:'market',  emoji:'🍭',  hint:'구름처럼 달콤해요',             hotspot:{x:0.65,y:0.35,r:0.10}},
  {id:'market_parsley', word:'미나리', syllables:['미','나','리'],   category:'일상', sceneId:'market',  emoji:'🌿',  hint:'시장에서 파는 초록 나물',        hotspot:{x:0.30,y:0.70,r:0.09}},

  // festival (2)
  {id:'festival_ricecake',word:'송편', syllables:['송','편'],         category:'일상', sceneId:'festival',emoji:'🌕',  hint:'추석에 먹는 떡',                hotspot:{x:0.40,y:0.60,r:0.10}},
  {id:'festival_lantern',word:'등불',  syllables:['등','불'],         category:'일상', sceneId:'festival',emoji:'🏮',  hint:'밤에 밝히는 불빛',              hotspot:{x:0.65,y:0.40,r:0.09}},

  // festival_moon is natural category
  {id:'festival_moon',  word:'보름달', syllables:['보','름','달'],   category:'자연', sceneId:'festival',emoji:'🌕',  hint:'추석에 뜨는 둥근 달',           hotspot:{x:0.65,y:0.25,r:0.12}},

  // ══════════════════════════════════════════════
  // 행동 (18 words)
  // ══════════════════════════════════════════════

  // actions scene (12)
  {id:'action_run',     word:'달리다', syllables:['달','리','다'],   category:'행동', sceneId:'actions', emoji:'🏃',  hint:'빠르게 두 발로 움직여요',        hotspot:{x:0.25,y:0.50,r:0.10}},
  {id:'action_eat',     word:'먹다',   syllables:['먹','다'],         category:'행동', sceneId:'actions', emoji:'🍽️', hint:'입으로 음식을 넣어요',           hotspot:{x:0.45,y:0.45,r:0.10}},
  {id:'action_sleep',   word:'자다',   syllables:['자','다'],         category:'행동', sceneId:'actions', emoji:'😴',  hint:'눈을 감고 쉬어요',              hotspot:{x:0.65,y:0.55,r:0.10}},
  {id:'action_jump',    word:'뛰다',   syllables:['뛰','다'],         category:'행동', sceneId:'actions', emoji:'🤸',  hint:'높이 발을 올려요',              hotspot:{x:0.30,y:0.35,r:0.09}},
  {id:'action_laugh',   word:'웃다',   syllables:['웃','다'],         category:'행동', sceneId:'actions', emoji:'😄',  hint:'기분 좋을 때 해요',             hotspot:{x:0.55,y:0.30,r:0.09}},
  {id:'action_cry',     word:'울다',   syllables:['울','다'],         category:'행동', sceneId:'actions', emoji:'😢',  hint:'슬플 때 눈물이 나요',           hotspot:{x:0.75,y:0.40,r:0.09}},
  {id:'action_draw',    word:'그리다', syllables:['그','리','다'],   category:'행동', sceneId:'actions', emoji:'✏️',  hint:'종이에 모양을 만들어요',         hotspot:{x:0.40,y:0.65,r:0.09}},
  {id:'action_play',    word:'놀다',   syllables:['놀','다'],         category:'행동', sceneId:'actions', emoji:'🎮',  hint:'즐겁게 시간을 보내요',          hotspot:{x:0.65,y:0.70,r:0.10}},
  {id:'action_dance',   word:'춤추다', syllables:['춤','추','다'],   category:'행동', sceneId:'actions', emoji:'💃',  hint:'음악에 맞춰 몸을 흔들어요',      hotspot:{x:0.70,y:0.45,r:0.10}},
  {id:'action_walk',    word:'걷다',   syllables:['걷','다'],         category:'행동', sceneId:'actions', emoji:'🚶',  hint:'두 발로 천천히 움직여요',        hotspot:{x:0.45,y:0.60,r:0.09}},
  {id:'action_share',   word:'나누다', syllables:['나','누','다'],   category:'행동', sceneId:'actions', emoji:'🤝',  hint:'함께 나눠요',                   hotspot:{x:0.55,y:0.35,r:0.09}},
  {id:'action_sing',    word:'노래하다',syllables:['노','래','하','다'],category:'행동',sceneId:'actions', emoji:'🎵',  hint:'음악을 입으로 불러요',          hotspot:{x:0.25,y:0.35,r:0.09}},

  // classroom scene (3)
  {id:'action_read',    word:'읽다',   syllables:['읽','다'],         category:'행동', sceneId:'classroom',emoji:'📖', hint:'책을 눈으로 봐요',              hotspot:{x:0.50,y:0.40,r:0.10}},
  {id:'action_write',   word:'쓰다',   syllables:['쓰','다'],         category:'행동', sceneId:'classroom',emoji:'✏️', hint:'글자를 손으로 적어요',          hotspot:{x:0.30,y:0.55,r:0.09}},
  {id:'action_make',    word:'만들다', syllables:['만','들','다'],   category:'행동', sceneId:'classroom',emoji:'🏗️', hint:'무언가를 새로 꾸며요',          hotspot:{x:0.65,y:0.60,r:0.09}},

  // playground scene (2)
  {id:'action_throw',   word:'던지다', syllables:['던','지','다'],   category:'행동', sceneId:'playground',emoji:'⚾', hint:'손으로 날려 보내요',           hotspot:{x:0.35,y:0.40,r:0.09}},
  {id:'action_catch',   word:'잡다',   syllables:['잡','다'],         category:'행동', sceneId:'playground',emoji:'🤲', hint:'손으로 붙들어요',              hotspot:{x:0.65,y:0.45,r:0.09}},

  // morning scene (1)
  {id:'action_wash',    word:'씻다',   syllables:['씻','다'],         category:'행동', sceneId:'morning', emoji:'🚿',  hint:'물로 깨끗하게 해요',            hotspot:{x:0.45,y:0.55,r:0.10}},

  // ══════════════════════════════════════════════
  // 감정 (13 words)
  // ══════════════════════════════════════════════

  {id:'emotion_joy',    word:'기쁨',   syllables:['기','쁨'],         category:'감정', sceneId:'emotions',emoji:'😊',  hint:'행복하고 신날 때',              hotspot:{x:0.20,y:0.40,r:0.10}},
  {id:'emotion_sadness',word:'슬픔',   syllables:['슬','픔'],         category:'감정', sceneId:'emotions',emoji:'😢',  hint:'눈물이 날 때의 느낌',           hotspot:{x:0.40,y:0.45,r:0.10}},
  {id:'emotion_fear',   word:'무서움', syllables:['무','서','움'],   category:'감정', sceneId:'emotions',emoji:'😨',  hint:'무서울 때의 느낌',              hotspot:{x:0.60,y:0.40,r:0.10}},
  {id:'emotion_flutter',word:'설렘',   syllables:['설','렘'],         category:'감정', sceneId:'emotions',emoji:'🤩',  hint:'두근두근 기대될 때',            hotspot:{x:0.75,y:0.55,r:0.09}},
  {id:'emotion_longing',word:'그리움', syllables:['그','리','움'],   category:'감정', sceneId:'emotions',emoji:'🥺',  hint:'보고 싶을 때의 느낌',           hotspot:{x:0.35,y:0.65,r:0.09}},
  {id:'emotion_surprise',word:'놀라움',syllables:['놀','라','움'],   category:'감정', sceneId:'emotions',emoji:'😲',  hint:'깜짝 놀랐을 때',               hotspot:{x:0.55,y:0.65,r:0.09}},
  {id:'emotion_embarrassment',word:'부끄러움',syllables:['부','끄','러','움'],category:'감정',sceneId:'emotions',emoji:'😳',hint:'얼굴이 빨개질 때',        hotspot:{x:0.25,y:0.55,r:0.10}},
  {id:'emotion_loneliness',word:'외로움',syllables:['외','로','움'], category:'감정', sceneId:'emotions',emoji:'🥹',  hint:'혼자일 때의 느낌',              hotspot:{x:0.45,y:0.70,r:0.09}},
  {id:'emotion_envy',   word:'부러움', syllables:['부','러','움'],   category:'감정', sceneId:'emotions',emoji:'🤔',  hint:'다른 사람이 가진 걸 원해요',     hotspot:{x:0.60,y:0.55,r:0.09}},
  {id:'emotion_pride',  word:'뿌듯함', syllables:['뿌','듯','함'],   category:'감정', sceneId:'emotions',emoji:'😤',  hint:'잘했을 때 생기는 좋은 느낌',    hotspot:{x:0.75,y:0.65,r:0.09}},
  {id:'emotion_curious',word:'궁금함', syllables:['궁','금','함'],   category:'감정', sceneId:'emotions',emoji:'🧐',  hint:'알고 싶은 마음이에요',          hotspot:{x:0.35,y:0.40,r:0.09}},
  {id:'emotion_dislike',word:'미움',   syllables:['미','움'],         category:'감정', sceneId:'emotions',emoji:'😠',  hint:'싫은 마음이에요',               hotspot:{x:0.55,y:0.45,r:0.09}},
  {id:'emotion_love',   word:'사랑',   syllables:['사','랑'],         category:'감정', sceneId:'emotions',emoji:'❤️',  hint:'소중한 마음이에요',             hotspot:{x:0.65,y:0.30,r:0.10}},
];

export const WORDS_BY_ID = Object.fromEntries(WORDS.map(w => [w.id, w]));
export const WORDS_BY_SCENE = WORDS.reduce((acc, w) => {
  if (!acc[w.sceneId]) acc[w.sceneId] = [];
  acc[w.sceneId].push(w);
  return acc;
}, {});
