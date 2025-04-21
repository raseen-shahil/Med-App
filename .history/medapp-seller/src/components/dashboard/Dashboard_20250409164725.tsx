import { useState } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
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
import { useNavigate } from 'react-router-dom';

const menuItems = [
  {
    title: 'Medicines',
    icon: <MedicineIcon sx={{ fontSize: 40 }} />,
    color: '#4CAF50',
    path: '/medicines'
  },
  {
    title: 'Add Medicine',
    icon: <AddIcon sx={{ fontSize: 40 }} />,
    color: '#2196F3',
    path: '/add-medicine'
  },
  {
    title: 'Completed Orders',
    icon: <CompletedIcon sx={{ fontSize: 40 }} />,
    color: '#9C27B0',
    path: '/completed-orders'
  },
  {
    title: 'Pending Orders',
    icon: <PendingIcon sx={{ fontSize: 40 }} />,
    color: '#FF9800',
    path: '/pending-orders'
  }
];

export default function Dashboard() {
  const { sellerData, logout } = useAuth();
  const navigate = useNavigate();
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
      <AppBar position="fixed" sx={{ backgroundColor: '#fff', color: '#333' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {sellerData?.pharmacyName || 'Seller Dashboard'}
          </Typography>
          <IconButton onClick={handleProfileClick}>
            <Avatar sx={{ bgcolor: '#1976d2' }}>
              {sellerData?.name?.charAt(0) || 'S'}
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
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
            <Grid component="div" item xs={12} sm={6} md={3} key={item.title}>
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