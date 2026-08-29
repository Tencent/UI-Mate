
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import MyTasks from './pages/MyTasks';
import Inbox from './pages/Inbox';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import Portfolios from './pages/Portfolios';
import Goals from './pages/Goals';
import Teams from './pages/Teams';
import Settings from './pages/Settings';
import Search from './pages/Search';
import StateInspector from './pages/StateInspector';

function App() {
  return (
    <Router>
      <AppProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="my-tasks" element={<MyTasks />} />
            <Route path="inbox" element={<Inbox />} />
            <Route path="projects" element={<Projects />} />
            <Route path="projects/:projectId" element={<ProjectDetail />} />
            <Route path="portfolios" element={<Portfolios />} />
            <Route path="goals" element={<Goals />} />
            <Route path="teams/:teamId" element={<Teams />} />
            <Route path="settings" element={<Settings />} />
            <Route path="search" element={<Search />} />
          </Route>
          <Route path="/go" element={<StateInspector />} />
        </Routes>
      </AppProvider>
    </Router>
  );
}

export default App;
  