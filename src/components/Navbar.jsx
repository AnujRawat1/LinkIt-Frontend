import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const generateRoomId = () => Math.random().toString(36).substring(2, 8);

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav
      className="shadow-md py-4 px-4 sm:px-6"
      style={{ background: 'linear-gradient(to right, lightblue, #add8e6)' }}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link to="/">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-black font-mono tracking-wide italic">
            LinkIt
          </h1>
        </Link>

        {/* Hamburger menu button */}
        <div className="sm:hidden">
          <button onClick={() => setMenuOpen(!menuOpen)} className="text-black">
            {menuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Navigation Links */}
        <ul
          className={`${
            menuOpen ? 'flex' : 'hidden'
          } flex-col sm:flex sm:flex-row gap-4 sm:gap-8 text-base sm:text-lg font-semibold text-gray-800 items-center absolute sm:static top-16 left-0 w-full sm:w-auto z-50 sm:z-auto 
          py-4 sm:py-0 px-6 sm:px-0 rounded-md sm:rounded-none shadow-md sm:shadow-none transition-all duration-300`}
          style={{
            background: menuOpen
              ? 'linear-gradient(to right, lightblue, #add8e6)'
              : 'transparent',
          }}
        >
          <li>
            <Link to="/" onClick={() => setMenuOpen(false)} className="hover:text-blue-700">
              Home
            </Link>
          </li>
          <li>
            <Link to="/about" onClick={() => setMenuOpen(false)} className="hover:text-blue-700">
              About
            </Link>
          </li>
          <li>
            <Link
              to={`/room/${generateRoomId()}`}
              onClick={() => setMenuOpen(false)}
              className="hover:text-blue-800"
            >
              Create Room
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
