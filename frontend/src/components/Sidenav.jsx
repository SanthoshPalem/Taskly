import * as React from 'react';
import {
  Box, Drawer, CssBaseline, AppBar, Toolbar,
  List, Typography, Divider, ListItem, ListItemButton,
  ListItemIcon, ListItemText, IconButton, useTheme, useMediaQuery
} from '@mui/material';

import DashboardIcon from '@mui/icons-material/Dashboard';
import GroupsIcon from '@mui/icons-material/Groups';
import Diversity2RoundedIcon from '@mui/icons-material/Diversity2Rounded';
import PersonSearchOutlinedIcon from '@mui/icons-material/PersonSearchOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate, Outlet } from 'react-router-dom';
import TopNav from './Topnav';


const drawerWidth = 200;

export default function Sidenav() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          backgroundColor: '#fff',
          boxShadow: 'none',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' }, color: '#1677ff' }}
          >
            <MenuIcon />
          </IconButton>
          <TopNav />
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            backgroundColor: '#f9f9f9',
            color: '#000',
            boxShadow: '2px 0 5px rgba(0, 0, 0, 0.1)',
          },
        }}
      >
        {/* Drawer Content */}
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <Typography variant="h6" noWrap>
            TaskManager
          </Typography>
        </Box>

        <List>
          <List>
            <ListItem disablePadding>
              <ListItemButton onClick={() => { navigate('/'); handleDrawerToggle(); }}>
                <ListItemIcon>
                  <DashboardIcon />
                </ListItemIcon>
                <ListItemText primary="Dashboard" />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton onClick={() => { navigate('/mygroups'); handleDrawerToggle(); }}>
                <ListItemIcon>
                  <GroupsIcon />
                </ListItemIcon>
                <ListItemText primary="My Groups" />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton onClick={() => { navigate('/mytasks'); handleDrawerToggle(); }}>
                <ListItemIcon>
                  <Diversity2RoundedIcon />
                </ListItemIcon>
                <ListItemText primary="My Tasks" />
              </ListItemButton>
            </ListItem>
            
            <ListItem disablePadding>
              <ListItemButton onClick={() => { navigate('/users'); handleDrawerToggle(); }}>
                <ListItemIcon>
                  <PersonSearchOutlinedIcon />
                </ListItemIcon>
                <ListItemText primary="Users" />
              </ListItemButton>
            </ListItem>
          </List>
        </List>
      </Drawer>

      {/* Desktop Drawer */}
      <Drawer
        sx={{
          display: { xs: 'none', md: 'block' },
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            backgroundColor: '#f9f9f9', // similar to top nav background
            color: '#000',
            boxShadow: '2px 0 5px rgba(0, 0, 0, 0.1)', // subtle shadow
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
                  <DashboardIcon />
                </ListItemIcon>
                <ListItemText primary="Dashboard" />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton onClick={() => navigate('/mygroups')}>
                <ListItemIcon>
                  <GroupsIcon />
                </ListItemIcon>
                <ListItemText primary="My Groups" />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton onClick={() => navigate('/mytasks')}>
                <ListItemIcon>
                  <Diversity2RoundedIcon />
                </ListItemIcon>
                <ListItemText primary="My Tasks" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>

              <ListItemButton onClick={() => navigate('/users')}>
                <ListItemIcon>
                  <PersonSearchOutlinedIcon />
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
          // ml: { sm: `${drawerWidth}px` },
          mt: '64px'
        }}
      >
        <Outlet /> {/* 👈 This renders the child route content */}
      </Box>
    </Box>
  );
}
