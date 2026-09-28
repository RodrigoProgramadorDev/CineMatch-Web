
//Função que mostra a tela do resutados e esconde o perfil
export function showResultsScreen() {
    document.querySelector("#perfil-section").hidden = true;
    document.querySelector("#results-section").hidden = false;
}

//Aqui vai mostra a tela do perfil e esconde o resultado
export function showProfileScreen() {
    document.querySelector("#perfil-section").hidden = false;
    document.querySelector("#results-section").hidden = true;
}

export function showLoading() {
    const message = document.querySelector("#loading-message");
    message.textContent = "Buscando as melhores séries pra você..."
    message.classList.add("loading"); 
}

export function hideLoading() {
    const message = document.querySelector("#loading-message");
    message.textContent = "";
    message.classList.remove("loading");
}

export function displayErrorMessage(text) {
    const message = document.querySelector("#error-message");
    message.textContent = text;
    message.classList.add("error");
}

//Aqui é a função que vai limpa os resultados e mensagens de erro
export function clearResults() {
    document.querySelector("#results").innerHTML = "";
    document.querySelector("#error-message").textContent = "";
}

export function displayWelcomeMessage(name) {
    const element = document.querySelector("#welcome-message");
    element.textContent = `Olá, ${name}! Esta são algumas séries que podem combinar com você.`
}

export function updateCounter(number) {
    const element = document.querySelector("#calculation-accountant");
    element.textContent = `Compatibilidade calculada ${number} vez(es) nesta sessão.`
}

// Dicionário de tradução dos gêneros
const genreTranslations = {
    "Drama": "Drama",
    "Comedy": "Comédia",
    "Action": "Ação",
    "Science-Fiction": "Ficção Científica",
    "Thriller": "Suspense",
    "Crime": "Crime",
    "Mystery": "Mistério",
    "Horror": "Terror",
    "Romance": "Romance",
    "Family": "Família",
    "Fantasy": "Fantasia",
    "Music": "Música",
    "Sports": "Esportes",
    "Medical": "Médico",
    "Legal": "Jurídico",
    "Western": "Faroeste",
    "War": "Guerra",
    "Anime": "Anime"
};

export function toggleTheme() {
    document.body.classList.toggle("light-theme");

    // verifica se o body tem a classe light-theme
    const isLight = document.body.classList.contains("light-theme");

    // salva no localStorage
    localStorage.setItem("theme", isLight ? "light" : "dark");
}

// Função auxiliar para traduzir listas de gêneros
function translateGenres(genres) {
    return genres.map(g => genreTranslations[g] || g).join(", ");
}

//Função que vai criar um "card" de cada filme ou serie com os dados de um resultado
export function renderCard(result) {
    const card = document.createElement("article");
    card.className = "card";

    
    const title = document.createElement("h3");
    title.textContent = result.title;
    
    const percentage = document.createElement("p");
    
    percentage.textContent = `Compatibilidade: ${result.percentage}`;
    
    //Criar tipo um rótulo badge
    const classification = document.createElement("span");
    
    //e aqui difinir uma classe de css para estilizar ele
    classification.className = `badge ${result.classification}`;
    classification.textContent = result.classificationLabel;
    
    const commonGenres = document.createElement("p");
    
    //aqui vai cria parágrafo para gêneros em comum
    commonGenres.textContent = `Gêneros em comum: ${result.commonGenres.length > 0 ? translateGenres(result.commonGenres) : "Nenhum"}`;
    
    const unexploredGenres =  document.createElement("p");
    
    //Cria parágrafo para gêneros não explorados
    unexploredGenres.textContent = `Gêneros não explorados: ${result.unexploredGenres.length > 0 ? translateGenres(result.unexploredGenres) : "Nenhum"}`;
    
    if (result.image) {
        const cover = document.createElement("img");
        cover.src = result.image;
        cover.alt = `Capa da série ${result.title}`;
        cover.className = "card-cover";
        card.appendChild(cover);
    }

    //Vou adicionar os elementos criados dentro do card
    card.appendChild(title);
    card.appendChild(percentage);
    card.appendChild(classification);
    card.appendChild(commonGenres);
    card.appendChild(unexploredGenres);

    //E aqui vou adicionar os card dentro da seção de resultados
    document.querySelector("#results").appendChild(card);
}