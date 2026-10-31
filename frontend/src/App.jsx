import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Screening from './pages/Screening';
import Result from './pages/Result';
import Ultrasound from './pages/Ultrasound';
import About from './pages/About';

export default function App() {
  const [activePage, setActivePage] = useState('home');
  const [resultData, setResultData] = useState(null);

  const handlePredictionComplete = (data) => {
    setResultData(data);
    setActivePage('result');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetScreening = () => {
    setResultData(null);
    setActivePage('screening');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="app-layout">
      <Navbar activePage={activePage} setActivePage={setActivePage} />

      <main className="main-content" role="main">
        {activePage === 'home' && (
          <Home setActivePage={setActivePage} />
        )}

        {activePage === 'screening' && (
          <Screening 
            onPredictionComplete={handlePredictionComplete}
            setActivePage={setActivePage}
          />
        )}

        {activePage === 'result' && (
          <Result 
            resultData={resultData}
            onReset={handleResetScreening}
            setActivePage={setActivePage}
          />
        )}

        {activePage === 'ultrasound' && (
          <Ultrasound setActivePage={setActivePage} />
        )}

        {activePage === 'about' && (
          <About setActivePage={setActivePage} />
        )}
      </main>

      <Footer setActivePage={setActivePage} />

      <style>{`
        .app-layout {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }

        .main-content {
          flex: 1 0 auto;
        }
      `}</style>
    </div>
  );
}
