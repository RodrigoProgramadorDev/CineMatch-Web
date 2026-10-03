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

    const user = {
      name: name,
      age: age,
      favoriteGenres: genres,
    };

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
    showLoading();
    await new Promise((resolve) => {
      setTimeout(resolve, 500);
    });

    const response = await fetch("https://api.tvmaze.com/shows?page=0");

    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }

    const data = await response.json();

    return data;
  } catch (error) {
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
        serie.rating?.average,
    )
    .sort((a, b) => b.rating.average - a.rating.average)
    .map(
      (serie) =>
        new Series(
          serie.id,
          serie.name,
          serie.genres,
          serie.runtime,
          serie.image?.medium || null,
        ),
    );
}

function calculateCompatibility(user, series) {
  const userGenres = user.favoriteGenres;

  const seriesGenres = series.genres;

  const commonGenres = seriesGenres.filter((genre) =>
    userGenres.includes(genre),
  );

  const percentage = Math.round(
    (commonGenres.length / seriesGenres.length) * 100,
  );

  const unexploredGenres = seriesGenres.filter(
    (genres) => !userGenres.includes(genres),
  );

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

async function startCineMatch(user) {
  showResultsScreen();
  clearResults();

  if (!series || series.length === 0) {
    displayErrorMessage("Não encontramos recomendações agora.");
    return;
  }

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

function verifySavedProfile() {
  const savedProfile = localStorage.getItem("cinematchProfile");

  if (savedProfile) {
    try {
      const user = JSON.parse(savedProfile);
      startCineMatch(user);
    } catch (erro) {
      localStorage.removeItem("cinematchProfile");
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

switchProfileButton.addEventListener("click", () => {
  localStorage.removeItem("cinematchProfile");
  form.reset();
  clearResults();
  showProfileScreen();
});

verifySavedProfile();
