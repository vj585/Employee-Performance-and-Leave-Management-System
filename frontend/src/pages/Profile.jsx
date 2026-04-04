import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { Camera, X, Check, ZoomIn } from 'lucide-react';
import AvatarEditor from 'react-avatar-editor';

const Profile = () => {
  const [user, setUser] = useState(null);
  const fileInputRef = useRef(null);
  const editorRef = useRef(null);

  const [editorTarget, setEditorTarget] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('employeeUser');
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        toast.error('Source image must be less than 8MB');
        return;
      }
      setEditorTarget(file);
      setZoom(1);
      setIsEditorOpen(true);
      e.target.value = null; // reset input
    }
  };

  const handleSaveCrop = async () => {
    if (editorRef.current) {
      setUploading(true);
      // Converts canvas directly to optimized base64 payload
      const canvas = editorRef.current.getImageScaledToCanvas();
      const base64String = canvas.toDataURL('image/jpeg', 0.85);

      try {
        const token = localStorage.getItem('employeeToken');
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/employees/profile/image`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ profileImage: base64String })
        });
        
        let data;
        const textResponse = await res.text();
        try {
          data = JSON.parse(textResponse);
        } catch(e) {
          if(res.status === 413) throw new Error('413 Payload Too Large - Backend needs restart!');
          throw new Error('Server returned non-JSON: ' + textResponse.substring(0,50));
        }
        
        if (res.ok) {
          toast.success('Profile picture perfectly cropped and updated!');
          const updatedUser = { ...user, profileImage: data.profileImage };
          localStorage.setItem('employeeUser', JSON.stringify(updatedUser));
          setUser(updatedUser);
          setIsEditorOpen(false);
          setEditorTarget(null);
          setTimeout(() => window.location.reload(), 1000);
        } else {
          toast.error(data.message || 'Failed to update image remotely.');
        }
      } catch (err) {
        if(err.message.includes('413')) toast.error('Backend payload limit blocking transfer. Please restart backend.');
        else toast.error(err.message || 'Network block: Payload too massive or disconnected.');
      } finally {
        setUploading(false);
      }
    }
  };

  if (!user) return <div className="loading-screen">Loading Profile Context...</div>;

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '2rem', maxWidth: '850px' }}>
      <h2 style={{ marginBottom: '2rem', color: 'var(--text-primary)' }}>My Profile & Settings</h2>
      
      <div style={{ display: 'flex', gap: '3rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        
        {/* Profile Picture Section */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', width: '240px', flexShrink: 0 }}>
          <div style={{ 
            width: '160px', height: '160px', borderRadius: '50%', 
            background: 'linear-gradient(135deg, var(--primary), #a855f7)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            color: 'white', fontSize: '4rem', fontWeight: 'bold', 
            position: 'relative', overflow: 'hidden', border: '5px solid var(--surface-base)', 
            boxShadow: '0 8px 25px rgba(0,0,0,0.1)' 
          }}>
            {user.profileImage ? (
              <img src={user.profileImage} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              user.name.charAt(0).toUpperCase()
            )}
            
            {/* Upload Overlay trigger */}
            <div 
              style={{ 
                position: 'absolute', bottom: 0, left: 0, right: 0, height: '50px', 
                background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                cursor: 'pointer', transition: 'all 0.3s' 
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera size={24} color="white" />
            </div>
          </div>
          <input type="file" accept="image/*" ref={fileInputRef} style={{ display: 'none' }} onChange={handleImageSelect} />
          
          <div style={{ width: '100%' }}>
            <h4 style={{ margin: '0 0 0.75rem 0', color: 'var(--text-primary)', fontSize: '1rem', textAlign: 'center' }}>Identity Verification</h4>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5', background: 'var(--surface)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--surface-border)' }}>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>Photo Guidelines:</div>
              <ul style={{ margin: 0, paddingLeft: '20px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <li>Corporate or professional headshot.</li>
                <li>Ensure bright, clear lighting.</li>
                <li>Use a plain, neutral background.</li>
                <li>Cropper auto-centers to perfect square/circle.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Existing User Data */}
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', background: 'var(--surface-base)', padding: '2.5rem', borderRadius: '20px', border: '1px solid var(--border)', boxShadow: '0 4px 15px rgba(0,0,0,0.02)', minWidth: '350px' }}>
          <div style={{ gridColumn: '1 / -1', borderBottom: '1px solid var(--surface-border)', paddingBottom: '1rem', marginBottom: '-0.5rem' }}>
            <h3 style={{ margin: 0, color: 'var(--primary)', fontSize: '1.2rem' }}>Account Information</h3>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontWeight: 500 }}>Full Name</label>
            <div style={{ fontSize: '1.1rem', color: 'var(--text-primary)', fontWeight: 600 }}>{user.name}</div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontWeight: 500 }}>Email Address</label>
            <div style={{ fontSize: '1.1rem', color: 'var(--text-primary)', fontWeight: 600, wordBreak: 'break-all' }}>{user.email}</div>
          </div>
          <div style={{ gridColumn: '1 / -1', borderBottom: '1px solid var(--surface-border)', paddingBottom: '1rem', paddingTop: '0.5rem', marginBottom: '-0.5rem' }}>
            <h3 style={{ margin: 0, color: 'var(--primary)', fontSize: '1.2rem' }}>Corporate Context</h3>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontWeight: 500 }}>Clearance Level</label>
            <div style={{ display: 'inline-block', padding: '0.3rem 0.8rem', background: 'var(--primary-glow)', color: 'var(--primary)', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 700 }}>{user.role}</div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontWeight: 500 }}>Designation</label>
            <div style={{ fontSize: '1.1rem', color: 'var(--text-primary)', fontWeight: 600 }}>{user.designation || 'Not Assigned'}</div>
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontWeight: 500 }}>Department</label>
            <div style={{ fontSize: '1.1rem', color: 'var(--text-primary)', fontWeight: 600 }}>{user.department || 'Not Assigned'}</div>
          </div>
        </div>

      </div>

      {/* Editor Modal */}
      {isEditorOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-panel animate-fade-in" style={{ width: '450px', background: 'var(--surface-base)', padding: '2rem', borderRadius: '24px', boxShadow: '0 25px 50px rgba(0,0,0,0.25)', position: 'relative' }}>
            
            <button 
              onClick={() => { setIsEditorOpen(false); setEditorTarget(null); }} 
              style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
            >
              <X size={24} />
            </button>
            
            <h3 style={{ margin: '0 0 1.5rem 0', color: 'var(--text-primary)', fontSize: '1.25rem', textAlign: 'center' }}>Crop Profile Image</h3>
            
            <div style={{ display: 'flex', justifyContent: 'center', background: '#f8fafc', borderRadius: '16px', overflow: 'hidden', padding: '1rem' }}>
              <AvatarEditor
                ref={editorRef}
                image={editorTarget}
                width={250}
                height={250}
                border={30}
                borderRadius={125} // creates circular cutoff view
                color={[15, 23, 42, 0.6]} // RGBA for editor backdrop mask
                scale={zoom}
                rotate={0}
                style={{ cursor: 'move', borderRadius: '16px' }}
              />
            </div>
            
            <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <ZoomIn size={20} color="var(--text-secondary)" />
              <input 
                type="range" 
                min="1" max="3" step="0.05" 
                value={zoom} 
                onChange={(e) => setZoom(parseFloat(e.target.value))} 
                style={{ flex: 1, accentColor: 'var(--primary)' }}
              />
            </div>
            
            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
              <button 
                onClick={() => setIsEditorOpen(false)} 
                style={{ flex: 1, padding: '0.85rem', background: 'transparent', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text-primary)', fontWeight: 600, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleSaveCrop} 
                disabled={uploading}
                style={{ flex: 1, padding: '0.85rem', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
              >
                {uploading ? 'Processing...' : <><Check size={18} /> Apply Crop</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
