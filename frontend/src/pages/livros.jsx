import React, { useState } from "react";
import Styles from "./fundoSite.module.css";
import styles from "./livros.module.css";
import logoUniforBranca from "../assets/logoUniforBranca.png"

export default function Livros() {

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

      <main className={styles.containerReferencias}>

          <h3 className={styles.tituloFormulario}>
              ELABORAR REFERÊNCIA A LIVROS:
          </h3>

          <form
              className={styles.formReferencias}
              onSubmit={handleSubmit}
          >


          <section className={styles.coluna}>

              <div className={styles.campo}>
                  <label className={styles.labelEscuro}>Coleção de Referências</label>
                  <select className={styles.inputEscuro} name="colecao" value={formulario.colecao} onChange={handleChange}>
                      <option>não classificada</option>
                      <option>ABNT</option>
                  </select>
              </div>

              <div className={styles.campo}>
                  <label className={styles.labelClaro}>Forma Abreviada p/ 4 autores?</label>
                  <select className={styles.inputClaro} 
                  name="abreviada" 
                  value={formulario.abreviada} 
                  onChange={handleChange}
                  disabled={formulario.tipoAutor === "Desconhecido" || formulario.quantidadeAutores < 4}>

                      <option>Não</option>
                      <option>Sim</option>
                  </select>
              </div>

              <div className={styles.campo}>
                  <label className={styles.labelEscuro}>Título*</label>
                  <input
                      className={styles.inputEscuro}
                      type="text"
                      name="titulo"
                      placeholder="Título do livro"
                      value={formulario.titulo}
                      onChange={handleChange}
                  />
              </div>

              <div className={styles.campo}>
                  <label className={styles.labelClaro}>Local (Cidade)*</label>
                  <input
                      className={styles.inputClaro}
                      type="text"
                      name="local"
                      placeholder="Ex: Fortaleza"
                      value={formulario.local}
                      onChange={handleChange}
                      required
                  />
              </div>

              <div className={styles.campo}>
                  <label className={styles.labelEscuro}>Nº de páginas, volumes ou folhas</label>

                  <div className={styles.campoDuplo}>
                      <select
                          className={styles.inputEscuro}
                          name="tipoPagina"
                          value={formulario.tipoPagina}
                          onChange={handleChange}
                      >
                          <option>Nº de páginas</option>
                          <option>Volumes</option>
                          <option>Folhas</option>
                      </select>

                      <input
                          className={styles.inputEscuro}
                          type="number"
                          name="quantidadePaginas"
                          placeholder="Ex: 326"
                          value={formulario.quantidadePaginas}
                          onChange={handleChange}
                      />
                  </div>
              </div>

              <div className={styles.campo}>
                  <label className={styles.labelClaro}>On-Line?</label>
                  <select className={styles.inputClaro} name="online" value={formulario.online} onChange={handleChange}>
                      <option>Não</option>
                      <option>Sim</option>
                  </select>
              </div>

              <div className={styles.campo}>
                  <label className={styles.labelEscuro}>Endereço (URL)</label>
                  <input
                      className={styles.inputEscuro}
                      type="text"
                      name="URL"
                      placeholder="Ex: https..."
                      value={formulario.URL}
                      onChange={handleChange}
                      disabled={formulario.online === "Não"}
                  />
              </div>

              <div className={styles.campo}>
                  <label className={styles.labelClaro}>Ano(aaaa)*</label>
                  <input
                      className={styles.inputClaro}
                      type="number"
                      name="ano"
                      placeholder="Ex: 2026"
                      value={formulario.ano}
                      onChange={handleChange}
                  />
              </div>

              <div className={styles.campo}>
                  <label className={styles.labelEscuro}>Subordinação do Autor</label>
                  <input
                      className={styles.inputEscuro}
                      type="text"
                      name="Subordinação"
                      placeholder="Secretaria Nacional de Biodiversidade"
                      value={formulario.Subordinação}
                      onChange={handleChange}
                      disabled={formulario.tipoAutor === "Pessoa(s) Física(s)" || formulario.tipoAutor === "Desconhecido"}
                  />
              </div>

          </section>


          <section className={styles.coluna}>

              {/* TIPO DO AUTOR */}
              <div className={styles.campo}>
                  <label className={styles.labelEscuro}>
                      Tipo do Autor
                  </label>

                  <select
                      className={styles.inputEscuro}
                      name="tipoAutor"
                      value={formulario.tipoAutor}
                      onChange={handleChange}
                  >
                      <option>Desconhecido</option>
                      <option>Pessoa(s) Física(s)</option>
                      <option>Pessoa(s) Jurídica(s)</option>
                  </select>
              </div>


              {/* QUANTIDADE DE AUTORES */}
              <div className={styles.campo}>
                  <label className={styles.labelClaro}>
                      Quantidade de Autores
                  </label>

                  <select
                      className={styles.inputClaro}
                      name="quantidadeAutores"
                      value={formulario.quantidadeAutores}
                      onChange={handleChange}
                      disabled={formulario.tipoAutor === "Desconhecido"}
                  >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(numero => (
                          <option key={numero} value={numero}>
                              {numero}
                          </option>
                      ))}
                  </select>
              </div>


              {/* SUBTÍTULO */}
              <div className={styles.campo}>
                  <label className={styles.labelEscuro}>
                      Subtítulo
                  </label>

                  <input
                      className={styles.inputEscuro}
                      type="text"
                      name="subtitulo"
                      placeholder="subtítulo do livro"
                      value={formulario.subtitulo}
                      onChange={handleChange}
                  />
              </div>


              {/* EDITORA */}
              <div className={styles.campo}>
                  <label className={styles.labelClaro}>
                      Editora*
                  </label>

                  <input
                      className={styles.inputClaro}
                      type="text"
                      name="editora"
                      placeholder="Ex: Premius Editora"
                      value={formulario.editora}
                      onChange={handleChange}
                      required
                  />
              </div>


              {/* SÉRIE */}
              <div className={styles.campo}>
                  <label className={styles.labelEscuro}>
                      Série
                  </label>

                  <input
                      className={styles.inputEscuro}
                      type="text"
                      name="serie"
                      placeholder="Ex: Vaga-lume, v. 12"
                      value={formulario.serie}
                      onChange={handleChange}
                  />
              </div>


              {/* RESPONSABILIDADE INTELECTUAL */}
              <div className={styles.campo}>
                  <label className={styles.labelClaro}>
                      Responsabilidade Intelectual
                  </label>

                  <select
                      className={styles.inputClaro}
                      name="responsabilidade"
                      value={formulario.responsabilidade}
                      onChange={handleChange}
                  >
                      <option>Autor da Obra</option>
                      <option>Organizador</option>
                      <option>Editor</option>
                      <option>Compilador</option>
                  </select>
              </div>


              {/* AUTOR */}
              <div className={styles.campo}>
                  <label className={styles.labelEscuro}>
                      Autor*
                  </label>

                  <input
                      className={styles.inputEscuro}
                      type="text"
                      name="autor"
                      placeholder="Nome Completo"
                      value={formulario.autor}
                      onChange={handleChange}
                      required
                  />
              </div>


              {/* NÚMERO DA EDIÇÃO */}
              <div className={styles.campo}>
                  <label className={styles.labelClaro}>
                      Nº da Edição
                  </label>

                  <input
                      className={styles.inputClaro}
                      type="number"
                      name="edicao"
                      placeholder="Ex: 3"
                      value={formulario.edicao}
                      onChange={handleChange}
                  />
              </div>


              {/* NOTAS */}
              <div className={styles.campo}>
                  <label className={styles.labelEscuro}>
                      Notas
                  </label>

                  <input
                      className={styles.inputEscuro}
                      type="text"
                      name="notas"
                      placeholder="Ex: Edição comemorativa"
                      value={formulario.notas}
                      onChange={handleChange}
                  />
              </div>

          </section>

          <section className={styles.coluna}>
            <div className={styles.campo}>
                  <label className={styles.labelEscuro}>Descrição Física do Suporte</label>

                  <div className={styles.campoDuplo}>
                      <select
                          className={styles.inputEscuro}
                          name="tipoSuporteFisico"
                          value={formulario.tipoSuporteFisico}
                          onChange={handleChange}
                      >
                          <option>Nenhum</option>
                          <option>CD-ROM</option>
                          <option>DVD</option>
                          <option>E-Book</option>
                          <option>Blu-ray</option>
                          <option>Outro</option>
                      </select>

                      <input
                          className={styles.inputEscuro}
                          type="number"
                          name="qtdSuporteFisico"
                          placeholder="Ex: 2"
                          value={formulario.qtdSuporteFisico}
                          onChange={handleChange}
                          disabled={formulario.tipoSuporteFisico === "Nenhum"}
                      />
                  </div>
              </div>

            <div className={styles.campo}>
                  <label className={styles.labelClaro}>Outro Suporte Fisico</label>
                  <input
                      className={styles.inputClaro}
                      type="text"
                      name="outroSuporteFisico"
                      placeholder="Ex: pen drive"
                      value={formulario.outroSuporteFisico}
                      onChange={handleChange}
                      disabled={formulario.tipoSuporteFisico !== "Outro"}
                  />
              </div>

            <div className={styles.campo}>
                  <label className={styles.labelEscuro}>Outro tipo de responsabilidade</label>
                  <input
                      className={styles.inputEscuro}
                      type="text"
                      name="tipoResponsa"
                      placeholder="Ex: Tradução de Heitor Aquino Ferreira"
                      value={formulario.tipoResponsa}
                      onChange={handleChange}
                  />
              </div>


            <div className={styles.campo}>
                  <label className={styles.labelClaro}>data do acesso a fonte bibliografica</label>
                  <input
                      className={styles.inputClaro}
                      type="date"
                      name="dataAcesso"
                      value={formulario.dataAcesso}
                      onChange={handleChange}
                  />
              </div>

          </section>

          <button
              type="submit"
              className={styles.btnGerar}
          >
              Gerar Referências e Citações
          </button>

          </form>

      </main>

    </div>
  );
}