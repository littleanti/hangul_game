// 한자별 파생 어휘 데이터
// 각 항목: hanjaId, text(어휘), syllables(분해 음절), meaning(아이 친화 의미), example(예문), grade(학년 태그)
// 의미는 항상 이미 아는 어휘로 재구성. syllables는 한자 음 위치를 포함한 전체 음절 배열.
// (3·4학년 중간 난이도 세트: 8급 유지분 + 7급II + 6급 + 5급. 삭제된 한자의 어휘는 제외됨.)

export const WORDS = [
  // 日 (날 일) — id 11 · 8급
  { id: 1101, hanjaId: 11, text: '일기', syllables: ['일','기'], meaning: '하루를 적은 글.', example: '오늘 일기를 썼어요.', grade: '3' },
  { id: 1102, hanjaId: 11, text: '생일', syllables: ['생','일'], meaning: '태어난 날.', example: '내 생일은 사월이에요.', grade: '3' },
  { id: 1103, hanjaId: 11, text: '일출', syllables: ['일','출'], meaning: '해가 뜨는 것.', example: '바다에서 일출을 봤어요.', grade: '4' },
  { id: 1104, hanjaId: 11, text: '평일', syllables: ['평','일'], meaning: '주말이 아닌 보통 날.', example: '평일에는 학교에 가요.', grade: '4' },

  // 月 (달 월) — id 12 · 8급
  { id: 1201, hanjaId: 12, text: '월요일', syllables: ['월','요','일'], meaning: '한 주의 첫 평일.', example: '월요일 아침은 분주해요.', grade: '3' },
  { id: 1202, hanjaId: 12, text: '월말', syllables: ['월','말'], meaning: '한 달의 끝.', example: '월말 시험을 봐요.', grade: '4' },
  { id: 1203, hanjaId: 12, text: '월급', syllables: ['월','급'], meaning: '한 달마다 받는 돈.', example: '아빠가 월급을 받으셨어요.', grade: '4' },
  { id: 1204, hanjaId: 12, text: '매월', syllables: ['매','월'], meaning: '달마다.', example: '매월 책 한 권을 읽어요.', grade: '4' },

  // 火 (불 화) — id 13 · 8급
  { id: 1301, hanjaId: 13, text: '화재', syllables: ['화','재'], meaning: '불로 생긴 사고.', example: '화재 대피 훈련을 해요.', grade: '4' },
  { id: 1302, hanjaId: 13, text: '화산', syllables: ['화','산'], meaning: '불을 내뿜는 산.', example: '화산이 폭발했어요.', grade: '3' },
  { id: 1303, hanjaId: 13, text: '화요일', syllables: ['화','요','일'], meaning: '한 주의 두 번째 날.', example: '화요일에 체육이 있어요.', grade: '3' },
  { id: 1304, hanjaId: 13, text: '소화기', syllables: ['소','화','기'], meaning: '불을 끄는 도구.', example: '교실에 소화기가 있어요.', grade: '4' },

  // 水 (물 수) — id 14 · 8급
  { id: 1401, hanjaId: 14, text: '수영', syllables: ['수','영'], meaning: '물에서 헤엄치기.', example: '여름에 수영을 배워요.', grade: '3' },
  { id: 1402, hanjaId: 14, text: '생수', syllables: ['생','수'], meaning: '맑은 마실 물.', example: '생수 한 병을 사 마셨어요.', grade: '3' },
  { id: 1403, hanjaId: 14, text: '약수', syllables: ['약','수'], meaning: '약처럼 몸에 좋은 물.', example: '산에서 약수를 마셨어요.', grade: '4' },
  { id: 1404, hanjaId: 14, text: '수돗물', syllables: ['수','돗','물'], meaning: '수도에서 나오는 물.', example: '수돗물로 손을 씻어요.', grade: '3' },

  // 木 (나무 목) — id 15 · 8급
  { id: 1501, hanjaId: 15, text: '목수', syllables: ['목','수'], meaning: '나무로 집·가구를 만드는 사람.', example: '목수가 책상을 만들어요.', grade: '4' },
  { id: 1502, hanjaId: 15, text: '목요일', syllables: ['목','요','일'], meaning: '한 주의 네 번째 날.', example: '목요일은 도서관 가는 날.', grade: '3' },
  { id: 1503, hanjaId: 15, text: '식목일', syllables: ['식','목','일'], meaning: '나무를 심는 날.', example: '식목일에 나무를 심었어요.', grade: '3' },
  { id: 1504, hanjaId: 15, text: '목재', syllables: ['목','재'], meaning: '나무로 만든 재료.', example: '목재로 만든 의자.', grade: '4' },

  // 金 (쇠 금) — id 16 · 8급
  { id: 1601, hanjaId: 16, text: '금요일', syllables: ['금','요','일'], meaning: '한 주의 다섯 번째 날.', example: '금요일은 신나는 날.', grade: '3' },
  { id: 1602, hanjaId: 16, text: '금메달', syllables: ['금','메','달'], meaning: '1등에게 주는 금빛 상.', example: '올림픽 금메달을 땄어요.', grade: '3' },
  { id: 1603, hanjaId: 16, text: '저금', syllables: ['저','금'], meaning: '돈을 모아 둠.', example: '용돈을 저금했어요.', grade: '4' },
  { id: 1604, hanjaId: 16, text: '황금', syllables: ['황','금'], meaning: '누런 빛의 비싼 쇠.', example: '황금 보석이 반짝여요.', grade: '4' },

  // 土 (흙 토) — id 17 · 8급
  { id: 1701, hanjaId: 17, text: '토요일', syllables: ['토','요','일'], meaning: '한 주의 여섯 번째 날.', example: '토요일에 가족 나들이.', grade: '3' },
  { id: 1702, hanjaId: 17, text: '국토', syllables: ['국','토'], meaning: '나라의 땅.', example: '우리나라 국토는 넓어요.', grade: '4' },
  { id: 1703, hanjaId: 17, text: '영토', syllables: ['영','토'], meaning: '한 나라가 다스리는 땅.', example: '독도는 우리 영토예요.', grade: '4' },
  { id: 1704, hanjaId: 17, text: '황토', syllables: ['황','토'], meaning: '누런 빛깔의 흙.', example: '황토집은 시원해요.', grade: '4' },

  // 山 (메 산) — id 18 · 8급
  { id: 1801, hanjaId: 18, text: '등산', syllables: ['등','산'], meaning: '산에 오르기.', example: '주말마다 등산을 해요.', grade: '3' },
  { id: 1802, hanjaId: 18, text: '산림', syllables: ['산','림'], meaning: '산과 숲.', example: '산림 보호가 중요해요.', grade: '4' },
  { id: 1803, hanjaId: 18, text: '산악', syllables: ['산','악'], meaning: '높은 산들.', example: '산악 자전거를 타요.', grade: '4' },
  { id: 1804, hanjaId: 18, text: '강산', syllables: ['강','산'], meaning: '강과 산. 자연.', example: '아름다운 우리 강산.', grade: '4' },

  // 中 (가운데 중) — id 19 · 8급
  { id: 1901, hanjaId: 19, text: '중심', syllables: ['중','심'], meaning: '한가운데. 가장 중요한 곳.', example: '도시 중심에 광장이 있어요.', grade: '3' },
  { id: 1902, hanjaId: 19, text: '집중', syllables: ['집','중'], meaning: '한 곳에 마음을 모음.', example: '공부에 집중해요.', grade: '4' },
  { id: 1903, hanjaId: 19, text: '중간', syllables: ['중','간'], meaning: '가운데.', example: '중간 자리에 앉았어요.', grade: '3' },
  { id: 1904, hanjaId: 19, text: '적중', syllables: ['적','중'], meaning: '정확히 맞힘.', example: '예상이 적중했어요.', grade: '4' },

  // 大 (큰 대) — id 20 · 8급
  { id: 2001, hanjaId: 20, text: '대문', syllables: ['대','문'], meaning: '집의 큰 문.', example: '대문이 활짝 열렸어요.', grade: '3' },
  { id: 2002, hanjaId: 20, text: '대왕', syllables: ['대','왕'], meaning: '훌륭한 임금.', example: '세종 대왕이 한글을 만드셨어요.', grade: '3' },
  { id: 2003, hanjaId: 20, text: '대학', syllables: ['대','학'], meaning: '고등 학교의 다음 학교.', example: '언니가 대학에 가요.', grade: '3' },
  { id: 2004, hanjaId: 20, text: '확대', syllables: ['확','대'], meaning: '크게 늘림.', example: '글자를 확대해서 봤어요.', grade: '4' },

  // 小 (작을 소) — id 21 · 8급
  { id: 2101, hanjaId: 21, text: '소년', syllables: ['소','년'], meaning: '작은 사내아이.', example: '동네 소년이 인사했어요.', grade: '3' },
  { id: 2102, hanjaId: 21, text: '소녀', syllables: ['소','녀'], meaning: '작은 여자아이.', example: '책 속 소녀가 용감해요.', grade: '3' },
  { id: 2103, hanjaId: 21, text: '축소', syllables: ['축','소'], meaning: '작게 줄임.', example: '지도를 축소해서 인쇄했어요.', grade: '4' },
  { id: 2104, hanjaId: 21, text: '소국', syllables: ['소','국'], meaning: '작은 나라.', example: '바다 위의 소국.', grade: '4' },

  // 父 (아비 부) — id 28 · 8급
  { id: 2801, hanjaId: 28, text: '부모', syllables: ['부','모'], meaning: '아버지와 어머니.', example: '부모님 말씀을 잘 들어요.', grade: '3' },
  { id: 2802, hanjaId: 28, text: '조부', syllables: ['조','부'], meaning: '할아버지.', example: '조부님 댁에 갔어요.', grade: '4' },
  { id: 2803, hanjaId: 28, text: '학부모', syllables: ['학','부','모'], meaning: '학생의 부모.', example: '학부모 회의가 있어요.', grade: '4' },
  { id: 2804, hanjaId: 28, text: '부친', syllables: ['부','친'], meaning: '아버지를 높여 부르는 말.', example: '부친께서 오셨어요.', grade: '4' },

  // 母 (어미 모) — id 29 · 8급
  { id: 2901, hanjaId: 29, text: '모친', syllables: ['모','친'], meaning: '어머니를 높여 부르는 말.', example: '모친께 인사 드렸어요.', grade: '4' },
  { id: 2902, hanjaId: 29, text: '모국', syllables: ['모','국'], meaning: '내가 태어난 나라.', example: '모국으로 돌아왔어요.', grade: '4' },
  { id: 2903, hanjaId: 29, text: '이모', syllables: ['이','모'], meaning: '엄마의 자매.', example: '이모가 케이크를 사오셨어요.', grade: '3' },
  { id: 2904, hanjaId: 29, text: '모교', syllables: ['모','교'], meaning: '내가 졸업한 학교.', example: '아빠 모교를 방문했어요.', grade: '4' },

  // 學 (배울 학) — id 36 · 8급
  { id: 3601, hanjaId: 36, text: '학생', syllables: ['학','생'], meaning: '배우는 사람.', example: '저는 초등학생이에요.', grade: '3' },
  { id: 3602, hanjaId: 36, text: '학교', syllables: ['학','교'], meaning: '배우는 곳.', example: '학교가 즐거워요.', grade: '3' },
  { id: 3603, hanjaId: 36, text: '학년', syllables: ['학','년'], meaning: '학교의 1년 단위.', example: '저는 삼학년이에요.', grade: '3' },
  { id: 3604, hanjaId: 36, text: '과학', syllables: ['과','학'], meaning: '자연을 배우는 학문.', example: '과학 실험이 재밌어요.', grade: '3' },

  // 校 (학교 교) — id 37 · 8급
  { id: 3701, hanjaId: 37, text: '학교', syllables: ['학','교'], meaning: '배우는 곳.', example: '학교에 일찍 갔어요.', grade: '3' },
  { id: 3702, hanjaId: 37, text: '교문', syllables: ['교','문'], meaning: '학교의 문.', example: '교문 앞에서 만나요.', grade: '3' },
  { id: 3703, hanjaId: 37, text: '교장', syllables: ['교','장'], meaning: '학교에서 가장 어른인 분.', example: '교장 선생님 말씀.', grade: '3' },
  { id: 3704, hanjaId: 37, text: '하교', syllables: ['하','교'], meaning: '학교를 마치고 나옴.', example: '하교 시간이 됐어요.', grade: '3' },

  // 敎 (가르칠 교) — id 38 · 8급
  { id: 3801, hanjaId: 38, text: '교실', syllables: ['교','실'], meaning: '배우는 방.', example: '교실이 조용해졌어요.', grade: '3' },
  { id: 3802, hanjaId: 38, text: '교사', syllables: ['교','사'], meaning: '가르치는 사람.', example: '교사가 되고 싶어요.', grade: '3' },
  { id: 3803, hanjaId: 38, text: '교과서', syllables: ['교','과','서'], meaning: '학교 책.', example: '교과서를 펴세요.', grade: '3' },
  { id: 3804, hanjaId: 38, text: '교육', syllables: ['교','육'], meaning: '가르치고 기르는 일.', example: '교육은 중요해요.', grade: '4' },

  // 室 (집 실) — id 39 · 8급
  { id: 3901, hanjaId: 39, text: '교실', syllables: ['교','실'], meaning: '배우는 방.', example: '교실에 책상이 많아요.', grade: '3' },
  { id: 3902, hanjaId: 39, text: '거실', syllables: ['거','실'], meaning: '가족이 함께 쓰는 방.', example: '거실에서 TV를 봐요.', grade: '3' },
  { id: 3903, hanjaId: 39, text: '실내', syllables: ['실','내'], meaning: '방 안.', example: '실내에서는 정숙해요.', grade: '4' },
  { id: 3904, hanjaId: 39, text: '욕실', syllables: ['욕','실'], meaning: '목욕하는 방.', example: '욕실 청소를 도왔어요.', grade: '4' },

  // 生 (날 생) — id 40 · 8급
  { id: 4001, hanjaId: 40, text: '학생', syllables: ['학','생'], meaning: '배우는 사람.', example: '제 동생도 학생이에요.', grade: '3' },
  { id: 4002, hanjaId: 40, text: '생일', syllables: ['생','일'], meaning: '태어난 날.', example: '생일 축하해요.', grade: '3' },
  { id: 4003, hanjaId: 40, text: '생활', syllables: ['생','활'], meaning: '하루하루 살아감.', example: '학교 생활이 즐거워요.', grade: '3' },
  { id: 4004, hanjaId: 40, text: '인생', syllables: ['인','생'], meaning: '사람의 살아가는 시간.', example: '인생은 길어요.', grade: '4' },

  // 年 (해 년) — id 41 · 8급
  { id: 4101, hanjaId: 41, text: '학년', syllables: ['학','년'], meaning: '학교의 1년 단위.', example: '저는 삼학년이에요.', grade: '3' },
  { id: 4102, hanjaId: 41, text: '내년', syllables: ['내','년'], meaning: '다음 해.', example: '내년에는 사학년이에요.', grade: '3' },
  { id: 4103, hanjaId: 41, text: '소년', syllables: ['소','년'], meaning: '어린 남자.', example: '꿈 많은 소년이에요.', grade: '3' },
  { id: 4104, hanjaId: 41, text: '연도', syllables: ['연','도'], meaning: '해를 세는 단위.', example: '졸업 연도를 기록해요.', grade: '4' },

  // 先 (먼저 선) — id 42 · 8급
  { id: 4201, hanjaId: 42, text: '선생', syllables: ['선','생'], meaning: '가르치는 분.', example: '선생님은 친절하세요.', grade: '3' },
  { id: 4202, hanjaId: 42, text: '선두', syllables: ['선','두'], meaning: '맨 앞.', example: '달리기에서 선두로 달려요.', grade: '4' },
  { id: 4203, hanjaId: 42, text: '선배', syllables: ['선','배'], meaning: '먼저 배운 사람.', example: '선배가 도와줬어요.', grade: '3' },
  { id: 4204, hanjaId: 42, text: '우선', syllables: ['우','선'], meaning: '먼저. 첫 번째로.', example: '우선 손부터 씻어요.', grade: '4' },

  // 韓 (한국 한) — id 43 · 8급
  { id: 4301, hanjaId: 43, text: '한국', syllables: ['한','국'], meaning: '우리나라 이름.', example: '한국에서 태어났어요.', grade: '3' },
  { id: 4302, hanjaId: 43, text: '한글', syllables: ['한','글'], meaning: '한국의 글자.', example: '한글은 자랑스러워요.', grade: '3' },
  { id: 4303, hanjaId: 43, text: '한식', syllables: ['한','식'], meaning: '한국 음식.', example: '한식이 가장 맛있어요.', grade: '3' },
  { id: 4304, hanjaId: 43, text: '한복', syllables: ['한','복'], meaning: '한국 전통 옷.', example: '설날에 한복을 입어요.', grade: '3' },

  // 國 (나라 국) — id 44 · 8급
  { id: 4401, hanjaId: 44, text: '국가', syllables: ['국','가'], meaning: '나라.', example: '대한민국은 우리 국가예요.', grade: '3' },
  { id: 4402, hanjaId: 44, text: '국기', syllables: ['국','기'], meaning: '나라를 나타내는 깃발.', example: '국기를 게양해요.', grade: '3' },
  { id: 4403, hanjaId: 44, text: '외국', syllables: ['외','국'], meaning: '다른 나라.', example: '외국 여행을 가요.', grade: '3' },
  { id: 4404, hanjaId: 44, text: '국민', syllables: ['국','민'], meaning: '나라의 사람.', example: '국민이 한마음이에요.', grade: '4' },

  // 民 (백성 민) — id 45 · 8급
  { id: 4501, hanjaId: 45, text: '국민', syllables: ['국','민'], meaning: '나라의 사람.', example: '국민이 행복해요.', grade: '4' },
  { id: 4502, hanjaId: 45, text: '민족', syllables: ['민','족'], meaning: '같은 핏줄의 사람들.', example: '한 민족의 자랑.', grade: '4' },
  { id: 4503, hanjaId: 45, text: '민속', syllables: ['민','속'], meaning: '백성의 옛 풍습.', example: '민속 박물관을 갔어요.', grade: '4' },
  { id: 4504, hanjaId: 45, text: '시민', syllables: ['시','민'], meaning: '도시에 사는 사람.', example: '시민의 권리를 존중해요.', grade: '4' },

  // 軍 (군사 군) — id 46 · 8급
  { id: 4601, hanjaId: 46, text: '군인', syllables: ['군','인'], meaning: '군에 속한 사람.', example: '군인 아저씨께 감사해요.', grade: '3' },
  { id: 4602, hanjaId: 46, text: '군대', syllables: ['군','대'], meaning: '병사들의 무리.', example: '군대에서 훈련해요.', grade: '4' },
  { id: 4603, hanjaId: 46, text: '장군', syllables: ['장','군'], meaning: '군사의 큰 우두머리.', example: '훌륭한 장군 이야기.', grade: '4' },
  { id: 4604, hanjaId: 46, text: '국군', syllables: ['국','군'], meaning: '나라의 군대.', example: '국군 장병의 날.', grade: '4' },

  // 王 (임금 왕) — id 47 · 8급
  { id: 4701, hanjaId: 47, text: '왕자', syllables: ['왕','자'], meaning: '임금의 아들.', example: '왕자가 백성을 도왔어요.', grade: '3' },
  { id: 4702, hanjaId: 47, text: '왕비', syllables: ['왕','비'], meaning: '임금의 부인.', example: '왕비가 미소를 지었어요.', grade: '3' },
  { id: 4703, hanjaId: 47, text: '왕국', syllables: ['왕','국'], meaning: '임금이 다스리는 나라.', example: '동화 속 왕국.', grade: '3' },
  { id: 4704, hanjaId: 47, text: '대왕', syllables: ['대','왕'], meaning: '훌륭한 임금.', example: '세종 대왕을 존경해요.', grade: '3' },

  // 車 (수레 차) — id 51 · 7급
  { id: 5101, hanjaId: 51, text: '자동차', syllables: ['자','동','차'], meaning: '엔진으로 스스로 움직이는 탈 것.', example: '아빠가 자동차를 운전해요.', grade: '4' },
  { id: 5102, hanjaId: 51, text: '기차', syllables: ['기','차'], meaning: '철길 위를 달리는 긴 탈 것.', example: '기차를 타고 부산에 갔어요.', grade: '4' },
  { id: 5103, hanjaId: 51, text: '마차', syllables: ['마','차'], meaning: '말이 끄는 수레.', example: '동화 속 공주가 마차를 탔어요.', grade: '4' },
  { id: 5104, hanjaId: 51, text: '차도', syllables: ['차','도'], meaning: '자동차가 다니는 길.', example: '차도에 함부로 나가면 위험해요.', grade: '4' },
  { id: 5105, hanjaId: 51, text: '주차장', syllables: ['주','차','장'], meaning: '자동차를 세워 두는 곳.', example: '마트 지하에 주차장이 있어요.', grade: '4' },

  // 場 (마당 장) — id 52 · 7급
  { id: 5201, hanjaId: 52, text: '운동장', syllables: ['운','동','장'], meaning: '운동을 할 수 있는 넓은 마당.', example: '운동장에서 달리기를 해요.', grade: '4' },
  { id: 5202, hanjaId: 52, text: '시장', syllables: ['시','장'], meaning: '물건을 사고파는 곳.', example: '엄마와 시장에서 채소를 샀어요.', grade: '4' },
  { id: 5203, hanjaId: 52, text: '광장', syllables: ['광','장'], meaning: '넓고 탁 트인 마당.', example: '광장에서 축제가 열렸어요.', grade: '4' },
  { id: 5204, hanjaId: 52, text: '공장', syllables: ['공','장'], meaning: '물건을 만드는 곳.', example: '공장에서 과자를 만들어요.', grade: '4' },
  { id: 5205, hanjaId: 52, text: '주차장', syllables: ['주','차','장'], meaning: '자동차를 세워 두는 곳.', example: '주차장이 꽉 찼어요.', grade: '4' },

  // 道 (길 도) — id 53 · 7급
  { id: 5301, hanjaId: 53, text: '차도', syllables: ['차','도'], meaning: '자동차가 다니는 길.', example: '차도 옆 인도로 걸어요.', grade: '4' },
  { id: 5302, hanjaId: 53, text: '인도', syllables: ['인','도'], meaning: '사람이 걸어다니는 길.', example: '인도에서 안전하게 걸어요.', grade: '4' },
  { id: 5303, hanjaId: 53, text: '도로', syllables: ['도','로'], meaning: '자동차가 다닐 수 있게 만든 길.', example: '도로가 넓어서 달리기 좋아요.', grade: '4' },
  { id: 5304, hanjaId: 53, text: '효도', syllables: ['효','도'], meaning: '부모님을 잘 섬기고 공경하는 것.', example: '부모님께 효도하는 어린이가 돼요.', grade: '4' },
  { id: 5305, hanjaId: 53, text: '횡단보도', syllables: ['횡','단','보','도'], meaning: '사람이 길을 건너도록 표시한 곳.', example: '횡단보도에서 신호를 지켜요.', grade: '4' },

  // 動 (움직일 동) — id 54 · 7급
  { id: 5401, hanjaId: 54, text: '동물', syllables: ['동','물'], meaning: '스스로 움직이며 사는 생물.', example: '동물원에서 사자를 봤어요.', grade: '4' },
  { id: 5402, hanjaId: 54, text: '운동', syllables: ['운','동'], meaning: '몸을 움직여 건강하게 하는 것.', example: '매일 운동을 하면 건강해져요.', grade: '4' },
  { id: 5403, hanjaId: 54, text: '활동', syllables: ['활','동'], meaning: '어떤 일을 활발하게 움직여 함.', example: '동아리 활동이 재미있어요.', grade: '4' },
  { id: 5404, hanjaId: 54, text: '동작', syllables: ['동','작'], meaning: '몸이 움직이는 모양.', example: '체조 동작을 따라 해요.', grade: '4' },
  { id: 5405, hanjaId: 54, text: '자동', syllables: ['자','동'], meaning: '스스로 움직임. 혼자 작동됨.', example: '자동문이 열렸어요.', grade: '4' },

  // 力 (힘 력) — id 55 · 7급
  { id: 5501, hanjaId: 55, text: '노력', syllables: ['노','력'], meaning: '목표를 위해 힘을 다해 애씀.', example: '열심히 노력하면 잘 할 수 있어요.', grade: '4' },
  { id: 5502, hanjaId: 55, text: '체력', syllables: ['체','력'], meaning: '몸을 움직일 수 있는 힘.', example: '체력이 좋아야 오래 뛸 수 있어요.', grade: '4' },
  { id: 5503, hanjaId: 55, text: '능력', syllables: ['능','력'], meaning: '어떤 일을 해낼 수 있는 힘.', example: '각자 자신만의 능력이 있어요.', grade: '4' },
  { id: 5504, hanjaId: 55, text: '동력', syllables: ['동','력'], meaning: '기계를 움직이는 힘.', example: '이 기계의 동력은 전기예요.', grade: '4' },

  // 立 (설 립) — id 56 · 7급
  { id: 5601, hanjaId: 56, text: '기립', syllables: ['기','립'], meaning: '자리에서 일어섬.', example: '선생님이 오시자 모두 기립했어요.', grade: '4' },
  { id: 5602, hanjaId: 56, text: '독립', syllables: ['독','립'], meaning: '남에게 기대지 않고 혼자 섬.', example: '우리나라 독립 기념일은 8월 15일이에요.', grade: '4' },
  { id: 5603, hanjaId: 56, text: '국립', syllables: ['국','립'], meaning: '나라에서 세운 것.', example: '국립 박물관에 견학을 갔어요.', grade: '4' },
  { id: 5604, hanjaId: 56, text: '자립', syllables: ['자','립'], meaning: '스스로의 힘으로 섬.', example: '자립하는 어른이 되고 싶어요.', grade: '4' },

  // 方 (모 방) — id 57 · 7급
  { id: 5701, hanjaId: 57, text: '방향', syllables: ['방','향'], meaning: '어느 쪽으로 향하는 쪽.', example: '나침반으로 방향을 찾아요.', grade: '4' },
  { id: 5702, hanjaId: 57, text: '사방', syllables: ['사','방'], meaning: '동서남북 네 방향 모두.', example: '사방에 꽃이 피어 있어요.', grade: '4' },
  { id: 5703, hanjaId: 57, text: '지방', syllables: ['지','방'], meaning: '서울 이외 여러 지역.', example: '지방 여행을 떠났어요.', grade: '4' },
  { id: 5704, hanjaId: 57, text: '방법', syllables: ['방','법'], meaning: '일을 하는 방식이나 수단.', example: '좋은 공부 방법을 찾아봐요.', grade: '4' },

  // 自 (스스로 자) — id 58 · 7급
  { id: 5801, hanjaId: 58, text: '자유', syllables: ['자','유'], meaning: '스스로 하고 싶은 대로 할 수 있음.', example: '자유 시간에 책을 읽었어요.', grade: '4' },
  { id: 5802, hanjaId: 58, text: '자연', syllables: ['자','연'], meaning: '사람이 만들지 않은 산, 강, 바다 등.', example: '자연 속에서 뛰어놀아요.', grade: '4' },
  { id: 5803, hanjaId: 58, text: '자기', syllables: ['자','기'], meaning: '자기 자신.', example: '자기 물건은 스스로 챙겨요.', grade: '4' },
  { id: 5804, hanjaId: 58, text: '자전거', syllables: ['자','전','거'], meaning: '발로 페달을 밟아 스스로 굴리는 탈 것.', example: '자전거를 타고 공원을 달려요.', grade: '4' },

  // 全 (온전할 전) — id 59 · 7급
  { id: 5901, hanjaId: 59, text: '안전', syllables: ['안','전'], meaning: '위험하지 않고 온전히 괜찮은 것.', example: '안전벨트를 꼭 매요.', grade: '4' },
  { id: 5902, hanjaId: 59, text: '전부', syllables: ['전','부'], meaning: '빠짐없이 모두.', example: '숙제를 전부 끝냈어요.', grade: '4' },
  { id: 5903, hanjaId: 59, text: '전체', syllables: ['전','체'], meaning: '모든 부분을 합친 것.', example: '전체 학생이 모였어요.', grade: '4' },
  { id: 5904, hanjaId: 59, text: '완전', syllables: ['완','전'], meaning: '모자람이 없이 완벽한 것.', example: '완전히 이해했어요.', grade: '4' },

  // 工 (장인 공) — id 60 · 7급
  { id: 6001, hanjaId: 60, text: '공사', syllables: ['공','사'], meaning: '건물이나 길을 짓거나 고치는 일.', example: '도로 공사로 길이 막혔어요.', grade: '4' },
  { id: 6002, hanjaId: 60, text: '공장', syllables: ['공','장'], meaning: '물건을 만드는 곳.', example: '공장에서 자동차를 만들어요.', grade: '4' },
  { id: 6003, hanjaId: 60, text: '공구', syllables: ['공','구'], meaning: '물건을 만들거나 고칠 때 쓰는 도구.', example: '아빠가 공구로 선반을 고쳤어요.', grade: '4' },
  { id: 6004, hanjaId: 60, text: '목공', syllables: ['목','공'], meaning: '나무를 다루어 물건 만드는 일.', example: '목공 시간에 책꽂이를 만들었어요.', grade: '4' },

  // 家 (집 가) — id 61 · 7급
  { id: 6101, hanjaId: 61, text: '가족', syllables: ['가','족'], meaning: '함께 사는 부모님, 형제 등의 무리.', example: '가족과 함께 여행을 갔어요.', grade: '4' },
  { id: 6102, hanjaId: 61, text: '가정', syllables: ['가','정'], meaning: '가족이 생활하는 집.', example: '행복한 가정을 만들어요.', grade: '4' },
  { id: 6103, hanjaId: 61, text: '화가', syllables: ['화','가'], meaning: '그림 그리는 것을 직업으로 하는 사람.', example: '화가가 되는 것이 꿈이에요.', grade: '4' },
  { id: 6104, hanjaId: 61, text: '작가', syllables: ['작','가'], meaning: '글을 쓰는 것을 직업으로 하는 사람.', example: '좋아하는 작가의 책을 읽었어요.', grade: '4' },

  // 男 (사내 남) — id 62 · 7급
  { id: 6201, hanjaId: 62, text: '남자', syllables: ['남','자'], meaning: '남성인 사람.', example: '남자 화장실은 왼쪽이에요.', grade: '4' },
  { id: 6202, hanjaId: 62, text: '남학생', syllables: ['남','학','생'], meaning: '남자 학생.', example: '남학생과 여학생이 함께 공부해요.', grade: '4' },
  { id: 6203, hanjaId: 62, text: '남녀', syllables: ['남','녀'], meaning: '남자와 여자.', example: '남녀 모두 운동을 즐겨요.', grade: '4' },
  { id: 6204, hanjaId: 62, text: '장남', syllables: ['장','남'], meaning: '맏아들.', example: '장남이 집안의 큰아들이에요.', grade: '4' },

  // 姓 (성씨 성) — id 63 · 7급
  { id: 6301, hanjaId: 63, text: '성명', syllables: ['성','명'], meaning: '성씨와 이름을 합쳐 부르는 말.', example: '서류에 성명을 적어요.', grade: '4' },
  { id: 6302, hanjaId: 63, text: '성씨', syllables: ['성','씨'], meaning: '집안을 나타내는 이름.', example: '우리 성씨는 김씨예요.', grade: '4' },
  { id: 6303, hanjaId: 63, text: '동성', syllables: ['동','성'], meaning: '같은 성씨.', example: '동성동본은 같은 조상을 가져요.', grade: '4' },
  { id: 6304, hanjaId: 63, text: '백성', syllables: ['백','성'], meaning: '옛날 나라의 일반 사람들.', example: '왕이 백성을 위해 한글을 만들었어요.', grade: '4' },

  // 名 (이름 명) — id 64 · 7급
  { id: 6401, hanjaId: 64, text: '성명', syllables: ['성','명'], meaning: '성씨와 이름.', example: '성명을 또박또박 써요.', grade: '4' },
  { id: 6402, hanjaId: 64, text: '유명', syllables: ['유','명'], meaning: '많은 사람이 알 만큼 이름이 널리 알려짐.', example: '유명한 가수 공연을 봤어요.', grade: '4' },
  { id: 6403, hanjaId: 64, text: '명함', syllables: ['명','함'], meaning: '이름과 연락처가 적힌 작은 종이.', example: '아빠가 명함을 주셨어요.', grade: '4' },
  { id: 6404, hanjaId: 64, text: '별명', syllables: ['별','명'], meaning: '본래 이름 외에 부르는 재미있는 이름.', example: '내 별명은 토끼예요.', grade: '4' },

  // 孝 (효도 효) — id 65 · 7급
  { id: 6501, hanjaId: 65, text: '효도', syllables: ['효','도'], meaning: '부모님을 잘 모시고 공경하는 것.', example: '부모님께 효도하는 어린이가 돼요.', grade: '4' },
  { id: 6502, hanjaId: 65, text: '효자', syllables: ['효','자'], meaning: '부모님께 잘 하는 아들.', example: '효자 홍길동 이야기를 읽었어요.', grade: '4' },
  { id: 6503, hanjaId: 65, text: '효녀', syllables: ['효','녀'], meaning: '부모님께 잘 하는 딸.', example: '심청이는 유명한 효녀예요.', grade: '4' },
  { id: 6504, hanjaId: 65, text: '불효', syllables: ['불','효'], meaning: '부모님께 잘 하지 못하는 것.', example: '불효를 하지 않도록 노력해요.', grade: '4' },

  // 食 (먹을 식) — id 66 · 7급
  { id: 6601, hanjaId: 66, text: '식사', syllables: ['식','사'], meaning: '밥을 먹는 것.', example: '식사 전에 손을 씻어요.', grade: '4' },
  { id: 6602, hanjaId: 66, text: '음식', syllables: ['음','식'], meaning: '먹고 마시는 것.', example: '엄마가 만든 음식이 맛있어요.', grade: '4' },
  { id: 6603, hanjaId: 66, text: '식당', syllables: ['식','당'], meaning: '음식을 파는 가게.', example: '학교 식당에서 급식을 먹어요.', grade: '4' },
  { id: 6604, hanjaId: 66, text: '식물', syllables: ['식','물'], meaning: '땅에 뿌리를 내리고 사는 생물.', example: '식물에 물을 줘요.', grade: '4' },

  // 手 (손 수) — id 67 · 7급
  { id: 6701, hanjaId: 67, text: '박수', syllables: ['박','수'], meaning: '두 손뼉을 마주쳐 소리 내는 것.', example: '공연이 끝나고 박수를 쳤어요.', grade: '4' },
  { id: 6702, hanjaId: 67, text: '선수', syllables: ['선','수'], meaning: '운동이나 게임에서 실력이 뛰어난 사람.', example: '축구 선수가 골을 넣었어요.', grade: '4' },
  { id: 6703, hanjaId: 67, text: '악수', syllables: ['악','수'], meaning: '만났을 때 손을 서로 잡고 흔드는 것.', example: '친구와 악수를 나눴어요.', grade: '4' },
  { id: 6704, hanjaId: 67, text: '가수', syllables: ['가','수'], meaning: '노래 부르는 것을 직업으로 하는 사람.', example: '좋아하는 가수의 노래를 들어요.', grade: '4' },

  // 安 (편안할 안) — id 68 · 7급
  { id: 6801, hanjaId: 68, text: '안전', syllables: ['안','전'], meaning: '위험하지 않고 편안한 상태.', example: '횡단보도를 건널 때 안전을 지켜요.', grade: '4' },
  { id: 6802, hanjaId: 68, text: '안심', syllables: ['안','심'], meaning: '걱정 없이 마음이 편안함.', example: '엄마 목소리를 들으니 안심이 됐어요.', grade: '4' },
  { id: 6803, hanjaId: 68, text: '불안', syllables: ['불','안'], meaning: '마음이 편하지 않고 걱정됨.', example: '발표 전에 불안한 마음이 들었어요.', grade: '4' },
  { id: 6804, hanjaId: 68, text: '안녕', syllables: ['안','녕'], meaning: '평안함. 인사말로 쓰임.', example: '친구에게 안녕 하고 인사했어요.', grade: '3' },
  { id: 6805, hanjaId: 68, text: '안방', syllables: ['안','방'], meaning: '집에서 가장 안쪽에 있는 방.', example: '온 가족이 안방에 모였어요.', grade: '3' },

  // 答 (대답할 답) — id 69 · 7급
  { id: 6901, hanjaId: 69, text: '대답', syllables: ['대','답'], meaning: '물음에 말로 답함.', example: '선생님 질문에 크게 대답했어요.', grade: '3' },
  { id: 6902, hanjaId: 69, text: '정답', syllables: ['정','답'], meaning: '문제의 맞는 답.', example: '시험에서 정답을 모두 맞혔어요.', grade: '3' },
  { id: 6903, hanjaId: 69, text: '답안', syllables: ['답','안'], meaning: '시험 문제에 쓴 답.', example: '답안지에 이름을 먼저 써요.', grade: '4' },
  { id: 6904, hanjaId: 69, text: '문답', syllables: ['문','답'], meaning: '묻고 답하기.', example: '문답 형식으로 수업을 했어요.', grade: '4' },
  { id: 6905, hanjaId: 69, text: '응답', syllables: ['응','답'], meaning: '부름이나 물음에 답함.', example: '라디오 퀴즈에 응답했어요.', grade: '4' },

  // 事 (일 사) — id 70 · 7급
  { id: 7001, hanjaId: 70, text: '사건', syllables: ['사','건'], meaning: '세상에서 일어난 일.', example: '신문에 큰 사건이 났어요.', grade: '4' },
  { id: 7002, hanjaId: 70, text: '사실', syllables: ['사','실'], meaning: '실제로 있었던 일.', example: '이건 내가 직접 본 사실이에요.', grade: '3' },
  { id: 7003, hanjaId: 70, text: '인사', syllables: ['인','사'], meaning: '만나거나 헤어질 때 예를 갖추는 일.', example: '어른께 먼저 인사를 해요.', grade: '3' },
  { id: 7004, hanjaId: 70, text: '행사', syllables: ['행','사'], meaning: '계획한 일을 실제로 함. 또는 그 행사.', example: '학교 운동회 행사가 재미있었어요.', grade: '4' },
  { id: 7005, hanjaId: 70, text: '사고', syllables: ['사','고'], meaning: '갑자기 일어난 좋지 않은 일.', example: '교통 사고가 나지 않게 조심해요.', grade: '4' },

  // 右 (오른쪽 우) — id 71 · 7급
  { id: 7101, hanjaId: 71, text: '좌우', syllables: ['좌','우'], meaning: '왼쪽과 오른쪽.', example: '길을 건너기 전에 좌우를 살펴요.', grade: '3' },
  { id: 7102, hanjaId: 71, text: '우편', syllables: ['우','편'], meaning: '오른쪽 방향.', example: '우편으로 돌면 학교가 나와요.', grade: '4' },
  { id: 7103, hanjaId: 71, text: '우측', syllables: ['우','측'], meaning: '오른쪽.', example: '에스컬레이터 우측에 서요.', grade: '4' },
  { id: 7104, hanjaId: 71, text: '우회전', syllables: ['우','회','전'], meaning: '오른쪽으로 방향을 바꿈.', example: '신호등에서 우회전했어요.', grade: '4' },

  // 左 (왼쪽 좌) — id 72 · 7급
  { id: 7201, hanjaId: 72, text: '좌우', syllables: ['좌','우'], meaning: '왼쪽과 오른쪽.', example: '좌우를 보고 길을 건너요.', grade: '3' },
  { id: 7202, hanjaId: 72, text: '좌측', syllables: ['좌','측'], meaning: '왼쪽.', example: '좌측 통행을 지켜요.', grade: '4' },
  { id: 7203, hanjaId: 72, text: '좌회전', syllables: ['좌','회','전'], meaning: '왼쪽으로 방향을 바꿈.', example: '삼거리에서 좌회전했어요.', grade: '4' },
  { id: 7204, hanjaId: 72, text: '좌우명', syllables: ['좌','우','명'], meaning: '늘 마음에 새겨 두는 말.', example: '나의 좌우명은 성실이에요.', grade: '4' },

  // 直 (곧을 직) — id 73 · 7급
  { id: 7301, hanjaId: 73, text: '정직', syllables: ['정','직'], meaning: '거짓 없이 바르고 솔직함.', example: '정직한 사람이 되고 싶어요.', grade: '3' },
  { id: 7302, hanjaId: 73, text: '직접', syllables: ['직','접'], meaning: '중간 없이 바로 하는 것.', example: '직접 만든 케이크를 드렸어요.', grade: '3' },
  { id: 7303, hanjaId: 73, text: '직선', syllables: ['직','선'], meaning: '구부러지지 않고 곧은 선.', example: '자로 직선을 그었어요.', grade: '3' },
  { id: 7304, hanjaId: 73, text: '직진', syllables: ['직','진'], meaning: '곧장 앞으로 나아감.', example: '신호를 보고 직진했어요.', grade: '4' },
  { id: 7305, hanjaId: 73, text: '솔직', syllables: ['솔','직'], meaning: '숨기지 않고 마음을 바로 말함.', example: '솔직하게 말해줘서 고마워요.', grade: '4' },

  // 正 (바를 정) — id 74 · 7급
  { id: 7401, hanjaId: 74, text: '정직', syllables: ['정','직'], meaning: '바르고 거짓이 없음.', example: '정직한 행동이 중요해요.', grade: '3' },
  { id: 7402, hanjaId: 74, text: '정답', syllables: ['정','답'], meaning: '바른 답. 맞는 답.', example: '세 문제 모두 정답을 맞혔어요.', grade: '3' },
  { id: 7403, hanjaId: 74, text: '정문', syllables: ['정','문'], meaning: '건물의 정면에 있는 문.', example: '학교 정문 앞에서 만나요.', grade: '3' },
  { id: 7404, hanjaId: 74, text: '공정', syllables: ['공','정'], meaning: '한쪽으로 치우치지 않고 바름.', example: '심판은 공정하게 판정해요.', grade: '4' },
  { id: 7405, hanjaId: 74, text: '정의', syllables: ['정','의'], meaning: '바르고 옳은 것.', example: '정의로운 세상을 꿈꿔요.', grade: '4' },

  // 不 (아닐 불) — id 75 · 7급
  { id: 7501, hanjaId: 75, text: '불안', syllables: ['불','안'], meaning: '마음이 편하지 않고 걱정됨.', example: '혼자 있으면 불안해요.', grade: '4' },
  { id: 7502, hanjaId: 75, text: '불만', syllables: ['불','만'], meaning: '마음에 들지 않아 아쉬움.', example: '결과에 불만이 없도록 최선을 다해요.', grade: '4' },
  { id: 7503, hanjaId: 75, text: '불편', syllables: ['불','편'], meaning: '편하지 않고 불쾌함.', example: '딱딱한 의자라 불편했어요.', grade: '3' },
  { id: 7504, hanjaId: 75, text: '불법', syllables: ['불','법'], meaning: '법에 어긋나는 것.', example: '불법 주차는 안 돼요.', grade: '4' },
  { id: 7505, hanjaId: 75, text: '불공평', syllables: ['불','공','평'], meaning: '고르지 않고 치우침.', example: '규칙이 불공평하다고 느꼈어요.', grade: '4' },

  // 平 (평평할 평) — id 76 · 7급
  { id: 7601, hanjaId: 76, text: '평안', syllables: ['평','안'], meaning: '마음이 고요하고 편함.', example: '오늘 하루도 평안하게 보내요.', grade: '4' },
  { id: 7602, hanjaId: 76, text: '평일', syllables: ['평','일'], meaning: '주말이 아닌 보통 날.', example: '평일에는 학교에 가요.', grade: '3' },
  { id: 7603, hanjaId: 76, text: '공평', syllables: ['공','평'], meaning: '모두에게 고르고 공정함.', example: '사탕을 공평하게 나눴어요.', grade: '3' },
  { id: 7604, hanjaId: 76, text: '수평', syllables: ['수','평'], meaning: '기울지 않고 수면처럼 평평함.', example: '책상이 수평인지 확인해요.', grade: '4' },
  { id: 7605, hanjaId: 76, text: '평소', syllables: ['평','소'], meaning: '보통 때. 늘.', example: '평소에도 손을 자주 씻어요.', grade: '3' },

  // 後 (뒤 후) — id 77 · 7급
  { id: 7701, hanjaId: 77, text: '후문', syllables: ['후','문'], meaning: '건물이나 학교의 뒷문.', example: '학교 후문으로 나왔어요.', grade: '4' },
  { id: 7702, hanjaId: 77, text: '오후', syllables: ['오','후'], meaning: '낮 12시 이후의 시간.', example: '오후 세 시에 수업이 끝났어요.', grade: '3' },
  { id: 7703, hanjaId: 77, text: '후배', syllables: ['후','배'], meaning: '나보다 나중에 들어온 사람.', example: '후배에게 학교생활을 알려줬어요.', grade: '3' },
  { id: 7704, hanjaId: 77, text: '후방', syllables: ['후','방'], meaning: '뒤쪽 방향.', example: '후방 카메라로 뒤를 확인해요.', grade: '4' },
  { id: 7705, hanjaId: 77, text: '식후', syllables: ['식','후'], meaning: '밥을 먹은 뒤.', example: '식후에 이를 닦아요.', grade: '3' },

  // 江 (강 강) — id 78 · 7급
  { id: 7801, hanjaId: 78, text: '강물', syllables: ['강','물'], meaning: '강에 흐르는 물.', example: '강물이 맑고 시원해요.', grade: '3' },
  { id: 7802, hanjaId: 78, text: '한강', syllables: ['한','강'], meaning: '서울을 흐르는 큰 강 이름.', example: '한강 공원에서 자전거를 탔어요.', grade: '3' },
  { id: 7803, hanjaId: 78, text: '강가', syllables: ['강','가'], meaning: '강의 가장자리.', example: '강가에서 돌멩이를 던졌어요.', grade: '3' },
  { id: 7804, hanjaId: 78, text: '강변', syllables: ['강','변'], meaning: '강 옆의 넓은 땅.', example: '강변에서 산책했어요.', grade: '4' },
  { id: 7805, hanjaId: 78, text: '강원도', syllables: ['강','원','도'], meaning: '우리나라의 산이 많은 도.', example: '강원도에 스키장이 많아요.', grade: '4' },

  // 海 (바다 해) — id 79 · 7급
  { id: 7901, hanjaId: 79, text: '해변', syllables: ['해','변'], meaning: '바닷가.', example: '여름에 해변에서 놀았어요.', grade: '3' },
  { id: 7902, hanjaId: 79, text: '동해', syllables: ['동','해'], meaning: '우리나라 동쪽 바다.', example: '동해 일출이 아름다워요.', grade: '3' },
  { id: 7903, hanjaId: 79, text: '서해', syllables: ['서','해'], meaning: '우리나라 서쪽 바다.', example: '서해에서 조개를 캤어요.', grade: '3' },
  { id: 7904, hanjaId: 79, text: '해군', syllables: ['해','군'], meaning: '바다를 지키는 군대.', example: '삼촌이 해군에서 근무해요.', grade: '4' },
  { id: 7905, hanjaId: 79, text: '해녀', syllables: ['해','녀'], meaning: '바다에서 해산물을 채취하는 여성.', example: '해녀가 전복을 잡아요.', grade: '4' },

  // 漢 (한수 한) — id 80 · 7급
  { id: 8001, hanjaId: 80, text: '한자', syllables: ['한','자'], meaning: '중국에서 온 옛날 글자.', example: '한자를 배우면 뜻을 이해하기 쉬워요.', grade: '4' },
  { id: 8002, hanjaId: 80, text: '한강', syllables: ['한','강'], meaning: '서울 가운데를 흐르는 강.', example: '한강 다리를 건너요.', grade: '3' },
  { id: 8003, hanjaId: 80, text: '한문', syllables: ['한','문'], meaning: '한자로 쓴 글.', example: '한문 교과서를 펼쳤어요.', grade: '4' },
  { id: 8004, hanjaId: 80, text: '한약', syllables: ['한','약'], meaning: '한방 재료로 만든 약.', example: '감기에 걸려 한약을 먹었어요.', grade: '4' },

  // 萬 (일만 만) — id 81 · 7급
  { id: 8101, hanjaId: 81, text: '만원', syllables: ['만','원'], meaning: '10,000원. 일만 원.', example: '용돈으로 만원을 받았어요.', grade: '3' },
  { id: 8102, hanjaId: 81, text: '만세', syllables: ['만','세'], meaning: '기쁨을 나타낼 때 외치는 말.', example: '운동회에서 만세를 불렀어요.', grade: '3' },
  { id: 8103, hanjaId: 81, text: '천만', syllables: ['천','만'], meaning: '1,000만. 매우 많음.', example: '서울 인구가 천만 명이에요.', grade: '4' },
  { id: 8104, hanjaId: 81, text: '만국', syllables: ['만','국'], meaning: '세계의 모든 나라.', example: '올림픽에는 만국의 선수가 모여요.', grade: '4' },
  { id: 8105, hanjaId: 81, text: '만년필', syllables: ['만','년','필'], meaning: '잉크가 든 펜.', example: '만년필로 편지를 써요.', grade: '4' },

  // 農 (농사 농) — id 82 · 7급
  { id: 8201, hanjaId: 82, text: '농부', syllables: ['농','부'], meaning: '농사를 짓는 사람.', example: '농부 아저씨가 벼를 심었어요.', grade: '3' },
  { id: 8202, hanjaId: 82, text: '농장', syllables: ['농','장'], meaning: '농사를 짓는 넓은 땅.', example: '농장에서 딸기를 따봤어요.', grade: '3' },
  { id: 8203, hanjaId: 82, text: '농촌', syllables: ['농','촌'], meaning: '농사를 짓는 시골 마을.', example: '할아버지 댁은 농촌이에요.', grade: '3' },
  { id: 8204, hanjaId: 82, text: '농민', syllables: ['농','민'], meaning: '농사를 짓는 사람들.', example: '농민들이 비가 오기를 기다려요.', grade: '4' },
  { id: 8205, hanjaId: 82, text: '농사', syllables: ['농','사'], meaning: '씨를 뿌리고 수확하는 일.', example: '봄이 되면 농사가 시작돼요.', grade: '3' },

  // 市 (저자 시) — id 83 · 7급
  { id: 8301, hanjaId: 83, text: '시장', syllables: ['시','장'], meaning: '물건을 사고파는 곳.', example: '엄마와 시장에서 채소를 샀어요.', grade: '3' },
  { id: 8302, hanjaId: 83, text: '시민', syllables: ['시','민'], meaning: '도시에 사는 사람.', example: '시민들이 공원 청소에 참여했어요.', grade: '4' },
  { id: 8303, hanjaId: 83, text: '시청', syllables: ['시','청'], meaning: '도시 일을 처리하는 기관.', example: '시청 앞에서 행사가 열렸어요.', grade: '4' },
  { id: 8304, hanjaId: 83, text: '도시', syllables: ['도','시'], meaning: '사람이 많이 사는 큰 마을.', example: '도시에는 건물이 많아요.', grade: '3' },
  { id: 8305, hanjaId: 83, text: '시내', syllables: ['시','내'], meaning: '도시의 안쪽. 번화한 곳.', example: '시내에 나가서 쇼핑했어요.', grade: '3' },

  // 物 (물건 물) — id 84 · 7급
  { id: 8401, hanjaId: 84, text: '물건', syllables: ['물','건'], meaning: '손으로 잡을 수 있는 것.', example: '소중한 물건을 잃어버렸어요.', grade: '3' },
  { id: 8402, hanjaId: 84, text: '동물', syllables: ['동','물'], meaning: '스스로 움직이는 생물.', example: '동물원에서 기린을 봤어요.', grade: '3' },
  { id: 8403, hanjaId: 84, text: '식물', syllables: ['식','물'], meaning: '땅에 뿌리를 내리고 자라는 생물.', example: '화분에 식물을 심었어요.', grade: '3' },
  { id: 8404, hanjaId: 84, text: '사물', syllables: ['사','물'], meaning: '세상의 모든 물건과 사물.', example: '사물함에 가방을 넣었어요.', grade: '4' },
  { id: 8405, hanjaId: 84, text: '인물', syllables: ['인','물'], meaning: '어떤 일에서 중요한 사람.', example: '역사 속 유명한 인물을 배웠어요.', grade: '4' },

  // 每 (매양 매) — id 85 · 7급
  { id: 8501, hanjaId: 85, text: '매일', syllables: ['매','일'], meaning: '하루도 빠지지 않고 날마다.', example: '매일 아침 이를 닦아요.', grade: '3' },
  { id: 8502, hanjaId: 85, text: '매년', syllables: ['매','년'], meaning: '해마다. 每년.', example: '매년 봄에 꽃축제가 열려요.', grade: '3' },
  { id: 8503, hanjaId: 85, text: '매월', syllables: ['매','월'], meaning: '달마다.', example: '매월 용돈을 모아요.', grade: '4' },
  { id: 8504, hanjaId: 85, text: '매번', syllables: ['매','번'], meaning: '할 때마다. 언제나.', example: '매번 숙제를 잊어버려요.', grade: '3' },

  // 世 (세상 세) — id 86 · 7급
  { id: 8601, hanjaId: 86, text: '세상', syllables: ['세','상'], meaning: '우리가 사는 모든 곳.', example: '세상에서 엄마가 제일 좋아요.', grade: '3' },
  { id: 8602, hanjaId: 86, text: '세계', syllables: ['세','계'], meaning: '지구 위의 모든 나라.', example: '세계 여러 나라 음식을 먹었어요.', grade: '3' },
  { id: 8603, hanjaId: 86, text: '세대', syllables: ['세','대'], meaning: '부모·자녀처럼 한 단계 차이 나는 사람들 무리.', example: '할머니와 나는 세대가 달라요.', grade: '4' },
  { id: 8604, hanjaId: 86, text: '세기', syllables: ['세','기'], meaning: '100년 단위의 기간.', example: '21세기는 과학이 발달했어요.', grade: '4' },

  // 間 (사이 간) — id 87 · 7급
  { id: 8701, hanjaId: 87, text: '시간', syllables: ['시','간'], meaning: '하루를 나눈 60분 단위. 또는 어떤 때.', example: '수업 시간에 집중했어요.', grade: '3' },
  { id: 8702, hanjaId: 87, text: '공간', syllables: ['공','간'], meaning: '사람이나 물건이 있을 수 있는 빈 곳.', example: '방에 공간이 넓어요.', grade: '4' },
  { id: 8703, hanjaId: 87, text: '중간', syllables: ['중','간'], meaning: '가운데. 반쯤 된 사이.', example: '중간 시험을 잘 봤어요.', grade: '3' },
  { id: 8704, hanjaId: 87, text: '인간', syllables: ['인','간'], meaning: '사람. 사람 무리.', example: '인간은 서로 도우며 살아요.', grade: '4' },

  // 時 (때 시) — id 88 · 7급
  { id: 8801, hanjaId: 88, text: '시간', syllables: ['시','간'], meaning: '하루를 나눈 단위. 어떤 때.', example: '놀이 시간이 끝났어요.', grade: '3' },
  { id: 8802, hanjaId: 88, text: '시계', syllables: ['시','계'], meaning: '시간을 알려 주는 기계.', example: '벽에 시계가 걸려 있어요.', grade: '3' },
  { id: 8803, hanjaId: 88, text: '일시', syllables: ['일','시'], meaning: '어느 날 어느 때.', example: '행사 일시를 확인해요.', grade: '4' },
  { id: 8804, hanjaId: 88, text: '동시', syllables: ['동','시'], meaning: '같은 때에 함께.', example: '둘이 동시에 출발했어요.', grade: '4' },

  // 午 (낮 오) — id 89 · 7급
  { id: 8901, hanjaId: 89, text: '오전', syllables: ['오','전'], meaning: '밤 12시부터 낮 12시까지.', example: '오전 수업이 끝났어요.', grade: '3' },
  { id: 8902, hanjaId: 89, text: '오후', syllables: ['오','후'], meaning: '낮 12시부터 밤 12시까지.', example: '오후에 친구와 놀았어요.', grade: '3' },
  { id: 8903, hanjaId: 89, text: '정오', syllables: ['정','오'], meaning: '낮 12시 꼭 그 시각.', example: '정오에 점심을 먹어요.', grade: '4' },
  { id: 8904, hanjaId: 89, text: '오시', syllables: ['오','시'], meaning: '옛날 시각으로 낮 11시~1시.', example: '옛날엔 오시에 밥을 먹었대요.', grade: '4' },

  // 前 (앞 전) — id 90 · 7급
  { id: 9001, hanjaId: 90, text: '오전', syllables: ['오','전'], meaning: '낮이 되기 전 아침 시간.', example: '오전 9시에 학교에 가요.', grade: '3' },
  { id: 9002, hanjaId: 90, text: '사전', syllables: ['사','전'], meaning: '일이 일어나기 전. 또는 낱말 뜻을 모아 놓은 책.', example: '사전을 찾아보면 뜻을 알 수 있어요.', grade: '4' },
  { id: 9003, hanjaId: 90, text: '전후', syllables: ['전','후'], meaning: '앞과 뒤. 또는 그 전과 그 후.', example: '전후 사정을 잘 살펴봐요.', grade: '4' },
  { id: 9004, hanjaId: 90, text: '식전', syllables: ['식','전'], meaning: '밥을 먹기 전.', example: '식전에 약을 먹어요.', grade: '3' },

  // 內 (안 내) — id 91 · 7급
  { id: 9101, hanjaId: 91, text: '내부', syllables: ['내','부'], meaning: '물건이나 장소의 안쪽.', example: '건물 내부가 따뜻해요.', grade: '4' },
  { id: 9102, hanjaId: 91, text: '실내', syllables: ['실','내'], meaning: '방이나 건물 안.', example: '실내에서 조용히 해요.', grade: '3' },
  { id: 9103, hanjaId: 91, text: '내년', syllables: ['내','년'], meaning: '올해 다음 해.', example: '내년에는 4학년이 돼요.', grade: '3' },
  { id: 9104, hanjaId: 91, text: '시내', syllables: ['시','내'], meaning: '도시의 중심 안쪽.', example: '시내에 나가서 쇼핑했어요.', grade: '3' },

  // 氣 (기운 기) — id 92 · 7급
  { id: 9201, hanjaId: 92, text: '공기', syllables: ['공','기'], meaning: '우리 주변을 가득 채운 투명한 것. 숨쉴 때 필요해요.', example: '산속 공기가 맑아요.', grade: '3' },
  { id: 9202, hanjaId: 92, text: '인기', syllables: ['인','기'], meaning: '많은 사람이 좋아하는 것.', example: '그 가수는 인기가 많아요.', grade: '3' },
  { id: 9203, hanjaId: 92, text: '기온', syllables: ['기','온'], meaning: '공기의 온도.', example: '오늘 기온이 많이 올랐어요.', grade: '4' },
  { id: 9204, hanjaId: 92, text: '감기', syllables: ['감','기'], meaning: '콧물·기침이 나는 흔한 병.', example: '감기에 걸려서 병원에 갔어요.', grade: '3' },

  // 空 (빌 공) — id 93 · 7급
  { id: 9301, hanjaId: 93, text: '공기', syllables: ['공','기'], meaning: '우리 주변을 가득 채운 보이지 않는 것.', example: '창문을 열어 공기를 바꿔요.', grade: '3' },
  { id: 9302, hanjaId: 93, text: '공중', syllables: ['공','중'], meaning: '하늘과 땅 사이의 빈 곳.', example: '공중에 풍선이 떠 있어요.', grade: '3' },
  { id: 9303, hanjaId: 93, text: '공책', syllables: ['공','책'], meaning: '글씨를 쓸 수 있는 빈 책.', example: '공책에 받아쓰기를 했어요.', grade: '3' },
  { id: 9304, hanjaId: 93, text: '공항', syllables: ['공','항'], meaning: '비행기가 뜨고 내리는 곳.', example: '공항에서 비행기를 탔어요.', grade: '3' },

  // 靑 (푸를 청) — id 94 · 7급
  { id: 9401, hanjaId: 94, text: '청년', syllables: ['청','년'], meaning: '젊고 활기찬 사람. 어른이 된 지 얼마 안 된 나이.', example: '청년들이 열심히 일해요.', grade: '4' },
  { id: 9402, hanjaId: 94, text: '청소년', syllables: ['청','소','년'], meaning: '어린이와 어른 사이의 중학생·고등학생 나이.', example: '청소년을 위한 도서관이 있어요.', grade: '4' },
  { id: 9403, hanjaId: 94, text: '청신호', syllables: ['청','신','호'], meaning: '건너도 좋다는 파란 신호등.', example: '청신호가 켜지면 건너요.', grade: '3' },
  { id: 9404, hanjaId: 94, text: '청춘', syllables: ['청','춘'], meaning: '젊고 활기찬 시절.', example: '청춘은 다시 오지 않아요.', grade: '4' },

  // 外 (바깥 외) — id 95 · 7급
  { id: 9501, hanjaId: 95, text: '외출', syllables: ['외','출'], meaning: '집 밖으로 나가는 것.', example: '비가 와서 외출을 못 했어요.', grade: '3' },
  { id: 9502, hanjaId: 95, text: '외국', syllables: ['외','국'], meaning: '우리나라가 아닌 다른 나라.', example: '외국 친구가 생겼어요.', grade: '3' },
  { id: 9503, hanjaId: 95, text: '야외', syllables: ['야','외'], meaning: '건물 밖 넓은 곳. 들판.', example: '야외 수업이 재미있었어요.', grade: '3' },
  { id: 9504, hanjaId: 95, text: '의외', syllables: ['의','외'], meaning: '생각했던 것과 다른. 뜻밖의.', example: '의외로 시험이 쉬웠어요.', grade: '4' },

  // 電 (번개 전) — id 96 · 7급
  { id: 9601, hanjaId: 96, text: '전기', syllables: ['전','기'], meaning: '빛이나 열을 만들고 기계를 움직이는 힘.', example: '전기를 아껴 써요.', grade: '3' },
  { id: 9602, hanjaId: 96, text: '전화', syllables: ['전','화'], meaning: '멀리 있는 사람과 목소리로 이야기하는 기계.', example: '엄마한테 전화했어요.', grade: '3' },
  { id: 9603, hanjaId: 96, text: '전등', syllables: ['전','등'], meaning: '전기로 밝히는 빛.', example: '전등을 켜면 방이 밝아요.', grade: '3' },
  { id: 9604, hanjaId: 96, text: '발전소', syllables: ['발','전','소'], meaning: '전기를 만드는 곳.', example: '발전소에서 전기가 만들어져요.', grade: '4' },

  // 話 (말씀 화) — id 97 · 7급
  { id: 9701, hanjaId: 97, text: '대화', syllables: ['대','화'], meaning: '서로 주고받는 말.', example: '친구와 대화를 나눴어요.', grade: '3' },
  { id: 9702, hanjaId: 97, text: '전화', syllables: ['전','화'], meaning: '멀리서도 목소리로 이야기하는 것.', example: '전화로 생일 축하를 했어요.', grade: '3' },
  { id: 9703, hanjaId: 97, text: '동화', syllables: ['동','화'], meaning: '어린이를 위해 쓴 이야기.', example: '잠자리에서 동화책을 읽어요.', grade: '3' },
  { id: 9704, hanjaId: 97, text: '신화', syllables: ['신','화'], meaning: '신과 영웅이 나오는 오래된 이야기.', example: '그리스 신화가 흥미로워요.', grade: '4' },

  // 記 (기록할 기) — id 98 · 7급
  { id: 9801, hanjaId: 98, text: '일기', syllables: ['일','기'], meaning: '하루 있었던 일을 적은 글.', example: '매일 일기를 써요.', grade: '3' },
  { id: 9802, hanjaId: 98, text: '기록', syllables: ['기','록'], meaning: '남기려고 적어 두는 것.', example: '운동회 기록을 세웠어요.', grade: '3' },
  { id: 9803, hanjaId: 98, text: '기억', syllables: ['기','억'], meaning: '전에 있던 일을 머릿속에 남겨 두는 것.', example: '친구 생일을 기억했어요.', grade: '3' },
  { id: 9804, hanjaId: 98, text: '후기', syllables: ['후','기'], meaning: '어떤 일을 겪고 나서 적은 감상.', example: '책을 읽고 후기를 남겼어요.', grade: '4' },

  // 活 (살 활) — id 99 · 7급
  { id: 9901, hanjaId: 99, text: '생활', syllables: ['생','활'], meaning: '날마다 살아가는 것.', example: '학교 생활이 즐거워요.', grade: '3' },
  { id: 9902, hanjaId: 99, text: '활동', syllables: ['활','동'], meaning: '몸을 움직여 무언가를 하는 것.', example: '동아리 활동을 해요.', grade: '3' },
  { id: 9903, hanjaId: 99, text: '활기', syllables: ['활','기'], meaning: '생기 있고 힘찬 기운.', example: '운동장에 활기가 넘쳐요.', grade: '4' },
  { id: 9904, hanjaId: 99, text: '부활', syllables: ['부','활'], meaning: '죽었다가 다시 살아나는 것.', example: '봄은 자연이 부활하는 계절이에요.', grade: '4' },

  // 足 (발 족) — id 100 · 7급
  { id: 10001, hanjaId: 100, text: '수족', syllables: ['수','족'], meaning: '손과 발. 또는 손발처럼 믿고 부리는 사람.', example: '할머니의 수족이 되어 도와드려요.', grade: '4' },
  { id: 10002, hanjaId: 100, text: '부족', syllables: ['부','족'], meaning: '모자라거나 충분하지 않은 것.', example: '잠이 부족하면 피곤해요.', grade: '3' },
  { id: 10003, hanjaId: 100, text: '만족', syllables: ['만','족'], meaning: '바라던 것이 이루어져 흐뭇한 것.', example: '열심히 하면 만족감이 생겨요.', grade: '3' },
  { id: 10004, hanjaId: 100, text: '족발', syllables: ['족','발'], meaning: '돼지의 발을 푹 삶은 음식.', example: '족발이 쫄깃쫄깃해요.', grade: '3' },

  // 戰 (싸움 전) — id 101 · 6급
  { id: 10101, hanjaId: 101, text: '전쟁', syllables: ['전','쟁'], meaning: '나라끼리 무기를 들고 싸우는 일.', example: '전쟁이 없는 평화로운 세상.', grade: '4' },
  { id: 10102, hanjaId: 101, text: '작전', syllables: ['작','전'], meaning: '일을 이루기 위해 세운 계획.', example: '우리 팀은 멋진 작전을 짰어요.', grade: '4' },
  { id: 10103, hanjaId: 101, text: '도전', syllables: ['도','전'], meaning: '어려운 일에 용기 있게 맞섬.', example: '새로운 일에 도전해 봤어요.', grade: '4' },
  { id: 10104, hanjaId: 101, text: '휴전', syllables: ['휴','전'], meaning: '싸움을 잠시 멈춤.', example: '두 나라가 휴전을 했어요.', grade: '4' },

  // 作 (지을 작) — id 102 · 6급
  { id: 10201, hanjaId: 102, text: '작품', syllables: ['작','품'], meaning: '정성껏 만든 그림이나 글.', example: '미술 작품을 전시했어요.', grade: '4' },
  { id: 10202, hanjaId: 102, text: '작가', syllables: ['작','가'], meaning: '글이나 그림을 만드는 사람.', example: '동화 작가가 되고 싶어요.', grade: '4' },
  { id: 10203, hanjaId: 102, text: '동작', syllables: ['동','작'], meaning: '몸을 움직이는 모양.', example: '체조 동작을 따라 했어요.', grade: '4' },
  { id: 10204, hanjaId: 102, text: '작곡', syllables: ['작','곡'], meaning: '노래의 곡을 만듦.', example: '직접 작곡한 노래예요.', grade: '4' },

  // 發 (필 발) — id 103 · 6급
  { id: 10301, hanjaId: 103, text: '발표', syllables: ['발','표'], meaning: '여러 사람 앞에서 알림.', example: '조사한 내용을 발표했어요.', grade: '4' },
  { id: 10302, hanjaId: 103, text: '출발', syllables: ['출','발'], meaning: '길을 떠나기 시작함.', example: '아침 일찍 출발했어요.', grade: '4' },
  { id: 10303, hanjaId: 103, text: '발견', syllables: ['발','견'], meaning: '못 보던 것을 찾아냄.', example: '새로운 별을 발견했어요.', grade: '4' },
  { id: 10304, hanjaId: 103, text: '발명', syllables: ['발','명'], meaning: '없던 것을 새로 만들어 냄.', example: '에디슨이 전구를 발명했어요.', grade: '4' },

  // 表 (겉 표) — id 104 · 6급
  { id: 10401, hanjaId: 104, text: '표현', syllables: ['표','현'], meaning: '생각이나 느낌을 드러냄.', example: '기쁨을 솔직하게 표현했어요.', grade: '4' },
  { id: 10402, hanjaId: 104, text: '시간표', syllables: ['시','간','표'], meaning: '시간에 따라 할 일을 적은 표.', example: '시간표를 보고 가방을 싸요.', grade: '4' },
  { id: 10403, hanjaId: 104, text: '대표', syllables: ['대','표'], meaning: '여럿을 대신하는 사람.', example: '우리 반 대표로 뽑혔어요.', grade: '4' },
  { id: 10404, hanjaId: 104, text: '표지', syllables: ['표','지'], meaning: '책의 겉면.', example: '책 표지가 알록달록 예뻐요.', grade: '4' },

  // 會 (모일 회) — id 105 · 6급
  { id: 10501, hanjaId: 105, text: '회의', syllables: ['회','의'], meaning: '여럿이 모여 의논함.', example: '학급 회의를 열었어요.', grade: '4' },
  { id: 10502, hanjaId: 105, text: '대회', syllables: ['대','회'], meaning: '많은 사람이 모여 겨루는 행사.', example: '글쓰기 대회에 나갔어요.', grade: '4' },
  { id: 10503, hanjaId: 105, text: '회사', syllables: ['회','사'], meaning: '여럿이 함께 일하는 곳.', example: '아빠가 회사에 가셨어요.', grade: '4' },
  { id: 10504, hanjaId: 105, text: '회장', syllables: ['회','장'], meaning: '모임을 이끄는 사람.', example: '전교 회장이 되었어요.', grade: '4' },

  // 光 (빛 광) — id 106 · 6급
  { id: 10601, hanjaId: 106, text: '광선', syllables: ['광','선'], meaning: '곧게 뻗어 나가는 빛줄기.', example: '햇빛 광선이 눈부셔요.', grade: '4' },
  { id: 10602, hanjaId: 106, text: '관광', syllables: ['관','광'], meaning: '경치 좋은 곳을 구경함.', example: '제주도로 관광을 갔어요.', grade: '4' },
  { id: 10603, hanjaId: 106, text: '영광', syllables: ['영','광'], meaning: '아주 자랑스러운 일.', example: '상을 받아 영광이에요.', grade: '4' },
  { id: 10604, hanjaId: 106, text: '야광', syllables: ['야','광'], meaning: '어두운 곳에서 스스로 빛남.', example: '야광 별이 천장에서 빛나요.', grade: '4' },

  // 線 (줄 선) — id 107 · 6급
  { id: 10701, hanjaId: 107, text: '곡선', syllables: ['곡','선'], meaning: '부드럽게 휜 줄.', example: '곡선으로 물결을 그렸어요.', grade: '4' },
  { id: 10702, hanjaId: 107, text: '점선', syllables: ['점','선'], meaning: '점으로 이어진 줄.', example: '점선을 따라 가위로 잘라요.', grade: '4' },
  { id: 10703, hanjaId: 107, text: '노선', syllables: ['노','선'], meaning: '버스나 지하철이 다니는 길.', example: '버스 노선을 확인했어요.', grade: '4' },
  { id: 10704, hanjaId: 107, text: '전선', syllables: ['전','선'], meaning: '전기가 흐르는 줄.', example: '전선은 함부로 만지면 안 돼요.', grade: '4' },

  // 行 (다닐 행) — id 108 · 6급
  { id: 10801, hanjaId: 108, text: '여행', syllables: ['여','행'], meaning: '멀리 다니며 구경함.', example: '가족과 여행을 떠났어요.', grade: '4' },
  { id: 10802, hanjaId: 108, text: '행동', syllables: ['행','동'], meaning: '몸을 움직여 하는 일.', example: '바르고 착한 행동을 해요.', grade: '4' },
  { id: 10803, hanjaId: 108, text: '은행', syllables: ['은','행'], meaning: '돈을 맡기고 찾는 곳.', example: '은행에 용돈을 저금했어요.', grade: '4' },
  { id: 10804, hanjaId: 108, text: '비행기', syllables: ['비','행','기'], meaning: '하늘을 나는 탈것.', example: '비행기를 타고 할머니 댁에 갔어요.', grade: '4' },

  // 向 (향할 향) — id 109 · 6급
  { id: 10901, hanjaId: 109, text: '향상', syllables: ['향','상'], meaning: '실력이 더 나아짐.', example: '연습하니 실력이 향상됐어요.', grade: '4' },
  { id: 10902, hanjaId: 109, text: '취향', syllables: ['취','향'], meaning: '좋아하는 마음의 방향.', example: '내 취향에 딱 맞는 색이에요.', grade: '4' },
  { id: 10903, hanjaId: 109, text: '성향', syllables: ['성','향'], meaning: '평소 가지는 마음의 방향.', example: '나는 조용한 성향이에요.', grade: '4' },
  { id: 10904, hanjaId: 109, text: '경향', syllables: ['경','향'], meaning: '한쪽으로 치우치는 흐름.', example: '단것을 좋아하는 경향이 있어요.', grade: '4' },

  // 習 (익힐 습) — id 110 · 6급
  { id: 11001, hanjaId: 110, text: '학습', syllables: ['학','습'], meaning: '배워서 익힘.', example: '날마다 꾸준히 학습해요.', grade: '4' },
  { id: 11002, hanjaId: 110, text: '연습', syllables: ['연','습'], meaning: '익숙해지도록 되풀이함.', example: '피아노를 열심히 연습했어요.', grade: '4' },
  { id: 11003, hanjaId: 110, text: '습관', syllables: ['습','관'], meaning: '몸에 밴 버릇.', example: '일찍 자는 습관을 들여요.', grade: '4' },
  { id: 11004, hanjaId: 110, text: '복습', syllables: ['복','습'], meaning: '배운 것을 다시 익힘.', example: '집에 와서 복습했어요.', grade: '4' },

  // 消 (사라질 소) — id 111 · 6급
  { id: 11101, hanjaId: 111, text: '소방', syllables: ['소','방'], meaning: '불을 끄고 막는 일.', example: '소방 훈련을 했어요.', grade: '4' },
  { id: 11102, hanjaId: 111, text: '소화', syllables: ['소','화'], meaning: '먹은 것을 잘게 삭임.', example: '밥을 먹고 천천히 소화시켜요.', grade: '4' },
  { id: 11103, hanjaId: 111, text: '취소', syllables: ['취','소'], meaning: '하기로 한 일을 없던 일로 함.', example: '비가 와서 소풍이 취소됐어요.', grade: '4' },
  { id: 11104, hanjaId: 111, text: '소독', syllables: ['소','독'], meaning: '병균을 없앰.', example: '넘어진 상처를 소독했어요.', grade: '4' },

  // 感 (느낄 감) — id 112 · 6급
  { id: 11201, hanjaId: 112, text: '감정', syllables: ['감','정'], meaning: '기쁘고 슬픈 마음.', example: '감정을 솔직하게 말해요.', grade: '4' },
  { id: 11202, hanjaId: 112, text: '감동', syllables: ['감','동'], meaning: '깊이 느껴 마음이 움직임.', example: '영화를 보고 크게 감동했어요.', grade: '4' },
  { id: 11203, hanjaId: 112, text: '감사', syllables: ['감','사'], meaning: '고맙게 여김.', example: '선생님께 감사한 마음을 전해요.', grade: '4' },
  { id: 11204, hanjaId: 112, text: '감각', syllables: ['감','각'], meaning: '보고 듣고 느끼는 힘.', example: '손끝 감각이 예민해요.', grade: '4' },

  // 樂 (노래 악) — id 113 · 6급
  { id: 11301, hanjaId: 113, text: '음악', syllables: ['음','악'], meaning: '소리로 만든 아름다운 예술.', example: '음악 시간이 제일 즐거워요.', grade: '4' },
  { id: 11302, hanjaId: 113, text: '악기', syllables: ['악','기'], meaning: '음악을 연주하는 도구.', example: '새 악기를 배우기 시작했어요.', grade: '4' },
  { id: 11303, hanjaId: 113, text: '악보', syllables: ['악','보'], meaning: '음을 적어 놓은 종이.', example: '악보를 보고 또박또박 연주해요.', grade: '4' },
  { id: 11304, hanjaId: 113, text: '국악', syllables: ['국','악'], meaning: '우리나라 전통 음악.', example: '국악 공연을 신나게 봤어요.', grade: '4' },

  // 音 (소리 음) — id 114 · 6급
  { id: 11401, hanjaId: 114, text: '소음', syllables: ['소','음'], meaning: '시끄러운 소리.', example: '공사 소음 때문에 시끄러워요.', grade: '4' },
  { id: 11402, hanjaId: 114, text: '발음', syllables: ['발','음'], meaning: '소리 내어 말하는 것.', example: '영어 발음을 또박또박 해요.', grade: '4' },
  { id: 11403, hanjaId: 114, text: '녹음', syllables: ['녹','음'], meaning: '소리를 기록함.', example: '내 목소리를 녹음해 봤어요.', grade: '4' },
  { id: 11404, hanjaId: 114, text: '음성', syllables: ['음','성'], meaning: '사람의 목소리.', example: '음성이 또렷하게 들려요.', grade: '4' },

  // 和 (화할 화) — id 115 · 6급
  { id: 11501, hanjaId: 115, text: '평화', syllables: ['평','화'], meaning: '싸움 없이 평온함.', example: '평화로운 마을에 살아요.', grade: '4' },
  { id: 11502, hanjaId: 115, text: '조화', syllables: ['조','화'], meaning: '서로 잘 어울림.', example: '색깔이 조화를 이뤄요.', grade: '4' },
  { id: 11503, hanjaId: 115, text: '화목', syllables: ['화','목'], meaning: '서로 사이좋음.', example: '우리 가족은 늘 화목해요.', grade: '4' },
  { id: 11504, hanjaId: 115, text: '화해', syllables: ['화','해'], meaning: '싸움을 풀고 사이좋아짐.', example: '친구와 금방 화해했어요.', grade: '4' },

  // 野 (들 야) — id 116 · 6급
  { id: 11601, hanjaId: 116, text: '야구', syllables: ['야','구'], meaning: '공과 방망이로 하는 운동.', example: '주말에 야구 경기를 봤어요.', grade: '4' },
  { id: 11602, hanjaId: 116, text: '야외', syllables: ['야','외'], meaning: '집 밖의 넓은 곳.', example: '야외로 소풍을 갔어요.', grade: '4' },
  { id: 11603, hanjaId: 116, text: '분야', syllables: ['분','야'], meaning: '나누어진 한 부분.', example: '내가 좋아하는 분야예요.', grade: '4' },
  { id: 11604, hanjaId: 116, text: '야생', syllables: ['야','생'], meaning: '들에서 저절로 자람.', example: '야생 토끼를 보았어요.', grade: '4' },

  // 對 (마주할 대) — id 117 · 6급
  { id: 11701, hanjaId: 117, text: '대화', syllables: ['대','화'], meaning: '서로 마주 보고 이야기함.', example: '친구와 즐겁게 대화를 나눠요.', grade: '4' },
  { id: 11702, hanjaId: 117, text: '반대', syllables: ['반','대'], meaning: '뜻이 서로 맞섬.', example: '그 의견에 반대해요.', grade: '4' },
  { id: 11703, hanjaId: 117, text: '상대', syllables: ['상','대'], meaning: '마주한 짝이나 편.', example: '게임 상대를 정했어요.', grade: '4' },
  { id: 11704, hanjaId: 117, text: '대결', syllables: ['대','결'], meaning: '맞서서 겨룸.', example: '두 선수가 멋지게 대결해요.', grade: '4' },

  // 知 (알 지) — id 118 · 5급
  { id: 11801, hanjaId: 118, text: '지식', syllables: ['지','식'], meaning: '배워서 아는 것.', example: '책으로 지식을 쌓아요.', grade: '4' },
  { id: 11802, hanjaId: 118, text: '지혜', syllables: ['지','혜'], meaning: '슬기롭게 아는 힘.', example: '할머니는 지혜로우세요.', grade: '4' },
  { id: 11803, hanjaId: 118, text: '지능', syllables: ['지','능'], meaning: '생각하고 아는 능력.', example: '인공 지능 로봇이 신기해요.', grade: '4' },
  { id: 11804, hanjaId: 118, text: '통지', syllables: ['통','지'], meaning: '알려 줌.', example: '합격 통지를 받았어요.', grade: '4' },

  // 能 (능할 능) — id 119 · 5급
  { id: 11901, hanjaId: 119, text: '능력', syllables: ['능','력'], meaning: '어떤 일을 해내는 힘.', example: '꾸준히 능력을 키워요.', grade: '4' },
  { id: 11902, hanjaId: 119, text: '가능', syllables: ['가','능'], meaning: '할 수 있음.', example: '노력하면 얼마든지 가능해요.', grade: '4' },
  { id: 11903, hanjaId: 119, text: '재능', syllables: ['재','능'], meaning: '타고난 솜씨.', example: '그림 그리는 재능이 있어요.', grade: '4' },
  { id: 11904, hanjaId: 119, text: '본능', syllables: ['본','능'], meaning: '타고난 성질.', example: '동물의 본능이 신기해요.', grade: '4' },

  // 種 (씨 종) — id 120 · 5급
  { id: 12001, hanjaId: 120, text: '종류', syllables: ['종','류'], meaning: '비슷한 것끼리 나눈 갈래.', example: '과일 종류가 아주 많아요.', grade: '4' },
  { id: 12002, hanjaId: 120, text: '종자', syllables: ['종','자'], meaning: '심으려고 둔 씨앗.', example: '좋은 종자를 밭에 심어요.', grade: '4' },
  { id: 12003, hanjaId: 120, text: '품종', syllables: ['품','종'], meaning: '같은 종류 안의 갈래.', example: '새로운 품종 사과예요.', grade: '4' },
  { id: 12004, hanjaId: 120, text: '각종', syllables: ['각','종'], meaning: '여러 종류.', example: '각종 학용품을 챙겼어요.', grade: '4' },

  // 爭 (다툴 쟁) — id 121 · 5급
  { id: 12101, hanjaId: 121, text: '경쟁', syllables: ['경','쟁'], meaning: '서로 이기려고 겨룸.', example: '달리기로 경쟁했어요.', grade: '4' },
  { id: 12102, hanjaId: 121, text: '논쟁', syllables: ['논','쟁'], meaning: '말로 옳고 그름을 다툼.', example: '의견이 갈려 논쟁했어요.', grade: '4' },
  { id: 12103, hanjaId: 121, text: '분쟁', syllables: ['분','쟁'], meaning: '서로 우겨 다툼.', example: '분쟁을 슬기롭게 풀었어요.', grade: '4' },
  { id: 12104, hanjaId: 121, text: '언쟁', syllables: ['언','쟁'], meaning: '말로 다툼.', example: '사소한 일로 언쟁을 했어요.', grade: '4' },

  // 質 (바탕 질) — id 122 · 5급
  { id: 12201, hanjaId: 122, text: '질문', syllables: ['질','문'], meaning: '모르는 것을 물음.', example: '선생님께 질문했어요.', grade: '4' },
  { id: 12202, hanjaId: 122, text: '품질', syllables: ['품','질'], meaning: '물건의 좋고 나쁨.', example: '품질이 좋은 신발이에요.', grade: '4' },
  { id: 12203, hanjaId: 122, text: '성질', syllables: ['성','질'], meaning: '본래 가진 특성.', example: '물의 성질을 배웠어요.', grade: '4' },
  { id: 12204, hanjaId: 122, text: '물질', syllables: ['물','질'], meaning: '물건을 이루는 바탕.', example: '여러 물질을 섞어 봤어요.', grade: '4' },

  // 敬 (공경 경) — id 123 · 5급
  { id: 12301, hanjaId: 123, text: '존경', syllables: ['존','경'], meaning: '훌륭하게 여겨 받듦.', example: '선생님을 존경해요.', grade: '4' },
  { id: 12302, hanjaId: 123, text: '공경', syllables: ['공','경'], meaning: '웃어른을 받들어 모심.', example: '어른을 공경해요.', grade: '4' },
  { id: 12303, hanjaId: 123, text: '경례', syllables: ['경','례'], meaning: '예의를 갖춰 인사함.', example: '국기에 경례했어요.', grade: '4' },
  { id: 12304, hanjaId: 123, text: '경로', syllables: ['경','로'], meaning: '어르신을 공경함.', example: '경로당에 다녀왔어요.', grade: '4' },

  // 練 (익힐 련) — id 124 · 5급
  { id: 12401, hanjaId: 124, text: '훈련', syllables: ['훈','련'], meaning: '익숙해지도록 가르쳐 익힘.', example: '소방 대피 훈련을 했어요.', grade: '4' },
  { id: 12402, hanjaId: 124, text: '숙련', syllables: ['숙','련'], meaning: '아주 익숙해짐.', example: '숙련된 솜씨로 만들어요.', grade: '4' },
  { id: 12403, hanjaId: 124, text: '단련', syllables: ['단','련'], meaning: '몸과 마음을 굳세게 함.', example: '날마다 체력을 단련해요.', grade: '4' },
  { id: 12404, hanjaId: 124, text: '세련', syllables: ['세','련'], meaning: '깔끔하고 멋짐.', example: '옷차림이 세련됐어요.', grade: '4' },

  // 馬 (말 마) — id 125 · 5급
  { id: 12501, hanjaId: 125, text: '목마', syllables: ['목','마'], meaning: '나무로 만든 말.', example: '회전목마를 신나게 탔어요.', grade: '4' },
  { id: 12502, hanjaId: 125, text: '경마', syllables: ['경','마'], meaning: '말을 타고 빠르기를 겨룸.', example: '경마 경기를 구경했어요.', grade: '4' },
  { id: 12503, hanjaId: 125, text: '승마', syllables: ['승','마'], meaning: '말을 타는 운동.', example: '주말에 승마를 배워요.', grade: '4' },
  { id: 12504, hanjaId: 125, text: '백마', syllables: ['백','마'], meaning: '하얀 말.', example: '백마를 탄 왕자 이야기예요.', grade: '4' },
];

// 빠른 lookup
export const WORDS_BY_ID = new Map(WORDS.map(w => [w.id, w]));
export const WORDS_BY_HANJA = (() => {
  const m = new Map();
  for (const w of WORDS) {
    if (!m.has(w.hanjaId)) m.set(w.hanjaId, []);
    m.get(w.hanjaId).push(w);
  }
  return m;
})();

export function getWordsForHanja(hanjaId) {
  return WORDS_BY_HANJA.get(hanjaId) || [];
}
