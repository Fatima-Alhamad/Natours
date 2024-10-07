import axios from 'axios';
import { showAlert } from './alerts';

// Then use the global Stripe object:
const stripe = Stripe(
  'pk_test_51Q6Z1uRwoWVRg7TUuUEe7ZNA8ifqKYTXnp3QzMEnZqyVlhqeitIFJXfk5G277wmqNHiUYT2qJIyFzhS2ZR4afVug001ifUwjGM'
);

export const bookTour = async (tourId) => {
  try {
    // 1) Get the checkout session from the server
    const session = await axios({
      method: 'GET',
      url: `/api/v1/bookings/checkout-session/${tourId}`,
    });

    // console.log(session);

    // 2) Create checkout form + charge credit card
    const result = await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });

    if (result.error) {
      showAlert('error', result.error.message);
    }
  } catch (error) {
    console.log(error);
    showAlert('error', error.message);
  }
};
