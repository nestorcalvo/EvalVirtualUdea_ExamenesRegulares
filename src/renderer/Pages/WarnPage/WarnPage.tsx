import { Container, Typography, Box } from '@mui/material';
import React, { useState, useEffect, useRef } from 'react';

function WarnPage() {
  const [warning, setWarning] = useState('');
  const [warningType, setWarningType] = useState('');
  const [timer, setTimer] = useState(15);
  const intervalRef: any = useRef();

  useEffect(() => {
    window.electron.ipcRenderer.once('open_window', (args) => {
      if (Array.isArray(args)) {
        setWarningType('software');
        const warn = args!.join(', ');
        setWarning(warn);
      } else if (typeof args === 'number') {
        setWarningType('screen');
        const warn = `Se han detectado ${args} pantallas.
        Recuerde que el uso de pantallas externas está prohibido durante el examen y puede ser sancionado.
        Por favor, desconectar la pantalla adicional para poder continuar con el examen y permitir el cierre de esta ventana.`;
        setWarning(warn);
      }
    });
  }, []);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setTimer((t) => t - 1);
      if (warningType === 'software') {
        if (timer === 10) {
          window.electron.ipcRenderer.sendMessage('screenshot');
        } else if (timer === 5) {
          window.electron.ipcRenderer.sendMessage('close_software');
        }
      }
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [timer, warningType]);

  useEffect(() => {
    if (timer <= 0) {
      clearInterval(intervalRef.current);
      window.electron.ipcRenderer.sendMessage('countdown_over');
    }
  }, [timer]);

  return (
    <div>
      <Container maxWidth="sm" style={{ justifyContent: 'center' }}>
        <Box display="flex" flexWrap="wrap" justifyContent="center">
          <Typography component="h1" variant="h4">
            ALERTA
          </Typography>

          <div>
            {warningType === 'software' && (
              <Typography component="h1" variant="h5">
                {warning}
              </Typography>
            )}
            {warningType === 'screen' && (
              <Typography component="h1" variant="h5">
                {warning}
              </Typography>
            )}
          </div>
          <Typography component="h1" variant="h4">
            {timer}
          </Typography>
        </Box>
      </Container>
    </div>
  );
}

export default WarnPage;
