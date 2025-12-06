import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Search from './pages/Search';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Search />} />  // Start with Search for testing
      </Routes>
    </Router>
  );
}

export default App;
