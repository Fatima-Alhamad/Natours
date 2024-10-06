import '@babel/polyfill';
import { login, logout } from './login';
import { updateSettings } from './updateSettings';
import { bookTour } from './stripe';

//Values

//DOM elements
const loginForm = document.querySelector('.loginForm');
if (loginForm) {
  document.querySelector('.loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.querySelector('#email').value;
    const password = document.querySelector('#password').value;
    login(email, password);
  });
}
//logout:
const logoutBtn = document.querySelector('.nav__el--logout');
if (logoutBtn) {
  logoutBtn.addEventListener('click', logout);
}
//update settings:
const updateUserDataForm = document.querySelector('.form-user-data');
if (updateUserDataForm) {
  updateUserDataForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', document.querySelector('#name').value);
    form.append('email', document.querySelector('#email').value);
    form.append('photo', document.getElementById('photo').files[0]);
    updateSettings(form, 'data');
  });
}

const updatePasswordForm = document.querySelector('.form-user-settings');
let saveBtn = document.querySelector('.btnSave');
if (updatePasswordForm) {
  updatePasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    saveBtn.textContent = 'Updating...';
    const currentPassword = document.querySelector('#password-current').value;
    const password = document.querySelector('#password').value;
    const confirmPassword = document.querySelector('#password-confirm').value;
    const data = {
      currentPassword,
      password,
      confirmPassword,
    };
    console.log(currentPassword, password, confirmPassword);

    await updateSettings(data, 'password');
    saveBtn.textContent = 'Save password';
    document.querySelector('#password-current').value = '';
    document.querySelector('#password').value = '';
    document.querySelector('#password-confirm').value = '';
  });
}

//stripe
const bookBtn = document.querySelector('#book-tour');
if (bookBtn) {
  bookBtn.addEventListener('click', (e) => {
    e.target.textContent = 'Processing...';
    const { tourId } = e.target.dataset;
    bookTour(tourId);
  });
}
