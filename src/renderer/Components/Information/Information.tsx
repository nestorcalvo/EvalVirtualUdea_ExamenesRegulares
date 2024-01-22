import Typography from '@mui/material/Typography';
import React from 'react';

function Information() {
  return (
    <>
      <Typography variant="subtitle1">
        Se recomienda verificar en la parte inferior (encima del botón de
        iniciar examen) que su camara esté encendida y funcionando.
      </Typography>
      <Typography variant="subtitle1">
        Una vez ingrese al examen, no podrá cerrar ninguna de las ventanas del
        aplicativo, de lo contrario, se generará un cierre total del examen y no
        podrá retornar a él.
      </Typography>
      <Typography variant="subtitle1">
        El uso de software de acceso remoto, máquinas virtuales y segundas
        pantallas está prohibido. Cualquier uso será detectado y reportado y es
        causal de sanciones.
      </Typography>
    </>
  );
}

export default Information;
