import * as React from "react";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import {
  Box,
  IconButton,
  Typography,
  Menu,
  Avatar,
  Tooltip,
  MenuItem,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function TopNav() {
  const navigate = useNavigate();
  const [anchorElUser, setAnchorElUser] = React.useState(null);

  const { user, logout } = useAuth();

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogout = () => {
    logout();
    handleCloseUserMenu();
    navigate("/login");
  };

  return (
    <Box sx={{ ml: "auto", display: "flex", alignItems: "center", gap: 2, p: 1 }}>
      {user ? (
        <>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 500,
              color: "text.primary",
              display: { xs: "none", sm: "block" }
            }}
          >
            {user.name || "User"}
          </Typography>
          <Tooltip title="Open settings">
            <IconButton 
              onClick={handleOpenUserMenu} 
              sx={{ 
                p: 0,
                '&:hover': {
                  transform: 'scale(1.1)',
                  transition: 'transform 0.2s'
                }
              }}
            >
              <Avatar
                alt={user.name || "User"}
                src={
                  user.profilePic
                    ? user.profilePic.startsWith("http")
                      ? user.profilePic
                      : `http://localhost:5000/uploads/${user.profilePic}`
                    : ""
                }
                sx={{ 
                  width: 40, 
                  height: 40,
                  border: '2px solid #fff',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              />
            </IconButton>
          </Tooltip>
          <Menu
            sx={{ 
              mt: "45px",
              '& .MuiPaper-root': {
                borderRadius: 2,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                minWidth: 180
              }
            }}
            anchorEl={anchorElUser}
            anchorOrigin={{ vertical: "top", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
            open={Boolean(anchorElUser)}
            onClose={handleCloseUserMenu}
          >
            <MenuItem onClick={handleCloseUserMenu}>
              <Typography textAlign="center">{user.name || "User"}</Typography>
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <Typography textAlign="center">Logout</Typography>
            </MenuItem>
          </Menu>
        </>
      ) : (
        <Stack spacing={2} direction="row">
          <Button 
            variant="outlined" 
            onClick={() => navigate("/login")}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              px: 3,
              '&:hover': {
                backgroundColor: 'rgba(25, 118, 210, 0.04)'
              }
            }}
          >
            Login
          </Button>
          <Button 
            variant="contained" 
            onClick={() => navigate("/signup")}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              px: 3,
              boxShadow: '0 2px 4px rgba(25, 118, 210, 0.2)',
              '&:hover': {
                boxShadow: '0 4px 8px rgba(25, 118, 210, 0.3)'
              }
            }}
          >
            Signup
          </Button>
        </Stack>
      )}
    </Box>
  );
}

export default TopNav;
