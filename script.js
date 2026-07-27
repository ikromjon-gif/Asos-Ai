/* ==========================================================================
   Uzbekistan Constitution AI Chatbot — script.js
   Pure vanilla JS, no dependencies, no backend required to run as-is.

   Architecture:
     1. FAQ_DATA / answer resolution   — the ONLY layer to touch for a
                                          Flask + faq.json backend.
     2. UI state & rendering           — message grouping, chips, scroll.
     3. Event wiring                   — form submit, sidebar, chips.
   ========================================================================== */

/* ============================================================
   1. DATA LAYER
   ============================================================ */
const FAQ_DATA = [
  {
    id: "adoption-date",
    question: "When was the Constitution adopted?",
    keywords: ["when", "adopt", "adopted", "date", "history", "1992", "2023", "referendum"],
    answer: "The original Constitution of the Republic of Uzbekistan was adopted on December 8, 1992, by the Supreme Council. It was comprehensively updated through a nationwide referendum on April 30, 2023, and the revised text took effect on May 1, 2023."
  },
  {
    id: "article-41",
    question: "What is Article 41?",
    keywords: ["article 41", "41", "education", "school"],
    answer: "Article 41 protects the right to education. The state guarantees free general secondary and primary vocational education, while secondary specialized and higher education are made accessible to everyone in accordance with the law."
  },
  {
    id: "citizens-rights",
    question: "What are citizens' rights?",
    keywords: ["citizens", "rights", "freedoms", "human rights", "civil rights"],
    answer: "Part Two of the Constitution sets out human and civil rights and freedoms. It covers personal rights such as life, liberty and dignity, political rights such as voting, association and free speech, and economic, social and cultural rights such as education, health care, work and a healthy environment. All citizens are equal before the law."
  },
  {
    id: "state-language",
    question: "What is the state language?",
    keywords: ["state language", "official language", "language", "uzbek language"],
    answer: "Uzbek is the state language of the Republic of Uzbekistan under Article 4. The state also guarantees respect for the languages, customs and traditions of all nationalities and peoples living in the country."
  },
  {
    id: "article-count",
    question: "How many articles are there?",
    keywords: ["how many articles", "articles", "chapters", "parts", "sections", "number of articles"],
    answer: "Following the 2023 constitutional reform, the Constitution now contains 155 articles organized into 6 parts and 27 chapters — up from 128 articles in the original 1992 version."
  }
];

const FALLBACK_ANSWER =
  "I don't have a confident answer for that yet. Try one of the sample questions below, or ask about the Constitution's adoption date, a specific article, citizens' rights, the state language, or the number of articles.";

const LANDING_MESSAGE =
  "Hello! I am your Uzbekistan Constitution AI Assistant. Ask me anything about the Constitution.";

/**
 * Resolves an answer for free-text input using local keyword matching.
 * Kept separate from getBotResponse() so the matching strategy can evolve
 * independently of how the answer is fetched.
 */
function findLocalAnswer(userText) {
  const normalized = userText.toLowerCase().trim();
  if (!normalized) return FALLBACK_ANSWER;

  let bestMatch = null;
  let bestScore = 0;

  FAQ_DATA.forEach(item => {
    let score = 0;
    item.keywords.forEach(keyword => {
      if (normalized.includes(keyword.toLowerCase())) {
        score += keyword.split(' ').length; // multi-word keywords score higher
      }
    });
    if (score > bestScore) {
      bestScore = score;
      bestMatch = item;
    }
  });

  return bestMatch ? bestMatch.answer : FALLBACK_ANSWER;
}

/**
 * Single entry point for getting a bot reply. This is the ONLY function
 * you need to change to connect a Flask backend — everything else in this
 * file is UI plumbing and does not need to change.
 *
 *   async function getBotResponse(userText) {
 *     const res = await fetch('/api/ask', {
 *       method: 'POST',
 *       headers: { 'Content-Type': 'application/json' },
 *       body: JSON.stringify({ question: userText })
 *     });
 *     if (!res.ok) throw new Error('Request failed');
 *     const data = await res.json();
 *     return data.answer;
 *   }
 *
 * Matching Flask route:
 *
 *   @app.route('/api/ask', methods=['POST'])
 *   def ask():
 *       question = request.json.get('question', '')
 *       with open('faq.json') as f:
 *           faq = json.load(f)
 *       answer = match_question(question, faq)
 *       return jsonify({'answer': answer})
 */
async function getBotResponse(userText) {
  return findLocalAnswer(userText);
}

/* ============================================================
   2. DOM REFERENCES
   ============================================================ */
const chatMessages    = document.getElementById('chatMessages');
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

let lastGroup = null;   // currently open <div class="msg-group">
let lastSender = null;  // 'bot' | 'user'
let isSending = false;

/* ============================================================
   3. RENDERING HELPERS
   ============================================================ */
function formatTime(date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function isNearBottom() {
  const { scrollTop, scrollHeight, clientHeight } = chatMessages;
  return scrollHeight - scrollTop - clientHeight < 80;
}

function scrollToBottom(smooth = true) {
  chatMessages.scrollTo({ top: chatMessages.scrollHeight, behavior: smooth ? 'smooth' : 'auto' });
}

function updateScrollFab() {
  scrollFab.hidden = isNearBottom();
}

/** Adds a message bubble, grouping consecutive same-sender messages. */
function addMessage(text, sender) {
  const shouldStartNewGroup = sender !== lastSender || !lastGroup;

  if (shouldStartNewGroup) {
    lastGroup = document.createElement('div');
    lastGroup.className = `msg-group ${sender}`;
    chatMessages.appendChild(lastGroup);
  }

  // Only the last message in a bot group keeps its avatar visible.
  if (sender === 'bot') {
    lastGroup.querySelectorAll('.msg-row').forEach(row => row.classList.remove('avatar-visible'));
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
  lastGroup.appendChild(row);

  lastSender = sender;

  const wasNearBottom = isNearBottom();
  if (wasNearBottom) scrollToBottom();
  updateScrollFab();
}

/** Shows follow-up suggestion chips (FAQ questions other than the one just asked). */
function addChips(excludeId) {
  const remaining = FAQ_DATA.filter(item => item.id !== excludeId).slice(0, 3);
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
  chatMessages.appendChild(row);

  if (isNearBottom()) scrollToBottom();
  updateScrollFab();
}

function showTyping() {
  typingIndicator.hidden = false;
  if (isNearBottom()) scrollToBottom();
}
function hideTyping() {
  typingIndicator.hidden = true;
}

/* ============================================================
   4. SEND MESSAGE FLOW
   ============================================================ */
async function sendMessage(text) {
  const message = (text ?? userInput.value).trim();
  if (!message || isSending) return;

  isSending = true;
  addMessage(message, 'user');
  userInput.value = '';
  updateSendButtonState();

  showTyping();
  const typingDelay = 450 + Math.random() * 450; // feels more natural than instant

  try {
    const matched = FAQ_DATA.find(item =>
      item.keywords.some(k => message.toLowerCase().includes(k.toLowerCase()))
    );
    const [answer] = await Promise.all([
      getBotResponse(message),
      new Promise(resolve => setTimeout(resolve, typingDelay))
    ]);
    hideTyping();
    addMessage(answer, 'bot');
    addChips(matched ? matched.id : null);
  } catch (err) {
    hideTyping();
    addMessage("Something went wrong while looking that up. Please try again.", 'bot');
  } finally {
    isSending = false;
    userInput.focus();
  }
}

function updateSendButtonState() {
  sendBtn.disabled = userInput.value.trim().length === 0 || isSending;
}

/* ============================================================
   5. EVENT WIRING
   ============================================================ */
chatForm.addEventListener('submit', (e) => {
  e.preventDefault();
  sendMessage();
});

userInput.addEventListener('input', updateSendButtonState);

sampleQuestions.addEventListener('click', (e) => {
  const btn = e.target.closest('.sample-q');
  if (!btn) return;
  sendMessage(btn.dataset.q);
  closeSidebarOnMobile();
});

chatMessages.addEventListener('scroll', updateScrollFab);
scrollFab.addEventListener('click', () => scrollToBottom());

/* Mobile sidebar */
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

/* ============================================================
   6. INITIAL STATE
   ============================================================ */
window.addEventListener('DOMContentLoaded', () => {
  addMessage(LANDING_MESSAGE, 'bot');
  addChips(null);
  updateSendButtonState();
  userInput.focus();
});
