import React from 'react';
import { BrowserRouter as Router, Routes, Route, useSearchParams } from 'react-router-dom';
import Layout from './components/Layout';
import Search from './pages/Search';
import { supabase } from '@/lib/supabase'; // Your client

function AppContent() {
  const [searchParams] = useSearchParams();
  const youtuberId = searchParams.get('youtuber');
  const [youtuber, setYoutuber] = React.useState(null);

  React.useEffect(() => {
    if (youtuberId) {
      supabase.from('youtubers').select('*').eq('id', youtuberId).single().then(({ data }) => setYoutuber(data));
    }
  }, [youtuberId]);

  return (
    <Layout youtuber={youtuber}>
      <Routes>
        <Route path="/search" element={<Search youtuber={youtuber} />} />
        {/* Other routes */}
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
