import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-[#7ce7f6] to-white py-6">
      <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-center text-gray-800">

        <p className="text-sm italic text-gray-700 mt-4 sm:mt-0 ">
          © {new Date().getFullYear()} LinkIt — Built with 💙 by Anuj
        </p>
      </div>
    </footer>
  );
};

export default Footer;
