// src/Components/Layout.jsx
import React, { useState, useEffect } from 'react';
import { getAuth, signOut, onAuthStateChanged } from 'firebase/auth';
import { Drawer, List, ListItem, ListItemText, Toolbar, AppBar, Typography, Box, Button } from '@mui/material';
import { Home as HomeIcon, Info as InfoIcon, ContactMail as ContactIcon } from '@mui/icons-material';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

const drawerWidth = 240;


function Layout() {

    // const [userr, setUserr] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();
    const auth = getAuth();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser); // Update the user state when the auth state changes
        });
        return () => unsubscribe(); // Cleanup the listener on component unmount
    }, [auth]);

    // Dynamically set the title based on the current path
    const getTitle = () => {
        switch (location.pathname) {
            case '/':
                return 'Home';
            case '/register':
                return 'Register';
            case '/logs':
                return 'Trade Logs';
            default:
                return 'Trading Journal';
        }
    };

    const title = getTitle();

    // Function to handle logout
    const handleLogout = () => {
        signOut(auth)
            .then(() => {
                navigate('/'); // Redirect to home or login page after logout
            })
            .catch((error) => {
                console.error("Logout error:", error);
            });
    };

    return (
        <Box sx={{ display: 'flex' }}>
            {/* AppBar */}
            <AppBar position="fixed" sx={{ width: `calc(100% - ${drawerWidth}px)`, ml: `${drawerWidth}px` }}>
                <Toolbar>
                    <Typography variant="h6" noWrap component="div">
                        Trading Journal - {title}
                    </Typography>
                    {user && (
                        <Button color="inherit" onClick={handleLogout} sx={{ marginLeft: 'auto' }}>
                            Logout
                        </Button>
                    )}
                </Toolbar>
            </AppBar>
            {/* Side Menu */}
            <Drawer
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: drawerWidth,
                        boxSizing: 'border-box',
                    },
                }}
                variant="permanent"
                anchor="left"
            >
                <Toolbar />
                <List>
                    <ListItem button onClick={() => navigate('/')} sx={{ cursor: 'pointer' }}>
                        <HomeIcon sx={{ marginRight: 2 }} />
                        <ListItemText primary="Home" />
                    </ListItem>
                    <ListItem button onClick={() => navigate('/logs')} sx={{ cursor: 'pointer' }}>
                        <InfoIcon sx={{ marginRight: 2 }} />
                        <ListItemText primary="Trade Logs" />
                    </ListItem>
                    <ListItem button>
                        <ContactIcon sx={{ marginRight: 2 }} />
                        <ListItemText primary="Contact" />
                    </ListItem>
                </List>
            </Drawer>

            {/* Main Content */}
            <Box
                sx={{
                    flexGrow: 1,
                    p: 3,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Outlet /> {/* Renders the page content */}
            </Box>
        </Box>
    );
}

export default Layout;
