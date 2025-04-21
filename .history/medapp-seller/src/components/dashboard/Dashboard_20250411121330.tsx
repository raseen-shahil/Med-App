import { useState } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Container,
  Button,
  Avatar,
  Menu,
  MenuItem,
  Divider,
} from '@mui/material';
import {
  Medication as MedicineIcon,
  AddCircle as AddIcon,
  CheckCircle as CompletedIcon,
  Pending as PendingIcon,
  Person as ProfileIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';

const navigationItems = [
  { title: 'Medicines', icon: <MedicineIcon />, path: '/dashboard/pagesedicines' },
  { title: 'Add Medicine', icon: <AddIcon />, path: '/dashboard/add-medicine' },
  { title: 'Completed Orders', icon: <CompletedIcon />, path: '/dashboard/completed' },
  { title: 'Pending Orders', icon: <PendingIcon />, path: '/dashboard/pending' },
];

export default function Dashboard() {
  const { sellerData, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleProfileClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="fixed" sx={{ backgroundColor: '#fff' }}>
        <Toolbar sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography 
            variant="h6" 
            sx={{ 
              color: '#1976d2',
              fontWeight: 'bold',
              minWidth: 'fit-content'
            }}
          >
            {sellerData?.pharmacyName}
          </Typography>

          <Box sx={{ 
            display: 'flex', 
            gap: 2, 
            flexGrow: 1, 
            justifyContent: 'center',
            overflowX: 'auto'
          }}>
            {navigationItems.map((item) => (
              <Button
                key={item.path}
                startIcon={item.icon}
                sx={{
                  color: location.pathname === item.path ? '#1976d2' : '#666',
                  borderBottom: location.pathname === item.path ? '2px solid #1976d2' : 'none',
                  borderRadius: 0,
                  textTransform: 'none',
                  padding: '20px 16px',
                  whiteSpace: 'nowrap',
                  '&:hover': {
                    backgroundColor: 'rgba(25, 118, 210, 0.04)',
                    borderBottom: '2px solid #1976d2',
                  },
                }}
                onClick={() => navigate(item.path)}
              >
                {item.title}
              </Button>
            ))}
          </Box>

          <Avatar
            onClick={handleProfileClick}
            sx={{
              bgcolor: '#1976d2',
              cursor: 'pointer',
              '&:hover': {
                bgcolor: '#1565c0'
              }
            }}
          >
            {sellerData?.name?.charAt(0) || 'S'}
          </Avatar>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            PaperProps={{
              elevation: 3,
              sx: { minWidth: 200 }
            }}
          >
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="subtitle1" fontWeight="bold">
                {sellerData?.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {sellerData?.email}
              </Typography>
            </Box>
            <Divider />
            <MenuItem onClick={() => { navigate('/profile'); handleClose(); }}>
              <ProfileIcon sx={{ mr: 2 }} /> Profile
            </MenuItem>
            <MenuItem onClick={handleLogout} sx={{ color: '#d32f2f' }}>
              <LogoutIcon sx={{ mr: 2 }} /> Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box component="main" sx={{ flexGrow: 1, mt: 8, p: 3 }}>
        <Container maxWidth="lg">
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
}