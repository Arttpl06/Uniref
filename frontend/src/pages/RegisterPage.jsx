import Button from "../components/Button";
import Input from "../components/Input";
import React from "react";
import styles from "./RegisterPage.module.css"
import logoUniforBranca from "../assets/logoUniforBranca.png"
import simbolo1 from "../assets/simboloUnifor1.png"
import simbolo2 from "../assets/simboloUnifor2.png"
import simbolo3 from "../assets/simboloUnifor3.png"
import simbolo4 from "../assets/simboloUnifor4.png"
import simbolo5 from "../assets/simboloUnifor5.png"

export default function RegisterPage() {
    return(
        <div className={styles.fundo}>
            <div>
            <img src={logoUniforBranca} alt="logo unifor" className={styles.logoUnifor}/>
            <h1 className="text-white">Unifor</h1>
            <h2 className="text-white">Gerador de Referências ABNT</h2>
            </div>
            <div className={styles.card}>
                <h5 className="text-start">Nome:</h5>
                <Input tipo='text'/><br></br>
                <h5 className="text-start">Email:</h5>
                <Input tipo='email'/><br></br>
                <h5 className="text-start">Senha:</h5>
                <Input tipo='password'/><br></br>
                <h5 className="text-start">Repita a Senha:</h5>
                <Input tipo='password'/><br></br>
                <a href="#" className="me-5 pe-5">Esqueci a Senha</a>
                <a href="#" className="ms-5">Cadastrar</a><br></br>
                <Button label='Cadastrar'></Button>
                <Button label='Voltar'></Button>
            </div>
            <div>
                <img src={simbolo2} alt="simbolo2" className={styles.simbolos}/>
                <img src={simbolo4} alt="simbolo4" className={styles.simbolos}/>
                <img src={simbolo3} alt="simbolo3" className={styles.simbolos}/>
                <img src={simbolo1} alt="simbolo1" className={styles.simbolos}/>
            </div>
        </div>
    )
};