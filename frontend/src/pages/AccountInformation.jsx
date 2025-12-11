import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Cropper from 'react-easy-crop';
import Navbar from '../components/Navbar';
import { supabase } from '../utils/supabase';
import '../styles/AccountInformation.css';

const AccountInformation = () => {
  const [profileName, setProfileName] = useState(''); 
  const [activeTab, setActiveTab] = useState('accountInformation');
  const [profileImage, setProfileImage] = useState(null);

  const navigate = useNavigate();
  const [accountData, setAccountData] = useState({
    username: '',
    email: '',
    phone: '', // Maps to phoneNumber on backend
    address: '', // Maps to shippingAddress on backend
    profileImage: '',
  });
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [userRole, setUserRole] = useState('BUYER');
  const [loading, setLoading] = useState(false);
  
  // Add logout function
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };
  
  // Cropper states
  const [showCropper, setShowCropper] = useState(false);
  const [imageToCrop, setImageToCrop] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Effect to sync profileImage state with accountData when accountData changes
  useEffect(() => {
    if (accountData.profileImage && accountData.profileImage !== profileImage) {
      setProfileImage(accountData.profileImage);
    }
  }, [accountData.profileImage, profileImage]);
  
  // Effect to ensure profileImage state is updated when activeTab changes
  useEffect(() => {
    if (accountData.profileImage && accountData.profileImage !== profileImage) {
      setProfileImage(accountData.profileImage);
    }
    
    // Refresh account info when switching to account information tab
    if (activeTab === 'accountInformation') {
      fetchAccountInfo();
    }
  }, [activeTab, accountData.profileImage, profileImage]);
  
  // Effect to fetch account info on component mount
  useEffect(() => {
    fetchAccountInfo();
  }, []);

  const fetchAccountInfo = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/user/account', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      // Extract profile image URL
      const profileImageUrl = response.data.profileImage || '';
      
      // Map backend fields to frontend state - ensure both states are synced
      setAccountData({
        ...response.data,
        phone: response.data.phoneNumber || '',
        address: response.data.shippingAddress || '',
        profileImage: profileImageUrl,
      });
      
      // Sync the profileImage state as well
      setProfileImage(profileImageUrl);
      
      // Get user role from localStorage
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      setUserRole(storedUser.role || 'BUYER');
    } catch (error) {
      console.error('Error fetching account info:', error);
      if (error.response?.status === 403) {
        toast.error('Session expired. Please log in again.');
        setTimeout(() => {
          handleLogout();
        }, 3000);
      } else {
        toast.error('Failed to load account information. Please try again.');
      }
    }
  };

  const handleChange = (e) => {
    setAccountData({
      ...accountData,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = (e) => {
    setNewPassword(e.target.value);
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmNewPassword(e.target.value);
  };

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

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

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
      
      // Update both local states synchronously
      setProfileImage(imageUrl);
      setAccountData(prev => ({ ...prev, profileImage: imageUrl }));
      
      // Immediately save to backend with all account data
      const token = localStorage.getItem('token');
      const updatePayload = {
        username: accountData.username,
        email: accountData.email,
        phoneNumber: accountData.phone,
        shippingAddress: accountData.address,
        profileImage: imageUrl, // Include the new profile image
      };
      
      await axios.put('http://localhost:8080/api/user/account', 
        updatePayload,
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      toast.success('Profile picture updated successfully!');
      setShowCropper(false);
      setImageToCrop(null);
      
      // Refresh account info to ensure consistency
      await fetchAccountInfo();
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload profile image. Please try again.');
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
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      // Prepare data for account update
      const updatePayload = {
        username: accountData.username,
        email: accountData.email,
        phoneNumber: accountData.phone, // Map frontend 'phone' to backend 'phoneNumber'
        shippingAddress: accountData.address, // Map frontend 'address' to backend 'shippingAddress'
        profileImage: accountData.profileImage, // Include profile image
      };

      await axios.put('http://localhost:8080/api/user/account', updatePayload, config);
      toast.success('Account information updated successfully!');

      // Handle password change if newPassword fields are filled
      if (newPassword || confirmNewPassword) {
        if (newPassword !== confirmNewPassword) {
          toast.error('New password and confirm password do not match.');
          return;
        }
        if (newPassword.length < 6) { // Example: minimum password length
          toast.error('Password must be at least 6 characters long.');
          return;
        }
        
        // Assuming a separate endpoint for password change
        await axios.post('http://localhost:8080/api/user/change-password', { newPassword }, config);
        toast.success('Password updated successfully!');
        setNewPassword('');
        setConfirmNewPassword('');
      }

    } catch (error) {
      console.error('Error updating account or password:', error);
      
      if (error.response?.status === 403) {
        toast.error('Authorization failed. Your session may have expired. Please log in again.');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        toast.error('Failed to update account information or password.');
      }
    }
  };

  const handleBecomeSellerClick = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      console.log('Token:', token);
      console.log('Making request to become seller...');
      
      // Call dedicated become-seller endpoint
      const response = await axios.post('http://localhost:8080/api/user/become-seller', {}, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Seller response:', response.data);

      // Update localStorage with new role
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      storedUser.role = 'SELLER';
      localStorage.setItem('user', JSON.stringify(storedUser));

      setUserRole('SELLER');
      toast.success('Congratulations! You are now a seller. You can now add and manage your products!');
      window.location.reload(); // Refresh to update navbar
    } catch (error) {
      const errorMessage = error.response?.data || error.message || 'Unknown error occurred';
      console.error('Error becoming a seller:', errorMessage);
      toast.error('Failed to become a seller: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'accountInformation':
        return (
          <div className="account-form-content display-info">
            <h3>Account Information</h3>
            <div className="info-group">
              <label>Username:</label>
              <span>{accountData.username}</span>
            </div>
            <div className="info-group">
              <label>Email:</label>
              <span>{accountData.email}</span>
            </div>
            <div className="info-group">
              <label>Phone:</label>
              <span>{accountData.phone || 'N/A'}</span>
            </div>
            <div className="info-group">
              <label>Address:</label>
              <span>{accountData.address || 'N/A'}</span>
            </div>
          </div>
        );
      case 'editProfile':
        return (
          <div className="account-form-content">
            <h3 style={{ color: '#800000' }}>Edit Profile Information</h3>
            <form onSubmit={handleSubmit} className="account-form">
              {/* Profile Picture Section */}
              <div className="form-section">
                <h3>Profile Picture</h3>
                <div className="profile-image-upload">
                  <div className="profile-image-preview">
                    {profileImage ? (
                      <img src={profileImage} alt="Profile" />
                    ) : (
                      <div className="profile-placeholder">
                        <span>{accountData.username?.charAt(0)?.toUpperCase() || '?'}</span>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    id="profileImageUpload"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="profileImageUpload" className="upload-image-btn">
                    {profileImage ? 'Change Photo' : 'Upload Photo'}
                  </label>
                </div>
              </div>

              <div className="form-section">
                <h3>Personal Information</h3>
                <div className="form-group">
                  <label htmlFor="username">Username</label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={accountData.username}
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
                    value={accountData.email}
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
                    value={accountData.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-section">
                <h3>Address Information</h3>
                <div className="form-group">
                  <label htmlFor="address">Street Address</label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={accountData.address}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-section">
                <h3>Account Security</h3>
                <div className="form-group">
                  <label htmlFor="new-password">New Password</label>
                  <input
                    type="password"
                    id="new-password"
                    placeholder="New Password"
                    value={newPassword}
                    onChange={handlePasswordChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="confirm-new-password">Confirm New Password</label>
                  <input
                    type="password"
                    id="confirm-new-password"
                    placeholder="Confirm New Password"
                    value={confirmNewPassword}
                    onChange={handleConfirmPasswordChange}
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
                  onClick={() => setActiveTab('accountInformation')}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        );
      case 'becomeSeller':
        return (
          <div className="account-form-content">
            <div className="seller-section">
              {userRole === 'SELLER' ? (
                <div className="seller-status">
                  <h3>✓ You are already a seller</h3>
                  <p>You can now manage your products and view the "My Products" section in the navigation bar.</p>
                </div>
              ) : (
                <div className="seller-prompt">
                  <h3>Become a Seller</h3>
                  <p>Start selling your products on WildMart! Once you become a seller, you'll be able to:</p>
                  <ul>
                    <li>Add and manage your products</li>
                    <li>View your sales and orders</li>
                    <li>Access the "My Products" section in the navigation</li>
                    <li>Reach thousands of buyers</li>
                  </ul>
                  <button 
                    className="become-seller-btn"
                    onClick={handleBecomeSellerClick}
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : 'Become a Seller Now'}
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="account-information-page">
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

      <div className="profile-header">
        <div className="profile-banner">
          <div className="profile-picture-container">
            {profileImage ? (
              <img src={profileImage} alt="Profile" className="profile-picture" />
            ) : (
              <div className="profile-picture-placeholder">
                <span>{accountData.username?.charAt(0)?.toUpperCase() || '?'}</span>
              </div>
            )}
          </div>
          <div className="profile-info">
            <h1 className="profile-name">{accountData.fullName || accountData.username}</h1>
          </div>
        </div>
      </div>

      <div className="profile-content-container">
        <div className="sidebar">
          <button 
            className={`sidebar-button ${activeTab === 'accountInformation' ? 'active' : ''}`}
            onClick={() => setActiveTab('accountInformation')}
          >
            ACCOUNT INFORMATION
          </button>
          <button 
            className={`sidebar-button ${activeTab === 'editProfile' ? 'active' : ''}`}
            onClick={() => setActiveTab('editProfile')}
          >
            EDIT PROFILE
          </button>
          {userRole !== 'SELLER' && (
            <button 
              className={`sidebar-button seller-btn ${activeTab === 'becomeSeller' ? 'active' : ''}`}
              onClick={() => setActiveTab('becomeSeller')}
            >
              🚀 BECOME A SELLER
            </button>
          )}
          <button 
            className="sidebar-button logout-button"
            onClick={handleLogout}
          >
            LOGOUT
          </button>
        </div>
        <div className="main-content">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AccountInformation;
