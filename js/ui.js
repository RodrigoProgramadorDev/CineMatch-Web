export function showResultsScreen() {
  document.querySelector("#perfil-section").hidden = true;
  document.querySelector("#results-section").hidden = false;
}

export function showProfileScreen() {
  document.querySelector("#perfil-section").hidden = false;
  document.querySelector("#results-section").hidden = true;
}

export function showLoading() {
  const message = document.querySelector("#loading-message");
  message.textContent = "Buscando as melhores séries pra você...";
  message.classList.add("loading");
  document.querySelector("#error-message").textContent = "";
  document.querySelector("#error-message").classList.remove("error");
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

export function clearResults() {
  document.querySelector("#results").innerHTML = "";
  const errorMessage = document.querySelector("#error-message");
  errorMessage.textContent = "";
  errorMessage.classList.remove("error");
  const oldButton = document.querySelector(".expand-button");
  if (oldButton) oldButton.remove();
}

export function displayWelcomeMessage(name) {
  const element = document.querySelector("#welcome-message");
  element.textContent = `Olá, ${name}! Estas são algumas séries que podem combinar com você.`;
}

export function updateCounter(number) {
  const element = document.querySelector("#calculation-accountant");
  element.textContent = `Compatibilidade calculada ${number} vez(es) nesta sessão.`;
}

const genreTranslations = {
  Drama: "Drama",
  Comedy: "Comédia",
  Action: "Ação",
  "Science-Fiction": "Ficção Científica",
  Thriller: "Suspense",
  Crime: "Policial",
  Mystery: "Mistério",
  Horror: "Terror",
  Romance: "Romance",
  Family: "Família",
  Fantasy: "Fantasia",
  Music: "Musical",
  Sports: "Esportes",
  Medical: "Médico",
  Legal: "Jurídico",
  Western: "Faroeste",
  War: "Guerra",
  Anime: "Anime",
  Adventure: "Aventura",
};

export function toggleTheme() {
  document.body.classList.toggle("light-theme");

  const isLight = document.body.classList.contains("light-theme");

  localStorage.setItem("theme", isLight ? "light" : "dark");
}

export function createExpandButton() {
  const button = document.createElement("button");
  button.textContent = "Mostrar mais";
  button.classList.add("expand-button");
  return button;
}

function translateGenres(genres) {
  return genres.map((g) => genreTranslations[g] || g).join(", ");
}

export function renderCard(result) {
  const card = document.createElement("article");
  card.className = "card";

  const title = document.createElement("h3");
  title.textContent = result.title;

  const percentage = document.createElement("p");

  percentage.textContent = `Compatibilidade: ${result.percentage}`;

  const classification = document.createElement("span");

  classification.className = `badge ${result.classification}`;
  classification.textContent = result.classificationLabel;

  classification.setAttribute(
    "aria-label",
    `Compatibilidade ${result.classificationLabel}`,
  );

  const commonGenres = document.createElement("p");

  commonGenres.textContent = `Gêneros em comum: ${result.commonGenres.length > 0 ? translateGenres(result.commonGenres) : "Nenhum"}`;

  const unexploredGenres = document.createElement("p");

  unexploredGenres.textContent = `Gêneros não explorados: ${result.unexploredGenres.length > 0 ? translateGenres(result.unexploredGenres) : "Nenhum"}`;

  if (result.image) {
    const cover = document.createElement("img");
    cover.src = result.image;
    cover.alt = `Capa da série ${result.title}`;
    cover.className = "card-cover";
    card.appendChild(cover);
  }

  card.appendChild(title);
  card.appendChild(percentage);
  card.appendChild(classification);
  card.appendChild(commonGenres);
  card.appendChild(unexploredGenres);

  document.querySelector("#results").appendChild(card);
}
