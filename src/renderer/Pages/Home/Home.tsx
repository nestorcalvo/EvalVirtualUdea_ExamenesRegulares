/* eslint-disable jsx-a11y/media-has-caption */
// import './Home.css';
import Camera from 'renderer/Components/Camera/Camera';
import Information from 'renderer/Components/Information/Information';
import { Container, Button, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import { URL_EXAM } from 'utils/constants';

function Home() {
  const renderExamPage = () => {
    window.electron.ipcRenderer.sendMessage('start_exam', URL_EXAM);
  };
  return (
    <Container maxWidth="sm" style={{ justifyContent: 'center' }}>
      <Box display="flex" flexWrap="wrap" justifyContent="center">
        <Typography
          variant="body1"
          style={{
            color: '#0B8983',
            display: 'flex',
            textAlign: 'center',
          }}
          fontSize="h4.fontSize"
        >
          Aplicación para examenes virtuales
        </Typography>
        <Typography
          variant="body1"
          style={{ color: '#49D5BB', display: 'flex', textAlign: 'center' }}
          fontSize="h4.fontSize"
        >
          Universidad de Antioquia
        </Typography>
      </Box>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <Box
          component="div"
          sx={{
            whiteSpace: 'wrap',
            overflowX: 'auto',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            my: 2,
            p: 1,
            bgcolor: (theme) =>
              theme.palette.mode === 'dark' ? '#101010' : 'grey.100',
            color: (theme) =>
              theme.palette.mode === 'dark' ? 'grey.300' : 'grey.800',
            border: '1px solid',
            borderColor: (theme) =>
              theme.palette.mode === 'dark' ? 'grey.800' : 'grey.300',
            borderRadius: 2,
            fontSize: '0.875rem',
            fontWeight: '700',
          }}
        >
          <Information />
        </Box>
        <Box component="div" display="flex" justifyContent="center">
          <Camera />
        </Box>
        <Box
          component="div"
          display="flex"
          justifyContent="center"
          sx={{ p: 1 }}
        >
          <Button
            type="submit"
            fullWidth
            variant="contained"
            onClick={renderExamPage}
            sx={{
              mx: 'auto',
              backgroundColor: '#0B8983',
              maxWidth: '40%',
            }}
          >
            Iniciar Examen
          </Button>
        </Box>
      </div>
    </Container>
  );
}
export default Home;
