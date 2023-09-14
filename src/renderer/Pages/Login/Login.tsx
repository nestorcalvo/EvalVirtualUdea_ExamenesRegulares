import {
  Avatar,
  Box,
  Button,
  CssBaseline,
  Grid,
  TextField,
  Typography,
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Image from '../../../../assets/login_image.jpeg';

const theme = createTheme();

function Login() {
  const [wrongMessage, setwrongMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = useCallback(
    (e: any) => {
      e.preventDefault();
      setwrongMessage('Envio de informacion');
      navigate('/home');
    },
    [navigate]
  );

  return (
    <>
      {/* <CheckCohort /> */}
      <ThemeProvider theme={theme}>
        <Grid container component="main" sx={{ height: '100%' }}>
          <CssBaseline />
          <Grid
            item
            xs={false}
            sm={4}
            md={7}
            sx={{
              backgroundImage: `url(${Image})`,
              backgroundRepeat: 'no-repeat',
              backgroundColor: (t) =>
                t.palette.mode === 'light'
                  ? t.palette.grey[50]
                  : t.palette.grey[900],
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
          <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6}>
            <Box
              sx={{
                my: 8,
                mx: 4,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <Avatar sx={{ m: 1, bgcolor: 'success.main' }}>
                <LockOutlinedIcon />
              </Avatar>
              <Typography component="h1" variant="h5">
                Log in
              </Typography>
              <Box
                component="form"
                noValidate
                onSubmit={handleSubmit}
                sx={{ mt: 1 }}
              >
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="user"
                  label="User"
                  name="user"
                  autoComplete="user"
                  autoFocus
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="current-password"
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2, bgcolor: 'success.main' }}
                >
                  Log In
                </Button>
              </Box>

              <Typography sx={{ color: 'error.main' }}>
                {wrongMessage}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </ThemeProvider>
    </>
  );
}

export default Login;
