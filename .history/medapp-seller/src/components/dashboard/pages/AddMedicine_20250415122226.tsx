import { useState, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { db, storage } from '../../../services/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  MenuItem,
  Input,
  InputLabel,
  CircularProgress,
  LinearProgress
} from '@mui/material';
import { CloudUpload as UploadIcon } from '@mui/icons-material';

const categories = [
  'Diabetes',
  'Hypertension',
  'Cholesterol',
  'Obesity',
  'Heart Diseases'
];

export default function AddMedicine() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    category: '',
    price: '',
    stock: '',
    description: ''
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleImageUpload = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      // Validate file size (max 1MB)
      if (file.size > 1024 * 1024) {
        reject(new Error('File size must be less than 1MB'));
        return;
      }

      // Create unique file name
      const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const storageRef = ref(storage, `medicines/${user?.uid}/${fileName}`);

      // Create upload task with metadata
      const uploadTask = uploadBytesResumable(storageRef, file, {
        contentType: file.type,
        cacheControl: 'public,max-age=7200'
      });

      // Monitor upload progress
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          reject(error);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadURL);
          } catch (error) {
            reject(error);
          }
        }
      );
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      brand: '',
      category: '',
      price: '',
      stock: '',
      description: ''
    });
    setImageFile(null);
    setImagePreview('');
    setUploadProgress(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !imageFile) {
      setError('Please select an image');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setUploadProgress(0);

      // Upload image first
      const imageUrl = await handleImageUpload(imageFile);

      // Add to Firestore only after successful upload
      const medicineData = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        sellerId: user.uid,
        imageUrl,
        createdAt: new Date()
      };

      await addDoc(collection(db, 'medicines'), medicineData);
      setSuccess('Medicine added successfully!');
      
      // Reset form and navigate
      resetForm();
      setTimeout(() => navigate('/dashboard/medicines'), 1500);

    } catch (error: any) {
      setError(error.message || 'Failed to add medicine');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Add New Medicine
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              {imagePreview && (
                <Box
                  component="img"
                  src={imagePreview}
                  alt="Medicine preview"
                  sx={{
                    width: 200,
                    height: 200,
                    objectFit: 'cover',
                    mb: 2,
                    borderRadius: 1
                  }}
                />
              )}
              <InputLabel
                htmlFor="medicine-image"
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1,
                  cursor: 'pointer'
                }}
              >
                <UploadIcon />
                Upload Medicine Image
              </InputLabel>
              <Input
                id="medicine-image"
                type="file"
                inputProps={{
                  accept: "image/*"
                }}
                onChange={handleImageChange}
                required
                sx={{ display: 'none' }}
              />
            </Box>

            <TextField
              required
              label="Medicine Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />

            <TextField
              required
              label="Brand"
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
            />

            <TextField
              required
              select
              label="Category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              required
              type="number"
              label="Price"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            />

            <TextField
              required
              type="number"
              label="Stock"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
            />

            <TextField
              multiline
              rows={4}
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />

            {uploadProgress > 0 && uploadProgress < 100 && (
              <Box sx={{ width: '100%', mt: 2 }}>
                <LinearProgress variant="determinate" value={uploadProgress} />
                <Typography variant="body2" color="text.secondary" align="center">
                  Uploading: {Math.round(uploadProgress)}%
                </Typography>
              </Box>
            )}

            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{ mt: 2 }}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {loading ? 'Adding Medicine...' : 'Add Medicine'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
}