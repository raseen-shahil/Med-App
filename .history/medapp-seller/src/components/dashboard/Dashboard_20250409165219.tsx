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
  Grid,
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
import { useNavigate, useLocation } from 'react-router-dom';

const navigationItems = [
  { title: 'Medicines', icon: <MedicineIcon />, path: '/medicines' },
  { title: 'Add Medicine', icon: <AddIcon />, path: '/add-medicine' },
  { title: 'Completed Orders', icon: <CompletedIcon />, path: '/completed-orders' },
  { title: 'Pending Orders', icon: <PendingIcon />, path: '/pending-orders' },
];

const menuItems = [
  { title: 'Medicines', icon: <MedicineIcon />, path: '/medicines', color: '#1976d2' },
  { title: 'Add Medicine', icon: <AddIcon />, path: '/add-medicine', color: '#2e7d32' },
  { title: 'Completed Orders', icon: <CompletedIcon />, path: '/completed-orders', color: '#ed6c02' },
  { title: 'Pending Orders', icon: <PendingIcon />, path: '/pending-orders', color: '#d32f2f' },
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
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="fixed" sx={{ backgroundColor: '#fff' }}>
        <Toolbar>
          <Typography 
            variant="h6" 
            sx={{ 
              color: '#1976d2',
              fontWeight: 'bold',
              marginRight: 4
            }}
          >
            {sellerData?.pharmacyName}
          </Typography>

          <Box sx={{ flexGrow: 1, display: 'flex', gap: 2 }}>
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
              sx: {
                minWidth: '200px',
                mt: 1
              }
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
            <MenuItem onClick={() => navigate('/profile')}>
              <ProfileIcon sx={{ mr: 1 }} /> Profile
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <LogoutIcon sx={{ mr: 1 }} /> Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 10, mb: 4 }}>
        <Grid container spacing={3}>
          {menuItems.map((item) => (
            <Grid item xs={12} sm={6} md={3} key={item.title}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'scale(1.02)',
                    boxShadow: 3
                  }
                }}
                onClick={() => navigate(item.path)}
              >
                <CardContent sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  p: 3
                }}>
                  <Box
                    sx={{
                      backgroundColor: `${item.color}15`,
                      borderRadius: '50%',
                      p: 2,
                      mb: 2
                    }}
                  >
                    {React.cloneElement(item.icon, { sx: { color: item.color } })}
                  </Box>
                  <Typography variant="h6" component="div" align="center">
                    {item.title}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}