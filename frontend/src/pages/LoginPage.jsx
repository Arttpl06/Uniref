import Input from "../components/Input";
import React from "react";
import { Link } from "react-router-dom";
import styles from "./LoginPage.module.css"
import Styles from "./fundoLogins.module.css"
import logoUniforBranca from "../assets/logoUniforBranca.png"
import simbolo1 from "../assets/simboloUnifor1.png"
import simbolo2 from "../assets/simboloUnifor2.png"
import simbolo3 from "../assets/simboloUnifor3.png"
import simbolo4 from "../assets/simboloUnifor4.png"
import simbolo5 from "../assets/simboloUnifor5.png"
import { useNavigate } from 'react-router-dom';
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../services/firebase.js";
import { useAuth } from "../auth/AuthContext.jsx";
import { authErrorMessage } from "../services/authErrors.js";


export default function LoginPage(){

    const navigate = useNavigate();
    const { syncWithBackend } = useAuth();

    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [erro, setErro] = useState("");
    const [carregando, setCarregando] = useState(false);

    async function handleSubmit(evento) {
        evento.preventDefault();
        setErro("");
        setCarregando(true);

        try {
            const { user } = await signInWithEmailAndPassword(auth, email.trim(), senha);
            await user.reload();

            if (!user.emailVerified) {
                navigate("/PasswordVerificationPage");
                return;
            }

            await syncWithBackend();
            navigate("/InicioPage");
        } catch (error) {
            setErro(
                error.code?.startsWith("auth/") ? authErrorMessage(error) : error.message
            );
        } finally {
            setCarregando(false);
        }
    }

    return(
        <div className={Styles.fundo}>
            <div className={Styles.titulo}>
            <img src={logoUniforBranca} alt="logo unifor" className={Styles.logoUnifor}/>
            <h1 className="text-white">Unifor</h1>
            <h2 className="text-white">Gerador de Referências ABNT</h2>
            </div>
            <form className={styles.card} onSubmit={handleSubmit}>
                <h3 className="mb-4">Acesse sua conta Unifor</h3>
                <h5 className="text-start mt-5">Email:</h5>
                <Input
                    tipo='email'
                    value={email}
                    onChange={(evento) => setEmail(evento.target.value)}
                    autoComplete="email"
                    required
                /><br></br>
                <h5 className="text-start">Senha:</h5>
                <Input
                    tipo='password'
                    value={senha}
                    onChange={(evento) => setSenha(evento.target.value)}
                    autoComplete="current-password"
                    required
                /><br></br>
                {erro && <p className="text-danger">{erro}</p>}
                <Link to="/PasswordRecoveryPage" className="me-5 pe-4">Esqueci a Senha</Link>
                <Link to="/RegisterPage" className="ms-5">Cadastrar</Link><br></br>
                <button type="submit" className="btn btn-primary mt-4 w-100" disabled={carregando}>
                    {carregando ? "Acessando..." : "Acessar"}
                </button>
            </form>
            <div>
                <img src={simbolo2} alt="simbolo2" className={Styles.simbolos}/>
                <img src={simbolo4} alt="simbolo4" className={Styles.simbolos}/>
                <img src={simbolo3} alt="simbolo3" className={Styles.simbolos}/>
                <img src={simbolo1} alt="simbolo1" className={Styles.simbolos}/>
            </div>
        </div>
    )
};