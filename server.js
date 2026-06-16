const express = require('express');
const cors = require('cors');
const path = require('path'); // 引入 path 模組
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(cors());
app.use(express.json());

// 【新增這行】將目前資料夾下的檔案設為靜態檔案，這樣就可以讀取 index.html
app.use(express.static(__dirname));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/api/analyze', async (req, res) => {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: '請提供文字內容' });
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `請解析以下文字，提取金額（數字）、消費類別（字串）、心情（字串）。文字: "${text}"。請僅回傳 JSON，格式：{"amount": 0, "category": "", "mood": ""}`;
        const result = await model.generateContent(prompt);
        const jsonText = result.response.text().replace(/```json|```/g, '').trim();
        res.json({ success: true, data: JSON.parse(jsonText) });
    } catch (error) {
        res.status(500).json({ error: 'AI 解析失敗', details: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`伺服器已啟動！`);
    console.log(`請在瀏覽器開啟此網址： http://localhost:${PORT}`);
});