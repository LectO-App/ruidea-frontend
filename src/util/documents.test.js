import { sizeProblem, uploadErrorMessage, shrinkPhoto, MAX_FILE_MB, MAX_UPLOAD_MB } from "./documents";

// Synthetic files only. The size is set by hand so the tests don't allocate megabytes.
const MB = 1024 * 1024;
const file = (name, type, sizeMb) => {
  const f = new File(["x"], name, { type });
  Object.defineProperty(f, "size", { value: sizeMb * MB });
  return f;
};

test("the limits match the server: 25 MB per file and 60 MB per upload", () => {
  expect(MAX_FILE_MB).toBe(25);
  expect(MAX_UPLOAD_MB).toBe(60);
});

test("files within both limits have no problem", () => {
  expect(sizeProblem([file("a.pdf", "application/pdf", 24), file("b.pdf", "application/pdf", 24)])).toBeNull();
});

test("a PDF over 25 MB is named, with how to make it smaller", () => {
  const message = sizeProblem([file("informe.pdf", "application/pdf", 2), file("escaneo.pdf", "application/pdf", 30)]);
  expect(message).toMatch("«escaneo.pdf» ocupa 30.0 MB");
  expect(message).toMatch("25 MB");
  expect(message).toMatch("menos resolución");
  expect(message).toMatch("divídelo");
});

test("a photo over 25 MB is named, with how to make it smaller", () => {
  const message = sizeProblem([file("foto.heic", "image/heic", 27)]);
  expect(message).toMatch("«foto.heic» ocupa 27.0 MB");
  expect(message).toMatch("captura de pantalla");
});

test("files over 60 MB in total are stopped with the total", () => {
  const message = sizeProblem([20, 20, 21].map((mb, i) => file(`p${i}.pdf`, "application/pdf", mb)));
  expect(message).toMatch("61.0 MB en total");
  expect(message).toMatch("60 MB");
});

const httpError = (status, data) => ({ response: { status, data } });

test("a 413 shows the server's message", () => {
  expect(uploadErrorMessage(httpError(413, { message: "Un archivo ocupa más de 25 MB." }))).toBe(
    "Un archivo ocupa más de 25 MB."
  );
});

test("a 413 without a message (from the proxy) still says it is a size problem", () => {
  expect(uploadErrorMessage(httpError(413, "<html>Request Entity Too Large</html>"))).toMatch("25 MB");
});

test("other errors are not size problems", () => {
  expect(uploadErrorMessage(httpError(500, { message: "Error al subir el archivo" }))).toBeNull();
  expect(uploadErrorMessage(new Error("Network Error"))).toBeNull();
});

describe("shrinkPhoto", () => {
  const original = { createImageBitmap: window.createImageBitmap, getContext: HTMLCanvasElement.prototype.getContext, toBlob: HTMLCanvasElement.prototype.toBlob };
  let drawn;
  beforeEach(() => {
    drawn = null;
    HTMLCanvasElement.prototype.getContext = function getContext() {
      const canvas = this;
      return {
        fillRect: () => {},
        drawImage: (bitmap, x, y, w, h) => {
          drawn = { canvas: [canvas.width, canvas.height], size: [w, h] };
        },
      };
    };
    HTMLCanvasElement.prototype.toBlob = (cb, type) => cb(new Blob(["jpeg"], { type }));
  });
  afterEach(() => {
    window.createImageBitmap = original.createImageBitmap;
    HTMLCanvasElement.prototype.getContext = original.getContext;
    HTMLCanvasElement.prototype.toBlob = original.toBlob;
  });

  test("a large photo is drawn at 2000 px on its longest edge, upright from its EXIF orientation", async () => {
    const close = jest.fn();
    window.createImageBitmap = jest.fn().mockResolvedValue({ width: 3000, height: 4000, close });
    const photo = new File(["raw"], "foto.png", { type: "image/png", lastModified: 1234 });

    const shrunk = await shrinkPhoto(photo);

    expect(window.createImageBitmap).toHaveBeenCalledWith(photo, { imageOrientation: "from-image" });
    expect(drawn).toEqual({ canvas: [1500, 2000], size: [1500, 2000] });
    expect(shrunk.type).toBe("image/jpeg");
    expect(shrunk.name).toBe("foto.png");
    expect(shrunk.lastModified).toBe(1234);
    expect(close).toHaveBeenCalled();
  });

  test("a photo of 2000 px or less is sent as it is", async () => {
    window.createImageBitmap = jest.fn().mockResolvedValue({ width: 2000, height: 1200, close: () => {} });
    const photo = new File(["raw"], "foto.jpg", { type: "image/jpeg" });
    expect(await shrinkPhoto(photo)).toBe(photo);
  });

  test("a photo the browser cannot decode (HEIC in most browsers) is sent as it is", async () => {
    window.createImageBitmap = jest.fn().mockRejectedValue(new DOMException("unsupported", "InvalidStateError"));
    const photo = new File(["raw"], "foto.heic", { type: "image/heic" });
    expect(await shrinkPhoto(photo)).toBe(photo);
  });

  test("a PDF is sent untouched", async () => {
    window.createImageBitmap = jest.fn();
    const pdf = new File(["%PDF-1.7"], "informe.pdf", { type: "application/pdf" });
    expect(await shrinkPhoto(pdf)).toBe(pdf);
    expect(window.createImageBitmap).not.toHaveBeenCalled();
  });
});
