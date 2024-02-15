import { Container, Typography, Box } from '@mui/material';
import React, { useState, useEffect, useRef } from 'react';

function WarnPage() {
  const [warning, setWarning] = useState('Se ha detectado una alerta');
  const [warningType, setWarningType] = useState('unknown');
  const [timer, setTimer] = useState(30);
  const intervalRef: any = useRef();
  useEffect(() => {
    window.electron.ipcRenderer.once('open_window', (args) => {
      if (Array.isArray(args)) {
        setWarningType('software');
        const warn = args!.join(', ');
        setWarning(warn);
      } else if (typeof args === 'number') {
        setWarningType('screen');
        const warn = `Se han detectado ${args} pantallas.`;
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
      <Container maxWidth="md" style={{ justifyContent: 'center' }}>
        <Box
          display="flex"
          flexWrap="wrap"
          justifyContent="center"
          flexDirection="row"
        >
          <Typography
            component="h1"
            variant="h3"
            style={{ marginBottom: '16px' }}
          >
            <strong>ALERTA</strong>
          </Typography>

          <Typography
            component="h1"
            variant="h4"
            style={{ marginBottom: '16px' }}
          >
            Esta alerta se genera debido a que la aplicación a detectado el uso
            de software no permitido o pantallas externas. RECUERDE que su uso
            no está permitido y puede generar sanciones.
          </Typography>

          <div>
            {warningType === 'software' && (
              <Typography
                component="h1"
                variant="h4"
                style={{ marginBottom: '16px' }}
              >
                <strong>Software no permitido: </strong>
                {warning}
              </Typography>
            )}
            {warningType === 'screen' && (
              <Typography
                component="h1"
                variant="h4"
                style={{ marginBottom: '16px' }}
              >
                <strong>{warning}</strong>
              </Typography>
            )}
            {warningType === 'unknown' && (
              <Typography
                component="h1"
                variant="h4"
                style={{ marginBottom: '16px' }}
              >
                <strong>{warning}</strong>
              </Typography>
            )}
          </div>
          <Typography
            component="h1"
            variant="h4"
            style={{ marginBottom: '16px' }}
          >
            Para poder seguir haciendo uso de la aplicación por favor siga las
            siguientes instrucciones:
            {warningType === 'software' && (
              <ol>
                <li>
                  Permita que el contador llegue a cero. En caso de que sigan
                  generando alertas, cierre la aplicación la cual puede estar
                  ejecutandose en segundo plano.{' '}
                </li>
              </ol>
            )}
            {warningType === 'screen' && (
              <ol>
                <li>
                  Por favor, desconectar la pantalla adicional para poder
                  continuar con el examen y permitir el cierre de esta ventana.{' '}
                </li>
              </ol>
            )}
            {warningType === 'unknown' && (
              <ol>
                <li>
                  Cierra esta ventana para que pueda mostrar la alerta que se
                  generó.{' '}
                </li>
              </ol>
            )}
          </Typography>
          <Typography
            component="h1"
            variant="h4"
            style={{ marginBottom: '16px' }}
          >
            Contador: {timer} seg
          </Typography>
        </Box>
      </Container>
    </div>
  );
}

export default WarnPage;
