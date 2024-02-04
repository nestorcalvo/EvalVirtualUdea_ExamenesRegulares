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
import React, { useState, useRef, useEffect } from 'react';
import { ToastContainer, toast, Slide, ToastOptions } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';
import instance from 'renderer/axiosConfig';
import { AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';
import { Toast } from 'react-toastify/dist/types';
import Image from '../../../../assets/udea_login_2.jpeg';

const theme = createTheme();

function Login() {
  const userRef = useRef<HTMLInputElement>(null);
  const errRef = useRef<HTMLInputElement>(null);
  const toastId = useRef<Toast>(null);
  const navigate = useNavigate();
  const [user, setUser] = useState('');
  const [pwd, setPwd] = useState('');
  const [wrongMessage, setWrongMessage] = useState('');
  const [version, setVersion] = useState<null | string>(null);

  useEffect(() => {
    window.electron.ipcRenderer.on('check_version', (args) => {
      if (typeof args === 'string') {
        setVersion(args);
      }
    });
  }, []);
  useEffect(() => {
    window.electron.ipcRenderer.on('show_notification', (args: any) => {
      if (typeof args.message === 'string') {
        const options: ToastOptions = {
          position: 'bottom-right',
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: false,
          progress: undefined,
          theme: 'light',
          transition: Slide,
        };
        if (args.type === 'info') {
          toastId.current = toast.info(args.message, options);
        } else if (args.type === 'error') {
          toastId.current = toast.error(args.message, options);
        }
      }
    });
  }, []);
  useEffect(() => {
    if (userRef.current) {
      userRef.current.focus();
    }
  }, []);

  useEffect(() => {
    setWrongMessage('');
  }, [user, pwd]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      const config = {
        headers: { 'Content-Type': 'application/json' },
        params: { user, password: pwd, cohort: 20232 },
        // withCredentials: true,
      };
      const response = await instance.post('/login', {}, config);
      const AuthToken = JSON.stringify(response?.data?.token);
      setUser('');
      setPwd('');
      window.electron.ipcRenderer.sendMessage('userLogin', AuthToken);
      navigate('/home', { state: { token: AuthToken } });
    } catch (err) {
      const error = err as AxiosError;
      if (!error?.response) {
        setWrongMessage('No internet connection');
      } else if (error.response?.status === 401) {
        setWrongMessage('Usuario o contrasena incorrectos');
      } else {
        setWrongMessage('Login failed');
      }
      if (errRef.current) {
        errRef.current.focus();
      }
    }
  };

  return (
    <>
      {/* <CheckCohort /> */}

      <ThemeProvider theme={theme}>
        <Grid container component="main" sx={{ height: '100%' }}>
          {version && (
            <ToastContainer
              position="bottom-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
            />
          )}
          <CssBaseline />
          <Grid
            item
            xs={false}
            sm={4}
            md={7}
            sx={{
              backgroundImage: `url(${Image})`,
              backgroundSize: 'cover',
              backgroundRepeat: 'no-repeat',
              backgroundColor: (t) =>
                t.palette.mode === 'light'
                  ? t.palette.grey[50]
                  : t.palette.grey[900],
              backgroundPosition: 'left',
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
              <Avatar sx={{ m: 1, backgroundColor: '#0B8983' }}>
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
                  autoComplete="off"
                  onChange={(e) => setUser(e.target.value)}
                  value={user}
                  inputRef={userRef}
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
                  onChange={(e) => setPwd(e.target.value)}
                  value={pwd}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2, backgroundColor: '#0B8983' }}
                >
                  Log In
                </Button>
                {version && (
                  <Typography variant="caption" sx={{ color: '#424242' }}>
                    v{version}
                  </Typography>
                )}
              </Box>

              <section>
                <p ref={errRef}>
                  <Typography component="span" sx={{ color: 'error.main' }}>
                    {wrongMessage}
                  </Typography>
                </p>
              </section>
            </Box>
          </Grid>
        </Grid>
      </ThemeProvider>
    </>
  );
}

export default Login;
