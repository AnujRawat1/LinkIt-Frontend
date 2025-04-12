import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from './components/Home';
import About from './components/About';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Room from "./components/Room";
import { ToastContainer, toast } from 'react-toastify';
import { Link } from 'react-router-dom';
const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <div>
        <Navbar />
        <Home />
        <Footer />
      </div>
    ),
  },
  {
    path: "/about",
    element: (
      <div>
        <Navbar />
        <About />
        <Footer />
      </div>
    ),
  },
  {
    path: "/room/:id",
    element: (
      <div>
        <Navbar />
        <Room/>
        <Footer />
      </div>
    ),
  },
  {
    path: "*",
    element: (
      <div className="min-h-screen bg-gradient-to-r from-[#ffc3c3] to-lightblue flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-extrabold text-red-600 mb-4 animate-bounce">404</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Oops! Page not found</h2>
        <p className="text-gray-600 mb-6">Looks like you took a wrong turn. Let’s get you back home.</p>
        <Link
          to="/"
          className="inline-block px-6 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold shadow transition duration-300"
        >
          Go Home
        </Link>

        <Link></Link>
      </div>
    </div>

    ),
  },
]);

function App() {
  return (
    <>
      <RouterProvider router={router} />
      <ToastContainer position="top-center" autoClose={1000} />
    </>
  );
}

export default App;
