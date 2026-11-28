import { mergeStaged } from "./phoneUpload";

jest.mock("../axios", () => ({ axiosInstance: { get: jest.fn(), post: jest.fn(), delete: jest.fn() } }));

// Synthetic values only.
const local = (name) => new File(["%PDF-1.7"], name, { type: "application/pdf" });
const staged = (id, grupo, orden = 1) => ({ id, grupo, orden, tipo: "image/jpeg", tamano: 1000, url: `https://storage.test/${id}` });
const names = (list) => list.map((f) => f.name);

test("new phone photos go at the end of their own group, tagged as from the phone", () => {
  const files = { diagnostico: [local("informe.pdf")], documento: [] };
  const next = mergeStaged(files, [staged("a", "diagnostico", 1), staged("b", "documento", 1)]);
  expect(names(next.diagnostico)).toEqual(["informe.pdf", "Foto del móvil 1"]);
  expect(next.diagnostico[1]).toMatchObject({ movil: true, id: "a", type: "image/jpeg", url: "https://storage.test/a" });
  expect(names(next.documento)).toEqual(["Foto del móvil 1"]);
});

test("the order the person chose is kept, and photos the server no longer has leave", () => {
  const first = mergeStaged({ diagnostico: [local("informe.pdf")], documento: [] }, [staged("a", "diagnostico", 1), staged("b", "diagnostico", 2)]);
  const reordered = { ...first, diagnostico: [first.diagnostico[2], first.diagnostico[0], first.diagnostico[1]] };
  const next = mergeStaged(reordered, [staged("b", "diagnostico", 2)]);
  expect(names(next.diagnostico)).toEqual(["Foto del móvil 2", "informe.pdf"]);
});

test("nothing changed gives back the same lists, so the step does not re-render", () => {
  const files = mergeStaged({ diagnostico: [], documento: [] }, [staged("a", "documento")]);
  expect(mergeStaged(files, [staged("a", "documento")])).toBe(files);
});

test("photos being deleted are not brought back", () => {
  const files = { diagnostico: [], documento: [] };
  expect(mergeStaged(files, [staged("a", "documento")], { ignored: new Set(["a"]) })).toBe(files);
});

test("refresh takes the new thumbnail links", () => {
  const files = mergeStaged({ diagnostico: [], documento: [] }, [staged("a", "documento")]);
  const next = mergeStaged(files, [{ ...staged("a", "documento"), url: "https://storage.test/nuevo" }], { refresh: true });
  expect(next.documento[0].url).toBe("https://storage.test/nuevo");
});
