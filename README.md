# AsosAI — Konstitutsiya Yordamchisi

Toza HTML/CSS/JS (backend yo'q). Ism — o'zbekcha "Asosiy Qonun" (Konstitutsiya)
so'zidan. Palitra: oq, qora (near-black) va yashil. **3 til: UZ / EN / KO** va
**ikki rejim: FAQ va AI**.

explain video link :https://lnkd.in/p/gMmdB_jj

## Ikki rejim farqi

- **FAQ rejimi** — 5 ta tayyor savoldan kalit so'z bo'yicha tezkor javob (klassik FAQ bot).
- **AI rejimi** — Konstitutsiyaning 9 ta mavzusidan iborat kengroq bazadan qidiradi,
  javob ostida qaysi modda/mavzudan olinganini **manba** sifatida ko'rsatadi — bu
  RAG (Retrieval-Augmented Generation) arxitekturasining "qidiruv" qismini taqlid qiladi.

**Halol ogohlantirish:** hozircha bu faqat **qidiruv** (retrieval) — haqiqiy LLM
generatsiyasi yo'q, ya'ni javob toifasidagi eng mos matn to'g'ridan-to'g'ri
qaytariladi, "sintez qilinmaydi". Haqiqiy RAG uchun quyidagi bo'limga qarang.

## Haqiqiy RAG backend bilan ulash

`script.js`dagi `getAIMatches()` funksiyasi hozir oddiy kalit-so'z skorlash bilan
ishlaydi. Buni haqiqiy vektor qidiruv + LLM bilan almashtirish uchun izohli
misol funksiya ichida keltirilgan:

```js
async function getAIResponse(query, lang) {
  const res = await fetch('/api/rag-ask', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question: query, lang })
  });
  const data = await res.json();
  return { answer: data.answer, sources: data.sources };
}
```

Flask tomonida taxminiy oqim:

```python
@app.route('/api/rag-ask', methods=['POST'])
def rag_ask():
    question = request.json.get('question', '')
    lang = request.json.get('lang', 'uz')
    query_embedding = embed(question)                    # sentence-transformers
    top_chunks = vector_db.search(query_embedding, k=3)   # FAISS / Chroma
    answer = llm_generate(question, top_chunks)           # OpenAI/Anthropic/local LLM
    return jsonify({'answer': answer, 'sources': [c.title for c in top_chunks]})
```

FAQ rejimi (`findFaqAnswer`) ga tegishning hojati yo'q — u alohida, sodda kalit-so'z
mosligicha qoladi (haqiqiy FAQ botlar odatda shunday ishlaydi).

## Bilim bazasini kengaytirish

`KNOWLEDGE_BASE` obyekti (`script.js` boshida) har bir til uchun 9 ta yozuvdan
iborat: `{ id, question, keywords, answer }`. Yangi mavzu qo'shish uchun har uch
tilga (`uz`, `en`, `ko`) bittadan yozuv qo'shing — ID bir xil bo'lishi kerak.

## Til almashtirish

Yuqori o'ng burchakdagi UZ/EN/KO tugmalari orqali interfeys matni, namuna
savollar va bilim bazasi tili almashadi. Standart til — o'zbekcha.

## Rasm (developer.jpg)

Sidebar pastida "Tojiboev Ikromjon" ismi chiqadi. `developer.jpg` faylini shu
papkaga qo'ysangiz avtomatik ko'rinadi; bo'lmasa "TI" harflari chiqadi.

## Deploy (Vercel yoki GitHub Pages)

1. `index.html`, `style.css`, `script.js` (va ixtiyoriy `developer.jpg`) — bitta repo.
2. **Vercel**: Framework Preset — "Other", Build/Output — bo'sh.
3. **GitHub Pages**: Settings → Pages → Deploy from branch → `main` / root.
