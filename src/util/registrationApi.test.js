import { uploadFiles } from "./registrationApi";
import { axiosInstance } from "../axios";

jest.mock("../axios", () => ({ axiosInstance: { get: jest.fn(), post: jest.fn() } }));

// Synthetic files only.
test("uploadFiles sends the mode and the files in their order", async () => {
  axiosInstance.post.mockResolvedValue({ data: { message: "Documentos subidos" } });
  const a = new File(["a"], "a.pdf", { type: "application/pdf" });
  const b = new File(["b"], "b.jpg", { type: "image/jpeg" });
  const c = new File(["c"], "c.png", { type: "image/png" });

  await uploadFiles({ Diagnostico: [b, a], Documento: [c] }, "agregar");

  const [path, form] = axiosInstance.post.mock.calls[0];
  expect(path).toBe("/inscripcion/subir-archivos");
  expect(form.get("modo")).toBe("agregar");
  const sent = [...form.entries()].filter(([, value]) => value instanceof File).map(([, file]) => file.name);
  expect(sent).toEqual(["b.jpg", "a.pdf", "c.png"]);
});

test("uploadFiles replaces by default", async () => {
  axiosInstance.post.mockResolvedValue({ data: {} });
  await uploadFiles({ Diagnostico: [new File(["a"], "a.pdf", { type: "application/pdf" })] });
  expect(axiosInstance.post.mock.calls.at(-1)[1].get("modo")).toBe("reemplazar");
});
