import React from 'react';

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-r from-[#7ce7f6] to-white py-16 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-extrabold text-blue-700 font-mono mb-6 italic">
          About LinkIt
        </h1>

        <p className="text-lg text-gray-700 mb-8">
          <strong>LinkIt</strong> is your modern solution to a simple problem — syncing clipboard data across multiple devices in real-time.
          Whether you're copying code snippets, links, text, or notes — LinkIt ensures it's available on all your devices without the hassle of email or messaging.
        </p>

        <div className="bg-white/60 p-6 rounded-xl shadow-md text-left backdrop-blur">
          <h2 className="text-2xl font-semibold text-indigo-700 mb-4">🚀 Why LinkIt?</h2>
          <ul className="list-disc list-inside text-gray-800 space-y-2">
            <li>Instant clipboard syncing between devices</li>
            <li>Secure and private clipboard rooms</li>
            <li>Share text without needing to login or install anything</li>
            <li>Built using React, Tailwind CSS, and Material UI</li>
          </ul>
        </div>

        <p className="mt-10 text-md text-gray-600 italic">
          Crafted with 💙 for productivity and ease of use.
        </p>
      </div>
    </div>
  );
};

export default About;
