import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Groups from './pages/MyTasks';
import MyGroups from './pages/MyGroups';
import Dashboard from './pages/Dashboard';
import Home from './components/Home'; // this should include <Sidenav />
import Users from './pages/Users';
import Login from './pages/Login';
import Signup from './pages/Signup'
import MyTasks from './pages/MyTasks';
const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='login' element={<Login/>}/>
        <Route path='signup' element={<Signup/>}/>
        {/* All routes with common layout (sidenav) go under Home */}
        <Route path='/' element={<Home />}>
          <Route index element={<Dashboard />} />
          <Route path='mytasks' element={<MyTasks/>} />
          <Route path='mygroups' element={<MyGroups />} />
          <Route path='Users' element={<Users/>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
