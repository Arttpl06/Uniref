import React, { useState } from "react";
import styles from "./inicioPage.module.css";
import Styles from "./fundoSite.module.css";
import logoUniforBranca from "../assets/logoUniforBranca.png"

export default function InicioPage() {
  const [menuAtivo, setMenuAtivo] = useState(null);

  const [perfilAberto, setPerfilAberto] = useState(false);

  const [pesquisa, setPesquisa] = useState("");

  const categorias = [
  {
    nome: "Monografia no Todo",
    temSubmenu: true,
    opcoes: [
      "Livros",
      "Dicionários",
      "Enciclopédias",
      "Relatório Técnico",
      "Teses, Dissertações e TCC's",
      "Anais/Proceedings",
      "Normas Técnicas"
    ]
  },
  {
    nome: "Parte de Monografia",
    temSubmenu: true,
    opcoes: [
      "Capítulo de Livro",
      "Verbetes de Dicionários/Enciclopédias",
      "Trabalhos Apresentados em Congressos"
    ]
  },
  {
    nome: "Periódico no Todo",
    temSubmenu: true,
    opcoes: [
      "Revistas",
      "Jornais"
    ]
  },
  {
    nome: "Artigo de Periódico",
    temSubmenu: true,
    opcoes: [
      "Artigo de Revista",
      "Artigo de Jornal"
    ]
  },
  {
    nome: "Documentos Exclusivos em Meio Eletrônico",
    temSubmenu: true,
    opcoes: [
        "Homepage",
      "E-mails",
      "Redes Socias"
    ]
  },
  {
    nome: "Documento Jurídico",
    temSubmenu: true,
    opcoes: [
      "Legislação",
      "Jurisprudência"
    ]
  },
  {
    nome: "Patente",
    temSubmenu: false,
    opcoes: [
      "---"
    ]
  },
  {
    nome: "Partitura",
    temSubmenu: false,
    opcoes: [
      "---"
    ]
  },
];

  function alternarMenu(index) {
    setMenuAtivo(menuAtivo === index ? null : index);
    setPerfilAberto(false);
  }

  function alternarPerfil() {
    setPerfilAberto(!perfilAberto);
    setMenuAtivo(null);
  }

  return (
    <div className={styles.pagina}>

      <header className={Styles.cabecalho}>

        <img src={logoUniforBranca} alt="logoUnifor" className={Styles.logo}/>

        <nav className={Styles.navegacao}>
          <a href="#inicio" className={Styles.ativo}>
            Início
          </a>

          <a href="#ajuda">Ajuda</a>
          <a href="#sobre">Sobre</a>
          <a href="#contato">Contato</a>
        </nav>

        <div className={Styles.pesquisa}>

          <input
            type="text"
            placeholder="Pesquisar Referências"
            value={pesquisa}
            onChange={(e) => setPesquisa(e.target.value)}
          />

          <button
            aria-label="Pesquisar"
            onClick={() => console.log("Pesquisa:", pesquisa)}
          >
            <svg viewBox="0 0 24 24">
              <circle cx="10.5" cy="10.5" r="6.5" />
              <path d="M15.5 15.5L21 21" />
            </svg>
          </button>

        </div>

        <div className={Styles.perfilContainer}>

          <button
            className={Styles.perfilBotao}
            onClick={alternarPerfil}
            aria-label="Abrir perfil"
          >
            <span className={Styles.avatar}></span>

            <span className={Styles.setaPerfil}>
              {perfilAberto ? "⌃" : "⌄"}
            </span>
          </button>

          {perfilAberto && (
            <div className={Styles.menuPerfil}>

              <div className={Styles.usuario}>
                <span>Você acessou como:</span>
                <strong>Nome do Usuário</strong>
              </div>

              <button>Gerenciar Referências</button>
              <button>Criar e Editar Coleções</button>
              <button>Atualizar Perfil</button>

              <div className={Styles.areaSair}>
                <button>Sair</button>
              </div>

            </div>
          )}

        </div>

      </header>

      <main className={styles.conteudo} id="inicio">

        <h1>Menu de Referências ABNT</h1>

        <div className={styles.areaMenus}>

          <div className={styles.menuPrincipal}>

            {categorias.map((categoria, index) => (

              <button
                key={index}
                className={`
                  ${styles.itemMenu}
                  ${menuAtivo === index ? styles.selecionado : ""}
                `}
                onClick={() => alternarMenu(index)}
              >

                <span>{categoria.nome}</span>

                {categoria.temSubmenu && (
                <span className={styles.setaMenu}>
                    {menuAtivo === index ? "‹" : "›"}
                </span>
                )}

              </button>

            ))}

          </div>

          {menuAtivo !== null && (

            <div className={styles.submenu}>

              {categorias[menuAtivo].opcoes.map((opcao, index) => (

                <button
                  key={index}
                  className={styles.itemSubmenu}
                  onClick={() => console.log("Opção:", opcao)}
                >
                  {opcao}
                </button>

              ))}

            </div>

          )}

        </div>

      </main>

    </div>
  );
}