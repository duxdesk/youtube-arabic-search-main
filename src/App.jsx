import React from "react";
import { BrowserRouter as Router, Routes, Route, useSearchParams } from 'react-router-dom';
import Layout from './components/Layout.js';
import Search from './pages/Search';

function AppContent() {
  const [searchParams] = useSearchParams();
  const youtuberId = searchParams.get('youtuber');
  const [youtuber, setYoutuber] = React.useState(null);

  React.useEffect(() => {
    if (youtuberId) {
      // Placeholder: In real app, fetch from Supabase or local state
      // For now, use ID to generate fallback (like Home)
      setYoutuber({
        id: youtuberId,
        arabic_name: "أرنست ويليام", // Replace with real name from ID
        english_name: "Ernest William",
        avatar_url: null // Triggers fallback
      });
    } else {
      setYoutuber(null);
    }
  }, [youtuberId]);

  return (
    <Layout youtuber={youtuber}>
      <Routes>
        <Route path="/search" element={<Search youtuber={youtuber} />} />
        <Route path="/" element={<Search youtuber={youtuber} />} />
        <Route path="*" element={<div className="min-h-screen flex items-center justify-center">404 - غير موجود</div>} />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;