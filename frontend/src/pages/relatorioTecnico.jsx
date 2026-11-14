import React, { useState } from "react";
import Styles from "./fundoSite.module.css";
import styles from "./fundoRefs.module.css";
import style from "./relatorioTecnico.module.css";
import logoUniforBranca from "../assets/logoUniforBranca.png"

export default function RelatorioTec() {

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
      autor2: "",
      autor3: "",
      autor4: "",
      autor5: "",
      autor6: "",
      autor7: "",
      autor8: "",
      autor9: "",
      autor10: "",
      edicao: "",
      notas: "",
      tipoSuporteFisico: "Nenhum",
      qtdSuporteFisico: "",
      outroSuporteFisico: "",
      URL: "",
      Subordinação: "",
      tipoResponsa: "",
      dataAcesso: "",
      pais: ""
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
              ELABORAR REFERÊNCIA A RELATÓRIOS TÉCNICOS:
          </h3>

          <form
              className={style.formReferencias}
              onSubmit={handleSubmit}
          >


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
                      <option>Entidade Coletiva(Assoc, Emp, etc)</option>
                      <option>Orgãos Governamentais</option>
                  </select>
              </div>

              {/* RESPONSABILIDADE INTELECTUAL */}
              <div className={styles.campo}>
                  <label className={styles.labelEscuro}>
                      Responsabilidade Intelectual
                  </label>

                  <select
                      className={styles.inputEscuro}
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

              {/* QUANTIDADE DE AUTORES */}
                {formulario.tipoAutor !== "Desconhecido" && (
                    <div className={styles.campo}>
                        <label className={styles.labelEscuro}>
                            Quantidade de Autores
                        </label>

                        <select
                            className={styles.inputEscuro}
                            name="quantidadeAutores"
                            value={formulario.quantidadeAutores}
                            onChange={handleChange}
                        >
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(numero => (
                                <option key={numero} value={numero}>
                                    {numero}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {formulario.tipoAutor !== "Desconhecido" &&(
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
                )}

                {formulario.tipoAutor !== "Desconhecido" && formulario.quantidadeAutores >= 2 && formulario.abreviada !== "Sim" &&(
                    <div className={styles.campo}>
                        <label className={styles.labelEscuro}>
                            2º Autor
                        </label>

                        <input
                            className={styles.inputEscuro}
                            type="text"
                            name="autor2"
                            placeholder="Nome Completo"
                            value={formulario.autor2}
                            onChange={handleChange}
                        />
                    </div>
                )}

                {formulario.tipoAutor !== "Desconhecido" && formulario.quantidadeAutores >= 3 && formulario.abreviada !== "Sim" &&(
                    <div className={styles.campo}>
                        <label className={styles.labelEscuro}>
                            3º Autor
                        </label>

                        <input
                            className={styles.inputEscuro}
                            type="text"
                            name="autor3"
                            placeholder="Nome Completo"
                            value={formulario.autor3}
                            onChange={handleChange}
                        />
                    </div>
                )}

                {formulario.tipoAutor !== "Desconhecido" && formulario.quantidadeAutores >= 4 && formulario.abreviada !== "Sim" &&(
                    <div className={styles.campo}>
                        <label className={styles.labelEscuro}>
                            4º Autor
                        </label>

                        <input
                            className={styles.inputEscuro}
                            type="text"
                            name="autor4"
                            placeholder="Nome Completo"
                            value={formulario.autor4}
                            onChange={handleChange}
                        />
                    </div>
                )}

                {formulario.tipoAutor !== "Desconhecido" && formulario.quantidadeAutores >= 5 && formulario.abreviada !== "Sim" &&(
                    <div className={styles.campo}>
                        <label className={styles.labelEscuro}>
                            5º Autor
                        </label>

                        <input
                            className={styles.inputEscuro}
                            type="text"
                            name="autor5"
                            placeholder="Nome Completo"
                            value={formulario.autor5}
                            onChange={handleChange}
                        />
                    </div>
                )}

                {formulario.tipoAutor !== "Desconhecido" && formulario.quantidadeAutores >= 6 && formulario.abreviada !== "Sim" &&(
                    <div className={styles.campo}>
                        <label className={styles.labelEscuro}>
                            6º Autor
                        </label>

                        <input
                            className={styles.inputEscuro}
                            type="text"
                            name="autor6"
                            placeholder="Nome Completo"
                            value={formulario.autor6}
                            onChange={handleChange}
                        />
                    </div>
                )}

                {formulario.tipoAutor !== "Desconhecido" && formulario.quantidadeAutores >= 7 && formulario.abreviada !== "Sim" &&(
                    <div className={styles.campo}>
                        <label className={styles.labelEscuro}>
                            7º Autor
                        </label>

                        <input
                            className={styles.inputEscuro}
                            type="text"
                            name="autor7"
                            placeholder="Nome Completo"
                            value={formulario.autor7}
                            onChange={handleChange}
                        />
                    </div>
                )}

                {formulario.tipoAutor !== "Desconhecido" && formulario.quantidadeAutores >= 8 && formulario.abreviada !== "Sim" &&(
                    <div className={styles.campo}>
                        <label className={styles.labelEscuro}>
                            8º Autor
                        </label>

                        <input
                            className={styles.inputEscuro}
                            type="text"
                            name="autor8"
                            placeholder="Nome Completo"
                            value={formulario.autor8}
                            onChange={handleChange}
                        />
                    </div>
                )}

                {formulario.tipoAutor !== "Desconhecido" && formulario.quantidadeAutores >= 9 && formulario.abreviada !== "Sim" &&(
                    <div className={styles.campo}>
                        <label className={styles.labelEscuro}>
                            9º Autor
                        </label>

                        <input
                            className={styles.inputEscuro}
                            type="text"
                            name="autor9"
                            placeholder="Nome Completo"
                            value={formulario.autor9}
                            onChange={handleChange}
                        />
                    </div>
                )}

                {formulario.tipoAutor !== "Desconhecido" && formulario.quantidadeAutores >= 10 && formulario.abreviada !== "Sim" &&(
                    <div className={styles.campo}>
                        <label className={styles.labelEscuro}>
                            10º Autor
                        </label>

                        <input
                            className={styles.inputEscuro}
                            type="text"
                            name="autor10"
                            placeholder="Nome Completo"
                            value={formulario.autor10}
                            onChange={handleChange}
                        />
                    </div>
                )}

                {formulario.tipoAutor !== "Desconhecido" && formulario.tipoAutor !== "Pessoa(s) Física(s)" &&(
                    <div className={styles.campo}>
                        <label className={styles.labelEscuro}>
                            País, Estado, Município 
                        </label>

                        <input
                            className={styles.inputEscuro}
                            type="text"
                            name="autor"
                            placeholder="Ex: Brasil"
                            value={formulario.autor}
                            onChange={handleChange}
                            required
                        />
                    </div>
                )}

                {formulario.tipoAutor === "Pessoa(s) Jurídica(s)" && (
                    <div className={styles.campo}>
                        <label className={styles.labelEscuro}>
                            Subordinação do Autor
                        </label>

                        <input
                            className={styles.inputEscuro}
                            type="text"
                            name="Subordinação"
                            placeholder="Secretaria Nacional de Biodiversidade"
                            value={formulario.Subordinação}
                            onChange={handleChange}
                        />
                    </div>
                )}

                    {formulario.tipoAutor !== "Desconhecido" && 
                    formulario.tipoAutor !== "Entidade Coletiva(Assoc, Emp, etc)" &&
                    formulario.tipoAutor !== "Orgãos Governamentais" &&
                    Number(formulario.quantidadeAutores) >= 4 && (
                        <div className={styles.campo}>
                            <label className={styles.labelEscuro}>
                                Forma Abreviada p/ 4 ou mais autores
                            </label>

                            <select
                                className={styles.inputEscuro}
                                name="abreviada"
                                value={formulario.abreviada}
                                onChange={handleChange}
                            >
                                <option>Não</option>
                                <option>Sim</option>
                            </select>
                        </div>
                    )}

          </section>

          <section className={styles.coluna}>

              <div className={styles.campo}>
                  <label className={styles.labelEscuro}>Título*</label>
                  <input
                      className={styles.inputEscuro}
                      type="text"
                      name="titulo"
                      placeholder="Título do livro"
                      value={formulario.titulo}
                      onChange={handleChange}
                      required
                  />
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

              {/* NÚMERO DA EDIÇÃO */}
              <div className={styles.campo}>
                  <label className={styles.labelEscuro}>
                      Nº da Edição
                  </label>

                  <input
                      className={styles.inputEscuro}
                      type="number"
                      name="edicao"
                      placeholder="Ex: 3"
                      value={formulario.edicao}
                      onChange={handleChange}
                  />
              </div>

              <div className={styles.campo}>
                  <label className={styles.labelEscuro}>Local (Cidade)*</label>
                  <input
                      className={styles.inputEscuro}
                      type="text"
                      name="local"
                      placeholder="Ex: Fortaleza"
                      value={formulario.local}
                      onChange={handleChange}
                      required
                  />
              </div>

              {/* EDITORA */}
              <div className={styles.campo}>
                  <label className={styles.labelEscuro}>
                      Editora*
                  </label>

                  <input
                      className={styles.inputEscuro}
                      type="text"
                      name="editora"
                      placeholder="Ex: Premius Editora"
                      value={formulario.editora}
                      onChange={handleChange}
                      required
                  />
              </div>

              <div className={styles.campo}>
                  <label className={styles.labelEscuro}>Ano(aaaa)*</label>
                  <input
                      className={styles.inputEscuro}
                      type="text"
                      name="ano"
                      placeholder="Ex: 2026"
                      value={formulario.ano}
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

          </section>

          <section className={styles.coluna}>

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

                        {formulario.tipoSuporteFisico !== "Nenhum" && formulario.tipoSuporteFisico !== "E-Book" &&(
                            <input
                                className={styles.inputEscuro}
                                type="number"
                                name="qtdSuporteFisico"
                                placeholder="Ex: 2"
                                value={formulario.qtdSuporteFisico}
                                onChange={handleChange}
                            />
                        )}
                  </div>
              </div>



                {formulario.tipoSuporteFisico === "Outro" && (
                    <div className={styles.campo}>
                        <label className={styles.labelEscuro}>
                            Outro Suporte Físico
                        </label>

                        <input
                            className={styles.inputEscuro}
                            type="text"
                            name="outroSuporteFisico"
                            placeholder="Ex: pen drive"
                            value={formulario.outroSuporteFisico}
                            onChange={handleChange}
                        />
                    </div>
                )}


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

              <div className={styles.campo}>
                  <label className={styles.labelEscuro}>On-Line?</label>
                  <select className={styles.inputEscuro} name="online" value={formulario.online} onChange={handleChange}>
                      <option>Não</option>
                      <option>Sim</option>
                  </select>
              </div>

                {formulario.online === "Sim" && (
                    <div className={styles.campo}>
                        <label className={styles.labelEscuro}>
                            Endereço (URL)
                        </label>

                        <input
                            className={styles.inputEscuro}
                            type="text"
                            name="URL"
                            placeholder="Ex: https..."
                            value={formulario.URL}
                            onChange={handleChange}
                        />
                    </div>
                )}

                {formulario.online === "Sim" && (
            <div className={styles.campo}>
                  <label className={styles.labelEscuro}>data do acesso a fonte bibliografica</label>
                  <input
                      className={styles.inputEscuro}
                      type="date"
                      name="dataAcesso"
                      value={formulario.dataAcesso}
                      onChange={handleChange}
                  />
              </div>
            )}

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