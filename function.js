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
    // Controlla se il timer è stato salvato nel localStorage
    const savedTime = localStorage.getItem('timeLeft');
    if (savedTime) {
        timeLeft = parseInt(savedTime);  // Imposta il tempo rimanente al valore salvato
    } else {
        // Se il timer non è salvato (prima volta o ricaricamento completo), salvalo come 10 minuti
        localStorage.setItem('timeLeft', timeLeft);
    }
}

// Funzione per avviare il timer
function startTimer() {
    timer = setInterval(() => {
        timeLeft--; // Diminuisce il tempo rimanente ogni secondo
        // Salva il tempo rimanente nel localStorage
        localStorage.setItem('timeLeft', timeLeft);
        // Mostra il tempo rimanente nel formato minuti:secondi
        document.getElementById('time').textContent = `${Math.floor(timeLeft / 60)}:${timeLeft % 60}`;

        // Quando il tempo scade, invia il test
        if (timeLeft <= 0) {
            clearInterval(timer); // Ferma il timer
            submit(); // Funzione di invio (definirla separatamente)
        }
    }, 1000);
}

// Funzione per aggiornare il conteggio dei caratteri (domande aperte)
function updateCharCount() {
    document.getElementById('char-count').textContent = document.getElementById('answer').value.length;
}

// Funzione per il submit del test (aggiungi la logica necessaria)
function submit() {
    alert("Tempo scaduto, il test è stato inviato!");
    // Qui puoi aggiungere la logica per inviare i dati del test
}


// Carica i dati appena la pagina è pronta
document.addEventListener('DOMContentLoaded', loadData);

// Funzione per caricare le domande aperte
function loadOpenQuestion(data) {
    try {
        const questionIndex = parseInt(new URLSearchParams(window.location.search).get('q')) - 1;

        // Controllo validità dell'indice
        if (isNaN(questionIndex) || questionIndex < 0 || questionIndex >= data.domandeAperte.length) {
            throw new Error("Indice della domanda non valido.");
        }

        // Recupero e visualizzazione della domanda
        const questionElement = document.getElementById('question');
        const answerElement = document.getElementById('answer');
        const charCountElement = document.getElementById('char-count');
        
        if (!questionElement || !answerElement || !charCountElement) {
            throw new Error("Elementi del DOM mancanti.");
        }

        const question = data.domandeAperte[questionIndex];
        questionElement.textContent = question.domanda;

        // Recupero risposta salvata localmente
        const savedAnswer = localStorage.getItem(`openAnswer${questionIndex}`) || '';
        answerElement.value = savedAnswer;

        // Aggiornamento del conteggio caratteri
        charCountElement.textContent = savedAnswer.length;
        
        // Event listener per il salvataggio della risposta
        answerElement.addEventListener('input', saveOpenAnswer);
    } catch (error) {
        console.error("Errore nel caricamento della domanda aperta:", error);
        document.getElementById('question').textContent = "Errore: impossibile caricare la domanda.";
        document.getElementById('answer').disabled = true;  // Disabilita il campo risposta in caso di errore
    }
}

// Funzione per salvare la risposta della domanda aperta
function saveOpenAnswer() {
    const questionIndex = parseInt(new URLSearchParams(window.location.search).get('q')) - 1;
    const answer = document.getElementById('answer').value;
    localStorage.setItem(`openAnswer${questionIndex}`, answer);
    updateCharCount();
}

// Funzione per aggiornare il conteggio dei caratteri
function updateCharCount() {
    document.getElementById('char-count').textContent = document.getElementById('answer').value.length;
}

// Funzione per caricare le domande a crocette
function loadMultipleChoice(data) {
    let sectionIndex = parseInt(new URLSearchParams(window.location.search).get('s')) - 1; // Indice della sezione

    // Se l'indice non è valido, carica la prima sezione (fallback)
    if (isNaN(sectionIndex) || sectionIndex < 0 || !data.sezioni[sectionIndex]) {
        console.warn("Parametro 's' mancante o non valido, carico la prima sezione.");
        sectionIndex = 0; // Fallback alla prima sezione
    }

    const section = data.sezioni[sectionIndex]; // Recupera la sezione
    document.getElementById('section-title').textContent = section.titolo; // Titolo della sezione
    const questions = section.domande; // Domande della sezione

    // Aggiungi le domande a crocette nella pagina
    questions.forEach((q, index) => {
        const container = document.createElement('div');
        container.classList.add('question-container');
        
        // Crea l'HTML per ogni domanda e le sue opzioni
        container.innerHTML = `
            <p>${q.domanda}</p>
            ${q.opzioni.map((opzione, i) => `
                <label>
                    <input type="radio" name="q${index}" 
                           onclick="saveAnswer(${sectionIndex}, ${index}, ${i})" 
                           ${localStorage.getItem(`section${sectionIndex}q${index}`) == i ? 'checked' : ''}>
                    ${opzione}
                </label><br>
            `).join('')}
        `;
        
        // Aggiungi la domanda e le opzioni al contenitore delle domande
        document.getElementById('questions').appendChild(container);
    });
}

// Funzione per salvare la risposta
function saveAnswer(sectionIndex, questionIndex, answerIndex) {
    // Salva la risposta nel localStorage
    localStorage.setItem(`section${sectionIndex}q${questionIndex}`, answerIndex);
}


// Funzione per salvare la risposta delle domande a crocette
function saveAnswer(textIndex, questionIndex, optionIndex) {
    localStorage.setItem(`text${textIndex}q${questionIndex}`, optionIndex);
}



// Funzione per aggiornare il conteggio caratteri
function updateCharCount() {
    document.getElementById('char-count').textContent = document.getElementById('answer').value.length;
}

// Carica le domande quando il DOM è pronto
document.addEventListener('DOMContentLoaded', () => {
    if (document.title === "Domanda Aperta") {
        loadOpenQuestions(); // Carica domande aperte
    } else if (document.title === "Domande a Crocette") {
        loadMultipleChoiceQuestions(); // Carica domande a crocette
    }
});


// Carica i dati appena la pagina è pronta
document.addEventListener('DOMContentLoaded', loadData);


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
function loadPage(page, questionIndex) {
    // Costruisce l'URL con il parametro query
    const url = `${page}?q=${questionIndex}`;
    
    // Naviga verso la nuova pagina
    window.location.href = url;
}
function goForward() {
    const params = new URLSearchParams(window.location.search);
    const currentIndex = parseInt(params.get('q')) || parseInt(params.get('t')) || 1; // Indice attuale
    const currentPage = window.location.pathname; // Ottieni il nome della pagina corrente
    
    const totalOpenQuestions = 3; // Numero totale di domande aperte
    const totalMultipleChoice = 2; // Numero totale di domande a crocette

    let nextPage;

    // Logica per determinare la prossima pagina
    if (currentPage.includes('domandaaperta.html')) {
        if (currentIndex < totalOpenQuestions) {
            nextPage = `domandaaperta.html?q=${currentIndex + 1}`;
        } else {
            nextPage = `crocetta.html?t=1`; // Passa alla prima domanda a crocette
        }
    } else if (currentPage.includes('crocetta.html')) {
        if (currentIndex < totalMultipleChoice) {
            nextPage = `crocetta.html?t=${currentIndex + 1}`;
        } else {
            nextPage = `domandaaperta.html?q=1`; // Torna alla prima domanda aperta (o fine test)
        }
    }

    // Naviga verso la prossima pagina
    if (nextPage) {
        window.location.href = nextPage;
    }
}

function goBack() {
    const params = new URLSearchParams(window.location.search);
    const currentIndex = parseInt(params.get('q')) || parseInt(params.get('t')) || 1; // Indice attuale
    const currentPage = window.location.pathname; // Ottieni il nome della pagina corrente
    
    const totalOpenQuestions = 3; // Numero totale di domande aperte
    const totalMultipleChoice = 2; // Numero totale di domande a crocette

    let prevPage;

    // Logica per determinare la pagina precedente
    if (currentPage.includes('domandaaperta.html')) {
        if (currentIndex > 1) {
            prevPage = `domandaaperta.html?q=${currentIndex - 1}`;
        } else {
            prevPage = `crocetta.html?t=${totalMultipleChoice}`; // Vai all'ultima domanda a crocette
        }
    } else if (currentPage.includes('crocetta.html')) {
        if (currentIndex > 1) {
            prevPage = `crocetta.html?t=${currentIndex - 1}`;
        } else {
            prevPage = `domandaaperta.html?q=${totalOpenQuestions}`; // Vai all'ultima domanda aperta
        }
    }

    // Naviga verso la pagina precedente
    if (prevPage) {
        window.location.href = prevPage;
    }
}
function goHome() {
    window.location.href = 'index.html'; // Reindirizza alla home (pagina principale)
}
