export {};
const assert = require("node:assert/strict");
const { WardrobeStore } = require("../src/wardrobe/wardrobe-store.ts");
const { accessoryCatalog } = require("../src/wardrobe/catalog.ts");
const { poseRigs, undecoratedPoses } = require("../src/wardrobe/pose-rigs.ts");
const { artworkTemplates } = require("../src/artwork/artwork-templates.ts");

// A new pose cannot silently ship without clothing anchors.
assert.deepEqual(Object.keys(poseRigs).sort(), Object.keys(artworkTemplates).filter((p) => !undecoratedPoses.includes(p)).sort());
for (const [pose, rig] of Object.entries(poseRigs) as [string, any][]) {
  const html = artworkTemplates[pose].html;
  const nodes = [rig.body.shape, rig.body.after, rig.body.shoulder, rig.body.neck, rig.head.parent, rig.head.after, rig.head.hair, ...rig.sleeves.map((s) => s.node)].filter((v) => v !== undefined);
  for (const node of nodes) assert.ok(html.includes(`art-${pose}-${node}"`), `${pose} missing node ${node}`);
  for (const node of [rig.body.shape, rig.body.shoulder, rig.body.neck, ...rig.sleeves.map((s) => s.node)].filter((id) => id !== undefined)) {
    assert.ok(html.includes(`art-${pose}-${node}-fill"`) || html.includes(`art-${pose}-${node}-shape"`), `${pose} missing surface ${node}`);
  }
}
const paid = { ...accessoryCatalog[0], id: "tee-test", starter: false };
let saved: any;
const storage = { load: () => saved, save: (value) => { saved = value; } };
const store = new WardrobeStore([...accessoryCatalog, paid], storage);
assert.equal(store.equip("tee-test"), false);
assert.equal(store.grant("unknown"), false);
assert.equal(store.grant("tee-test"), true);
assert.equal(store.equip("tee-test"), true);
store.grant("helmet-vader");
store.grant("suit-clown");
store.grant("suit-vader");
store.equip("helmet-vader");
assert.deepEqual(store.snapshot.equipped, { body: "tee-test", head: "helmet-vader" });
store.equip("suit-clown");
assert.equal(store.snapshot.equipped.head, "helmet-vader");
let notices = 0;
const unsubscribe = store.subscribe(() => notices++);
store.equip("suit-clown"); // Idempotent: no redraw/animation restart.
assert.equal(notices, 0);
store.unequip("body");
assert.equal(notices, 1);
unsubscribe();
store.equip("suit-vader");
assert.equal(notices, 1);
const snapshot = store.snapshot;
snapshot.equipped.head = "corrupt";
snapshot.owned.length = 0;
assert.equal(store.snapshot.equipped.head, "helmet-vader");
assert.equal(store.owns("helmet-vader"), true);
assert.deepEqual(new WardrobeStore([...accessoryCatalog, paid], storage).snapshot, store.snapshot);
for (const raw of [null, "bad", { version: 900 }, { version: 2, owned: ["unknown"], equipped: { head: "suit-vader", body: "unknown" } }]) {
  const restored = new WardrobeStore(accessoryCatalog, { load: () => raw, save() {} });
  assert.deepEqual(restored.snapshot.equipped, {});
}
const unavailable = new WardrobeStore(accessoryCatalog, { load() { throw Error(); }, save() { throw Error(); } });
unavailable.grant("suit-vader");
assert.equal(unavailable.equip("suit-vader"), true);
assert.throws(() => new WardrobeStore([paid, paid]), /Invalid accessory/);
assert.throws(() => new WardrobeStore([{ ...paid, color: 'red;display:none' }]), /Invalid accessory/);
console.log("wardrobe inventory, persistence, validation and all-pose coverage tests passed");

// Previewing/owning nothing is free. Purchases debit exactly 10, at click time.
const shop = new WardrobeStore();
let fish = 20;
let debits = 0;
const wallet = { balance: () => fish, spend: (amount) => {
  assert.equal(amount, 10);
  if (fish < amount) return false;
  fish -= amount; debits++; return true;
} };
assert.deepEqual(shop.snapshot.owned, []);
assert.equal(shop.equip("suit-vader"), false);
assert.equal(fish, 20);
assert.equal(shop.purchase("missing", wallet), "unknown");
assert.equal(shop.purchase("suit-vader", wallet), "purchased");
assert.equal(fish, 10);
assert.equal(shop.purchase("suit-vader", wallet), "owned");
assert.equal(debits, 1);
assert.equal(shop.equip("suit-vader"), true);
shop.unequip("body");shop.equip("suit-vader");
assert.equal(fish, 10);
assert.equal(shop.purchase("hat-duck", wallet), "purchased");
assert.equal(fish, 0);
assert.equal(shop.purchase("suit-clown", wallet), "insufficient");
assert.equal(shop.owns("suit-clown"), false);
assert.equal(debits, 2);
const reloaded = new WardrobeStore(accessoryCatalog, { load: () => shop.snapshot, save() {} });
assert.equal(reloaded.purchase("hat-duck", wallet), "owned");
assert.equal(fish, 0);
const legacy = new WardrobeStore(accessoryCatalog, { load: () => ({ version: 1, owned: ["suit-vader"], equipped: { body: "suit-vader" } }), save() {} });
assert.deepEqual(legacy.snapshot.owned, []); // Old free samples are not purchases.
assert.ok(undecoratedPoses.includes("caveirinha"));
console.log("fish purchases: exact price, insufficient funds, duplicates and legacy inventory passed");

const upgraded = new WardrobeStore(accessoryCatalog, { load: () => ({ version: 2, owned: ["tee-ocean", "cap-sun"], equipped: { body: "tee-ocean", head: "cap-sun" } }), save() {} });
assert.deepEqual(upgraded.snapshot.equipped, { body: "suit-vader", head: "hat-duck" });
assert.equal(upgraded.purchase("suit-vader", wallet), "owned");
assert.equal(fish, 0, "Upgrading the collection never charges previous buyers");
assert.equal(upgraded.owns("suit-batman"), false);
assert.equal(accessoryCatalog.length, 18);
assert.throws(() => new WardrobeStore([{ ...paid, kind: "headphones" }]), /Invalid accessory/);
