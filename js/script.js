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