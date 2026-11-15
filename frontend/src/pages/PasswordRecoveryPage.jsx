import Button from "../components/Button";
import Input from "../components/Input";
import React, { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import styles from "./PasswordRecoveryPage.module.css"
import Styles from "./fundoLogins.module.css"
import logoUniforBranca from "../assets/logoUniforBranca.png"
import simbolo1 from "../assets/simboloUnifor1.png"
import simbolo2 from "../assets/simboloUnifor2.png"
import simbolo3 from "../assets/simboloUnifor3.png"
import simbolo4 from "../assets/simboloUnifor4.png"
import simbolo5 from "../assets/simboloUnifor5.png"
import { auth } from "../services/firebase.js";
import { authErrorMessage } from "../services/authErrors.js";


export default function PasswordRecoveryPage(){
    const [email, setEmail] = useState("");
    const [erro, setErro] = useState("");
    const [aviso, setAviso] = useState("");
    const [carregando, setCarregando] = useState(false);

    async function handleSubmit(evento) {
        evento.preventDefault();
        setErro("");
        setAviso("");
        setCarregando(true);

        try {
            await sendPasswordResetEmail(auth, email.trim());
            setAviso("Se este e-mail estiver cadastrado, enviamos as instruções para redefinir a senha.");
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
                <h5 className="text-start">Email:</h5>
                <Input
                    tipo='email'
                    value={email}
                    onChange={(evento) => setEmail(evento.target.value)}
                    autoComplete="email"
                    required
                /><br></br>
                {erro && <p className="text-danger">{erro}</p>}
                {aviso && <p className="text-success">{aviso}</p>}
                <Button
                    label={carregando ? 'Enviando...' : 'Acessar'}
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
