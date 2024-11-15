let timer; 
let timeLeft = 600; // 10 minutes

document.addEventListener('DOMContentLoaded', () => {
    startTimer();
    loadData();
    if (document.getElementById('answer')) updateCharCount();
});

function startTimer() {
    timer = setInterval(() => {
        timeLeft--;
        document.getElementById('time').textContent = `${Math.floor(timeLeft / 60)}:${timeLeft % 60}`;
        if (timeLeft <= 0) submit();
    }, 1000);
}

function loadData() {
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            if (document.title === "Domanda Aperta") loadOpenQuestion(data);
            else if (document.title === "Domande a Crocette") loadMultipleChoice(data);
        });
}

function loadOpenQuestion(data) {
    const questionIndex = parseInt(new URLSearchParams(window.location.search).get('q')) - 1;
    document.getElementById('question').textContent = data.domandeAperte[questionIndex].domanda;
    const answer = localStorage.getItem(`openAnswer${questionIndex}`) || '';
    document.getElementById('answer').value = answer;
    updateCharCount();
}

function saveOpenAnswer() {
    const questionIndex = parseInt(new URLSearchParams(window.location.search).get('q')) - 1;
    const answer = document.getElementById('answer').value;
    localStorage.setItem(`openAnswer${questionIndex}`, answer);
    updateCharCount();
}

function updateCharCount() {
    document.getElementById('char-count').textContent = document.getElementById('answer').value.length;
}

function loadMultipleChoice(data) {
    const textIndex = parseInt(new URLSearchParams(window.location.search).get('t')) - 1;
    document.getElementById('text-title').textContent = data.testi[textIndex].titolo;
    const questions = data.testi[textIndex].domande;

    questions.forEach((q, index) => {
        const container = document.createElement('div');
        container.innerHTML = `
            <p>${q.domanda}</p>
            ${q.opzioni.map((opzione, i) => `
                <label><input type="radio" name="q${index}" onclick="saveAnswer(${textIndex}, ${index}, ${i})" ${localStorage.getItem(`text${textIndex}q${index}`) == i ? 'checked' : ''}>${opzione}</label>
            `).join('')}
        `;
        document.getElementById('questions').appendChild(container);
    });
}

function saveAnswer(textIndex, questionIndex, answerIndex) {
    localStorage.setItem(`text${textIndex}q${questionIndex}`, answerIndex);
}

function submit() {
    const answers = JSON.stringify(localStorage);
    fetch('save.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: answers
    });
    alert("Risposte consegnate!");
    clearInterval(timer);
    localStorage.clear();
}
