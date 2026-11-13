import React, { useState } from "react";
import Styles from "./fundoSite.module.css";
import styles from "./fundoRefs.module.css";
import style from "./livrosRef.module.css";
import logoUniforBranca from "../assets/logoUniforBranca.png"

export default function LivrosRef() {

  const [formulario, setFormulario] = useState({
      colecao: "não classificada",
      abreviada: "Não",
      titulo: "",
      local: "",
      tipoPagina: "Nº de páginas",
      quantidadePaginas: "",
      online: "Não",
      ano: "",
      tipoAutor: "Desconhecido",
      quantidadeAutores: "1",
      subtitulo: "",
      editora: "",
      serie: "",
      responsabilidade: "Autor da Obra",
      autor: "",
      edicao: "",
      notas: "",
      tipoSuporteFisico: "Nenhum",
      qtdSuporteFisico: "",
      outroSuporteFisico: "",
      URL: "",
      Subordinação: "",
      tipoResponsa: "",
      dataAcesso: ""
  });

  const handleChange = (e) => {
      const { name, value } = e.target;

      setFormulario((anterior) => ({
          ...anterior,
          [name]: value
      }));
  };

  const handleSubmit = (e) => {
      e.preventDefault();

      console.log("Dados do formulário:", formulario);
  };


  const [perfilAberto, setPerfilAberto] = useState(false);

  const [pesquisa, setPesquisa] = useState("");

  function alternarMenu(index) {
    setMenuAtivo(menuAtivo === index ? null : index);
    setPerfilAberto(false);
  }

  function alternarPerfil() {
    setPerfilAberto(!perfilAberto);
    setMenuAtivo(null);
  }


  return (
    <div className={Styles.pagina}>

      <header className={Styles.cabecalho}>

        <img src={logoUniforBranca} alt="logoUnifor" className={Styles.logo}/>

        <nav className={Styles.navegacao}>
          <a href="#inicio">
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

      <main className={style.containerReferencias}>

          <h3 className={styles.tituloFormulario}>
              ELABORAR REFERÊNCIA A LIVROS:
          </h3>

          <form
              className={style.formReferencias}
              onSubmit={handleSubmit}
          >


          <section className={styles.coluna}>

                    <div className={styles.campo}>
                        <label className={styles.labelEscuro}>
                            Referência:
                        </label>

                        <label className={styles.labelEscuro}>

                        </label>
                    </div>

                    <div className={styles.campo}>
                        <label className={styles.labelEscuro}>
                            Citação com Autor Incluido no Texto:
                        </label>

                        <label className={styles.labelEscuro}>

                        </label>
                    </div>

                    <div className={styles.campo}>
                        <label className={styles.labelEscuro}>
                            Citação com Autor Não Incluido no Texto:
                        </label>

                        <label className={styles.labelEscuro}>

                        </label>
                    </div>

          </section>

          <button
              type="submit"
              className={styles.btnGerar}
          >
              Voltar
          </button>

          </form>

      </main>

    </div>
  );
}