/**
 * This demo shows how to authorize your requests,
 * and then how to create bulk QR codes
 */

const BASE_URL = "https://www.qr.biscard.id/api"; // https://quickcode-instance.tld/api

const USER_EMAIL = "walid@quickcode.digital";

const USER_PASSWORD = "WalidQr123__1..d";

const START_ID = 130061;

const END_ID = 130160;

class SvgPngConverter {
  constructor(svgUrl, name) {
    this.svgUrl = svgUrl;
    this.name = name;
  }

  async fetch(url) {
    this.response = await fetch(url);
  }

  async loadSvg() {
    await this.fetch(this.svgUrl);

    const src = URL.createObjectURL(await this.getResponseBlob());

    return new Promise((resolve) => {
      this.image = document.createElement("img");

      this.image.setAttribute("crossOrigin", "anonymous");

      this.image.onload = () => {
        resolve();

        this.image.onload = null;
      };

      this.image.style = `position: fixed; top: -999999px;`;

      document.body.appendChild(this.image);

      this.image.src = src;
    });
  }

  async getViewboxSize() {
    const text = await this.response.clone().text();

    const line = text.substring(0, 500);

    const viewBox = line
      .match(/viewBox="(.*?)"/)[1]
      .split(" ")
      .map((n) => +n);

    const width = viewBox[2],
      height = viewBox[3];

    return [width, height];
  }

  async getResponseBlob() {
    const blobType = "image/svg+xml";

    let text = await this.response.clone().text();

    const length = 700;

    let line = text.substring(0, length);

    let svgTag = line.match(/<svg.*?>/)[0];

    const [width, height] = await this.getViewboxSize();

    if (!svgTag.match("width"))
      line = line.replace(
        "<svg",
        `<svg width="${width}px" height="${height}px"`
      );

    text = line + text.substring(length);

    // console.log(text)

    return new Blob([text], {
      type: blobType,
    });
  }

  getPngBlob(width = 0, height = 0) {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");

      this.getViewboxSize().then(([w, h]) => {
        canvas.width = width === 0 ? w : width;

        canvas.height = height === 0 ? h : (height * h) / w;

        const ctx = canvas.getContext("2d");

        ctx.globalAlpha = 100;

        ctx.drawImage(this.image, 0, 0, canvas.width, canvas.height);

        canvas.toBlob((blob) => {
          URL.revokeObjectURL(this.image.src);

          this.image.remove();

          resolve(blob);

          canvas.remove();
        });
      });
    });
  }

  downloadBlob(data) {
    const link = document.createElement("a");

    link.download = this.name;

    link.href = URL.createObjectURL(data);

    document.body.appendChild(link);

    link.click();

    setTimeout(() => {
      URL.revokeObjectURL(link.href);

      link.remove();
    }, 50);
  }

  async downloadPng() {
    await this.loadSvg();

    const data = await this.getPngBlob();

    this.downloadBlob(data);
  }
}

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

async function getQRCodeSvgFileUrl(id, token) {
  const qrcode = await get("/qrcodes/" + id, token);

  const fileName = `${qrcode.file_name}.svg`;

  return BASE_URL.replace("api", "") + "qrcode_files/" + fileName;
}

async function main() {
  const token = await getToken();

  for (let i = START_ID; i <= END_ID; i++) {
    const url = await getQRCodeSvgFileUrl(i, token);
    const converter = new SvgPngConverter(url, `qrcode-${i}`);

    await converter.downloadPng();
  }
}

main();
