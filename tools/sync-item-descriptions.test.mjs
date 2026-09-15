import { describe, expect, it } from "vitest";
import { projectDescriptions } from "./sync-item-descriptions.mjs";

const RAW = [
  { id: 501, name: "Poção Vermelha", description: "Poção feita de ervas vermelhas." },
  { id: 19242, name: "Tiara Felina", description: "^0000ffEXP +10%.^000000" },
  { id: 18571, name: null, description: "" },
  { id: 400445, name: "Chapéu de Oficial-LT", description: "Mostre que você…" },
];

const ITEMS = [
  { id: 400445, name: "Chapéu de Oficial" },
  { id: 19242, name: "Tiara Felina" },
  { id: 18571, name: "Chapéu das Flores Encantadas" },
  { id: 99999999, name: "Item removido do cliente" },
];

describe("projectDescriptions", () => {
  it("keeps only the listed items, by ascending id, with the raw client text", () => {
    const { descriptions } = projectDescriptions(RAW, ITEMS);
    expect(Object.keys(descriptions)).toEqual(["19242", "400445"]);
    expect(descriptions[19242]).toBe("^0000ffEXP +10%.^000000");
  });

  it("reports items with no client text instead of writing empty entries", () => {
    expect(projectDescriptions(RAW, ITEMS).missing).toEqual([18571, 99999999]);
  });

  it("reports items the client names differently", () => {
    expect(projectDescriptions(RAW, ITEMS).renamed).toEqual([
      { id: 400445, local: "Chapéu de Oficial", client: "Chapéu de Oficial-LT" },
    ]);
  });

  it("rejects anything that is not the item array", () => {
    expect(() => projectDescriptions({ items: [] }, ITEMS)).toThrow(/JSON array/);
  });
});
