import "./App.css";
import Header from "./components/Header";
import Home from "./pages/Home"
import Analysis from "./pages/Analysis";
import Validator from "./pages/Validator";
import {Routes, Route} from "react-router-dom"
import Footer from "./components/Footer";


function App() {
  return (
    <>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />}/>
          <Route path="/transactions" element={<Analysis />}/>
          <Route path="/validators" element={<Validator />}/>
        </Routes>
      </main>
      <Footer />
    </>
  );
}

export default App;
