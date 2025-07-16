const state = {
    score: {
        playerScore: 0,
        computerScore: 0,
        scoreBox: document.getElementById("score_points")
    },
    cardSprites: {
        avatar: document.getElementById("card-image"),
        name: document.getElementById("card-name"),
        type: document.getElementById("card-type")
    },
    fieldCards: {
        player: document.getElementById("player-field-card"),
        computer: document.getElementById("computer-field-card")
    },
    playerSides: {
        player1: "player-cards",
        player1Box: document.querySelector("#player-cards"),
        computer: "computer-cards",
        computerBox: document.querySelector("#computer-cards")
    },
    actions: {
        nextButton: document.getElementById("next-duel"),
        confirmButton: document.createElement("button") // Novo botão
    },
    selectedCardId: null
};

// Cria o botão de confirmação
state.actions.confirmButton.id = "confirm-duel";
state.actions.confirmButton.innerText = "SEND";
document.querySelector(".versus-bottom").prepend(state.actions.confirmButton);

const pathImages = "./src/assets/icons/";
const cardData = [
    {
        id: 0,
        name: 'Blue Eyes White Dragon',
        type: 'Paper',
        img: `${pathImages}dragon.png`,
        winOf: [1],
        loseOf: [2]
    },
    {
        id: 1,
        name: 'Dark Magician',
        type: 'Rock',
        img: `${pathImages}magician.png`,
        winOf: [2],
        loseOf: [0]
    },
    {
        id: 2,
        name: 'Exodia',
        type: 'Scissors',
        img: `${pathImages}exodia.png`,
        winOf: [0],
        loseOf: [1]
    }
];

async function getRandomCardId() {
    const randomIndex = Math.floor(Math.random() * cardData.length);
    return cardData[randomIndex].id;
}

async function createCardImage(idCard, fieldSide) {
    const cardImage = document.createElement("img");
    cardImage.setAttribute("height", "100px");
    cardImage.setAttribute("src", "./src/assets/icons/card-back.png");
    cardImage.setAttribute("data-id", idCard);
    cardImage.classList.add("card");

    if (fieldSide === state.playerSides.player1) {
        cardImage.addEventListener("click", () => {
            // Para mobile: seleciona a carta para visualização
            if (window.innerWidth <= 1023) {
                selectCardForDuel(idCard);
            } else {
                // Desktop: envia direto para o campo
                setCardsField(idCard);
            }
        });

        // Hover só para desktop
        if (window.innerWidth > 1023) {
            cardImage.addEventListener("mouseover", () => {
                drawSelectCard(idCard);
            });
        }
    }

    return cardImage;
}

// Função para selecionar carta (mobile)
function selectCardForDuel(cardId) {
    state.selectedCardId = cardId;
    drawSelectCard(cardId);
    state.actions.confirmButton.style.display = "block";
}

async function setCardsField(cardId) {
    await removeAllCardsImages();

    let computerCardId = await getRandomCardId();

    state.fieldCards.player.style.display = "block";
    state.fieldCards.computer.style.display = "block";

    state.fieldCards.player.src = cardData[cardId].img;
    state.fieldCards.computer.src = cardData[computerCardId].img;

    let duelResults = await checkDuelResults(cardId, computerCardId);

    await updateScore();
    await drawButton(duelResults);
}

async function drawButton(text) {
    state.actions.nextButton.innerText = text;
    state.actions.nextButton.style.display = "block";
    state.actions.confirmButton.style.display = "none";
}

async function updateScore() {
    state.score.scoreBox.innerText = `Win: ${state.score.playerScore} | Lose: ${state.score.computerScore}`;
}

async function checkDuelResults(playerCardId, computerCardId) {
    let duelResults = "Draw";
    let playerCard = cardData[playerCardId];

    if (playerCard.winOf.includes(computerCardId)) {
        duelResults = "Win";
        state.score.playerScore++;
    }
    
    if (playerCard.loseOf.includes(computerCardId)) {
        duelResults = "Lose";
        state.score.computerScore++;
    }

    await playAudio();
    return duelResults;
}

async function removeAllCardsImages() {
    let { computerBox, player1Box } = state.playerSides;

    let imgElements = computerBox.querySelectorAll("img");
    imgElements.forEach((img) => img.remove());

    imgElements = player1Box.querySelectorAll("img");
    imgElements.forEach((img) => img.remove());
}

async function drawSelectCard(index) {
    state.cardSprites.avatar.src = cardData[index].img;
    state.cardSprites.name.innerText = cardData[index].name;
    state.cardSprites.type.innerText = "Attribute: " + cardData[index].type;
}

async function drawCards(cardNumbers, fieldSide) {
    for (let i = 0; i < cardNumbers; i++) {
        const randomIdCard = await getRandomCardId();
        const cardImage = await createCardImage(randomIdCard, fieldSide);

        document.getElementById(fieldSide).appendChild(cardImage);
    }
}

async function resetDuel() {
    state.cardSprites.avatar.src = "";
    state.cardSprites.name.innerText = "Selecione";
    state.cardSprites.type.innerText = "Uma Carta";
    state.actions.nextButton.style.display = "none";
    state.actions.confirmButton.style.display = "none";

    state.fieldCards.player.style.display = "none";
    state.fieldCards.computer.style.display = "none";

    state.selectedCardId = null;

    init();
}

async function playAudio() {
    const audio = new Audio(`./src/assets/audios/lose.wav`);
    audio.play();
}

// Função para enviar a carta selecionada
function confirmDuel() {
    if (state.selectedCardId !== null) {
        setCardsField(state.selectedCardId);
    }
}

function init() {
    drawCards(5, state.playerSides.player1);
    drawCards(5, state.playerSides.computer);
    
    // Configurar evento para o botão de confirmação
    state.actions.confirmButton.addEventListener("click", confirmDuel);
    state.actions.confirmButton.style.display = "none";
    

}

init();