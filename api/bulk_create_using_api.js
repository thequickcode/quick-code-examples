/**
 * This demo shows how to authorize your requests,
 * and then how to create bulk QR codes
 */

const BASE_URL = ""; // https://quickcode-instance.tld/api

const USER_EMAIL = "";

const USER_PASSWORD = "";

const DESTINATION_URL = ""; // The URL which should be opened after scanning the QR code.

const NUMBER_OF_QRCODES = 100; // How many QR codes should be created ...

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

async function createDynamicUrlQRCode(destinationUrl, name, token) {
  return await post(
    "/qrcodes",
    {
      type: "url",
      name,
      data: {
        url: destinationUrl,
      },
      design: {},
    },
    token
  );
}

async function main() {
  const token = await getToken();

  for (let i = 0; i < NUMBER_OF_QRCODES; i++) {
    await createDynamicUrlQRCode(
      DESTINATION_URL,
      `Bali Geckos Membership Card #${i + 1}`,
      token
    );

    console.log(`Created QR code ${i + 1} out of ${NUMBER_OF_QRCODES}`);
  }

  alert(NUMBER_OF_QRCODES + " QR code created succesfully!");
}

main();
