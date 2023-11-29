import axios from 'axios';
import { BASE_URL_POSTMAN } from 'utils/constants';

const instance = axios.create({
  baseURL: BASE_URL_POSTMAN,
  headers: {
    // 'Token-Security': TOKEN,
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,HEAD,OPTIONS,POST,PUT',
    'Access-Control-Allow-Headers':
      'Origin, X-Requested-With, Content-Type, Accept, x-client-key, x-client-token, x-client-secret, Authorization',
  },
});

// Where you would set stuff like your 'Authorization' header, etc ...
// instance.defaults.headers.common['Authorization'] = 'AUTH TOKEN FROM INSTANCE';

export default instance;
