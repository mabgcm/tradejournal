// src/Components/TradeLogs.jsx
import React, { useState, useEffect } from 'react';
import { collection, addDoc, deleteDoc, updateDoc, getDocs, doc } from 'firebase/firestore';
import { Box, Button, Table, TableBody, TableCell, TableHead, TableRow, TextField, MenuItem, Grid, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import Typography from '@mui/material/Typography';
import NoMaxWidthTooltip from '@mui/material/Tooltip';
import DatePicker from 'react-datepicker';
import dayjs from 'dayjs';
import 'react-datepicker/dist/react-datepicker.css';
import { db } from '../firebaseConfig'; // Ensure Firebase is configured and imported correctly


function TradeLogs() {
    const [trades, setTrades] = useState([]);
    const [newTrade, setNewTrade] = useState({
        entryDate: null,
        entryTime: null,
        symbol: '',
        entryPrice: '',
        entryAmount: '',
        leverage: '',
        position: '',
        exitDate: null,
        exitTime: null,
        exitPrice: '',
        exitAmount: '',
        plAmount: '',
        plRate: '',
        info: ''
    });
    const [open, setOpen] = useState(false);
    const [editId, setEditId] = useState(null);

    const fetchTrades = async () => {
        try {
            const tradesRef = collection(db, 'trades');
            const querySnapshot = await getDocs(tradesRef);
            setTrades(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (error) {
            console.error("Error fetching trades:", error);
        }
    };

    const calculatePL = () => {
        const entryAmount = parseFloat(newTrade.entryAmount);
        const exitAmount = parseFloat(newTrade.exitAmount);
        if (!isNaN(entryAmount) && !isNaN(exitAmount) && entryAmount !== 0) {
            const plAmount = exitAmount - entryAmount;
            const plRate = (plAmount / entryAmount) * 100;
            setNewTrade(prev => ({
                ...prev,
                plAmount: plAmount.toFixed(2),
                plRate: plRate.toFixed(2)
            }));
        }
    };

    const saveTrade = async () => {
        const tradeData = {
            ...newTrade,
            entryDate: dayjs(newTrade.entryDate).format('YYYY-MM-DD'),
            entryTime: dayjs(newTrade.entryTime).format('HH:mm'),
            exitDate: dayjs(newTrade.exitDate).format('YYYY-MM-DD'),
            exitTime: dayjs(newTrade.exitTime).format('HH:mm'),
            info: newTrade.info
        };

        try {
            if (editId) {
                await updateDoc(doc(db, 'trades', editId), tradeData);
            } else {
                await addDoc(collection(db, 'trades'), tradeData);
            }
            fetchTrades(); // Refresh list after saving
            setOpen(false); // Close dialog
            resetForm(); // Reset form fields
        } catch (error) {
            console.error("Error saving trade:", error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteDoc(doc(db, 'trades', id));
            fetchTrades(); // Refresh after delete
        } catch (error) {
            console.error("Error deleting trade:", error);
        }
    };

    const handleEdit = (trade) => {
        setEditId(trade.id);
        setNewTrade({
            entryDate: trade.entryDate ? dayjs(trade.entryDate, 'YYYY-MM-DD').isValid() ? dayjs(trade.entryDate, 'YYYY-MM-DD').toDate() : null : null,
            entryTime: trade.entryTime ? dayjs(trade.entryTime, 'HH:mm').isValid() ? dayjs(trade.entryTime, 'HH:mm').toDate() : null : null,
            symbol: trade.symbol || '',
            entryPrice: trade.entryPrice || '',
            entryAmount: trade.entryAmount || '',
            leverage: trade.leverage || '',
            position: trade.position || '',
            exitDate: trade.exitDate ? dayjs(trade.exitDate, 'YYYY-MM-DD').isValid() ? dayjs(trade.exitDate, 'YYYY-MM-DD').toDate() : null : null,
            exitTime: trade.exitTime ? dayjs(trade.exitTime, 'HH:mm').isValid() ? dayjs(trade.exitTime, 'HH:mm').toDate() : null : null,
            exitPrice: trade.exitPrice || '',
            exitAmount: trade.exitAmount || '',
            plAmount: trade.plAmount || '',
            plRate: trade.plRate || '',
            info: trade.info || ''
        });
        setOpen(true);
    };


    const handleDateChange = (date, field) => {
        setNewTrade(prev => ({
            ...prev,
            [field]: date
        }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewTrade(prev => ({ ...prev, [name]: value }));
        if (name === 'entryAmount' || name === 'exitAmount') {
            setTimeout(calculatePL, 0);
        }
    };

    const resetForm = () => {
        setNewTrade({
            entryDate: null,
            entryTime: null,
            symbol: '',
            entryPrice: '',
            entryAmount: '',
            leverage: '',
            position: '',
            exitDate: null,
            exitTime: null,
            exitPrice: '',
            exitAmount: '',
            plAmount: '',
            plRate: '',
            info: ''
        });
        setEditId(null);
    };

    useEffect(() => {
        fetchTrades();
    }, []);

    return (
        <Box mt={10}>
            <Button variant="contained" color="primary" onClick={() => { resetForm(); setOpen(true); }}>
                Add New Trade
            </Button>

            {/* Popup for data entry */}
            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{editId ? "Edit Trade" : "Add New Trade"}</DialogTitle>
                <DialogContent>
                    {/* Symbol Field */}
                    <Grid item xs={12}>
                        <Box sx={{ mb: 1 }}>Symbol</Box>
                        <TextField
                            name="symbol"
                            value={newTrade.symbol}
                            onChange={handleChange}
                            size="small"
                            fullWidth
                        />
                    </Grid>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        {/* Entry Date */}
                        <Grid item xs={3}>
                            <Box sx={{ mb: 1 }}>Entry Date</Box>
                            <Box sx={{ width: '100%' }}>
                                <DatePicker
                                    selected={newTrade.entryDate}
                                    onChange={(date) => handleDateChange(date, 'entryDate')}
                                    dateFormat="yyyy/MM/dd"
                                    customInput={<TextField fullWidth size="small" />}
                                />
                            </Box>
                        </Grid>
                        {/* Entry Time */}
                        <Grid item xs={3}>
                            <Box sx={{ mb: 1 }}>Entry Time</Box>
                            <Box sx={{ width: '100%' }}>
                                <DatePicker
                                    selected={newTrade.entryTime}
                                    onChange={(time) => handleDateChange(time, 'entryTime')}
                                    showTimeSelect
                                    showTimeSelectOnly
                                    timeIntervals={15}
                                    timeCaption="Time"
                                    dateFormat="HH:mm"
                                    customInput={<TextField fullWidth size="small" />}
                                />
                            </Box>
                        </Grid>
                        {/* Exit Date */}
                        <Grid item xs={3}>
                            <Box sx={{ mb: 1 }}>Exit Date</Box>
                            <Box sx={{ width: '100%' }}>
                                <DatePicker
                                    selected={newTrade.exitDate}
                                    onChange={(date) => handleDateChange(date, 'exitDate')}
                                    dateFormat="yyyy/MM/dd"
                                    customInput={<TextField fullWidth size="small" />}
                                />
                            </Box>
                        </Grid>
                        {/* Exit Time */}
                        <Grid item xs={3}>
                            <Box sx={{ mb: 1 }}>Exit Time</Box>
                            <Box sx={{ width: '100%' }}>
                                <DatePicker
                                    selected={newTrade.exitTime}
                                    onChange={(time) => handleDateChange(time, 'exitTime')}
                                    showTimeSelect
                                    showTimeSelectOnly
                                    timeIntervals={15}
                                    timeCaption="Time"
                                    dateFormat="HH:mm"
                                    customInput={<TextField fullWidth size="small" />}
                                />
                            </Box>
                        </Grid>

                        {/* Entry Price and Exit Price */}
                        <Grid item xs={6}>
                            <Box sx={{ mb: 1 }}>Entry Price</Box>
                            <TextField
                                name="entryPrice"
                                value={newTrade.entryPrice}
                                onChange={handleChange}
                                fullWidth
                                size="small"
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <Box sx={{ mb: 1 }}>Exit Price</Box>
                            <TextField
                                name="exitPrice"
                                value={newTrade.exitPrice}
                                onChange={handleChange}
                                fullWidth
                                size="small"
                            />
                        </Grid>

                        {/* Entry Amount and Exit Amount */}
                        <Grid item xs={6}>
                            <Box sx={{ mb: 1 }}>Entry Amount</Box>
                            <TextField
                                name="entryAmount"
                                value={newTrade.entryAmount}
                                onChange={handleChange}
                                fullWidth
                                size="small"
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <Box sx={{ mb: 1 }}>Exit Amount</Box>
                            <TextField
                                name="exitAmount"
                                value={newTrade.exitAmount}
                                onChange={handleChange}
                                fullWidth
                                size="small"
                            />
                        </Grid>

                        {/* Position and Leverage */}
                        <Grid item xs={6}>
                            <Box sx={{ mb: 1 }}>Position</Box>
                            <TextField
                                name="position"
                                value={newTrade.position}
                                onChange={handleChange}
                                select
                                fullWidth
                                size="small"
                            >
                                <MenuItem value="Long">Long</MenuItem>
                                <MenuItem value="Short">Short</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid item xs={6}>
                            <Box sx={{ mb: 1 }}>Leverage</Box>
                            <TextField
                                name="leverage"
                                value={newTrade.leverage}
                                onChange={handleChange}
                                fullWidth size="small"
                            />
                        </Grid>

                        {/* P/L Amount and P/L Rate */}
                        <Grid item xs={6}>
                            <Box sx={{ mb: 1 }}>P/L Amount</Box>
                            <TextField
                                name="plAmount"
                                value={newTrade.plAmount}
                                disabled
                                fullWidth size="small"
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <Box sx={{ mb: 1 }}>P/L Rate (%)</Box>
                            <TextField
                                name="plRate"
                                value={newTrade.plRate}
                                disabled
                                fullWidth size="small"
                            />
                        </Grid>
                    </Grid>
                    {/* Info Field */}
                    <Grid item xs={12}>
                        <Box sx={{ mb: 1 }}>Notes</Box>
                        <TextField
                            name="info"
                            value={newTrade.info}
                            onChange={handleChange}
                            size="small"
                            fullWidth
                        />
                    </Grid>
                </DialogContent>

                <DialogActions>
                    <Button onClick={() => setOpen(false)} color="secondary">Cancel</Button>
                    <Button onClick={saveTrade} color="primary" variant="contained">Save Trade</Button>
                </DialogActions>
            </Dialog>

            {/* Display the list of trades */}
            <Table sx={{ mt: 4 }}>
                <TableHead>
                    <TableRow>
                        <TableCell><Typography variant="h6" gutterBottom>Entry Date</Typography></TableCell>
                        <TableCell><Typography variant="h6" gutterBottom>Entry Time</Typography></TableCell>
                        <TableCell><Typography variant="h6" gutterBottom>Symbol</Typography></TableCell>
                        <TableCell><Typography variant="h6" gutterBottom>Entry Price</Typography></TableCell>
                        <TableCell><Typography variant="h6" gutterBottom>Entry Amount</Typography></TableCell>
                        <TableCell><Typography variant="h6" gutterBottom>Leverage</Typography></TableCell>
                        <TableCell><Typography variant="h6" gutterBottom>Position</Typography></TableCell>
                        <TableCell><Typography variant="h6" gutterBottom>Exit Date</Typography></TableCell>
                        <TableCell><Typography variant="h6" gutterBottom>Exit Time</Typography></TableCell>
                        <TableCell><Typography variant="h6" gutterBottom>Exit Price</Typography></TableCell>
                        <TableCell><Typography variant="h6" gutterBottom>Exit Amount</Typography></TableCell>
                        <TableCell><Typography variant="h6" gutterBottom>P/L Amount</Typography></TableCell>
                        <TableCell><Typography variant="h6" gutterBottom>P/L Rate</Typography></TableCell>
                        <TableCell><Typography variant="h6" gutterBottom>Actions</Typography></TableCell>

                    </TableRow>
                </TableHead>
                <TableBody>
                    {trades.map((trade, index) => (
                        <NoMaxWidthTooltip key={trade.id} title={trade.info || ''} arrow>
                            <TableRow
                                sx={{
                                    backgroundColor: index % 2 === 0 ? 'action.hover' : 'background.paper',
                                }}
                            >
                                <TableCell align="center">{trade.entryDate}</TableCell>
                                <TableCell align="center">{trade.entryTime}</TableCell>
                                <TableCell align="center">{trade.symbol}</TableCell>
                                <TableCell align="center">${trade.entryPrice}</TableCell>
                                <TableCell align="center">${trade.entryAmount}</TableCell>
                                <TableCell align="center">{trade.leverage}x</TableCell>
                                <TableCell align="center">{trade.position}</TableCell>
                                <TableCell align="center">{trade.exitDate}</TableCell>
                                <TableCell align="center">{trade.exitTime}</TableCell>
                                <TableCell align="center">${trade.exitPrice}</TableCell>
                                <TableCell align="center">${trade.exitAmount}</TableCell>
                                <TableCell align="center">${trade.plAmount}</TableCell>
                                <TableCell align="center">%{trade.plRate}</TableCell>
                                <TableCell align="center">
                                    <IconButton onClick={() => handleEdit(trade)} color="primary" size="small">
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton onClick={() => handleDelete(trade.id)} color="secondary" size="small">
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        </NoMaxWidthTooltip>
                    ))}
                </TableBody>
            </Table>
        </Box >
    );
}

export default TradeLogs;
