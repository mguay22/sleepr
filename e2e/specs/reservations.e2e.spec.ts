describe('Reservations', () => {
  let jwt: string;

  beforeAll(async () => {
    const user = {
      email: 'sleeprnestapp@gmail.com',
      password: 'StrogPassword123!@',
    };
    await fetch('http://auth:3001/users', {
      method: 'POST',
      body: JSON.stringify(user),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const response = await fetch('http://auth:3001/auth/login', {
      method: 'POST',
      body: JSON.stringify(user),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    jwt = await response.text();
  });

  test('Create & Get (checkout session)', async () => {
    const createdReservation = await createReservation({ amount: 13 });
    const { paymentUrl, ...reservation } = createdReservation;
    expect(paymentUrl).toContain('https://checkout.stripe.com');
    expect(reservation.status).toEqual('pending');
    expect(reservation.checkoutSessionId).toBeDefined();

    const responseGet = await fetch(
      `http://reservations:3000/reservations/${reservation._id}`,
      {
        headers: {
          Authentication: jwt,
        },
      },
    );
    expect(await responseGet.json()).toEqual(reservation);
  });

  // Legacy flow - requires raw card data APIs to be enabled on the
  // Stripe account: https://docs.stripe.com/security/guide#restricted-apis
  test('Create & Get (direct card charge)', async () => {
    const createdReservation = await createReservation({
      amount: 13,
      card: {
        cvc: '413',
        exp_month: 12,
        exp_year: 2027,
        number: '4242 4242 4242 4242',
      },
    });
    expect(createdReservation.status).toEqual('confirmed');
    expect(createdReservation.invoiceId).toBeDefined();

    const responseGet = await fetch(
      `http://reservations:3000/reservations/${createdReservation._id}`,
      {
        headers: {
          Authentication: jwt,
        },
      },
    );
    expect(await responseGet.json()).toEqual(createdReservation);
  });

  const createReservation = async (charge: object) => {
    const responseCreate = await fetch(
      'http://reservations:3000/reservations',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authentication: jwt,
        },
        body: JSON.stringify({
          startDate: '02-01-2023',
          endDate: '02-05-2023',
          charge,
        }),
      },
    );
    expect(responseCreate.ok).toBeTruthy();
    return responseCreate.json();
  };
});
