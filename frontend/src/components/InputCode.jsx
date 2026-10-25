import styles from "./InputCode.module.css"

export default function InputCode() {
    return(
        <div className={styles.inputCode}>
            <input className={styles.box}></input>
            <input className={styles.box}></input>
            <input className={styles.box}></input>
            <input className={styles.box}></input>
            <input className={styles.box}></input>
            <input className={styles.box}></input>
        </div>
    )
}