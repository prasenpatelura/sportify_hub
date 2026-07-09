// REST client — points to the Express + Firestore API in ./backend (port 5000).

const BASE_URL = 'http://192.168.1.135:5000/api';

let _token: string | null = null;

export const setAuthToken = (token: string | null) => {
  _token = token;
};

const headers = () => ({
  'Content-Type': 'application/json',
  ..._token ? { Authorization: `Bearer ${_token}` } : {},
});

const handleResponse = async (res: Response) => {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `HTTP ${res.status}`);
  }
  return res.json();
};

// ─── Auth ────────────────────────────────────────────────────────────────────
export const apiLogin = async (email: string, password: string) => {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST', headers: headers(), body: JSON.stringify({ email, password }),
  });
  return handleResponse(res);
};

export const apiRegister = async (name: string, email: string, password: string) => {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST', headers: headers(), body: JSON.stringify({ name, email, password }),
  });
  return handleResponse(res);
};

export const apiPhoneAuth = async (phone: string, code: string, name?: string) => {
  const res = await fetch(`${BASE_URL}/auth/phone-auth`, {
    method: 'POST', headers: headers(), body: JSON.stringify({ phone, code, name }),
  });
  return handleResponse(res);
};

export const apiGetProfile = async () => {
  const res = await fetch(`${BASE_URL}/auth/profile`, { headers: headers() });
  return handleResponse(res);
};

// ─── Venues ──────────────────────────────────────────────────────────────────
export const apiGetVenues = async () => {
  const res = await fetch(`${BASE_URL}/venues`, { headers: headers() });
  return handleResponse(res);
};

export const apiGetVenueById = async (id: string) => {
  const res = await fetch(`${BASE_URL}/venues/${id}`, { headers: headers() });
  return handleResponse(res);
};

export const apiGetNearbyVenues = async (lat: number, lng: number, radius = 10000) => {
  const res = await fetch(`${BASE_URL}/venues/nearby?lat=${lat}&lng=${lng}&radius=${radius}`, { headers: headers() });
  return handleResponse(res);
};

// ─── Games ───────────────────────────────────────────────────────────────────
export const apiGetGames = async () => {
  const res = await fetch(`${BASE_URL}/games`, { headers: headers() });
  return handleResponse(res);
};

export const apiGetNearbyGames = async (lat: number, lng: number, radius = 10000) => {
  const res = await fetch(`${BASE_URL}/games?lat=${lat}&lng=${lng}&radius=${radius}`, { headers: headers() });
  return handleResponse(res);
};

export const apiJoinGame = async (gameId: string, userId: string) => {
  const res = await fetch(`${BASE_URL}/games/${gameId}/join`, {
    method: 'POST', headers: headers(), body: JSON.stringify({ userId }),
  });
  return handleResponse(res);
};

// ─── Bookings ────────────────────────────────────────────────────────────────
export const apiCreateBooking = async (data: {
  userId: string; venueId: string; date: string; timeSlot: string;
}) => {
  const res = await fetch(`${BASE_URL}/bookings`, {
    method: 'POST', headers: headers(), body: JSON.stringify(data),
  });
  return handleResponse(res);
};

export const apiGetUserBookings = async (userId: string) => {
  const res = await fetch(`${BASE_URL}/bookings/user/${userId}`, { headers: headers() });
  return handleResponse(res);
};

export const apiGetBookingById = async (id: string) => {
  const res = await fetch(`${BASE_URL}/bookings/${id}`, { headers: headers() });
  return handleResponse(res);
};

// ─── OTP / phone verification ─────────────────────────────────────────────────
export const apiSendOtp = async (phone: string) => {
  const res = await fetch(`${BASE_URL}/otp/send`, {
    method: 'POST', headers: headers(), body: JSON.stringify({ phone }),
  });
  return handleResponse(res);
};

export const apiVerifyOtp = async (phone: string, code: string, userId?: string) => {
  const res = await fetch(`${BASE_URL}/otp/verify`, {
    method: 'POST', headers: headers(), body: JSON.stringify({ phone, code, userId }),
  });
  return handleResponse(res);
};
