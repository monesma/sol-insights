import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import Logo from "../assets/img/logo4.png";
import ScreenSize from "../helpers/ScreenSize";

const Header = () => {
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const screenW = ScreenSize().width;

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header
      className={`${isHomePage ? "absolute-header" : ""} ${
        isMenuOpen ? "menu-open" : ""
      }`}
    >
      <img src={Logo} alt="logo" />
      {screenW < 1024 ? (
        <>
          <button className="burger-btn" onClick={toggleMenu}>
            ☰
          </button>
          <nav className={isMenuOpen ? "nav-open" : ""}>
            <Link to="/" onClick={() => setIsMenuOpen(false)}>
              Home
            </Link>
            <Link to="/transactions" onClick={() => setIsMenuOpen(false)}>
              Transactions
            </Link>
            <Link to="/validators" onClick={() => setIsMenuOpen(false)}>
              Validators
            </Link>
          </nav>
        </>
      ) : (
        <nav>
          <Link to="/">Home</Link>
          <Link to="/transactions">Transactions</Link>
          <Link to="/validators">Validators</Link>
        </nav>
      )}
    </header>
  );
};

export default Header;
