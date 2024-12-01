import React from "react";
import styles from "../styles/Home.module.css";

const Home = () => {
  return (
    <div className={styles.container}>
      <h1>Bem-vindo ao Histórico de Revisões</h1>
      <br /><br />
      <p>Escolha como deseja visualizar as revisões:</p><br />
      <div className={styles.buttons}>
        <a href="/revisions" className={styles.button}>
          Ver Revisões em Lista
        </a>
        <a href="/timeline" className={styles.button}>
          Ver Revisões em Timeline
        </a><br /><br />
      </div>
    </div>
  );
};

export default Home;