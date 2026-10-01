import { Series } from "./modelo.js";
import {
  renderCard,
  showResultsScreen,
  clearResults,
  showProfileScreen,
  displayWelcomeMessage,
  updateCounter,
  displayErrorMessage,
  hideLoading,
  showLoading,
  toggleTheme,
  createExpandButton,
} from "./ui.js";

// Os elementos da DOM
const form = document.querySelector("#form-profile");

const switchProfileButton = document.querySelector("#btn-switch-profile");

const formMessage = document.querySelector("#form-message");

function createCounter() {
  let counter = 0;

  return function () {
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
    const genres = Array.from(
      document.querySelectorAll(`input[name="genres"]:checked`),
    ).map((input) => input.value);

    if (!name) {
      throw new Error("Digite seu nome.");
    }

    if (isNaN(age) || age < 1 || age > 120) {
      throw new Error("Digite uma idade válida");
    }

    if (genres.length === 0) {
      throw new Error("Escolha pelo menos um gênero favorito.");
    }

    // Montando o objeto usuario
    const user = {
      name: name,
      age: age,
      favoriteGenres: genres,
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
    await new Promise((resolve) => {
      setTimeout(resolve, 500);
    });

    const response = await fetch("https://api.tvmaze.com/shows?page=0");

    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }

    const data = await response.json();

    console.log("Catálago bruto", data);

    return data;
  } catch (error) {
    console.error("Erro ao buscar catálogo:", error);
    return [];
  } finally {
    hideLoading();
  }
}

function processCatalog(data) {
  return data
    .filter(
      (serie) =>
        Array.isArray(serie.genres) &&
        serie.genres.length > 0 &&
        serie.rating?.average
    )
    .sort((a, b) => b.rating.average - a.rating.average)
    .map(
      (serie) =>
        new Series(
          serie.id,
          serie.name,
          serie.genres,
          serie.runtime,
          serie.image?.medium || null
        )
    );
}

function calculateCompatibility(user, series) {
  // Pegar os gêneros favoritos escolhidos pelo usuário
  const userGenres = user.favoriteGenres;

  // Pega os gêneros associados à série
  const seriesGenres = series.genres;

  // Aqui vou filtra os gêneros que aparecem tanto no perfil do usuário quanto na lista de gêneros da série
  const commonGenres = seriesGenres.filter((genre) =>
    userGenres.includes(genre),
  );

  //Regra de calculo de compatibilidade número de gêneros em comum / total de gêneros da série * 100
  const percentage = Math.round(
    (commonGenres.length / seriesGenres.length) * 100,
  );

  //Identifica os gêneros da série que o usuário ainda não escolheu
  const unexploredGenres = seriesGenres.filter(
    (genres) => !userGenres.includes(genres),
  );

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

const series = processCatalog(data);

function executeAfterLoading(callback, name) {
  setTimeout(() => {
    callback(name);
  }, 500);
}

//Função principal que inicia o CineMacth com base no perfil do usuário
async function startCineMatch(user) {
  showResultsScreen();
  clearResults();

  if (!series || series.length === 0) {
    console.log("nada encontrado nesse momento");
    displayErrorMessage("Não encontramos recomendações agora.");
    return;
  }

  // Calcula compatibilidade para cada série
  const results = series
    .map((serie) => calculateCompatibility(user, serie))
    .sort((a, b) => b.percentage - a.percentage);

  let currentIndex = 0;
  const batchSize = 8;

  function renderBatch() {
    const batch = results.slice(currentIndex, currentIndex + batchSize);
    batch.forEach((result) => {
      renderCard(result);
      updateCounter(countCalculations());
    });
    currentIndex += batchSize;
  }

  executeAfterLoading(displayWelcomeMessage, user.name);

  renderBatch();

  if (results.length > batchSize) {
    const expandButton = createExpandButton();

    expandButton.addEventListener("click", () => {
      renderBatch();
      if (currentIndex >= results.length) {
        expandButton.remove(); 
      }
    });

    document.querySelector("#results-section").appendChild(expandButton);
  }
}

//Função que vai verifica se existe um perfil salvo no localStorage
function verifySavedProfile() {
  //aqui vou recupera o perfil salvo
  const savedProfile = localStorage.getItem("cinematchProfile");

  if (savedProfile) {
    try {
      const user = JSON.parse(savedProfile); //converte de JSON para objeto

      console.log("Perfil recuperado:", user);

      startCineMatch(user); //vai iniciar com o perfil recuperado
    } catch (erro) {
      console.error("Erro ao recuperar perfil:", erro);

      localStorage.removeItem("cinematchProfile"); //vai remove o perfil inválido
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
switchProfileButton.addEventListener("click", () => {
  localStorage.removeItem("cinematchProfile");
  form.reset();
  clearResults();
  showProfileScreen();
});

//Executa a verificação de perfil salvo ao carregar
verifySavedProfile();
