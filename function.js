let timeLeft = 600; // Tempo iniziale (10 minuti)
let timer;

// Quando la pagina è pronta
document.addEventListener('DOMContentLoaded', () => {
    loadTimer();  // Carica il timer salvato (se presente)
    startTimer(); // Avvia il timer
    loadData();   // Carica i dati delle domande
    if (document.getElementById('answer')) updateCharCount(); // Per le domande aperte
});

// Funzione per caricare i dati (domande aperte, crocette, ecc.)
function loadData() {
    fetch('data.json')
        .then(response => {
            if (!response.ok) {
                throw new Error("Errore nel caricamento del file JSON");
            }
            return response.json();
        })
        .then(data => {
            if (document.title === "Domanda Aperta") {
                loadOpenQuestion(data);
            } else if (document.title === "Domande a Crocette") {
                loadMultipleChoice(data);
            }
        })
        .catch(error => {
            console.error("Errore:", error);
        });
}

// Funzione per caricare il timer salvato
function loadTimer() {
    const savedTime = localStorage.getItem('timeLeft');
    if (savedTime) {
        timeLeft = parseInt(savedTime);
    } else {
        localStorage.setItem('timeLeft', timeLeft);
    }
}

function startTimer() {
    // Avvia il timer, che decrementa ogni secondo
    timer = setInterval(() => {
        if (timeLeft > 0) {
            timeLeft--;  // Decrementa il tempo rimasto di un secondo
            document.getElementById("timer").textContent = `Tempo rimanente: ${timeLeft} secondi`; // Mostra il tempo rimanente
        } else {
            clearInterval(timer);  // Ferma il timer
            showSubmissionMessage();  // Mostra il messaggio di consegna
            submit();  // Invia automaticamente le risposte quando il tempo scade
        }
    }, 1000);  // Intervallo di 1 secondo
}

function showSubmissionMessage() {
    // Mostra il messaggio "Consegna effettuata"
    const messageDiv = document.getElementById('submission-message');
    messageDiv.style.display = 'block';

    // Nasconde il messaggio dopo 3 secondi
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 3000); // Nasconde dopo 3 secondi
}

// Funzione per aggiornare il conteggio dei caratteri (domande aperte)
function updateCharCount() {
    const answerElement = document.getElementById('answer');
    if (answerElement) {
        document.getElementById('char-count').textContent = answerElement.value.length;
    }
}

// Funzione per caricare le domande aperte
function loadOpenQuestion(data) {
    try {
        const questionIndex = parseInt(new URLSearchParams(window.location.search).get('q')) - 1;
        if (isNaN(questionIndex) || questionIndex < 0 || questionIndex >= data.domandeAperte.length) {
            throw new Error("Indice della domanda non valido.");
        }

        const questionElement = document.getElementById('question');
        const answerElement = document.getElementById('answer');
        const charCountElement = document.getElementById('char-count');

        if (!questionElement || !answerElement || !charCountElement) {
            throw new Error("Elementi del DOM mancanti.");
        }

        const question = data.domandeAperte[questionIndex];
        questionElement.textContent = question.domanda;

        const savedAnswer = localStorage.getItem(`openAnswer${questionIndex}`) || '';
        answerElement.value = savedAnswer;
        charCountElement.textContent = savedAnswer.length;

        answerElement.addEventListener('input', saveOpenAnswer);
    } catch (error) {
        console.error("Errore nel caricamento della domanda aperta:", error);
        document.getElementById('question').textContent = "Errore: impossibile caricare la domanda.";
        document.getElementById('answer').disabled = true;
    }
}

// Funzione per salvare la risposta della domanda aperta
function saveOpenAnswer() {
    const questionIndex = parseInt(new URLSearchParams(window.location.search).get('q')) - 1;
    const answer = document.getElementById('answer').value;
    localStorage.setItem(`openAnswer${questionIndex}`, answer);
    updateCharCount();
}

function loadMultipleChoice(data) {
    // Ottieni i parametri dalla query string
    const params = new URLSearchParams(window.location.search);

    // Definisci currentIndex, prendendo il valore da 'q' o 't', se presenti, altrimenti impostando a 1 come default
    const currentIndex = parseInt(params.get('q')) || parseInt(params.get('t')) || 1;

    // Gestione della sezione in base a currentIndex
    if (currentIndex === 1) {
        // Carica la Sezione 1
        const section1 = data.sezioni[0]; // Prima sezione
        document.getElementById('section-title').textContent = section1.titolo; // Titolo della sezione
        const questions1 = section1.domande; // Domande della sezione

        // Aggiungi le domande a crocette nella pagina
        const questionsContainer1 = document.getElementById('questions1'); // Assicurati che ci sia un container con ID 'questions1'
        questionsContainer1.innerHTML = ''; // Pulisce eventuali contenuti preesistenti

        // Cicla su tutte le domande della Sezione 1
        questions1.forEach((q, index) => {
            const container = document.createElement('div');
            container.classList.add('question-container');
            
            // Crea l'HTML per ogni domanda e le sue opzioni
            const questionHTML = `
                <p>${q.domanda}</p>
                ${q.opzioni.map((opzione, i) => `
                    <label>
                        <input type="radio" name="q${currentIndex}_${index}" 
                               onclick="saveAnswer(${currentIndex}, ${index}, ${i})" 
                               ${localStorage.getItem(`section${currentIndex}q${index}`) == i ? 'checked' : ''}>
                        ${opzione}
                    </label><br>
                `).join('')}
            `;
            
            container.innerHTML = questionHTML;
            questionsContainer1.appendChild(container);
        });
    }
    else if(currentIndex === 2){
        // Carica la Sezione 2
        const section2 = data.sezioni[1]; // Seconda sezione
        document.getElementById('section-title2').textContent = section2.titolo; // Titolo della sezione
        const questions2 = section2.domande; // Domande della sezione

        // Aggiungi le domande a crocette nella pagina
        const questionsContainer2 = document.getElementById('questions2'); // Assicurati che ci sia un container con ID 'questions2'
        questionsContainer2.innerHTML = ''; // Pulisce eventuali contenuti preesistenti

        // Cicla su tutte le domande della Sezione 2
        questions2.forEach((q, index) => {
            const container = document.createElement('div');
            container.classList.add('question-container');
            
            // Crea l'HTML per ogni domanda e le sue opzioni
            const questionHTML = `
                <p>${q.domanda}</p>
                ${q.opzioni.map((opzione, i) => `
                    <label>
                        <input type="radio" name="q${currentIndex}_${index}" 
                               onclick="saveAnswer(${currentIndex}, ${index}, ${i})" 
                               ${localStorage.getItem(`section${currentIndex}q${index}`) == i ? 'checked' : ''}>
                        ${opzione}
                    </label><br>
                `).join('')}
            `;
            
            container.innerHTML = questionHTML;
            questionsContainer2.appendChild(container);
        });
    }
}


// Funzione per salvare la risposta
function saveAnswer(sectionIndex, questionIndex, answerIndex) {
    // Salva la risposta nel localStorage specificando la sezione, la domanda e la risposta
    const key = `section${sectionIndex}q${questionIndex}`;
    localStorage.setItem(key, answerIndex);
}


// Funzione per il submit del test
function submit() {
    // Ottieni tutte le risposte salvate nel localStorage
    const answers = {};
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const value = localStorage.getItem(key);
        answers[key] = value;
    }

    // Crea un array separato per le risposte alle domande aperte
    let openAnswers = [];
    let sectionAnswers = [];

    // Filtra le risposte per separare le open answers
    for (const key in answers) {
        if (key.startsWith('openAnswer')) {
            openAnswers.push(`${key}: ${answers[key]}`);
        } else if (key !== 'timeLeft') {
            // Per le risposte a domande a crocette, aggiungi +1 all'indice
            const number = parseInt(key.replace(/[^0-9]/g, '')); // Estrai l'indice numerico dalla chiave
            const response = parseInt(answers[key]) + 1; // Aggiungi 1 alla risposta per avere numerazione da 1 a 4
            sectionAnswers.push(`section${number}q${number + 1}: ${response}`); // +1 all'indice per la numerazione da 1
        }
    }

    // Assicurati che le open answers siano numerate da 1 a 4
    openAnswers = openAnswers.map((answer, index) => {
        const number = index + 1; // Cambia la numerazione da 0-3 a 1-4
        return `openAnswer${number}: ${answer.split(": ")[1]}`; // Mantieni solo il testo dopo ": "
    });

    // Ordina le risposte (open answers all'inizio, timeLeft alla fine)
    const sortedAnswers = [
        ...openAnswers,           // Le open answers vengono per prime
        ...sectionAnswers,        // Poi le risposte delle domande a scelta
        `timeLeft: ${answers['timeLeft']}` // Alla fine, il tempo rimasto
    ];

    // Unisci tutto in una stringa
    let answersText = sortedAnswers.join("\n");

    // Crea un Blob con il contenuto delle risposte
    const blob = new Blob([answersText], { type: 'text/plain' });

    // Crea un URL per il Blob
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'risposte.txt'; // Nome del file di testo

    // Aggiungi il link al DOM e simula un click per avviare il download
    link.click();

    // Pulisci il timer (se esiste) e il localStorage
    clearInterval(timer);
    localStorage.clear();
}



// Funzioni per la navigazione tra le pagine
function loadPage(page, questionIndex) {
    const url = `${page}?q=${questionIndex}`;
    window.location.href = url;
}

function goForward() {
    const params = new URLSearchParams(window.location.search);
    const currentIndex = parseInt(params.get('q')) || parseInt(params.get('t')) || 1;
    const currentPage = window.location.pathname;

    const totalOpenQuestions = 3;
    const totalMultipleChoice = 2;

    let nextPage;

    if (currentPage.includes('domandaaperta.html')) {
        if (currentIndex < totalOpenQuestions) {
            nextPage = `domandaaperta.html?q=${currentIndex + 1}`;
        } else {
            nextPage = `crocetta.html?t=1`;
           
        }
    } else if (currentPage.includes('crocetta.html')) {
        if (currentIndex < totalMultipleChoice) {
            nextPage = `crocetta.html?t=${currentIndex + 1}`;
           
        } else {
            nextPage = `domandaaperta.html?q=1`;
        }
    }

    if (nextPage) {
        window.location.href = nextPage;
    }
}

function goBack() {
    const params = new URLSearchParams(window.location.search);
    const currentIndex = parseInt(params.get('q')) || parseInt(params.get('t')) || 1;
    const currentPage = window.location.pathname;

    const totalOpenQuestions = 3;
    const totalMultipleChoice = 2;

    let prevPage;

    if (currentPage.includes('domandaaperta.html')) {
        if (currentIndex > 1) {
            prevPage = `domandaaperta.html?q=${currentIndex - 1}`;
        } else {
            prevPage = `crocetta.html?t=${totalMultipleChoice}`;
            
        }
    } else if (currentPage.includes('crocetta.html')) {
        if (currentIndex > 1) {
            prevPage = `crocetta.html?t=${currentIndex - 1}`;
           
        } else {
            prevPage = `domandaaperta.html?q=${totalOpenQuestions}`;
        }
    }

    if (prevPage) {
        window.location.href = prevPage;
    }
}

function goHome() {
    window.location.href = 'index.html';
}
