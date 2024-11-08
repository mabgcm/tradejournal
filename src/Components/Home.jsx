// src/Components/Home.jsx
import React, { useState, useEffect } from 'react';
import { Toolbar, Typography, Box, Button, TextField, Divider, Alert } from '@mui/material';
import { signInWithPopup, signInWithEmailAndPassword, GoogleAuthProvider, onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebaseConfig'; // Import Firestore
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';


const drawerWidth = 240;

function Home() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();


    // Check if a user is logged in
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe(); // Cleanup subscription on unmount
    }, []);

    // Function to handle Google login
    const handleGoogleLogin = async () => {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            // Check if user already exists in Firestore
            const userDoc = doc(db, "users", user.uid);
            const docSnap = await getDoc(userDoc);

            if (!docSnap.exists()) {
                // If user doesn't exist, save to Firestore
                await setDoc(userDoc, {
                    uid: user.uid,
                    name: user.displayName,
                    email: user.email,
                    photoURL: user.photoURL,
                });
            }

            alert('Login successful with Google!');
        } catch (error) {
            setError(error.message);
        }
    };

    // Function to handle email/password login
    const handleEmailLogin = async (e) => {
        e.preventDefault();
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            setError(error.message);
        }
    };

    // Navigate to Register page
    const goToRegister = () => {
        navigate('/register');
    };

    return (
        <Box sx={{ display: 'flex' }}>

            {/* Main Content */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    bgcolor: 'background.default',
                    p: 3,
                    width: `calc(100% - ${drawerWidth}px)`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100vh'
                }}
            >
                <Toolbar />

                {user ? (
                    // Show welcome message if user is logged in
                    <Typography variant="h4">
                        Welcome, {user.displayName || user.email}!
                    </Typography>
                ) : (
                    // Show login form if no user is logged in
                    <>
                        <Typography variant="h4" gutterBottom>
                            Welcome to Trading Journal
                        </Typography>

                        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                        <Box
                            sx={{
                                width: 300,
                                padding: 3,
                                backgroundColor: 'white',
                                borderRadius: 2,
                                boxShadow: 3,
                            }}
                        >
                            {/* Google Login Button with Custom Google Logo */}
                            <Button
                                variant="outlined"
                                fullWidth
                                onClick={handleGoogleLogin}
                                sx={{
                                    mb: 2,
                                    color: '#757575',
                                    borderColor: '#dcdcdc',
                                    textTransform: 'none',
                                    '&:hover': { backgroundColor: '#f5f5f5' },
                                    fontWeight: 'bold',
                                }}
                                startIcon={
                                    <img
                                        src="https://developers.google.com/identity/images/g-logo.png"
                                        alt="Google logo"
                                        style={{ width: 20, height: 20 }}
                                    />
                                }
                            >
                                Continue with Google
                            </Button>


                            <Divider sx={{ my: 2 }}>or</Divider>

                            {/* Email/Password Login Form */}
                            <form onSubmit={handleEmailLogin}>
                                <TextField
                                    label="Email"
                                    variant="outlined"
                                    fullWidth
                                    required
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    sx={{ mb: 2 }}
                                />
                                <TextField
                                    label="Password"
                                    variant="outlined"
                                    fullWidth
                                    required
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    sx={{ mb: 2 }}
                                />
                                <Button type="submit" variant="contained" color="primary" fullWidth>
                                    Login with Email
                                </Button>
                            </form>

                            {/* Register Button */}
                            <Button
                                variant="outlined"
                                color="primary"
                                fullWidth
                                onClick={goToRegister}
                                sx={{ mt: 2 }}
                            >
                                Register
                            </Button>
                        </Box>
                    </>
                )}
            </Box>
        </Box>
    );
}

export default Home;
