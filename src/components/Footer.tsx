import LinkedinBlack from "../assets/img/icones/linkedin-logo-black.png"
import TwitterBlack from "../assets/img/icones/twitter-x-black.png"
import TelegramBlack from "../assets/img/icones/telegram-black.png"

const Footer = () => {
  return (
    <footer>
        <div>
            <a target="_blank" href="#" id="arya">
            <img src={LinkedinBlack} alt="" />
            </a>
            <a target="_blank" href="#" id="arya">
            <img src={TwitterBlack} alt="" />
            </a>
            <a target="_blank" href="#" id="arya">
            <img src={TelegramBlack} alt="" />
            </a>
        </div>
      <p>contact@sol-insights.com</p>
    </footer>
  );
};

export default Footer;
