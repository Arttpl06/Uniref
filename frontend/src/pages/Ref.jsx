import React, { useState } from "react";
import Styles from "./fundoSite.module.css";
import styles from "./fundoRefs.module.css";
import style from "./Ref.module.css";
import logoUniforBranca from "../assets/logoUniforBranca.png"
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';

export default function Ref() {

  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const estado = location.state || {};
  const referencia = estado.referencia;
  const citacao = estado.citacao;

  const [perfilAberto, setPerfilAberto] = useState(false);

  const [pesquisa, setPesquisa] = useState("");

  function alternarPerfil() {
    setPerfilAberto(!perfilAberto);
  }

  function renderSegmentos(segmentos) {
    if (!segmentos) return null;
    return segmentos.map((segmento, index) => {
      if (segmento.destaque === "italico") {
        return <em key={index}>{segmento.texto}</em>;
      }
      if (segmento.destaque === "negrito") {
        return <strong key={index}>{segmento.texto}</strong>;
      }
      return <span key={index}>{segmento.texto}</span>;
    });
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
                <strong>{user?.displayName || user?.email}</strong>
              </div>

              <button>Gerenciar Referências</button>
              <button>Criar e Editar Coleções</button>
              <button>Atualizar Perfil</button>

              <div className={Styles.areaSair}>
                <button onClick={logout}>Sair</button>
              </div>

            </div>
          )}

        </div>

      </header>

      <main className={style.containerReferencias}>

        <h3 className={styles.tituloFormulario}>
          REFERÊNCIA E CITAÇÃO:
        </h3>

        {referencia && citacao ? (
          <div className={style.saidaResultado}>

            <div className={styles.campo}>
              <label className={styles.labelEscuro}>
                Referência:
              </label>
              <div className={style.valorReferencia}>
                {renderSegmentos(referencia.segmentos)}
              </div>
            </div>

            <div className={styles.campo}>
              <label className={styles.labelEscuro}>
                Citação indireta (chamada entre parênteses):
              </label>
              <div className={style.valorReferencia}>
                {renderSegmentos(citacao.chamada.segmentos)}
              </div>
            </div>

          </div>
        ) : (
          <div className={style.semResultado}>
            <p>Gere uma referência primeiro.</p>
            <button
              className={styles.btnGerar}
              onClick={() => navigate("/Livros")}
            >
              Ir para o formulário
            </button>
          </div>
        )}

        <button
          type="button"
          className={styles.btnGerar}
          onClick={() => navigate("/InicioPage")}
        >
          Voltar
        </button>

      </main>

    </div>
  );
}
