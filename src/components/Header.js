import React from "react";
import { Link } from "react-router-dom";
import "./Header.css";
const Header = () => {
  return (
    <footer className="footer">
      <div className="footer-icons">
        <Link to="/toplist" className="footer-icon">
        <i className="fa-solid fa-ranking-star " ></i>
          <span>Ranking</span>
        </Link>
        <Link to="/tasks" className="footer-icon">
          <i className="fas fa-coins"></i>
          <span>Earn</span>
        </Link>
        <Link to="/" className="footer-icon">
          <i className="fas fa-home"></i>
          <span>Home</span>
        </Link>
        <Link to="/friends" className="footer-icon">
          <i className="fas fa-user-friends"></i>
          <span>Friends</span>
        </Link>
        <Link to="/airdrop" className="footer-icon">
          <i className="fas fa-parachute-box"></i>
          <span>Airdrop</span>
        </Link>
      </div>
    </footer>
  );
};

export default Header;
