
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

//Aqui é a função que vai limpa os resultados e mensagens de erro
export function clearResults() {
    document.querySelector("#results").innerHTML = "";
    document.querySelector("#error-message").textContent = "";
}

//Função que vai criar um "card" de cada filme ou serie com os dados de um resultado
export function rerenderCard(result) {
    const card = document.createElement("article");

    const title = document.createElement("h3");
    title.textContent = result.title;

    const percentage = document.createElement("p");

    percentage.textContent = `Compatibilidade: ${result.percentage}`;

    //Criar tipo um rótulo badge
    const classification = document.createElement("span");

    //e aqui difinir uma classe de css para estilizar ele
    classification.className = `badge ${result.classification.toLowerCase()}`;

    //texto de classificação
    classification.textContent = result.classification;

    const commonGenres = document.createElement("p");

    //aqui vai cria parágrafo para gêneros em comum
    commonGenres.textContent = `Gêneros em comum: ${result.commonGenres.length > 0 ? result.commonGenres.join(", ") : "Nenhum"}`;
    
    const unexploredGenres =  document.createElement("p");
    
    //Cria parágrafo para gêneros não explorados
    unexploredGenres.textContent = `Gêneros não explorados: ${result.unexploredGenres.lenth > 0 ? result.unexploredGenres.join(", ") : "Nenhum"}`;

    //Vou adicionar os elementos criados dentro do card
    card.appendChild(title);
    card.appendChild(percentage);
    card.appendChild(classification);
    card.appendChild(commonGenres);
    card.appendChild(unexploredGenres);

    //E aqui vou adicionar os card dentro da seção de resultados
    document.querySelector("#results").appendChild(card);
}