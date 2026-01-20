import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from "@mui/material";

export default  function ConfirmDialog({open, title, message, onClose}){
    const handleConfirm = () => onClose(true);
    const handleCancel = () => onClose(false);

    return(
        <Dialog open={open} onClose={handleCancel}
        sx={{
            '& .MuiDialog-paper':{
                borderRadius: '15px',
                padding: '8px'
            }
        }}>
            <DialogTitle sx={{fontWeight: "bold", color: "black"}}>{title || "Confirm"}</DialogTitle>
            <DialogContent>
                <DialogContentText>{message || "Are you sure?"}</DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleCancel} color="error" variant="outlined">Cancel</Button>
                <Button onClick={handleConfirm} color="primary" autoFocus variant="contained">Confirm</Button>
            </DialogActions>
        </Dialog>
    )
}