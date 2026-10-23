import Button from "../components/Button";
import Input from "../components/Input";
import React from "react";
import styles from "../modules/pageSenha3.module.css"
import logoUniforBranca from "../images/logoUniforBranca.png"
import simbolo1 from "../images/simboloUnifor1.png"
import simbolo2 from "../images/simboloUnifor2.png"
import simbolo3 from "../images/simboloUnifor3.png"
import simbolo4 from "../images/simboloUnifor4.png"
import simbolo5 from "../images/simboloUnifor5.png"


export default function PageSenha3(){
    return(
        <div className={styles.fundo}>
            <div>
            <img src={logoUniforBranca} alt="logo unifor" className={styles.logoUnifor}/>
            <h1 className="text-white">Unifor</h1>
            <h2 className="text-white">Gerador de Referências ABNT</h2>
            </div>
            <div className={styles.card}>
                <h5 className="text-start">Senha:</h5>
                <Input tipo='password'/><br></br>
                <h5 className="text-start">Repita a Senha:</h5>
                <Input tipo='password'/><br></br>
                <Button label='Confirmar Senha'></Button>
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