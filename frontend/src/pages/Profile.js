import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/auth/profile');
      setProfile(response.data);
      setFormData({
        name: response.data.name,
        phone: response.data.phone,
        address: response.data.address,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      toast.error('Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    // Validate passwords if changing
    if (formData.newPassword) {
      if (formData.newPassword !== formData.confirmPassword) {
        toast.error('New passwords do not match');
        return;
      }
      if (formData.newPassword.length < 6) {
        toast.error('Password must be at least 6 characters');
        return;
      }
    }

    try {
      const updateData = {
        name: formData.name,
        phone: formData.phone,
        address: formData.address
      };

      if (formData.newPassword) {
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }

      await axios.put('http://localhost:5000/api/auth/profile', updateData);
      toast.success('Profile updated successfully');
      setEditing(false);
      fetchProfile();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    }
  };

  if (loading) {
    return <div className="text-center mt-5">Loading profile...</div>;
  }

  return (
    <div className="profile-page">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h4 className="mb-0">My Profile</h4>
              {!editing && (
                <button 
                  className="btn btn-primary"
                  onClick={() => setEditing(true)}
                >
                  Edit Profile
                </button>
              )}
            </div>
            <div className="card-body">
              {editing ? (
                <form onSubmit={handleUpdateProfile}>
                  <div className="form-group mb-3">
                    <label className="form-label">Name</label>
                    <input
                      type="text"
                      name="name"
                      className="form-control"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group mb-3">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      value={profile?.email}
                      disabled
                      readOnly
                    />
                    <small className="text-muted">Email cannot be changed</small>
                  </div>

                  <div className="form-group mb-3">
                    <label className="form-label">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      className="form-control"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group mb-3">
                    <label className="form-label">Address</label>
                    <textarea
                      name="address"
                      className="form-control"
                      value={formData.address}
                      onChange={handleChange}
                      required
                      rows="2"
                    />
                  </div>

                  <hr />
                  <h5>Change Password (Optional)</h5>

                  <div className="form-group mb-3">
                    <label className="form-label">Current Password</label>
                    <input
                      type="password"
                      name="currentPassword"
                      className="form-control"
                      value={formData.currentPassword}
                      onChange={handleChange}
                      placeholder="Enter current password"
                    />
                  </div>

                  <div className="form-group mb-3">
                    <label className="form-label">New Password</label>
                    <input
                      type="password"
                      name="newPassword"
                      className="form-control"
                      value={formData.newPassword}
                      onChange={handleChange}
                      placeholder="Enter new password"
                      minLength="6"
                    />
                  </div>

                  <div className="form-group mb-4">
                    <label className="form-label">Confirm New Password</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      className="form-control"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm new password"
                      minLength="6"
                    />
                  </div>

                  <div className="btn-group w-100">
                    <button type="submit" className="btn btn-success">
                      Save Changes
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-secondary"
                      onClick={() => setEditing(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div>
                  <div className="row mb-3">
                    <div className="col-md-4 fw-bold">Name:</div>
                    <div className="col-md-8">{profile?.name}</div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-md-4 fw-bold">Email:</div>
                    <div className="col-md-8">{profile?.email}</div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-md-4 fw-bold">Phone:</div>
                    <div className="col-md-8">{profile?.phone}</div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-md-4 fw-bold">Address:</div>
                    <div className="col-md-8">{profile?.address}</div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-md-4 fw-bold">Date of Birth:</div>
                    <div className="col-md-8">
                      {new Date(profile?.dateOfBirth).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-md-4 fw-bold">Member Since:</div>
                    <div className="col-md-8">
                      {new Date(profile?.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;