import Button from "../components/Button";
import Input from "../components/Input";
import React from "react";
import { Link } from "react-router-dom";
import styles from "./RegisterPage.module.css"
import Styles from "./fundoLogins.module.css"
import logoUniforBranca from "../assets/logoUniforBranca.png"
import simbolo1 from "../assets/simboloUnifor1.png"
import simbolo2 from "../assets/simboloUnifor2.png"
import simbolo3 from "../assets/simboloUnifor3.png"
import simbolo4 from "../assets/simboloUnifor4.png"
import simbolo5 from "../assets/simboloUnifor5.png"
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from "firebase/auth";
import { auth } from "../services/firebase.js";
import { authErrorMessage } from "../services/authErrors.js";

function isAllowedDomain(value) {
    const allowed = (import.meta.env.VITE_ALLOWED_EMAIL_DOMAINS || "@edu.unifor.br,@unifor.br")
        .split(",")
        .map((domain) => domain.trim().toLowerCase())
        .filter(Boolean)
        .map((domain) => (domain.startsWith("@") ? domain : `@${domain}`));

    const email = value.trim().toLowerCase();
    const at = email.lastIndexOf("@");

    return at > 0 && allowed.includes(email.slice(at));
}

export default function RegisterPage() {
    const navigate = useNavigate();

    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [confirmar, setConfirmar] = useState("");
    const [erro, setErro] = useState("");
    const [carregando, setCarregando] = useState(false);

    async function handleSubmit(evento) {
        evento.preventDefault();
        setErro("");

        if (!isAllowedDomain(email)) {
            setErro("Use seu e-mail institucional (@edu.unifor.br ou @unifor.br).");
            return;
        }

        if (senha.length < 6) {
            setErro("A senha deve ter pelo menos 6 caracteres.");
            return;
        }

        if (senha !== confirmar) {
            setErro("As senhas não coincidem.");
            return;
        }

        setCarregando(true);

        try {
            const { user } = await createUserWithEmailAndPassword(auth, email.trim(), senha);
            await updateProfile(user, { displayName: nome.trim() });
            await user.getIdToken(true);

            try {
                await sendEmailVerification(user, {
                    url: `${window.location.origin}/PasswordVerificationPage`,
                });
            } catch {
                // A tela de verificação permite reenviar o e-mail.
            }

            navigate("/PasswordVerificationPage");
        } catch (error) {
            setErro(authErrorMessage(error));
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
                <h5 className="text-start">Nome:</h5>
                <Input
                    tipo='text'
                    value={nome}
                    onChange={(evento) => setNome(evento.target.value)}
                    autoComplete="name"
                    required
                /><br></br>
                <h5 className="text-start">Email:</h5>
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
                    autoComplete="new-password"
                    required
                /><br></br>
                <h5 className="text-start">Repita a Senha:</h5>
                <Input
                    tipo='password'
                    value={confirmar}
                    onChange={(evento) => setConfirmar(evento.target.value)}
                    autoComplete="new-password"
                    required
                /><br></br>
                {erro && <p className="text-danger">{erro}</p>}
                <Link to="/PasswordRecoveryPage" className="me-5 pe-4">Esqueci a Senha</Link>
                <Link to="/" className="ms-5">Entrar</Link><br></br>
                <Button
                    label={carregando ? 'Cadastrando...' : 'Cadastrar'}
                    type="submit"
                    disabled={carregando}
                ></Button>
                <Button label='Voltar' to='/'></Button>
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