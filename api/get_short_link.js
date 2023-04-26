/**
 * This demo shows how to authorize your requests,
 * and then how to create a QR code and then get
 * the short link of the QR code.
 */

const BASE_URL = "";

const USER_EMAIL = "";

const USER_PASSWORD = "";

async function post(url, data, token) {
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  if (token) {
    headers.Authorization = "Bearer " + token;
  }

  const response = await fetch(BASE_URL + url, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });

  return await response.json();
}

async function get(url, token) {
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  if (token) {
    headers.Authorization = "Bearer " + token;
  }

  const response = await fetch(BASE_URL + url, {
    method: "GET",
    headers,
  });

  return await response.json();
}

async function getToken() {
  const response = await post("/login", {
    email: USER_EMAIL,
    password: USER_PASSWORD,
  });

  return response.token;
}

async function createQRCode(token) {
  return await post(
    "/qrcodes",
    {
      type: "url",
      data: {
        url: "https://google.com",
      },
      design: {},
    },
    token
  );
}

async function getRedirect(qrcodeId, token) {
  return await get("/qrcodes/" + qrcodeId + "/redirect", token);
}

async function main() {
  const token = await getToken();

  const qrcode = await createQRCode(token);

  const redirect = await getRedirect(qrcode.id, token);

  alert(redirect.route);
}

main();
