# Uzbekistan Constitution AI Chatbot

Toza HTML/CSS/JS (backend yo'q). Palitra: **oq, qora (near-black) va yashil**
(yashil — yagona urg'u rangi: tugmalar, chip'lar, status, statistikalar;
qora — matn/muhr; oq — sirt). Senior frontend darajasida: design-token
asosidagi CSS tizimi, xabarlarni guruhlash, har javobdan keyingi savol-chip'lari,
"pastga tushish" floating tugmasi, status pill, SVG icon-sprite.

Uch faylga bo'lingan:

- `index.html` — struktura + SVG icon-sprite (`<symbol>`larda)
- `style.css` — dizayn tokenlari, glassmorphism, animatsiyalar, responsive
- `script.js` — chat logikasi, xabar guruhlash, chip'lar, scroll-FAB



## Hozir qanday ishlaydi

`script.js` ichidagi `FAQ_DATA` massivida savol/kalit so'z/javob saqlanadi.
Foydalanuvchi savol yozganda, `findLocalAnswer()` kalit so'zlarni solishtirib
eng mos javobni topadi — hech qanday server kerak emas.

## Flask + faq.json bilan ulash

`script.js` ichida faqat **bitta** funksiyani o'zgartirish kifoya:
`getBotResponse(userText)`. Uning ichida tayyor izohli misol bor:

```js
const res = await fetch('/api/ask', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ question: userText })
});
const data = await res.json();
return data.answer;
```

Flask tomonida mos route:

```python
@app.route('/api/ask', methods=['POST'])
def ask():
    question = request.json.get('question', '')
    with open('faq.json') as f:
        faq = json.load(f)
    answer = match_question(question, faq)
    return jsonify({'answer': answer})
```

`faq.json` formati `FAQ_DATA` bilan bir xil bo'lishi kerak:

```json
[
  {
    "id": "adoption-date",
    "question": "When was the Constitution adopted?",
    "keywords": ["when", "adopted", "1992", "2023"],
    "answer": "..."
  }
]
```

UI kodini (HTML/CSS, tugmalar, scroll, typing animatsiya) o'zgartirish shart emas.

## Dasturchi rasmi

Sahifa pastida (chap panelda) "Tojiboev Ikromjon" ismi va emaili chiqadi.
Rasm ko'rinishi uchun:

1. Rasmingizni `developer.jpg` deb nomlang.
2. Uni `index.html`, `style.css`, `script.js` bilan bir xil papkaga qo'ying.
3. Deploy qilganda avtomatik chiqadi. Fayl topilmasa, "TI" harflari bilan
   doira ko'rsatiladi — sahifa buzilmaydi.

## GitHub Pages orqali deploy

1. Repo yarating, shu 3 faylni (va ixtiyoriy `developer.jpg` ni) yuklang.
2. **Settings → Pages → Source: Deploy from a branch**, branch `main`, folder `/root`.
3. Bir necha daqiqadan so'ng `https://username.github.io/repo-nomi/` da ishlaydi.
