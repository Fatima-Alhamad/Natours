import axios from 'axios';
import { showAlert } from './alerts';

//type is either password or data
export const updateSettings = async (data, type) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url:
        type === 'data'
          ? '/api/v1/users/updateMe'
          : '/api/v1/users/updatePassword',
      data,
    });
    if (res.data.status === 'success') {
      showAlert('success', `${type.toUpperCase()} updated successfully`);
    }
  } catch (error) {
    showAlert('error', error.response.data.message);
  }
};
