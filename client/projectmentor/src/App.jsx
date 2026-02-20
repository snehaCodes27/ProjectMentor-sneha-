import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useState, useEffect } from 'react';
import LeaderLogin from './components/LeaderLogin';
import LeaderDashboard from './components/LeaderDashboard';
import LeaderRegister from './components/LeaderRegister';
import CreateTeam from './components/CreateTeam';
import SplashScreen from './components/SplashScreen';
import RoleSelect from "./components/RoleSelect";
import JoinTeam from './components/JoinTeam';
import MemberDashboard from './components/MemberDashboard';
import MemberLogin from './components/MemberLogin';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasTeam, setHasTeam] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        // Check if user has created a team
        const teamInfo = localStorage.getItem("teamInfo");
        setHasTeam(!!teamInfo);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f8f9fa'
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/splash" element={<SplashScreen />} />
        <Route path="/role-selection" element={<RoleSelect />} />
        <Route path="/role-select" element={<Navigate to="/role-selection" replace />} />
        <Route path="/join-team" element={<JoinTeam />} />
        <Route path="/member-dashboard" element={<MemberDashboard />} />
        <Route path="/member-login" element={<MemberLogin />} />
        <Route 
          path="/leader-login" 
          element={user ? <Navigate to="/leader-dashboard" /> : <LeaderLogin />} 
        />
        <Route 
          path="/leader-dashboard" 
          element={user ? <LeaderDashboard /> : <Navigate to="/leader-login" />} 
        />
        <Route 
          path="/leader-register" 
          element={user ? (hasTeam ? <Navigate to="/leader-dashboard" /> : <Navigate to="/create-team" />) : <LeaderRegister />} 
        />
        <Route 
          path="/create-team" 
          element={user ? <CreateTeam /> : <Navigate to="/leader-register" />} 
        />
        <Route 
          path="/" 
          element={<Navigate to={user ? (hasTeam ? "/leader-dashboard" : "/create-team") : "/splash"} />} 
        />
      </Routes>
    </Router>
  );
}

export default App;