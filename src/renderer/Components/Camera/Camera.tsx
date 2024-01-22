import React from 'react';
import Webcam from 'react-webcam';

const videoConstraints = {
  width: 480,
  height: 240,
  facingMode: 'user',
};
function WebcamComponent() {
  return <Webcam audio={false} videoConstraints={videoConstraints} />;
}
function Camera() {
  return (
    <div
      style={{ height: videoConstraints.height, width: videoConstraints.width }}
    >
      <WebcamComponent />
    </div>
  );
}
export default Camera;
