import React, { useState } from 'react';tate, ReactNode } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container,erData {
  Paper,string;
  Typography,ng;
  TextField,string;
  Button,yName: string;
  Box,ess: string;
  IconButton,er: string;
  InputAdornment,
  Alert,
  Grid,ce AuthContextType {
} from '@mui/material';
import {g: boolean;
  Email as EmailIcon,ng, password: string) => Promise<void>;
  Lock as LockIcon,mise<void>;
  Store as StoreIcon,: UserData) => Promise<void>;
  Person as PersonIcon,
  LocationOn as LocationIcon,
  Badge as BadgeIcon,reateContext<AuthContextType | undefined>(undefined);
  Visibility,
  VisibilityOff,AuthProvider({ children }: { children: ReactNode }) {
} from '@mui/icons-material';State<User | null>(null);
import { useAuth } from '../../contexts/AuthContext';

export default function Register() {, password: string) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',() => {
    pharmacyName: '',gout logic...
    address: '',
    licenseNumber: '',
  });st register = async (userData: UserData) => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');tion
  const navigate = useNavigate();er:', userData);
  const { register } = useAuth();
      throw error;
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };nst value = {
    user,
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    register
    try {
      setLoading(true);
      await register(formData);
      navigate('/dashboard');ue={value}>
    } catch (error) {ildren}
      setError('Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };rt function useAuth() {
  const context = useContext(AuthContext);
  return (ext === undefined) {
    <Container maxWidth="sm">must be used within an AuthProvider');
      <Box sx={{ marginY: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>ext;
          <Typography component="h1" variant="h4" gutterBottom>
            Seller Registration          </Typography>          <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>            Create your pharmacy account          </Typography>          {error && (            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>              {error}            </Alert>          )}          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>            <Grid container spacing={2}>              <Grid item xs={12}>                <TextField                  required                  fullWidth                  name="name"                  label="Full Name"                  value={formData.name}                  onChange={handleChange}                  InputProps={{                    startAdornment: (                      <InputAdornment position="start">                        <PersonIcon color="action" />                      </InputAdornment>                    ),                  }}                />              </Grid>              <Grid item xs={12}>                <TextField                  required                  fullWidth                  name="email"                  label="Email Address"                  type="email"                  value={formData.email}                  onChange={handleChange}                  InputProps={{                    startAdornment: (                      <InputAdornment position="start">                        <EmailIcon color="action" />                      </InputAdornment>                    ),                  }}                />              </Grid>              <Grid item xs={12}>                <TextField                  required                  fullWidth                  name="password"                  label="Password"                  type={showPassword ? 'text' : 'password'}                  value={formData.password}                  onChange={handleChange}                  InputProps={{                    startAdornment: (                      <InputAdornment position="start">                        <LockIcon color="action" />                      </InputAdornment>                    ),                    endAdornment: (                      <InputAdornment position="end">                        <IconButton                          onClick={() => setShowPassword(!showPassword)}                          edge="end"                        >                          {showPassword ? <VisibilityOff /> : <Visibility />}                        </IconButton>                      </InputAdornment>                    ),                  }}                />              </Grid>              <Grid item xs={12}>                <TextField                  required                  fullWidth                  name="pharmacyName"                  label="Pharmacy Name"                  value={formData.pharmacyName}                  onChange={handleChange}                  InputProps={{                    startAdornment: (                      <InputAdornment position="start">                        <StoreIcon color="action" />                      </InputAdornment>                    ),                  }}                />              </Grid>              <Grid item xs={12}>                <TextField                  required                  fullWidth                  name="address"                  label="Pharmacy Address"                  value={formData.address}                  onChange={handleChange}                  multiline                  rows={2}                  InputProps={{                    startAdornment: (                      <InputAdornment position="start">                        <LocationIcon color="action" />                      </InputAdornment>                    ),                  }}                />              </Grid>              <Grid item xs={12}>                <TextField                  required                  fullWidth                  name="licenseNumber"                  label="License Number"                  value={formData.licenseNumber}                  onChange={handleChange}                  InputProps={{                    startAdornment: (                      <InputAdornment position="start">                        <BadgeIcon color="action" />                      </InputAdornment>                    ),                  }}                />              </Grid>            </Grid>            <Button              type="submit"              fullWidth              variant="contained"              sx={{ mt: 3, mb: 2, height: 48 }}              disabled={loading}            >              {loading ? 'Creating Account...' : 'Register'}            </Button>          </Box>          <Box sx={{ mt: 2 }}>            <Typography variant="body1" color="text.secondary" align="center">              Already have an account?{' '}              <Link                to="/login"                style={{                  color: '#1976d2',                  textDecoration: 'none',                }}              >                Sign in here              </Link>            </Typography>          </Box>        </Paper>      </Box>    </Container>  );}