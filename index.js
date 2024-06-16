const express = require('express');
const { Aki } = require('aki-api');
const app = express();
const port = 3000;

let aki;

// نقطة النهاية لعرض الشرح
app.get('/', (req, res) => {
    res.send(`
        <h1>مرحبًا بك في Akinator API</h1>
        <p>يمكنك استخدام النقاط النهائية التالية للتفاعل مع Akinator:</p>
        <ul>
            <li>
                <strong>بدء اللعبة:</strong> 
                <code>/start?region=en&childMode=false</code> 
                - لبدء لعبة جديدة. يمكنك تغيير <code>region</code> و<code>childMode</code> إذا رغبت في ذلك.
            </li>
            <li>
                <strong>الإجابة على سؤال:</strong> 
                <code>/step?answer=yes</code> 
                - للإجابة على السؤال الحالي. الإجابات الممكنة هي: <code>yes</code>, <code>no</code>, <code>dont_know</code>, <code>probably</code>, <code>probably_not</code>.
            </li>
            <li>
                <strong>الحصول على التخمين:</strong> 
                <code>/answer</code> 
                - للحصول على تخمين Akinator.
            </li>
        </ul>
    `);
});

// نقطة النهاية لبدء اللعبة
app.get('/start', async (req, res) => {
    const region = req.query.region || 'en';
    const childMode = req.query.childMode === 'true';

    aki = new Aki({ region, childMode });
    await aki.start();

    res.json({
        question: aki.question,
        answers: aki.answers
    });
});

// نقطة النهاية للإجابة على سؤال
app.get('/step', async (req, res) => {
    if (!aki) return res.status(400).json({ error: 'Game has not started' });

    const answerMap = {
        "yes": 0,
        "no": 1,
        "dont_know": 2,
        "probably": 3,
        "probably_not": 4
    };

    const answer = req.query.answer;
    const myAnswer = answerMap[answer.toLowerCase()];

    if (myAnswer === undefined) {
        return res.status(400).json({ error: 'Invalid answer' });
    }

    await aki.step(myAnswer);

    res.json({
        question: aki.question,
        answers: aki.answers,
        progress: aki.progress
    });
});

// نقطة النهاية للحصول على التخمين
app.get('/answer', async (req, res) => {
    if (!aki) return res.status(400).json({ error: 'Game has not started' });

    const guessOrResponse = await aki.answer();

    res.json({
        guessOrResponse: guessOrResponse
    });
});

// بدء الخادم
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});