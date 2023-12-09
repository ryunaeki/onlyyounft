import { Box, Container, Fab, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import LoginButton from '../components/LoginButton'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

const Login = () => {
    const navigate = useNavigate();

    return (
        <>
            <Fab size="small" sx={{ position: 'absolute', top: 16, right: 16 }} color="primary" aria-label="管理画面" onClick={() => navigate("/admin")}>
                <AdminPanelSettingsIcon />
            </Fab>
            <Box
                sx={{
                    bgcolor: 'background.paper',
                    pt: 8,
                    pb: 6,
                }}
            >
                <Container maxWidth="sm">
                    <Typography
                        component="h1"
                        variant="h2"
                        align="center"
                        color="text.primary"
                        gutterBottom
                    >
                        OnlyYou NFT
                    </Typography>
                </Container>
            </Box>
            <LoginButton />
        </>
    );
}

export default Login;
