import React from 'react';
import Webcam from 'react-webcam';

const videoConstraints = {
  width: 480,
  height: 240,
  facingMode: 'user',
};
function Camera() {
  return (
    <div
      style={{ height: videoConstraints.height, width: videoConstraints.width }}
    >
      <Webcam audio={false} videoConstraints={videoConstraints} />
    </div>
  );
}
export default Camera;
