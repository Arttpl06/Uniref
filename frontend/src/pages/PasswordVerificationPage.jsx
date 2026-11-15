import Button from "../components/Button";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { sendEmailVerification } from "firebase/auth";
import styles from "./PasswordVerificationPage.module.css"
import Styles from "./fundoLogins.module.css"
import logoUniforBranca from "../assets/logoUniforBranca.png"
import simbolo1 from "../assets/simboloUnifor1.png"
import simbolo2 from "../assets/simboloUnifor2.png"
import simbolo3 from "../assets/simboloUnifor3.png"
import simbolo4 from "../assets/simboloUnifor4.png"
import simbolo5 from "../assets/simboloUnifor5.png"
import { auth } from "../services/firebase.js";
import { useAuth } from "../auth/AuthContext.jsx";
import { authErrorMessage } from "../services/authErrors.js";


export default function PasswordVerificationPage(){
    const navigate = useNavigate();
    const { user, loading, syncWithBackend } = useAuth();

    const [erro, setErro] = useState("");
    const [aviso, setAviso] = useState("");
    const [carregando, setCarregando] = useState(false);
    const [enviando, setEnviando] = useState(false);

    useEffect(() => {
        if (!loading && !user) {
            navigate("/", { replace: true });
        }
    }, [loading, user, navigate]);

    async function handleVerificar() {
        setErro("");
        setAviso("");
        setCarregando(true);

        try {
            await auth.currentUser.reload();

            if (!auth.currentUser.emailVerified) {
                setErro("Ainda não identificamos a verificação. Abra o link do e-mail e tente de novo.");
                return;
            }

            await auth.currentUser.getIdToken(true);
            await syncWithBackend();
            navigate("/InicioPage", { replace: true });
        } catch (error) {
            setErro(error.message);
        } finally {
            setCarregando(false);
        }
    }

    async function handleReenviar() {
        setErro("");
        setAviso("");
        setEnviando(true);

        try {
            await sendEmailVerification(auth.currentUser, {
                url: `${window.location.origin}/PasswordVerificationPage`,
            });
            setAviso("E-mail enviado. Confira a caixa de entrada e o spam.");
        } catch (error) {
            setErro(authErrorMessage(error));
        } finally {
            setEnviando(false);
        }
    }

    return(
        <div className={Styles.fundo}>
            <div className={Styles.titulo}>
            <img src={logoUniforBranca} alt="logo unifor" className={Styles.logoUnifor}/>
            <h1 className="text-white">Unifor</h1>
            <h2 className="text-white">Gerador de Referências ABNT</h2>
            </div>
            <div className={styles.card}>
                <h5 className="text-start mb-3">Confirme seu e-mail:</h5>
                <p className="text-start">
                    Enviamos um link de confirmação para <strong>{user?.email}</strong>.
                </p>
                {erro && <p className="text-danger">{erro}</p>}
                {aviso && <p className="text-success">{aviso}</p>}
                <Button
                    label={carregando ? 'Verificando...' : 'Já verifiquei'}
                    onClick={handleVerificar}
                    disabled={carregando}
                ></Button>
                <Button
                    label={enviando ? 'Enviando...' : 'Reenviar e-mail'}
                    onClick={handleReenviar}
                    disabled={enviando}
                ></Button>
                <Button label='Voltar' to='/'></Button>
            </div>
            <div>
                <img src={simbolo2} alt="simbolo2" className={Styles.simbolos}/>
                <img src={simbolo4} alt="simbolo4" className={Styles.simbolos}/>
                <img src={simbolo3} alt="simbolo3" className={Styles.simbolos}/>
                <img src={simbolo1} alt="simbolo1" className={Styles.simbolos}/>
            </div>
        </div>
    )
};
