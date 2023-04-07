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

  test('Create', async () => {
    const response = await fetch('http://reservations:3000/reservations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authentication: jwt,
      },
      body: JSON.stringify({
        startDate: '02-01-2023',
        endDate: '02-05-2023',
        placeId: '123',
        invoiceId: '123',
        charge: {
          amount: 13,
          card: {
            cvc: '413',
            exp_month: 12,
            exp_year: 2027,
            number: '4242 4242 4242 4242',
          },
        },
      }),
    });
    expect(response.ok).toBeTruthy();
    const reservation = await response.json();
    console.log(reservation);
  });
});
