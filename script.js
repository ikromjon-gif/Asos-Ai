/* ==========================================================================
   AsosAI — script.js
   Pure vanilla JS, no dependencies.

   Architecture:
     1. KNOWLEDGE_BASE (3 languages) + retrieval — the layer to touch for a
        real backend (Flask + vector search + LLM generation).
     2. i18n — UI chrome translation (uz / en / ko).
     3. UI state & rendering — message grouping, chips, source citations, scroll.
     4. Event wiring.
   ========================================================================== */

/* ============================================================
   1. KNOWLEDGE BASE (per language)
   First 5 items = curated FAQ set. All 9 = the AI mode's search corpus.
   ============================================================ */
const KNOWLEDGE_BASE = {
  en: [
    { id: "adoption", question: "When was the Constitution adopted?", keywords: ["when","adopt","adopted","date","history","1992","2023","referendum"],
      answer: "The original Constitution of the Republic of Uzbekistan was adopted on December 8, 1992. It was comprehensively renewed through a nationwide referendum on April 30, 2023, with the new text taking effect on May 1, 2023." },
    { id: "article-41", question: "What is Article 41?", keywords: ["article 41","41","education","school"],
      answer: "Article 41 protects the right to education. The state guarantees free general secondary and primary vocational education, while secondary specialized and higher education are made accessible to everyone in accordance with the law." },
    { id: "citizens-rights", question: "What are citizens' rights?", keywords: ["citizens","rights","freedoms","human rights","civil rights"],
      answer: "Part Two of the Constitution sets out human and civil rights and freedoms — personal rights such as life and liberty, political rights such as voting and free speech, and economic, social and cultural rights such as education, health care and work. All citizens are equal before the law." },
    { id: "state-language", question: "What is the state language?", keywords: ["state language","official language","language","uzbek language"],
      answer: "Uzbek is the state language of the Republic of Uzbekistan under Article 4. The state also guarantees respect for the languages, customs and traditions of all nationalities and peoples living in the country." },
    { id: "article-count", question: "How many articles are there?", keywords: ["how many articles","articles","chapters","parts","sections"],
      answer: "Following the 2023 constitutional reform, the Constitution now contains 155 articles organized into 6 parts and 27 chapters — up from 128 articles in the original 1992 version." },
    { id: "president", question: "How is the President elected?", keywords: ["president","elected","term","seven years","election","head of state"],
      answer: "The President is the head of state, elected by direct popular vote for a seven-year term under Article 90 — extended from five years in the 2023 reform. A president may serve no more than two consecutive terms." },
    { id: "parliament", question: "What is the Oliy Majlis?", keywords: ["oliy majlis","parliament","legislative chamber","senate","deputies","legislature"],
      answer: "The Oliy Majlis is Uzbekistan's supreme legislative body. It is bicameral: the Legislative Chamber (150 elected deputies, the lower house) and the Senate (100 members representing the regions, the upper house), both serving five-year terms." },
    { id: "judiciary", question: "How is the judiciary organized?", keywords: ["judiciary","court","judicial","supreme court","constitutional court","judge"],
      answer: "Judicial power is independent from the legislative and executive branches. It includes the Constitutional Court, the Supreme Court, and the courts of the Republic of Karakalpakstan, regions, districts and cities." },
    { id: "amendment", question: "How can the Constitution be amended?", keywords: ["amend","amendment","change constitution","referendum","modify"],
      answer: "Amending the Constitution requires either a two-thirds vote of both chambers of the Oliy Majlis sitting jointly, or approval by a nationwide referendum, depending on which part of the Constitution is being changed." },
  ],
  uz: [
    { id: "adoption", question: "Konstitutsiya qachon qabul qilingan?", keywords: ["qachon","qabul","tarix","1992","2023","referendum"],
      answer: "O'zbekiston Respublikasining asl Konstitutsiyasi 1992-yil 8-dekabrda qabul qilingan. 2023-yil 30-aprelda umumxalq referendumi orqali keng qamrovli yangilandi, yangi matn 2023-yil 1-maydan kuchga kirdi." },
    { id: "article-41", question: "41-modda nima haqida?", keywords: ["41-modda","41","ta'lim","maktab"],
      answer: "41-modda ta'lim olish huquqini himoya qiladi. Davlat bepul umumiy o'rta va boshlang'ich kasb-hunar ta'limini kafolatlaydi, o'rta maxsus va oliy ta'lim esa qonun asosida hamma uchun ochiq." },
    { id: "citizens-rights", question: "Fuqarolarning huquqlari qanday?", keywords: ["fuqaro","huquq","erkinlik","inson huquqlari"],
      answer: "Konstitutsiyaning ikkinchi qismi inson va fuqaro huquq va erkinliklarini belgilaydi — hayot va erkinlik kabi shaxsiy huquqlar, ovoz berish va so'z erkinligi kabi siyosiy huquqlar, ta'lim, sog'liqni saqlash va mehnat kabi iqtisodiy-ijtimoiy huquqlar. Barcha fuqarolar qonun oldida tengdir." },
    { id: "state-language", question: "Davlat tili nima?", keywords: ["davlat tili","rasmiy til","til","o'zbek tili"],
      answer: "4-moddaga ko'ra, o'zbek tili O'zbekiston Respublikasining davlat tilidir. Davlat, shuningdek, mamlakatda yashovchi barcha millat va xalqlarning tili, urf-odati va an'analariga hurmatni kafolatlaydi." },
    { id: "article-count", question: "Nechta modda bor?", keywords: ["nechta modda","modda","bob","qism"],
      answer: "2023-yilgi konstitutsiyaviy islohotdan so'ng, Konstitutsiya 6 qism va 27 bobga birlashtirilgan 155 moddadan iborat — bu 1992-yilgi asl nusxadagi 128 moddadan ko'p." },
    { id: "president", question: "Prezident qanday saylanadi?", keywords: ["prezident","saylanadi","muddat","yetti yil","saylov","davlat rahbari"],
      answer: "Prezident davlat rahbari bo'lib, 90-moddaga ko'ra xalq tomonidan bevosita 7 yil muddatga saylanadi — 2023-yilgi islohotda 5 yildan oshirilgan. Prezident ketma-ket ikki muddatdan ortiq lavozimda bo'la olmaydi." },
    { id: "parliament", question: "Oliy Majlis nima?", keywords: ["oliy majlis","parlament","qonunchilik palatasi","senat","deputat"],
      answer: "Oliy Majlis O'zbekistonning oliy qonun chiqaruvchi organi. U ikki palatadan iborat — Qonunchilik palatasi (150 deputat, quyi palata) va Senat (hududlarni vakillik qiluvchi 100 a'zo, yuqori palata), ikkalasi ham 5 yil muddatga saylanadi." },
    { id: "judiciary", question: "Sud tizimi qanday tashkil etilgan?", keywords: ["sud","sud tizimi","konstitutsiyaviy sud","oliy sud","sudya"],
      answer: "Sud hokimiyati qonun chiqaruvchi va ijro etuvchi hokimiyatdan mustaqildir. Unga Konstitutsiyaviy sud, Oliy sud, hamda Qoraqalpog'iston Respublikasi, viloyatlar, tuman va shaharlarning sudlari kiradi." },
    { id: "amendment", question: "Konstitutsiyaga qanday o'zgartirish kiritiladi?", keywords: ["o'zgartirish","tuzatish","referendum","konstitutsiyaga o'zgartirish"],
      answer: "Konstitutsiyaga o'zgartirish kiritish, o'zgartirilayotgan qismiga qarab, Oliy Majlis ikkala palatasining qo'shma majlisida uchdan ikki ovoz bilan yoki umumxalq referendumi orqali amalga oshiriladi." },
  ],
  ko: [
    { id: "adoption", question: "헌법은 언제 채택되었나요?", keywords: ["언제","채택","역사","1992","2023","국민투표"],
      answer: "우즈베키스탄 공화국의 원래 헌법은 1992년 12월 8일에 채택되었습니다. 2023년 4월 30일 전국 국민투표를 통해 대폭 개정되었으며, 새 헌법은 2023년 5월 1일부터 발효되었습니다." },
    { id: "article-41", question: "41조는 무엇에 관한 것인가요?", keywords: ["41조","41","교육","학교"],
      answer: "41조는 교육받을 권리를 보장합니다. 국가는 무상 일반 중등교육과 초급 직업교육을 보장하며, 중등 전문교육과 고등교육은 법률에 따라 모두에게 개방됩니다." },
    { id: "citizens-rights", question: "시민의 권리는 무엇인가요?", keywords: ["시민","권리","자유","인권"],
      answer: "헌법 제2부는 인간과 시민의 권리 및 자유를 규정합니다 — 생명과 자유 같은 인격권, 투표와 언론의 자유 같은 정치적 권리, 교육·의료·노동 같은 경제·사회·문화적 권리가 포함됩니다. 모든 시민은 법 앞에 평등합니다." },
    { id: "state-language", question: "국가 공용어는 무엇인가요?", keywords: ["국가 공용어","공용어","언어","우즈베크어"],
      answer: "제4조에 따라 우즈베크어가 우즈베키스탄 공화국의 국가 공용어입니다. 국가는 또한 국내에 거주하는 모든 민족과 인민의 언어, 관습, 전통에 대한 존중을 보장합니다." },
    { id: "article-count", question: "조항은 몇 개인가요?", keywords: ["조항","몇 개","장","부"],
      answer: "2023년 헌법 개정 이후, 헌법은 6부 27장 155개 조항으로 구성되어 있습니다 — 1992년 원본의 128개 조항보다 늘어났습니다." },
    { id: "president", question: "대통령은 어떻게 선출되나요?", keywords: ["대통령","선출","임기","7년","선거","국가원수"],
      answer: "대통령은 국가 원수로서, 제90조에 따라 국민의 직접 투표로 7년 임기로 선출됩니다 — 2023년 개혁으로 5년에서 연장되었습니다. 대통령은 연속 2회를 초과하여 재임할 수 없습니다." },
    { id: "parliament", question: "올리 마즐리스란 무엇인가요?", keywords: ["올리 마즐리스","의회","입법원","상원","세나트","의원"],
      answer: "올리 마즐리스는 우즈베키스탄의 최고 입법기관입니다. 양원제로 구성되며, 하원인 입법원(선출된 150명의 의원)과 지역을 대표하는 상원인 세나트(100명)로 이루어져 있으며, 임기는 모두 5년입니다." },
    { id: "judiciary", question: "사법부는 어떻게 구성되나요?", keywords: ["사법부","법원","헌법재판소","대법원","판사"],
      answer: "사법권은 입법부 및 행정부로부터 독립되어 있습니다. 여기에는 헌법재판소, 대법원, 그리고 카라칼파크스탄 공화국·주·구·시의 법원들이 포함됩니다." },
    { id: "amendment", question: "헌법은 어떻게 개정되나요?", keywords: ["개정","헌법 개정","국민투표","수정"],
      answer: "헌법 개정은 개정되는 부분에 따라 올리 마즐리스 양원 합동 회의에서 3분의 2 찬성을 얻거나, 전국 국민투표를 통해 승인받아야 합니다." },
  ],
};

const FAQ_IDS = ["adoption","article-41","citizens-rights","state-language","article-count"];

/* ============================================================
   2. RETRIEVAL (keyword + lightweight bag-of-words scoring)
   This is the layer to replace with real embedding search
   (e.g. sentence-transformers + FAISS) on a Flask backend.
   ============================================================ */
function scoreItem(query, item) {
  const q = query.toLowerCase();
  let score = 0;
  item.keywords.forEach(kw => {
    if (q.includes(kw.toLowerCase())) score += kw.split(' ').length * 2;
  });
  const words = q.split(/\s+/).filter(w => w.length > 2);
  const answerLower = item.answer.toLowerCase();
  words.forEach(w => { if (answerLower.includes(w)) score += 1; });
  return score;
}

/** FAQ mode: keyword match restricted to the 5 curated questions. */
function findFaqAnswer(query, lang) {
  const kb = KNOWLEDGE_BASE[lang].filter(item => FAQ_IDS.includes(item.id));
  let best = null, bestScore = 0;
  kb.forEach(item => {
    const s = scoreItem(query, item);
    if (s > bestScore) { bestScore = s; best = item; }
  });
  return best;
}

/**
 * AI mode: broader retrieval across the full 9-item knowledge base,
 * returns the top match(es) with a source citation. This is retrieval
 * only (no generative synthesis) — the answer text is the retrieved
 * passage itself, honestly labeled as such in the UI.
 *
 * ---- BACKEND INTEGRATION (Flask + vector search + LLM) ----
 * async function getAIResponse(query, lang) {
 *   const res = await fetch('/api/rag-ask', {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/json' },
 *     body: JSON.stringify({ question: query, lang })
 *   });
 *   const data = await res.json();
 *   return { answer: data.answer, sources: data.sources };
 * }
 * Matching Flask route would: embed the query, run a similarity search
 * over embedded Constitution chunks (e.g. FAISS/Chroma), pass the top
 * chunks + question to an LLM to generate a grounded answer, and return
 * both the generated answer and the source article(s) used.
 */
function getAIMatches(query, lang, topK = 2) {
  const kb = KNOWLEDGE_BASE[lang];
  const scored = kb.map(item => ({ item, score: scoreItem(query, item) })).filter(s => s.score > 0);
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK).map(s => s.item);
}

/* ============================================================
   3. i18n (UZ / EN / KO)
   ============================================================ */
const uiStrings = {
  uz: {
    headerSub: "O'zbekiston Respublikasi Asosiy Qonuni bo'yicha yordamchi",
    online: "Onlayn",
    aboutTitle: "Loyiha haqida",
    aboutText: "Bu yordamchi O'zbekiston Respublikasi Konstitutsiyasi bo'yicha savollarga javob beradi — 1992-yilda qabul qilingan va 2023-yilgi umumxalq referendumi bilan keng qamrovli yangilangan.",
    statAdopted: "Qabul qilingan", statRenewed: "Yangilangan", statArticles: "Moddalar",
    sampleQTitle: "Namuna Savollar",
    devLabel: "Dasturchi",
    modeFaq: "FAQ", modeAi: "AI",
    modeFaqDesc: "5 ta tayyor savoldan tezkor javob",
    modeAiDesc: "Konstitutsiya matnidan qidirib, manba bilan javob beradi (RAG)",
    inputPlaceholder: "Konstitutsiya haqida so'rang…",
    landing: "Salom! Men AsosAI — O'zbekiston Konstitutsiyasi bo'yicha yordamchiman. FAQ rejimida tayyor savollardan tanlang, yoki AI rejimiga o'tib istalgan savolingizni bering.",
    fallback: "Bu savolga ishonchli javobim yo'q. Quyidagi namuna savollardan birini tanlang yoki Konstitutsiyaning qabul qilingan sanasi, moddalari, fuqarolar huquqi, davlat tili yoki tuzilishi haqida so'rang.",
    sourceLabel: "Manba",
    typing: "Yozmoqda...",
    aiLanding: "Bu — AI rejimi (alohida suhbat). Hozircha bu yerda haqiqiy AI backend ulanmagan — savolingizni yozing, tizim qanday javob qaytarishini ko'rasiz.",
    aiNotConnected: "AI backend hali ulanmagan. Bu — namuna javob: savolingiz qabul qilindi va Flask + LLM backendga yuborilishi kerak edi. Ulanganda, bu yerda haqiqiy AI javobi chiqadi.",
  },
  en: {
    headerSub: "Your guide to the Basic Law of the Republic of Uzbekistan",
    online: "Online",
    aboutTitle: "About",
    aboutText: "This assistant answers questions about the Constitution of the Republic of Uzbekistan — adopted in 1992 and comprehensively renewed by national referendum in 2023.",
    statAdopted: "Adopted", statRenewed: "Renewed", statArticles: "Articles",
    sampleQTitle: "Sample Questions",
    devLabel: "Developer",
    modeFaq: "FAQ", modeAi: "AI",
    modeFaqDesc: "Instant answers from 5 curated questions",
    modeAiDesc: "Searches the Constitution and cites its source (RAG)",
    inputPlaceholder: "Ask about the Constitution…",
    landing: "Hello! I am AsosAI, your Uzbekistan Constitution assistant. Pick a curated question in FAQ mode, or switch to AI mode to ask anything.",
    fallback: "I don't have a confident answer for that yet. Try one of the sample questions below, or ask about the Constitution's adoption date, a specific article, citizens' rights, the state language, or its structure.",
    sourceLabel: "Source",
    typing: "Typing...",
    aiLanding: "This is AI mode (a separate conversation). No real AI backend is connected yet — send a question to see how the response will look once it is.",
    aiNotConnected: "The AI backend isn't connected yet. This is a placeholder response: your question was received and would normally be sent to a Flask + LLM backend. Once connected, a real AI-generated answer will appear here.",
  },
  ko: {
    headerSub: "우즈베키스탄 공화국 헌법 안내 도우미",
    online: "온라인",
    aboutTitle: "소개",
    aboutText: "이 어시스턴트는 우즈베키스탄 공화국 헌법에 대한 질문에 답합니다 — 1992년에 채택되었고 2023년 국민투표로 대폭 개정되었습니다.",
    statAdopted: "채택일", statRenewed: "개정일", statArticles: "조항 수",
    sampleQTitle: "예시 질문",
    devLabel: "개발자",
    modeFaq: "FAQ", modeAi: "AI",
    modeFaqDesc: "선별된 5개 질문에 대한 즉시 답변",
    modeAiDesc: "헌법 본문을 검색하여 출처와 함께 답변 (RAG)",
    inputPlaceholder: "헌법에 대해 질문하세요…",
    landing: "안녕하세요! 저는 우즈베키스탄 헌법 도우미 AsosAI입니다. FAQ 모드에서 선별된 질문을 고르거나, AI 모드로 전환해 자유롭게 질문해보세요.",
    fallback: "아직 확실한 답변이 없습니다. 아래 예시 질문 중 하나를 선택하거나, 헌법의 채택일, 특정 조항, 시민의 권리, 공용어, 또는 구조에 대해 질문해보세요.",
    sourceLabel: "출처",
    typing: "입력 중...",
    aiLanding: "여기는 AI 모드(별도의 대화)입니다. 아직 실제 AI 백엔드가 연결되어 있지 않습니다 — 질문을 보내면 연결 후 응답이 어떻게 보일지 확인할 수 있습니다.",
    aiNotConnected: "AI 백엔드가 아직 연결되지 않았습니다. 이것은 임시 응답입니다: 질문은 접수되었으며 원래는 Flask + LLM 백엔드로 전송되어야 합니다. 연결되면 실제 AI 생성 답변이 여기에 표시됩니다.",
  },
};

let currentLang = 'uz';
let currentMode = 'faq';

function applyLang(lang) {
  const t = uiStrings[lang];
  if (!t) return;
  currentLang = lang;
  document.documentElement.lang = lang;

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (t[key] !== undefined) el.textContent = t[key];
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.dataset.i18nPlaceholder;
    if (t[key] !== undefined) el.placeholder = t[key];
  });

  // sample question button labels pull from the knowledge base itself
  document.querySelectorAll('[data-i18n-q]').forEach(el => {
    const id = el.dataset.i18nQ;
    const item = KNOWLEDGE_BASE[lang].find(k => k.id === id);
    if (item) el.textContent = item.question;
  });

  document.querySelectorAll('.lang-switch button').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.uiLang === lang);
  });

  document.getElementById('modeDesc').textContent = currentMode === 'faq' ? t.modeFaqDesc : t.modeAiDesc;
}

document.querySelectorAll('.lang-switch button').forEach(btn => {
  btn.addEventListener('click', () => applyLang(btn.dataset.uiLang));
});


/* ============================================================
   4. MODE SWITCH (FAQ / AI) — two independent chat panels
   ============================================================ */
const chatMessagesFaq = document.getElementById('chatMessagesFaq');
const chatMessagesAi  = document.getElementById('chatMessagesAi');

function activePanel() {
  return currentMode === 'faq' ? chatMessagesFaq : chatMessagesAi;
}

document.querySelectorAll('.mode-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    currentMode = btn.dataset.mode;
    document.querySelectorAll('.mode-btn').forEach(b => b.classList.toggle('active', b === btn));
    document.getElementById('modeDesc').textContent =
      currentMode === 'faq' ? uiStrings[currentLang].modeFaqDesc : uiStrings[currentLang].modeAiDesc;

    chatMessagesFaq.hidden = currentMode !== 'faq';
    chatMessagesAi.hidden = currentMode !== 'ai';

    if (currentMode === 'ai' && !chatMessagesAi.dataset.initialized) {
      chatMessagesAi.dataset.initialized = '1';
      addMessage(uiStrings[currentLang].aiLanding, 'bot');
    }
    updateScrollFab();
    userInput.focus();
  });
});

/* ============================================================
   5. DOM REFERENCES
   ============================================================ */
const typingIndicator = document.getElementById('typingIndicator');
const chatForm         = document.getElementById('chatForm');
const userInput         = document.getElementById('userInput');
const sendBtn            = document.getElementById('sendBtn');
const scrollFab           = document.getElementById('scrollFab');
const sampleQuestions      = document.getElementById('sampleQuestions');
const sidebar                = document.getElementById('sidebar');
const sidebarToggle           = document.getElementById('sidebarToggle');
const sidebarClose             = document.getElementById('sidebarClose');
const sidebarOverlay            = document.getElementById('sidebarOverlay');

// Per-panel message-grouping state (FAQ and AI keep separate histories)
const panelState = {
  faq: { lastGroup: null, lastSender: null },
  ai:  { lastGroup: null, lastSender: null },
};
let isSending = false;

/* ============================================================
   6. RENDERING HELPERS
   ============================================================ */
function formatTime(date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
function isNearBottom() {
  const el = activePanel();
  return el.scrollHeight - el.scrollTop - el.clientHeight < 80;
}
function scrollToBottom(smooth = true) {
  const el = activePanel();
  el.scrollTo({ top: el.scrollHeight, behavior: smooth ? 'smooth' : 'auto' });
}
function updateScrollFab() {
  scrollFab.hidden = isNearBottom();
}

function addMessage(text, sender) {
  const container = activePanel();
  const state = panelState[currentMode];

  const shouldStartNewGroup = sender !== state.lastSender || !state.lastGroup;

  if (shouldStartNewGroup) {
    state.lastGroup = document.createElement('div');
    state.lastGroup.className = `msg-group ${sender}`;
    container.appendChild(state.lastGroup);
  }
  if (sender === 'bot') {
    state.lastGroup.querySelectorAll('.msg-row').forEach(row => row.classList.remove('avatar-visible'));
  }

  const row = document.createElement('div');
  row.className = `msg-row${sender === 'bot' ? ' avatar-visible' : ''}`;
  if (sender === 'bot') {
    row.insertAdjacentHTML('afterbegin',
      `<span class="avatar avatar--bot"><svg class="icon"><use href="#icon-seal"/></svg></span>`);
  }

  const content = document.createElement('div');
  content.className = 'msg-content';

  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  bubble.textContent = text;

  const time = document.createElement('span');
  time.className = 'msg-time';
  time.textContent = formatTime(new Date());

  content.append(bubble, time);
  row.appendChild(content);
  state.lastGroup.appendChild(row);
  state.lastSender = sender;

  scrollToBottom();
  updateScrollFab();
  return row;
}

/** FAQ mode only: shows which knowledge-base entries the answer was drawn from. */
function addSourceRow(items) {
  if (!items.length) return;
  const container = activePanel();
  const row = document.createElement('div');
  row.className = 'source-row';
  const label = document.createElement('span');
  label.style.fontSize = '10.5px';
  label.style.color = 'var(--ink-35)';
  label.textContent = uiStrings[currentLang].sourceLabel + ':';
  row.appendChild(label);
  items.forEach(item => {
    const badge = document.createElement('span');
    badge.className = 'source-badge';
    badge.textContent = item.question;
    row.appendChild(badge);
  });
  container.appendChild(row);
  scrollToBottom();
  updateScrollFab();
}

function addChips(excludeId) {
  if (currentMode !== 'faq') return; // sample-question chips only make sense in FAQ mode
  const container = activePanel();
  const kb = KNOWLEDGE_BASE[currentLang].filter(i => FAQ_IDS.includes(i.id));
  const remaining = kb.filter(item => item.id !== excludeId).slice(0, 3);
  if (!remaining.length) return;

  const row = document.createElement('div');
  row.className = 'chip-row';
  remaining.forEach(item => {
    const chip = document.createElement('button');
    chip.className = 'chip';
    chip.type = 'button';
    chip.textContent = item.question;
    chip.addEventListener('click', () => sendMessage(item.question));
    row.appendChild(chip);
  });
  container.appendChild(row);
  scrollToBottom();
  updateScrollFab();
}

function showTyping() {
  typingIndicator.hidden = false;
  scrollToBottom();
}
function hideTyping() {
  typingIndicator.hidden = true;
}

/* ============================================================
   7. SEND MESSAGE FLOW
   The whole body runs inside try/finally so a single unexpected
   error can never permanently lock the input (isSending is always
   reset), and any failure is shown to the user instead of failing
   silently.
   ============================================================ */
async function sendMessage(text) {
  let message = '';
  try {
    message = (text ?? userInput.value ?? '').trim();
  } catch (e) {
    message = '';
  }
  if (!message || isSending) return;

  isSending = true;
  updateSendButtonState();

  try {
    addMessage(message, 'user');
    userInput.value = '';
    updateSendButtonState();
    showTyping();

    const typingDelay = 350 + Math.random() * 350;
    await new Promise(resolve => setTimeout(resolve, typingDelay));
    hideTyping();

if (currentMode === 'faq') {
  // FAQ MODE
  const match = findFaqAnswer(message, currentLang);
  const answer = match
    ? match.answer
    : uiStrings[currentLang].fallback;

  addMessage(answer, 'bot');
  addChips(match ? match.id : null);

} else {
  // AI MODE → FastAPI → Ollama → Qwen

  try {
    const response = await fetch(
      'https://psoriatic-unsharply-stefani.ngrok-free.dev/chat',
      {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json'
        },

        body: JSON.stringify({
          message: message
        })
      }
    );

    if (!response.ok) {
      throw new Error(
        `AI server xatosi: ${response.status}`
      );
    }

    const data = await response.json();

    // FastAPI javobi: { "answer": "..." }
    if (data.answer) {
      addMessage(data.answer, 'bot');
    } else {
      throw new Error(
        data.error || 'AI javob qaytarmadi.'
      );
    }

  } catch (error) {
    console.error('AI Backend Error:', error);

    addMessage(
      "⚠️ AI server bilan bog'lanib bo'lmadi. " +
      "Server va tunnel ishlayotganini tekshiring.",
      'bot'
    );
  }
}
  } catch (err) {
    hideTyping();
    console.error('AsosAI sendMessage error:', err);
    addMessage("⚠ " + (err && err.message ? err.message : "Something went wrong."), 'bot');
  } finally {
    isSending = false;
    updateSendButtonState();
    userInput.focus();
  }
}

function updateSendButtonState() {
  sendBtn.disabled = userInput.value.trim().length === 0 || isSending;
}

/* ============================================================
   8. EVENT WIRING
   ============================================================ */
chatForm.addEventListener('submit', (e) => {
  e.preventDefault();
  sendMessage();
});
userInput.addEventListener('input', updateSendButtonState);
userInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

sampleQuestions.addEventListener('click', (e) => {
  const btn = e.target.closest('.sample-q');
  if (!btn) return;
  const item = KNOWLEDGE_BASE[currentLang].find(k => k.id === btn.dataset.qid);
  sendMessage(item ? item.question : btn.dataset.qid);
  closeSidebarOnMobile();
});

chatMessagesFaq.addEventListener('scroll', updateScrollFab);
chatMessagesAi.addEventListener('scroll', updateScrollFab);
scrollFab.addEventListener('click', () => scrollToBottom());

function openSidebar() {
  sidebar.classList.add('open');
  sidebarOverlay.classList.add('visible');
  sidebarToggle.setAttribute('aria-expanded', 'true');
}
function closeSidebar() {
  sidebar.classList.remove('open');
  sidebarOverlay.classList.remove('visible');
  sidebarToggle.setAttribute('aria-expanded', 'false');
}
function closeSidebarOnMobile() {
  if (window.innerWidth <= 880) closeSidebar();
}
sidebarToggle.addEventListener('click', () => {
  sidebar.classList.contains('open') ? closeSidebar() : openSidebar();
});
sidebarClose.addEventListener('click', closeSidebar);
sidebarOverlay.addEventListener('click', closeSidebar);
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && sidebar.classList.contains('open')) closeSidebar();
});

/* Safety net: never let an uncaught error silently break the page with no trace. */
window.addEventListener('error', (e) => {
  console.error('AsosAI uncaught error:', e.error || e.message);
});
window.addEventListener('unhandledrejection', (e) => {
  console.error('AsosAI unhandled promise rejection:', e.reason);
  isSending = false; // never leave the input permanently locked
});

/* ============================================================
   9. INIT
   ============================================================ */
window.addEventListener('DOMContentLoaded', () => {
  applyLang('uz');
  currentMode = 'faq';
  addMessage(uiStrings['uz'].landing, 'bot');
  addChips(null);
  updateSendButtonState();
  userInput.focus();
});
