// src/Components/Layout.jsx
import React, { useState, useEffect } from 'react';
import { getAuth, signOut, onAuthStateChanged } from 'firebase/auth';
import {
    Drawer, List, ListItem, ListItemText, Toolbar, AppBar,
    Typography, Box, Button, useMediaQuery, BottomNavigation, BottomNavigationAction
} from '@mui/material';
import { useTheme } from '@mui/material/styles'; // Import useTheme
import { Home as HomeIcon, Info as InfoIcon, ContactMail as ContactIcon } from '@mui/icons-material';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

const drawerWidth = 240;


function Layout() {

    const theme = useTheme(); // Get theme instance
    const location = useLocation();
    const navigate = useNavigate();
    const auth = getAuth();
    const [user, setUser] = useState(null);
    const isMediumScreen = useMediaQuery(theme.breakpoints.down('md'));
    const [navValue, setNavValue] = useState('/');

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

    const handleNavChange = (event, newValue) => {
        setNavValue(newValue);
        navigate(newValue);
    };

    return (
        <Box sx={{ display: 'flex' }}>
            {/* AppBar */}
            <AppBar position="fixed" sx={{ width: { md: `calc(100% - ${drawerWidth}px)` }, ml: { md: `${drawerWidth}px` } }}>
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
            {/* Conditional Navigation */}

            {isMediumScreen ? (
                // Bottom Navigation for medium and smaller screens
                <BottomNavigation
                    sx={{
                        width: '100%',
                        position: 'fixed',
                        bottom: 0,
                        zIndex: 91100,
                        borderTop: '1px solid rgba(0, 0, 0, 0.12)',
                    }}
                    value={navValue}
                    onChange={handleNavChange}
                >
                    <BottomNavigationAction label="Home" value="/" icon={<HomeIcon />} />
                    <BottomNavigationAction label="Logs" value="/logs" icon={<InfoIcon />} />
                    <BottomNavigationAction label="Contact" value="/contact" icon={<ContactIcon />} />
                </BottomNavigation>
            ) : (
                // Drawer for larger screens
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
                        <ListItem button onClick={() => navigate('/contact')} sx={{ cursor: 'pointer' }}>
                            <ContactIcon sx={{ marginRight: 2 }} />
                            <ListItemText primary="Contact" />
                        </ListItem>
                    </List>
                </Drawer>
            )}

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
