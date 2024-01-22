/* eslint-disable jsx-a11y/media-has-caption */
// import './Home.css';
import { useLocation } from 'react-router-dom';
import Camera from 'renderer/Components/Camera/Camera';
import Information from 'renderer/Components/Information/Information';
import { Card, Typography, Divider, Paper, Button } from '@mui/material';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import Stack from '@mui/material/Stack';

import icon from '../../../../assets/icon.png';

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

function Home() {
  const { state } = useLocation();
  const token = state?.token;

  return (
    <Box sx={{ width: '100%' }} justifyContent="center">
      <div>
        <img width="50" height="50" alt="icon" src={icon} />
      </div>
      <Stack
        spacing={{ xs: 1, sm: 2 }}
        divider={<Divider orientation="vertical" flexItem />}
        direction="row"
        useFlexGap
        flexWrap="wrap"
        alignItems="center"
      >
        <Item>
          <h1>{token}</h1>
          <Information />
        </Item>
        <Item>
          <Camera />
        </Item>
      </Stack>
    </Box>
  );
}
export default Home;
