import React from 'react';
import { Link } from 'react-router-dom';
import styles from './hero.module.css';

function HeroSection() {
    return (
        <section className={styles.banner}>
            <div className={styles.vector}>
                <h1>Build advanced chatbots visually</h1>
                <p>Typebot gives you powerful blocks to create unique chat experiences. Embed them anywhere on your web/mobile apps and start collecting results like magic.</p>
                <Link to="/register"><button>Create a FormBot for free</button></Link>
                <img className={styles.triangle} src="/images/vectors/triangle-single.png" alt="triangle image" />
                <img className={styles.semiCircle} src="/images/vectors/semi-circle.png" alt="semi-circle image" />
            </div>
            <img src="/Hero.png" alt="banner image" />
        </section>
    )
}

export default HeroSection