const perfis = [
  {
    id: 1,
    nome: "Engenheiro de Sistemas",
    categoria: "Construção",
    chave: "construcao",
    descricao: "Você gosta de transformar problemas em soluções. Observador e prático, prefere entender como as coisas funcionam e colocar ideias em ação.",
    recomendacao: "Fique responsável pelos equipamentos, pela manutenção da nave e pela criação de soluções técnicas para os desafios do planeta.",
    imagem: "imagens/perfil-1.png"
  },
  {
    id: 2,
    nome: "Cientista Explorador",
    categoria: "Investigação",
    chave: "investigacao",
    descricao: "Sua curiosidade leva você a fazer perguntas e buscar evidências. Você gosta de analisar informações antes de chegar a uma conclusão.",
    recomendacao: "Lidere a análise de amostras, registre descobertas e investigue os fenômenos desconhecidos encontrados em Aura.",
    imagem: "imagens/perfil-2.png"
  },
  {
    id: 3,
    nome: "Explorador de Campo",
    categoria: "Exploração",
    chave: "exploracao",
    descricao: "Você se anima com novidades e prefere aprender na prática. Adaptabilidade e coragem para experimentar caminhos diferentes são seus pontos fortes.",
    recomendacao: "Ajude a mapear o terreno, identifique rotas seguras e procure novos locais que a equipe ainda não conhece.",
    imagem: "imagens/perfil-3.png"
  },
  {
    id: 4,
    nome: "Estrategista da Missão",
    categoria: "Planejamento",
    chave: "planejamento",
    descricao: "Você pensa no conjunto, organiza informações e considera as consequências das decisões. Gosta de ajudar o grupo a avançar com clareza.",
    recomendacao: "Coordene as tarefas, organize os recursos e ajude a equipe a escolher os próximos passos com segurança.",
    imagem: "imagens/perfil-4.png"
  }
];

const form = document.querySelector("#aura-form");
const nomeInput = document.querySelector("#nome");
const nascimentoInput = document.querySelector("#nascimento");
const errorMessage = document.querySelector("#form-error");
const resultPanel = document.querySelector("#result-panel");
const resultContent = document.querySelector("#result-content");
const formPanel = document.querySelector("#form-panel");
const resetButton = document.querySelector("#reset-button");

// Impede que o calendário permita selecionar uma data futura.
const hoje = new Date();
const hojeLocal = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}-${String(hoje.getDate()).padStart(2, "0")}`;
nascimentoInput.max = hojeLocal;

function calcularIdade(dataTexto) {
  const [ano, mes, dia] = dataTexto.split("-").map(Number);
  const agora = new Date();
  let idade = agora.getFullYear() - ano;
  const aindaNaoFezAniversario =
    agora.getMonth() + 1 < mes ||
    (agora.getMonth() + 1 === mes && agora.getDate() < dia);

  if (aindaNaoFezAniversario) idade--;
  return idade;
}

function obterDataValida(dataTexto) {
  if (!dataTexto) return false;
  const data = new Date(`${dataTexto}T00:00:00`);
  return !Number.isNaN(data.getTime()) && dataTexto <= hojeLocal && data <= new Date(`${hojeLocal}T23:59:59`);
}

function calcularPontuacao(respostas) {
  const pontos = {
    construcao: 0,
    investigacao: 0,
    exploracao: 0,
    planejamento: 0
  };

  respostas.forEach((resposta) => {
    if (Object.prototype.hasOwnProperty.call(pontos, resposta)) {
      pontos[resposta]++;
    }
  });
  return pontos;
}

function escolherPerfil(pontos) {
  const maiorPontuacao = Math.max(...Object.values(pontos));
  const empatados = Object.keys(pontos).filter((chave) => pontos[chave] === maiorPontuacao);

  // Se houver empate, escolhe entre os perfis empatados usando a resposta da última pergunta.
  // Assim, o resultado continua ligado às escolhas da pessoa, sem favorecer sempre um perfil.
  const ultimaResposta = document.querySelector('input[name="q4"]:checked')?.value;
  const chaveEscolhida = empatados.includes(ultimaResposta) ? ultimaResposta : empatados[0];
  return { perfil: perfis.find((perfil) => perfil.chave === chaveEscolhida), empatados };
}

form.addEventListener("submit", (evento) => {
  evento.preventDefault();
  errorMessage.textContent = "";

  const nome = nomeInput.value.trim();
  const nascimento = nascimentoInput.value;
  if (!nome) {
    errorMessage.textContent = "Digite seu nome para continuar.";
    nomeInput.focus();
    return;
  }
  if (!obterDataValida(nascimento)) {
    errorMessage.textContent = "Informe uma data de nascimento válida, que não seja futura.";
    nascimentoInput.focus();
    return;
  }

  const respostas = [];
  for (let numero = 1; numero <= 4; numero++) {
    const selecionada = document.querySelector(`input[name="q${numero}"]:checked`);
    if (!selecionada) {
      errorMessage.textContent = `Responda à pergunta ${numero} para descobrir seu perfil.`;
      document.querySelector(`fieldset[data-question="${numero}"]`).scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    respostas.push(selecionada.value);
  }

  const idade = calcularIdade(nascimento);
  const pontos = calcularPontuacao(respostas);
  const { perfil, empatados } = escolherPerfil(pontos);
  const mensagemEmpate = empatados.length > 1
    ? `<p class="result-person">Seu resultado teve empate entre ${empatados.length} perfis. Usamos sua resposta da última pergunta para definir a função recomendada.</p>`
    : "";

 
  resultContent.innerHTML = `
    <div class="result-grid">
      <div class="result-copy">
        <span class="result-label">PARTICIPANTE REGISTRADO</span>
        <p class="result-person"><strong>${escaparHTML(nome)}</strong> · ${idade} ${idade === 1 ? "ano" : "anos"}</p>
        <h3 class="result-name">${perfil.nome}</h3>
        <span class="category-pill">${perfil.categoria}</span>
        <p class="result-description">${perfil.descricao}</p>
        <div class="recommendation">
          <b>RECOMENDAÇÃO PARA A MISSÃO</b>
          ${perfil.recomendacao}
        </div>
        ${mensagemEmpate}
      </div>

      <div class="profile-image-container">
        <img
          class="profile-art"
          src="./${perfil.imagem}"
          alt="Ilustração do perfil ${perfil.nome}"
          onerror="this.style.display='none'; this.nextElementSibling.style.display='block';"
        >
        <p class="image-error" style="display:none;">
          Não foi possível carregar a imagem. Confira o nome do arquivo
          e se ele está dentro da pasta imagens.
        </p>
      </div>
    </div>

  `;
  resultPanel.hidden = false;
  resultPanel.scrollIntoView({ behavior: "smooth", block: "start" });
});

function escaparHTML(texto) {
  return texto.replace(/[&<>"']/g, (caractere) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[caractere]);
}

resetButton.addEventListener("click", () => {
  form.reset();
  errorMessage.textContent = "";
  resultPanel.hidden = true;
  nascimentoInput.max = hojeLocal;
  formPanel.scrollIntoView({ behavior: "smooth", block: "start" });
});
