import { Series } from "./modelo.js";

// Os elementos da DOM
const form = document.querySelector("#form-profile");

const switchProfileButton = document.querySelector("#btn-switch-profile");

const formMessage = document.querySelector("#form-message")

// capturando os dados do formulario

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    try {
        const name = document.querySelector("#name").value.trim();
        const age = Number(document.querySelector("#age").value);
        const genres = Array.from(document.querySelectorAll(`input[name="genres"]:checked`)).map(input => input.value);
        
        // Montando o objeto usuario
        const user = {
            name: name,
            age: age,
            favoriteGenres: genres
        };
        console.log("Usuário:", user);

        localStorage.setItem("cinematchProfile", JSON.stringify(user));

        formMessage.textContent = "";

        await iniciarCineMatch(user);

    } catch (error) {
        formMessage.textContent = error.message
    }
});
console.log("test");
async function searchCatalog() {
    try {
        console.log("test2");
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
        console.log("cai aqui");
        return data;

    } catch(error) {
        console.error("Erro ao buscar catálogo:", error);
        return[];
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
        durationMinutes: serie.runtime
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
    const commonGenres = seriesGenres.filter(genres => userGenres.includes(genres));

    //Regra de calculo de compatibilidade número de gêneros em comum / total de gêneros da série * 100
    const percentage = Math.round((commonGenres.length / seriesGenres.length) * 100);

    //Identifica os gêneros da série que o usuário ainda não escolheu
    const unexploredGenres = seriesGenres.filter(genres => !userGenres.includes(genres));

    //Classificação da compatibilidade com base no percentual calculado
    let classification;

    if (percentage >= 70) {
        classification = "Alta";
    } else if (percentage >= 40) {
        classification = "Média";
    } else {
        classification = "Baixa";
    }

    //E aqui vai retorna um objeto com os dados da compatibilidade
    return {
        title: series.title,
        percentage: percentage,
        classification: classification,
        commonGenres: commonGenres,
        unexploredGenres: unexploredGenres
    };
}

const data = await searchCatalog();

const catalog = processCatalog(data);

const series = catalog.map(dataSeries => new Series(
    dataSeries.id,
    dataSeries.title,
    dataSeries.genres,
    dataSeries.durationMinutes
));

console.log("Objetos Serie:", series);