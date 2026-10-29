import Input from "../components/Input";
import React from "react";
import styles from "./LoginPage.module.css"
import Styles from "./fundoLogins.module.css"
import logoUniforBranca from "../assets/logoUniforBranca.png"
import simbolo1 from "../assets/simboloUnifor1.png"
import simbolo2 from "../assets/simboloUnifor2.png"
import simbolo3 from "../assets/simboloUnifor3.png"
import simbolo4 from "../assets/simboloUnifor4.png"
import simbolo5 from "../assets/simboloUnifor5.png"


export default function LoginPage(){
    return(
        <div className={Styles.fundo}>
            <div className={Styles.titulo}>
            <img src={logoUniforBranca} alt="logo unifor" className={Styles.logoUnifor}/>
            <h1 className="text-white">Unifor</h1>
            <h2 className="text-white">Gerador de Referências ABNT</h2>
            </div>
            <div className={styles.card}>
                <h3 className="mb-4">Acesse sua conta Unifor</h3>
                <h5 className="text-start mt-5">Email:</h5>
                <Input tipo='email'/><br></br>
                <h5 className="text-start">Senha:</h5>
                <Input tipo='password'/><br></br>
                <a href="#" className="me-5 pe-4">Esqueci a Senha</a>
                <a href="#" className="ms-5">Cadastrar</a><br></br>
                <button className="btn btn-primary mt-4 w-100">Acessar</button>
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