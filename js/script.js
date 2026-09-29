import { Series } from "./modelo.js";
import {renderCard, showResultsScreen, clearResults, showProfileScreen, displayWelcomeMessage, updateCounter, displayErrorMessage, hideLoading, showLoading, toggleTheme} from "./ui.js";

// Os elementos da DOM
const form = document.querySelector("#form-profile");

const switchProfileButton = document.querySelector("#btn-switch-profile");

const formMessage = document.querySelector("#form-message");

function createCounter(){
    let counter = 0;

    return function() {
        counter++;

        return counter;
    };
}

const countCalculations = createCounter();

// capturando os dados do formulario

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    try {
        const name = document.querySelector("#name").value.trim();
        const age = Number(document.querySelector("#age").value);
        const genres = Array.from(document.querySelectorAll(`input[name="genres"]:checked`)).map(input => input.value);

        if(!name) {
            throw new Error("Digite seu nome.");
        }

        if(isNaN(age) || age < 1 || age > 120) {
            throw new Error("Digite uma idade válida");
        }

        if(genres.length === 0) {
            throw new Error("Escolha pelo menos um gênero favorito.");
        }
        
        // Montando o objeto usuario
        const user = {
            name: name,
            age: age,
            favoriteGenres: genres
        };
        console.log("Usuário:", user);

        localStorage.setItem("cinematchProfile", JSON.stringify(user));

        formMessage.textContent = "";
        formMessage.classList.remove("error");

        await startCineMatch(user);

    } catch (error) {
        formMessage.textContent = error.message;
        formMessage.classList.add("error");
    }
});

async function searchCatalog() {
    try {

        //simular o atrasor
        showLoading();
        await new Promise(resolve => {
            setTimeout(resolve, 500);
        });

        const response = await fetch(
            "https://api.tvmaze.com/shows?page=0"
        );

        if(!response.ok) {
            throw new Error(
                `Erro HTTP: ${response.status}`
            );
        }

        const data = await response.json();

        console.log("Catálago bruto", data);

        return data;

    } catch(error) {
        console.error("Erro ao buscar catálogo:", error);
        return[];
    } finally {
        hideLoading();
    }
}

function processCatalog(data) {
    const catalog = data

        // Filtra apenas série que têm um array de generos válido e não vazio
        // e se possuem um object rating com média definida
        .filter(serie => 
            Array.isArray(serie.genres) &&
            serie.genres.length > 0 &&
            serie.rating &&
            serie.rating.average
        )

        //Ordena as séries pela nota média (rating.average), do maior para o menor
        .sort((a, b) => 
            b.rating.average - a.rating.average    
        ) 

        //Pega apenas as 8 primeiras séries da lista ordenada
        .slice(0, 8)
        
        //Transforma cada série em um novo objeto com os campos desejados
        .map(serie => ({
        id: serie.id,
        title: serie.name,
        type: "Série",
        genres: serie.genres,
        durationMinutes: serie.runtime,
        image: serie.image ? serie.image.medium : null
        }));

    //Aqui ele vai retorna o catalogo final ja tratado
    return catalog;
}

function calculateCompatibility(user, series) {

    // Pegar os gêneros favoritos escolhidos pelo usuário
    const userGenres = user.favoriteGenres;

    // Pega os gêneros associados à série
    const seriesGenres = series.genres;

    // Aqui vou filtra os gêneros que aparecem tanto no perfil do usuário quanto na lista de gêneros da série
    const commonGenres = seriesGenres.filter(genre => userGenres.includes(genre));

    //Regra de calculo de compatibilidade número de gêneros em comum / total de gêneros da série * 100
    const percentage = Math.round((commonGenres.length / seriesGenres.length) * 100);

    //Identifica os gêneros da série que o usuário ainda não escolheu
    const unexploredGenres = seriesGenres.filter(genres => !userGenres.includes(genres));

    //Classificação da compatibilidade com base no percentual calculado
    let classification;
    let classificationLabel;

    if (percentage >= 70) {
        classification = "high";
        classificationLabel = "Alta";
    } else if (percentage >= 40) {
        classification = "medium";
        classificationLabel = "Média";
    } else {
        classification = "low";
        classificationLabel = "Baixa";
    }

    //E aqui vai retorna um objeto com os dados da compatibilidade
    return {
        title: series.title,
        percentage: percentage,
        classification: classification,
        classificationLabel: classificationLabel,
        commonGenres: commonGenres,
        unexploredGenres: unexploredGenres,
        image: series.image,
    };
}

const data = await searchCatalog();

const catalog = processCatalog(data);

const series = catalog.map(dataSeries => new Series(
    dataSeries.id,
    dataSeries.title,
    dataSeries.genres,
    dataSeries.durationMinutes,
    dataSeries.image
));

console.log("Objetos Serie:", series);

function executeAfterLoading(callback, name) {
    callback(name);
}

//Função principal que inicia o CineMacth com base no perfil do usuário
async function startCineMatch(user) {
    //mostrar a tela de resultado
    showResultsScreen();

    clearResults();

    displayWelcomeMessage(user.name);

    //Aqui vou busca o catálago de séries ou filmes
    const data = await searchCatalog();

    //Caso não encontrar dados vai encerra a função
    if(data.length === 0) {
        console.log("nada encontrado nesse momento");

        displayErrorMessage("Não encontramos recomendações agora.");

        return;
    }

    //vai processa os dados brutos do catálogo
    const catalog = processCatalog(data);

    //para caso não ter recomendação após o processamento
    if (catalog.length === 0) {
        console.log("Sem recomendação");

        displayErrorMessage("Não encontramos recomendações agora.");

        return;
    }
    //log mostrar o catálogo processado ou tratado
    console.log("Catálogo tratado:", catalog);
    
    //Vai cria objetos da classe Series a partir dos dados do catálogo
    const series = catalog.map(dataSeries => new Series(dataSeries.id, dataSeries.title, dataSeries.genres, dataSeries.durationMinutes, dataSeries.image));
    
    //log dos objetos criados
    console.log("Objetos Serie:", series);

    // Calcula compatibilidade para cada série
    const results = series.map(serie => calculateCompatibility(user, serie));

    // Ordena pela compatibilidade maior primeiro
    results.sort((a, b) => b.percentage - a.percentage);

    // Pega apenas os 8 primeiros
    const topResults = results.slice(0, 8);

    // Renderiza os cards
    topResults.forEach(result => {
    renderCard(result);
    const number = countCalculations();
    updateCounter(number);
    });
}

//Função que vai verifica se existe um perfil salvo no localStorage
function verifySavedProfile() {

    //aqui vou recupera o perfil salvo
    const savedProfile = localStorage.getItem("cinematchProfile");

    if (savedProfile) {
        try {
            const user = JSON.parse(savedProfile);//converte de JSON para objeto

            console.log("Perfil recuperado:", user);

            startCineMatch(user);//vai iniciar com o perfil recuperado
        } catch (erro) {
            console.error("Erro ao recuperar perfil:", erro);

            localStorage.removeItem("cinematchProfile");//vai remove o perfil inválido
        }
    }
}

const switchThemeButton = document.querySelector("#btn-switch-theme");

const savedTheme = localStorage.getItem("theme");
if (savedTheme === "light") {
    document.body.classList.add("light-theme");
}

switchThemeButton.addEventListener("click", () => {
    toggleTheme();
});
//botão para trocar de perfil
switchProfileButton.addEventListener("click", () => { localStorage.removeItem("cinematchProfile"); form.reset(); clearResults(); showProfileScreen() ;});


//Executa a verificação de perfil salvo ao carregar
verifySavedProfile();