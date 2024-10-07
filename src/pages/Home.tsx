import { Link } from "react-router-dom";
import Wallet from "../assets/img/transac.png"
import Valid from "../assets/img/valid.png"
import Rocket from "../assets/img/rocketsol.png"
import ScreenSize from "../helpers/ScreenSize";
import { motion, useInView } from "framer-motion";
import Form from "../components/Form"
import { useRef } from "react";
const home = () => {
    const screenW = ScreenSize().width;
    const sectionVariants = {
      hidden: { opacity: 0, y: 50 },
      visible: { opacity: 1, y: 0 },
    };
    const rocketVariants = {
      hidden: { y: 300, opacity: 0 },
      visible: { y: 0, opacity: 1 },
    };


  const article1Ref = useRef(null);
  const article2Ref = useRef(null);
  const pRef = useRef(null);
  const rocketRef = useRef(null);

  const isInViewArticle1 = useInView(article1Ref);
  const isInViewArticle2 = useInView(article2Ref);
  const isInViewP = isInViewArticle1 || isInViewArticle2;
  const isInViewRocket = useInView(rocketRef);

  return (
    <>
      <div className="presentation">
        <motion.h1
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
          >The solana network analysis platform</motion.h1>
        {screenW >= 1024 && <motion.a
          href="#about"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2, delay: 0.5 }}
        >Discover</motion.a>}
      </div>
      <section className="about" id="about">
        <div>

        
        <div>
          <h2>About us</h2>
          <p>
            With Sol Insights, dive into the heart of the Solana network to gain
            an in-depth understanding of how it works and the impact of key events
            on the ecosystem. Our platform offers you simple, accessible analysis
            tools, as well as the ability to monitor interactions on the
            blockchain in real time.
          </p>

          <p>
            Whether you want to observe the health of the network, track the
            activity of validators, or measure the effects of an update or
            technical incident, Sol Insights helps you visualize and decipher
            what's happening in the Solana universe.
          </p>
        </div>
        <div className="iframe-container">
        <iframe width="560" height="315" src="https://www.youtube.com/embed/LqeWN6_ThnI?si=TkCwfslnzhnhM6W-" title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen></iframe>
        </div>
        </div>
      </section>
      <section className="analysis">
      <h2>Find out more about the Solana network through our analyses</h2>

      <motion.article
        ref={article1Ref}
        initial="hidden"
        animate={isInViewArticle1 ? "visible" : "hidden"}
        transition={{ duration: 0.8 }}
        variants={sectionVariants}
      >
        <motion.img
          src={Wallet}
          alt="Wallet"
          initial={{ opacity: 0, x: -100 }}
          animate={isInViewArticle1 ? { opacity: 1, x: 0 } : { opacity: 0, x: -100 }}
          transition={{ duration: 0.5 }}
        />
        <div>
          <h3>Explore Solana's live transaction analysis at the click of a button!</h3>
          {screenW >= 768 && (
            <p>
              Dive into the heart of Solana transactions and track every move in real time. Discover valuable insights into network trends, user activity and traded volumes. An essential tool for developers, traders, and blockchain enthusiasts.
            </p>
          )}
          <Link to="/transactions">See more</Link>
        </div>
      </motion.article>

      <motion.article
        ref={article2Ref}
        initial="hidden"
        animate={isInViewArticle2 ? "visible" : "hidden"}
        transition={{ duration: 0.8, delay: 0.2 }}
        variants={sectionVariants}
      >
        <div>
          <h3>Discover the in-depth analysis of Solana validators in real time here!</h3>
          {screenW >= 768 && (
            <p>
              Get a complete overview of Solana's validators: performance, reliability and their crucial role in securing the network. Understand how each validator contributes to the decentralization and stability of the blockchain. Ideal for delegators and those wishing to better understand the infrastructure.
            </p>
          )}
          <Link to="/validators">See more</Link>
        </div>
        <motion.img
          src={Valid}
          alt="Valid"
          initial={{ opacity: 0, x: 100 }}
          animate={isInViewArticle2 ? { opacity: 1, x: 0 } : { opacity: 0, x: 100 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        />
      </motion.article>

      <motion.p
        ref={pRef}
        initial="hidden"
        animate={isInViewP ? "visible" : "hidden"}
        transition={{ duration: 0.5, delay: 0.4 }}
        variants={sectionVariants}
      >
        More analysis will be available soon
      </motion.p>
    </section>
    <section className="join" ref={rocketRef}>
      {screenW < 1024 ? (
        <>
          <h2>Join us in building Sol Insights!</h2>
          <p>
            We invite you to join us on the Sol Insights adventure. Together, let's develop an innovative platform that transforms the way we understand and exploit data. Whether you're a developer, designer or passionate about innovation, your contribution is invaluable. Together, let's bring to life ideas that will change the way we work and collaborate. Join us and let's build the future together!
          </p>
          <div>
            <Form />
            <motion.img
              src={Rocket}
              alt="Rocket"
              initial="hidden"
              animate={isInViewRocket ? "visible" : "hidden"}
              transition={{ duration: 1, ease: "easeOut" }}
              variants={rocketVariants}
            />
          </div>
        </>
      ) : (
        <>
          <div>
            <h2>Join us in building Sol Insights!</h2>
            <p>
              We invite you to join us on the Sol Insights adventure. Together, let's develop an innovative platform that transforms the way we understand and exploit data. Whether you're a developer, designer or passionate about innovation, your contribution is invaluable. Together, let's bring to life ideas that will change the way we work and collaborate. Join us and let's build the future together!
            </p>
            <Form />
          </div>
          <motion.img
            src={Rocket}
            alt="Rocket"
            initial="hidden"
            animate={isInViewRocket ? "visible" : "hidden"}
            transition={{ duration: 1, ease: "easeOut" }}
            variants={rocketVariants}
          />
        </>
      )}
    </section>
    </>
  );
};

export default home;
