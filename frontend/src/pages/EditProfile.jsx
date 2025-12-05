import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cropper from 'react-easy-crop';
import Navbar from '../components/Navbar';
import { supabase } from '../utils/supabase';
import '../styles/EditProfile.css';

// Helper function to create cropped image
const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

const getCroppedImg = async (imageSrc, pixelCrop) => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    }, 'image/jpeg', 0.9);
  });
};

const EditProfile = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    bio: '',
    phone: '',
    address: ''
  });
  const [profileImage, setProfileImage] = useState(null);
  const [existingProfileImage, setExistingProfileImage] = useState(null);
  
  // Cropper states
  const [showCropper, setShowCropper] = useState(false);
  const [imageToCrop, setImageToCrop] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/user/profile', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setFormData({
        username: response.data.username || '',
        email: response.data.email || '',
        bio: response.data.bio || '',
        phone: response.data.phoneNumber || '',
        address: response.data.shippingAddress || ''
      });
      if (response.data.profileImage) {
        setExistingProfileImage(response.data.profileImage);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        setImageToCrop(reader.result);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropConfirm = async () => {
    try {
      setUploading(true);
      const croppedBlob = await getCroppedImg(imageToCrop, croppedAreaPixels);
      
      // Generate unique filename
      const fileName = `profile_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
      
      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('Profile Image')
        .upload(fileName, croppedBlob, {
          contentType: 'image/jpeg',
          upsert: true
        });

      if (error) {
        console.error('Supabase upload error:', error);
        throw error;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('Profile Image')
        .getPublicUrl(fileName);

      const imageUrl = urlData.publicUrl;
      
      // Update local state
      setProfileImage(imageUrl);
      setExistingProfileImage(imageUrl);
      
      // Immediately save to backend
      const token = localStorage.getItem('token');
      await axios.put('http://localhost:8080/api/user/profile', 
        { profileImage: imageUrl },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      setShowCropper(false);
      setImageToCrop(null);
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setImageToCrop(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updateData = {
        username: formData.username,
        email: formData.email,
        phoneNumber: formData.phone,
        shippingAddress: formData.address
      };
      
      if (profileImage) {
        updateData.profileImage = profileImage;
      }

      await axios.put('http://localhost:8080/api/user/profile', updateData, {
        headers: { 
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      navigate('/profile');
    } catch (error) {
      console.error('Error updating profile:', error);
      
      if (error.response?.status === 403) {
        console.error('Authorization failed. Your session may have expired.');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    }
  };

  return (
    <div className="edit-profile-page">
      <Navbar />
      
      {/* Image Cropper Modal */}
      {showCropper && (
        <div className="crop-modal-overlay">
          <div className="crop-modal">
            <h3>Crop Your Profile Picture</h3>
            <div className="crop-container">
              <Cropper
                image={imageToCrop}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>
            <div className="zoom-control">
              <label>Zoom:</label>
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
              />
            </div>
            <div className="crop-actions">
              <button 
                type="button" 
                className="btn-secondary" 
                onClick={handleCropCancel}
                disabled={uploading}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn-primary" 
                onClick={handleCropConfirm}
                disabled={uploading}
              >
                {uploading ? 'Uploading...' : 'Confirm & Upload'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="edit-profile-container">
        <h2>Edit Profile</h2>
        
        <form onSubmit={handleSubmit} className="edit-profile-form">
          <div className="profile-image-section">
            <div className="image-upload">
              <div className="image-preview">
                {existingProfileImage ? (
                  <img src={existingProfileImage} alt="Profile" />
                ) : (
                  <div className="placeholder-circle">
                    <span>+</span>
                  </div>
                )}
              </div>
              <input
                type="file"
                id="profileImage"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
              <label htmlFor="profileImage" className="upload-btn">
                {existingProfileImage ? 'Change Photo' : 'Upload Photo'}
              </label>
            </div>
          </div>

          <div className="form-section">
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="address">Address</label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="bio">Bio</label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows="4"
                placeholder="Tell us about yourself..."
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary">
              Save Changes
            </button>
            <button 
              type="button" 
              className="btn-secondary"
              onClick={() => navigate('/profile')}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
