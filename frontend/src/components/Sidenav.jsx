import * as React from 'react';
import {
  Box, Drawer, CssBaseline, AppBar, Toolbar,
  List, Typography, Divider, ListItem, ListItemButton,
  ListItemIcon, ListItemText
} from '@mui/material';

import DashboardIcon from '@mui/icons-material/Dashboard';
import GroupsIcon from '@mui/icons-material/Groups';
import Diversity2RoundedIcon from '@mui/icons-material/Diversity2Rounded';
import PersonSearchOutlinedIcon from '@mui/icons-material/PersonSearchOutlined';
import { useNavigate, Outlet } from 'react-router-dom';
import TopNav from './Topnav';


const drawerWidth = 200;

export default function Sidenav() {
  const navigate = useNavigate();
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: `calc(100% - ${drawerWidth}px)`,
          ml: `${drawerWidth}px`,
          backgroundColor: '#fff',
          boxShadow: 'none',
        }}
      >
        <Toolbar>
          <TopNav />
        </Toolbar>
      </AppBar>

      {/* Drawer / Sidebar */}
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            backgroundColor: '#ffffffff',
            color: '#000',
          },
        }}
        variant="permanent"
        anchor="left"
      >
        {/* <Toolbar /> */}
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <Typography variant="h6" noWrap>
            TaskManager
          </Typography>
        </Box>
       
        <List>
          <List>
            <ListItem disablePadding>
              <ListItemButton onClick={() => navigate('/')}>
                <ListItemIcon>
                 <DashboardIcon/>
                </ListItemIcon>
                <ListItemText primary="Dashboard" />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton onClick={() => navigate('/groups')}>
                <ListItemIcon>
                  <GroupsIcon/>
                </ListItemIcon>
                <ListItemText primary="Groups" />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton onClick={() => navigate('/Mygroups')}>
                <ListItemIcon>
                 <Diversity2RoundedIcon/>
                </ListItemIcon>
                <ListItemText primary="My Groups" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>

              <ListItemButton onClick={() => navigate('/users')}>
                <ListItemIcon>
                 <PersonSearchOutlinedIcon/>
                </ListItemIcon>
                <ListItemText primary="Users" />
              </ListItemButton>
            </ListItem>

          </List>

        </List>
     

      </Drawer>

      {/* Main content area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: 'background.default',
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          mt: '64px'
        }}
      >
        <Outlet /> {/* 👈 This renders the child route content */}
      </Box>
    </Box>
  );
}
