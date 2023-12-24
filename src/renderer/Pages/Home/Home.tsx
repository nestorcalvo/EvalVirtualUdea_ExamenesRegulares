/* eslint-disable jsx-a11y/media-has-caption */
import { useLocation } from 'react-router-dom';
import Camera from 'renderer/Components/Camera/Camera';
import Information from 'renderer/Components/Information/Information';
import icon from '../../../../assets/icon.png';

function Home() {
  const { state } = useLocation();
  const token = state?.token;

  return (
    <div>
      <div className="Hello">
        <img width="200" alt="icon" src={icon} />
      </div>
      <h1>Eval Virtual UdeA</h1>
      <h1>{token}</h1>
      <Information />
      <Camera />
    </div>
  );
}
export default Home;
