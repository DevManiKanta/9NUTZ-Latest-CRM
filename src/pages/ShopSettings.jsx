

// import React, { useEffect, useRef, useState } from "react";
// import api from "../api/axios"; // adjust path if needed
// import { Plus, Trash2 } from "lucide-react";
// import toast from "react-hot-toast";
// import { Button } from "@/components/ui/button";

// const MAX_IMAGE_BYTES = 2 * 1024 * 1024; // 2MB

// function makeUid(prefix = "v") {
//   return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
// }

// function isValidMoney(s) {
//   return /^\d+(\.\d{1,2})?$/.test(String(s || "").trim());
// }

// async function createVariantsApi(variantsJson, variantFiles) {
//   const fd = new FormData();
//   fd.append("variants", JSON.stringify(variantsJson));
//   (variantFiles || []).forEach((f) => fd.append("variant_images[]", f));
//   const res = await api.post("/admin/variants/add", fd, { headers: { "Content-Type": "multipart/form-data" } });
//   return res.data ?? res;
// }

// async function updateVariantsApi(productId, variantsJson, variantFiles) {
//   const fd = new FormData();
//   fd.append("variants", JSON.stringify(variantsJson));
//   (variantFiles || []).forEach((f) => fd.append("variant_images[]", f));
//   // adjust endpoint if needed
//   const res = await api.post(`/admin/products/${productId}/variants`, fd, { headers: { "Content-Type": "multipart/form-data" } }).catch(() => ({}));
//   return res.data ?? res;
// }

// /* ---------------- Component ---------------- */
// export default function VariantsEditor({ productId = null, initialVariants = {}, onChange = null }) {
//   // parse incoming initial variants safely
//   const normalizeIncoming = (arr) =>
//     Array.isArray(arr)
//       ? arr.map((it) => ({
//           uid: it.uid || makeUid("v"),
//           id: it.id,
//           value: it.value ?? "",
//           price: it.price ?? "",
//           imageFile: null,
//           imagePreview: it.image_url ?? it.imagePreview ?? "",
//         }))
//       : [];

//   const [weights, setWeights] = useState(normalizeIncoming(initialVariants.weight));
//   const [sizes, setSizes] = useState(normalizeIncoming(initialVariants.size));
//   const [colors, setColors] = useState(normalizeIncoming(initialVariants.color));
//   const [materials, setMaterials] = useState(normalizeIncoming(initialVariants.material));

//   const [errors, setErrors] = useState({});
//   const [isSaving, setIsSaving] = useState(false);
//   const fileInputRef = useRef(null);

//   // storeType controls which variant columns are visible
//   const STORE_OPTIONS = [
//     { value: "9Nutz", label: "9Nutz Sweet" },
//     { value: "Fashion", label: "Fashion" },
//     { value: "Gold", label: "Gold" },
//   ];
//   const [storeType, setStoreType] = useState(STORE_OPTIONS[0].value);

//   // quick material chips (displayed in a single row beside colors)
//   const DEFAULT_MATERIAL_CHIPS = ["Cotton", "Leather", "Metal", "Silk"];

//   // notify parent when variants change
//   useEffect(() => {
//     if (onChange) {
//       onChange({
//         weight: weights.map((w) => ({ id: w.id, uid: w.uid, value: w.value, price: w.price, imagePreview: w.imagePreview })),
//         size: sizes.map((s) => ({ id: s.id, uid: s.uid, value: s.value, price: s.price, imagePreview: s.imagePreview })),
//         color: colors.map((c) => ({ id: c.id, uid: c.uid, value: c.value, price: c.price, imagePreview: c.imagePreview })),
//         material: materials.map((m) => ({ id: m.id, uid: m.uid, value: m.value, price: m.price, imagePreview: m.imagePreview })),
//       });
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [weights, sizes, colors, materials]);

//   // helpers to add / remove / update entries for any variant type
//   const addEntry = (type, preset = "") => {
//     const entry = { uid: makeUid("v"), value: preset, price: "", imageFile: null, imagePreview: "" };
//     if (type === "weight") setWeights((p) => [...p, entry]);
//     if (type === "size") setSizes((p) => [...p, entry]);
//     if (type === "color") setColors((p) => [...p, entry]);
//     if (type === "material") setMaterials((p) => [...p, entry]);
//   };

//   const removeEntry = (type, uid) => {
//     if (type === "weight") setWeights((p) => p.filter((it) => it.uid !== uid));
//     if (type === "size") setSizes((p) => p.filter((it) => it.uid !== uid));
//     if (type === "color") setColors((p) => p.filter((it) => it.uid !== uid));
//     if (type === "material") setMaterials((p) => p.filter((it) => it.uid !== uid));
//   };

//   const updateField = (type, uid, key, val) => {
//     const updater = (arr) => arr.map((it) => (it.uid === uid ? { ...it, [key]: val } : it));
//     if (type === "weight") setWeights((p) => updater(p));
//     if (type === "size") setSizes((p) => updater(p));
//     if (type === "color") setColors((p) => updater(p));
//     if (type === "material") setMaterials((p) => updater(p));
//   };

//   const handleImageChange = (type, uid, e) => {
//     const file = e.target.files?.[0] ?? null;
//     const clear = () => {
//       const c = (arr) => arr.map((it) => (it.uid === uid ? { ...it, imageFile: null, imagePreview: "" } : it));
//       if (type === "weight") setWeights((p) => c(p));
//       if (type === "size") setSizes((p) => c(p));
//       if (type === "color") setColors((p) => c(p));
//       if (type === "material") setMaterials((p) => c(p));
//     };

//     if (!file) {
//       clear();
//       return;
//     }
//     if (!file.type || !file.type.startsWith("image/")) {
//       toast.error("Selected file is not an image.");
//       try { e.currentTarget.value = ""; } catch {}
//       return;
//     }
//     if (file.size > MAX_IMAGE_BYTES) {
//       toast.error("Image too large (max 2MB).");
//       try { e.currentTarget.value = ""; } catch {}
//       return;
//     }

//     const reader = new FileReader();
//     reader.onload = () => {
//       const preview = String(reader.result ?? "");
//       const updater = (arr) => arr.map((it) => (it.uid === uid ? { ...it, imageFile: file, imagePreview: preview } : it));
//       if (type === "weight") setWeights((p) => updater(p));
//       if (type === "size") setSizes((p) => updater(p));
//       if (type === "color") setColors((p) => updater(p));
//       if (type === "material") setMaterials((p) => updater(p));
//     };
//     reader.readAsDataURL(file);
//     try { e.currentTarget.value = ""; } catch {}
//   };

//   const buildVariantsJson = () => ({
//     weight: weights.map((w) => ({ uid: w.uid, value: w.value, price: w.price })),
//     size: sizes.map((s) => ({ uid: s.uid, value: s.value, price: s.price })),
//     color: colors.map((c) => ({ uid: c.uid, value: c.value, price: c.price })),
//     material: materials.map((m) => ({ uid: m.uid, value: m.value, price: m.price })),
//   });

//   const collectVariantFiles = () => {
//     const files = [];
//     const collect = (arr) => {
//       for (const v of arr) {
//         if (v.imageFile) {
//           try {
//             const f = new File([v.imageFile], `${v.uid}__${v.imageFile.name}`, { type: v.imageFile.type });
//             files.push(f);
//           } catch (err) {
//             files.push(v.imageFile);
//           }
//         }
//       }
//     };
//     collect(weights);
//     collect(sizes);
//     collect(colors);
//     collect(materials);
//     return files;
//   };

//   const validate = () => {
//     const err = {};
//     // Determine visible variants according to storeType
//     const visible = visibleTypesForStore(storeType);
//     const total =
//       (visible.includes("weight") ? weights.length : 0) +
//       (visible.includes("size") ? sizes.length : 0) +
//       (visible.includes("color") ? colors.length : 0) +
//       (visible.includes("material") ? materials.length : 0);

//     if (total === 0) err.variants = "Add at least one variant (visible for the selected store type).";

//     const all = [...weights, ...sizes, ...colors, ...materials];
//     all.forEach((v) => {
//       if (!String(v.value).trim()) err[`value-${v.uid}`] = "Value required";
//       if (v.price && !isValidMoney(v.price)) err[`price-${v.uid}`] = "Invalid price";
//     });

//     setErrors(err);
//     return Object.keys(err).length === 0;
//   };

//   const saveVariants = async () => {
//     if (!validate()) {
//       toast.error("Fix variant errors");
//       return;
//     }
//     setIsSaving(true);
//     try {
//       const variantsJson = buildVariantsJson();
//       const variantFiles = collectVariantFiles();

//       // debugging logs
//       console.log("Saving variants — productId:", productId ?? "(none)");
//       console.log("variantsJson:", JSON.stringify(variantsJson, null, 2));
//       console.log("variantFiles:", variantFiles.map((f) => ({ name: f.name, size: f.size, type: f.type })));

//       let res;
//       if (productId) {
//         res = await updateVariantsApi(productId, variantsJson, variantFiles);
//       } else {
//         res = await createVariantsApi(variantsJson, variantFiles);
//       }

//       toast.success("Variants saved ✅");
//       // optionally clear local UI entries
//       setWeights([]);
//       setSizes([]);
//       setColors([]);
//       setMaterials([]);
//       setErrors({});
//       return res;
//     } catch (err) {
//       console.error("saveVariants error:", err, err?.response?.data);
//       const msg = err?.response?.data?.message ?? err?.message ?? "Failed to save variants";
//       toast.error(String(msg));
//       throw err;
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   // UI helpers
//   const fileLabelShort = (f) => {
//     if (!f) return "Choose";
//     const name = f.name ? String(f.name).split("/").pop() : "";
//     return name.length > 18 ? `${name.slice(0, 15)}…` : name;
//   };

//   const renderEntry = (type, e) => {
//     const fileInputId = `file-${type}-${e.uid}`;
//     const filename = e.imageFile?.name ? String(e.imageFile.name).split("/").pop() : "";
//     const shortName = filename ? (filename.length > 18 ? filename.slice(0, 15) + "…" : filename) : "Choose";

//     return (
//       <div key={e.uid} className="p-2 border rounded-md bg-white shadow-sm">
//         <div className="flex items-start gap-2">
//           {/* Value */}
//           <div className="flex flex-col">
//             <label className="text-xs text-slate-500">{type === "size" ? "Size" : type === "color" ? "Color" : type === "material" ? "Material" : "Weight"}</label>
//             {type === "size" ? (
//               <select
//                 value={e.value}
//                 onChange={(ev) => updateField(type, e.uid, "value", ev.target.value)}
//                 className="mt-1 block w-28 border border-slate-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-300"
//               >
//                 <option value="">—</option>
//                 <option value="XS">XS</option>
//                 <option value="S">S</option>
//                 <option value="M">M</option>
//                 <option value="L">L</option>
//                 <option value="XL">XL</option>
//                 <option value="XXL">XXL</option>
//               </select>
//             ) : (
//               <input
//                 value={e.value}
//                 onChange={(ev) => updateField(type, e.uid, "value", ev.target.value)}
//                 className="mt-1 block w-28 border border-slate-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-300"
//                 placeholder={type === "color" ? "Red" : type === "material" ? "Cotton" : "250g"}
//               />
//             )}
//             {errors[`value-${e.uid}`] && <div className="text-[11px] text-red-600 mt-1">{errors[`value-${e.uid}`]}</div>}
//           </div>

//           {/* Price */}
//           <div className="flex flex-col">
//             <label className="text-xs text-slate-500">Price</label>
//             <input
//               value={e.price}
//               onChange={(ev) => updateField(type, e.uid, "price", ev.target.value)}
//               className="mt-1 block w-20 border border-slate-200 rounded px-2 py-1 text-sm text-right focus:outline-none focus:ring-1 focus:ring-indigo-300"
//               placeholder="0.00"
//             />
//             {errors[`price-${e.uid}`] && <div className="text-[11px] text-red-600 mt-1">{errors[`price-${e.uid}`]}</div>}
//           </div>

//           {/* Inline preview */}
//           <div className="flex items-center gap-2 ml-1 mt-5">
//             <div className="w-8 h-8 rounded-sm overflow-hidden border bg-slate-50 flex items-center justify-center">
//               {e.imagePreview ? <img src={e.imagePreview} alt={`variant-${e.uid}`} className="w-full h-full object-cover" /> : <div className="text-[11px] text-slate-400">No</div>}
//             </div>
//           </div>

//           {/* File chooser */}
//           <div className="flex flex-col">
//             <label className="text-xs text-slate-500">Image</label>
//             <div className="mt-1 flex items-center gap-2">
//               <input id={fileInputId} type="file" accept="image/*" onChange={(ev) => handleImageChange(type, e.uid, ev)} className="hidden" />
//               <label
//                 htmlFor={fileInputId}
//                 className="inline-flex items-center gap-2 px-2 py-1 rounded border border-slate-200 text-xs cursor-pointer hover:bg-slate-50"
//                 title={filename || "Choose file"}
//               >
//                 {shortName}
//               </label>
//               {filename ? (
//                 <button
//                   type="button"
//                   onClick={() => {
//                     updateField(type, e.uid, "imageFile", null);
//                     updateField(type, e.uid, "imagePreview", "");
//                   }}
//                   className="inline-flex items-center justify-center p-1 rounded border hover:bg-red-50"
//                   aria-label="Clear file"
//                 >
//                   <Trash2 className="w-4 h-4 text-red-500" />
//                 </button>
//               ) : null}
//             </div>
//           </div>

//           {/* Delete entry */}
//           <div className="ml-auto">
//             <button
//               type="button"
//               onClick={() => removeEntry(type, e.uid)}
//               className="inline-flex items-center justify-center p-1.5 rounded border hover:bg-red-50 mt-5"
//               aria-label={`Remove ${type} variant`}
//             >
//               <Trash2 className="w-4 h-4 text-red-600" />
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   // decide which variant columns are visible based on store type
//   const visibleTypesForStore = (st) => {
//     switch (st) {
//       case "9Nutz":
//         return ["weight"];
//       case "Fashion":
//         return ["size", "color", "material"];
//       case "Gold":
//         return ["weight"]; // treat weight as grams for gold
//       default:
//         return ["weight", "size", "color", "material"];
//     }
//   };

//   const visibleTypes = visibleTypesForStore(storeType);

//   return (
//     <div className="w-full max-w-full mx-auto p-4 flex flex-col items-start justify-start">
//       <h3 className="text-lg font-semibold mb-3">Manage Variants</h3>

//       <div className="bg-white p-4 rounded-lg shadow-sm w-full">
//         {/* top row: store type + counts */}
//         <div className="flex items-center justify-between gap-4 mb-4">
//           <div className="flex items-center gap-3">
//             <div className="text-sm font-medium">Store type</div>
//             <select
//               value={storeType}
//               onChange={(e) => setStoreType(e.target.value)}
//               className="border rounded px-3 py-2 text-sm"
//             >
//               {STORE_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
//             </select>
//           </div>

//           <div className="text-sm text-slate-500">
//             Visible: {visibleTypes.join(", ")}
//           </div>
//         </div>

//         {/* columns area */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
//           {/* Weight column */}
//           {visibleTypes.includes("weight") && (
//             <div className="border rounded-lg p-3 bg-gray-50">
//               <div className="flex items-center justify-between mb-3">
//                 <div>
//                   <div className="text-sm font-medium">Weights (grams)</div>
//                   <div className="text-xs text-slate-500">{weights.length} items</div>
//                 </div>
//                 <button type="button" onClick={() => addEntry("weight")} className="inline-flex items-center gap-2 px-2 py-1 rounded-md border hover:bg-slate-100 text-sm bg-white">
//                   <Plus className="w-3 h-3" /> Add
//                 </button>
//               </div>

//               <div className="space-y-2">
//                 {weights.length === 0 ? <div className="text-sm text-slate-500 p-2">No weights yet.</div> : weights.map((w) => renderEntry("weight", w))}
//               </div>
//             </div>
//           )}

//           {/* Size column */}
//           {visibleTypes.includes("size") && (
//             <div className="border rounded-lg p-3 bg-gray-50">
//               <div className="flex items-center justify-between mb-3">
//                 <div>
//                   <div className="text-sm font-medium">Sizes</div>
//                   <div className="text-xs text-slate-500">{sizes.length} items</div>
//                 </div>
//                 <button type="button" onClick={() => addEntry("size")} className="inline-flex items-center gap-2 px-2 py-1 rounded-md border hover:bg-slate-100 text-sm bg-white">
//                   <Plus className="w-3 h-3" /> Add
//                 </button>
//               </div>

//               <div className="space-y-2">
//                 {sizes.length === 0 ? <div className="text-sm text-slate-500 p-2">No sizes yet.</div> : sizes.map((s) => renderEntry("size", s))}
//               </div>
//             </div>
//           )}

//           {/* Colors + Material chips column */}
//           {visibleTypes.includes("color") && (
//             <div className="border rounded-lg p-3 bg-gray-50">
//               <div className="flex items-center justify-between mb-3">
//                 <div>
//                   <div className="text-sm font-medium">Colors</div>
//                   <div className="text-xs text-slate-500">{colors.length} items</div>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <button type="button" onClick={() => addEntry("color")} className="inline-flex items-center gap-2 px-2 py-1 rounded-md border hover:bg-slate-100 text-sm bg-white">
//                     <Plus className="w-3 h-3" /> Add
//                   </button>
//                 </div>
//               </div>

//               <div className="space-y-2">
//                 {colors.length === 0 ? <div className="text-sm text-slate-500 p-2">No colors yet.</div> : colors.map((c) => renderEntry("color", c))}
//               </div>

//               {/* Material quick chips row (4 chips in a single row) */}
//               {visibleTypes.includes("material") && (
//                 <div className="mt-4">
//                   <div className="text-sm font-medium mb-2">Quick add materials</div>
//                   <div className="flex gap-2">
//                     {DEFAULT_MATERIAL_CHIPS.map((m) => (
//                       <button
//                         key={m}
//                         type="button"
//                         onClick={() => addEntry("material", m)}
//                         className="px-3 py-2 rounded border bg-white text-sm hover:shadow-sm"
//                       >
//                         {m}
//                       </button>
//                     ))}
//                   </div>
//                 </div>
//               )}
//             </div>
//           )}

//           {visibleTypes.includes("material") && (
//           <div className="border rounded-lg p-3 bg-gray-50 mb-4">
//             <div className="flex items-center justify-between mb-3">
//               <div>
//                 <div className="text-sm font-medium">Materials</div>
//                 <div className="text-xs text-slate-500">{materials.length} items</div>
//               </div>
//               <button type="button" onClick={() => addEntry("material")} className="inline-flex items-center gap-2 px-2 py-1 rounded-md border hover:bg-slate-100 text-sm bg-white">
//                 <Plus className="w-3 h-3" /> Add
//               </button>
//             </div>

//             <div className="space-y-2">
//               {materials.length === 0 ? <div className="text-sm text-slate-500 p-2">No materials yet. Use the quick chips above to add common materials.</div> : materials.map((m) => renderEntry("material", m))}
//             </div>
//           </div>
//         )}

//         </div>

        
//         {errors.variants && <div className="text-sm text-red-600 mt-3">{errors.variants}</div>}

//         <div className="mt-4 flex justify-end gap-2">
//           <Button
//             type="button"
//             onClick={() => {
//               setWeights([]);
//               setSizes([]);
//               setColors([]);
//               setMaterials([]);
//               setErrors({});
//             }}
//             className="bg-white"
//           >
//             Reset
//           </Button>

//           <Button
//             onClick={async () => {
//               try {
//                 await saveVariants();
//               } catch {
//                 /* handled in saveVariants */
//               }
//             }}
//             disabled={isSaving}
//           >
//             {isSaving ? "Saving..." : productId ? "Save Variants" : "Create Variants"}
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// }



import React, { useEffect, useRef, useState } from "react";
import api from "../api/axios"; // adjust path if needed
import { Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";

const MAX_IMAGE_BYTES = 2 * 1024 * 1024; // 2MB

function makeUid(prefix = "v") {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function isValidMoney(s) {
  return /^\d+(\.\d{1,2})?$/.test(String(s || "").trim());
}

async function createVariantsApi(variantsJson, variantFiles) {
  const fd = new FormData();
  fd.append("variants", JSON.stringify(variantsJson));
  (variantFiles || []).forEach((f) => fd.append("variant_images[]", f));
  const res = await api.post("/admin/variants/add", fd, { headers: { "Content-Type": "multipart/form-data" } });
  return res.data ?? res;
}

async function updateVariantsApi(productId, variantsJson, variantFiles) {
  const fd = new FormData();
  fd.append("variants", JSON.stringify(variantsJson));
  (variantFiles || []).forEach((f) => fd.append("variant_images[]", f));
  const res = await api
    .post(`/admin/products/${productId}/variants`, fd, { headers: { "Content-Type": "multipart/form-data" } })
    .catch(() => ({}));
  return res.data ?? res;
}

/* ---------------- Component ---------------- */
export default function VariantsEditor({ productId = null, initialVariants = {}, onChange = null }) {
  // ---------- Dummy data (used only if initialVariants is empty) ----------
  const DUMMY_VARIANTS = {
    weight: [
      { uid: makeUid("v"), id: null, value: "250g", price: "120.00", imagePreview: "https://source.unsplash.com/80x80/?grains" },
      { uid: makeUid("v"), id: null, value: "500g", price: "220.00", imagePreview: "https://source.unsplash.com/80x80/?nuts" },
    ],
    size: [
      { uid: makeUid("v"), id: null, value: "M", price: "450.00", imagePreview: "https://source.unsplash.com/80x80/?tshirt" },
      { uid: makeUid("v"), id: null, value: "L", price: "480.00", imagePreview: "https://source.unsplash.com/80x80/?fashion" },
    ],
    color: [
      { uid: makeUid("v"), id: null, value: "Red", price: "0.00", imagePreview: "https://source.unsplash.com/80x80/?red" },
      { uid: makeUid("v"), id: null, value: "Blue", price: "0.00", imagePreview: "https://source.unsplash.com/80x80/?blue" },
    ],
    material: [
      { uid: makeUid("v"), id: null, value: "Cotton", price: "0.00", imagePreview: "https://source.unsplash.com/80x80/?cotton" },
      { uid: makeUid("v"), id: null, value: "Silk", price: "50.00", imagePreview: "https://source.unsplash.com/80x80/?silk" },
    ],
  };

  // if initialVariants is empty, fall back to DUMMY_VARIANTS
  const incoming = initialVariants && Object.keys(initialVariants || {}).length ? initialVariants : DUMMY_VARIANTS;

  // parse incoming initial variants safely and include editing flag
  const normalizeIncoming = (arr) =>
    Array.isArray(arr)
      ? arr.map((it) => ({
          uid: it.uid || makeUid("v"),
          id: it.id,
          value: it.value ?? "",
          price: it.price ?? "",
          imageFile: null,
          imagePreview: it.image_url ?? it.imagePreview ?? "",
          editing: false,
        }))
      : [];

  // state arrays contain objects with editing flag now
  const [weights, setWeights] = useState(normalizeIncoming(incoming.weight));
  const [sizes, setSizes] = useState(normalizeIncoming(incoming.size));
  const [colors, setColors] = useState(normalizeIncoming(incoming.color));
  const [materials, setMaterials] = useState(normalizeIncoming(incoming.material));

  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // storeType controls which variant columns are visible
  const STORE_OPTIONS = [
    { value: "9Nutz", label: "9Nutz Sweet" },
    { value: "Fashion", label: "Fashion" },
    { value: "Gold", label: "Gold" },
  ];
  const [storeType, setStoreType] = useState(STORE_OPTIONS[0].value);

  // quick material chips (displayed in a single row beside colors)
  const DEFAULT_MATERIAL_CHIPS = ["Cotton", "Leather", "Metal", "Silk"];

  // snapshot ref to keep original row values while editing (for cancel)
  const snapshotRef = useRef({});

  // notify parent when variants change
  useEffect(() => {
    if (onChange) {
      const stripMeta = (arr) => arr.map((it) => ({ id: it.id, uid: it.uid, value: it.value, price: it.price, imagePreview: it.imagePreview }));
      onChange({
        weight: stripMeta(weights),
        size: stripMeta(sizes),
        color: stripMeta(colors),
        material: stripMeta(materials),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weights, sizes, colors, materials]);

  // helpers to add / remove / update entries for any variant type
  const addEntry = (type, preset = "") => {
    const entry = { uid: makeUid("v"), value: preset, price: "", imageFile: null, imagePreview: "", editing: true };
    if (type === "weight") setWeights((p) => [...p, entry]);
    if (type === "size") setSizes((p) => [...p, entry]);
    if (type === "color") setColors((p) => [...p, entry]);
    if (type === "material") setMaterials((p) => [...p, entry]);
  };

  const removeEntry = (type, uid) => {
    if (type === "weight") setWeights((p) => p.filter((it) => it.uid !== uid));
    if (type === "size") setSizes((p) => p.filter((it) => it.uid !== uid));
    if (type === "color") setColors((p) => p.filter((it) => it.uid !== uid));
    if (type === "material") setMaterials((p) => p.filter((it) => it.uid !== uid));
    delete snapshotRef.current[uid];
  };

  const updateField = (type, uid, key, val) => {
    const updater = (arr) => arr.map((it) => (it.uid === uid ? { ...it, [key]: val } : it));
    if (type === "weight") setWeights((p) => updater(p));
    if (type === "size") setSizes((p) => updater(p));
    if (type === "color") setColors((p) => updater(p));
    if (type === "material") setMaterials((p) => updater(p));
  };

  // toggle edit/save/cancel
  const startEdit = (type, uid) => {
    const arr = getArrayByType(type);
    const target = arr.find((x) => x.uid === uid);
    if (target) snapshotRef.current[uid] = { ...target };
    setEditingFlag(type, uid, true);
  };

  const saveEdit = (type, uid) => {
    const arr = getArrayByType(type);
    const target = arr.find((x) => x.uid === uid);
    if (!target) return;
    if (!String(target.value).trim()) {
      toast.error("Value required");
      setErrors((e) => ({ ...e, [`value-${uid}`]: "Value required" }));
      return;
    }
    if (target.price && !isValidMoney(target.price)) {
      toast.error("Invalid price");
      setErrors((e) => ({ ...e, [`price-${uid}`]: "Invalid price" }));
      return;
    }
    delete snapshotRef.current[uid];
    setEditingFlag(type, uid, false);
    setErrors((e) => {
      const copy = { ...e };
      delete copy[`value-${uid}`];
      delete copy[`price-${uid}`];
      return copy;
    });
  };

  const cancelEdit = (type, uid) => {
    const snap = snapshotRef.current[uid];
    if (snap) {
      const restore = (arr) => arr.map((it) => (it.uid === uid ? { ...snap } : it));
      if (type === "weight") setWeights((p) => restore(p));
      if (type === "size") setSizes((p) => restore(p));
      if (type === "color") setColors((p) => restore(p));
      if (type === "material") setMaterials((p) => restore(p));
      delete snapshotRef.current[uid];
    } else {
      // newly added row with no snapshot -> remove on cancel
      removeEntry(type, uid);
      return;
    }
    setEditingFlag(type, uid, false);
    setErrors((e) => {
      const copy = { ...e };
      delete copy[`value-${uid}`];
      delete copy[`price-${uid}`];
      return copy;
    });
  };

  const setEditingFlag = (type, uid, flag) => {
    const updater = (arr) => arr.map((it) => (it.uid === uid ? { ...it, editing: flag } : it));
    if (type === "weight") setWeights((p) => updater(p));
    if (type === "size") setSizes((p) => updater(p));
    if (type === "color") setColors((p) => updater(p));
    if (type === "material") setMaterials((p) => updater(p));
  };

  const getArrayByType = (type) => {
    if (type === "weight") return weights;
    if (type === "size") return sizes;
    if (type === "color") return colors;
    if (type === "material") return materials;
    return [];
  };

  const handleImageChange = (type, uid, e) => {
    const file = e.target.files?.[0] ?? null;
    const clear = () => {
      const c = (arr) => arr.map((it) => (it.uid === uid ? { ...it, imageFile: null, imagePreview: "" } : it));
      if (type === "weight") setWeights((p) => c(p));
      if (type === "size") setSizes((p) => c(p));
      if (type === "color") setColors((p) => c(p));
      if (type === "material") setMaterials((p) => c(p));
    };

    if (!file) {
      clear();
      return;
    }
    if (!file.type || !file.type.startsWith("image/")) {
      toast.error("Selected file is not an image.");
      try {
        e.currentTarget.value = "";
      } catch {}
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      toast.error("Image too large (max 2MB).");
      try {
        e.currentTarget.value = "";
      } catch {}
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const preview = String(reader.result ?? "");
      const updater = (arr) => arr.map((it) => (it.uid === uid ? { ...it, imageFile: file, imagePreview: preview } : it));
      if (type === "weight") setWeights((p) => updater(p));
      if (type === "size") setSizes((p) => updater(p));
      if (type === "color") setColors((p) => updater(p));
      if (type === "material") setMaterials((p) => updater(p));
    };
    reader.readAsDataURL(file);
    try {
      e.currentTarget.value = "";
    } catch {}
  };

  const buildVariantsJson = () => ({
    weight: weights.map((w) => ({ uid: w.uid, value: w.value, price: w.price })),
    size: sizes.map((s) => ({ uid: s.uid, value: s.value, price: s.price })),
    color: colors.map((c) => ({ uid: c.uid, value: c.value, price: c.price })),
    material: materials.map((m) => ({ uid: m.uid, value: m.value, price: m.price })),
  });

  const collectVariantFiles = () => {
    const files = [];
    const collect = (arr) => {
      for (const v of arr) {
        if (v.imageFile) {
          try {
            const f = new File([v.imageFile], `${v.uid}__${v.imageFile.name}`, { type: v.imageFile.type });
            files.push(f);
          } catch (err) {
            files.push(v.imageFile);
          }
        }
      }
    };
    collect(weights);
    collect(sizes);
    collect(colors);
    collect(materials);
    return files;
  };

  const validate = () => {
    const err = {};
    const visible = visibleTypesForStore(storeType);
    const total =
      (visible.includes("weight") ? weights.length : 0) +
      (visible.includes("size") ? sizes.length : 0) +
      (visible.includes("color") ? colors.length : 0) +
      (visible.includes("material") ? materials.length : 0);

    if (total === 0) err.variants = "Add at least one variant (visible for the selected store type).";

    const all = [...weights, ...sizes, ...colors, ...materials];
    all.forEach((v) => {
      if (!String(v.value).trim()) err[`value-${v.uid}`] = "Value required";
      if (v.price && !isValidMoney(v.price)) err[`price-${v.uid}`] = "Invalid price";
    });

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const saveVariants = async () => {
    if (!validate()) {
      toast.error("Fix variant errors");
      return;
    }
    setIsSaving(true);
    try {
      const variantsJson = buildVariantsJson();
      const variantFiles = collectVariantFiles();

      console.log("Saving variants — productId:", productId ?? "(none)");
      console.log("variantsJson:", JSON.stringify(variantsJson, null, 2));
      console.log("variantFiles:", variantFiles.map((f) => ({ name: f.name, size: f.size, type: f.type })));

      let res;
      if (productId) {
        res = await updateVariantsApi(productId, variantsJson, variantFiles);
      } else {
        res = await createVariantsApi(variantsJson, variantFiles);
      }

      toast.success("Variants saved ✅");
      // keep behaviour you had: optionally clear local UI entries (I kept this)
      setWeights([]);
      setSizes([]);
      setColors([]);
      setMaterials([]);
      setErrors({});
      snapshotRef.current = {};
      return res;
    } catch (err) {
      console.error("saveVariants error:", err, err?.response?.data);
      const msg = err?.response?.data?.message ?? err?.message ?? "Failed to save variants";
      toast.error(String(msg));
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  // UI helpers
  const fileLabelShort = (f) => {
    if (!f) return "Choose";
    const name = f.name ? String(f.name).split("/").pop() : "";
    return name.length > 18 ? `${name.slice(0, 15)}…` : name;
  };

  const renderEntry = (type, e) => {
    const fileInputId = `file-${type}-${e.uid}`;
    const filename = e.imageFile?.name ? String(e.imageFile.name).split("/").pop() : "";
    const shortName = filename ? (filename.length > 18 ? filename.slice(0, 15) + "…" : filename) : "Choose";
    const editable = Boolean(e.editing);

    return (
      <div key={e.uid} className="p-2 border rounded-md bg-white shadow-sm">
        <div className="flex items-start gap-2">
          {/* Value */}
          <div className="flex flex-col">
            <label className="text-xs text-slate-500">{type === "size" ? "Size" : type === "color" ? "Color" : type === "material" ? "Material" : "Weight"}</label>

            {type === "size" ? (
              <select
                value={e.value}
                onChange={(ev) => updateField(type, e.uid, "value", ev.target.value)}
                className="mt-1 block w-28 border border-slate-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-300"
                disabled={!editable}
              >
                <option value="">—</option>
                <option value="XS">XS</option>
                <option value="S">S</option>
                <option value="M">M</option>
                <option value="L">L</option>
                <option value="XL">XL</option>
                <option value="XXL">XXL</option>
              </select>
            ) : (
              <input
                value={e.value}
                onChange={(ev) => updateField(type, e.uid, "value", ev.target.value)}
                className="mt-1 block w-28 border border-slate-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-300"
                placeholder={type === "color" ? "Red" : type === "material" ? "Cotton" : "250g"}
                readOnly={!editable}
              />
            )}

            {errors[`value-${e.uid}`] && <div className="text-[11px] text-red-600 mt-1">{errors[`value-${e.uid}`]}</div>}
          </div>

          {/* Price */}
          <div className="flex flex-col">
            <label className="text-xs text-slate-500">Price</label>
            <input
              value={e.price}
              onChange={(ev) => updateField(type, e.uid, "price", ev.target.value)}
              className="mt-1 block w-20 border border-slate-200 rounded px-2 py-1 text-sm text-right focus:outline-none focus:ring-1 focus:ring-indigo-300"
              placeholder="0.00"
              readOnly={!editable}
            />
            {errors[`price-${e.uid}`] && <div className="text-[11px] text-red-600 mt-1">{errors[`price-${e.uid}`]}</div>}
          </div>

          {/* Inline preview */}
          <div className="flex items-center gap-2 ml-1 mt-5">
            <div className="w-8 h-8 rounded-sm overflow-hidden border bg-slate-50 flex items-center justify-center">
              {e.imagePreview ? <img src={e.imagePreview} alt={`variant-${e.uid}`} className="w-full h-full object-cover" /> : <div className="text-[11px] text-slate-400">No</div>}
            </div>
          </div>

          {/* File chooser */}
          <div className="flex flex-col">
            <label className="text-xs text-slate-500">Image</label>
            <div className="mt-1 flex items-center gap-2">
              <input id={fileInputId} type="file" accept="image/*" onChange={(ev) => handleImageChange(type, e.uid, ev)} className="hidden" disabled={!editable} />
              <label
                htmlFor={fileInputId}
                className={`inline-flex items-center gap-2 px-2 py-1 rounded border border-slate-200 text-xs cursor-pointer ${editable ? "hover:bg-slate-50" : "opacity-60 cursor-not-allowed"}`}
                title={filename || "Choose file"}
              >
                {shortName}
              </label>
              {filename ? (
                <button
                  type="button"
                  onClick={() => {
                    updateField(type, e.uid, "imageFile", null);
                    updateField(type, e.uid, "imagePreview", "");
                  }}
                  className="inline-flex items-center justify-center p-1 rounded border hover:bg-red-50"
                  aria-label="Clear file"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              ) : null}
            </div>
          </div>

          {/* Edit / Save / Cancel / Delete buttons */}
          <div className="ml-auto flex flex-col gap-2">
            {!editable ? (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => startEdit(type, e.uid)}
                  className="inline-flex items-center gap-2 px-2 py-1 rounded border bg-white text-xs hover:bg-slate-50"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => removeEntry(type, e.uid)}
                  className="inline-flex items-center gap-2 px-2 py-1 rounded border text-xs hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => saveEdit(type, e.uid)}
                  className="inline-flex items-center gap-2 px-2 py-1 rounded border bg-emerald-600 text-white text-xs hover:bg-emerald-700"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => cancelEdit(type, e.uid)}
                  className="inline-flex items-center gap-2 px-2 py-1 rounded border text-xs hover:bg-slate-100"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const visibleTypesForStore = (st) => {
    switch (st) {
      case "9Nutz":
        return ["weight"];
      case "Fashion":
        return ["size", "color", "material"];
      case "Gold":
        return ["weight"];
      default:
        return ["weight", "size", "color", "material"];
    }
  };

  const visibleTypes = visibleTypesForStore(storeType);

  return (
    <div className="w-full max-w-full mx-auto p-4 flex flex-col items-start justify-start">
      <h3 className="text-lg font-semibold mb-3">Manage Variants</h3>

      <div className="bg-white p-4 rounded-lg shadow-sm w-full">
        {/* top row: store type + counts */}
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="text-sm font-medium">Store type</div>
            <select value={storeType} onChange={(e) => setStoreType(e.target.value)} className="border rounded px-3 py-2 text-sm">
              {STORE_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div className="text-sm text-slate-500">Visible: {visibleTypes.join(", ")}</div>
        </div>

        {/* columns area */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Weight column */}
          {visibleTypes.includes("weight") && (
            <div className="border rounded-lg p-3 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-sm font-medium">Weights (grams)</div>
                  <div className="text-xs text-slate-500">{weights.length} items</div>
                </div>
                <button type="button" onClick={() => addEntry("weight")} className="inline-flex items-center gap-2 px-2 py-1 rounded-md border hover:bg-slate-100 text-sm bg-white">
                  <Plus className="w-3 h-3" /> Add
                </button>
              </div>

              <div className="space-y-2">{weights.length === 0 ? <div className="text-sm text-slate-500 p-2">No weights yet.</div> : weights.map((w) => renderEntry("weight", w))}</div>
            </div>
          )}

          {/* Size column */}
          {visibleTypes.includes("size") && (
            <div className="border rounded-lg p-3 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-sm font-medium">Sizes</div>
                  <div className="text-xs text-slate-500">{sizes.length} items</div>
                </div>
                <button type="button" onClick={() => addEntry("size")} className="inline-flex items-center gap-2 px-2 py-1 rounded-md border hover:bg-slate-100 text-sm bg-white">
                  <Plus className="w-3 h-3" /> Add
                </button>
              </div>

              <div className="space-y-2">{sizes.length === 0 ? <div className="text-sm text-slate-500 p-2">No sizes yet.</div> : sizes.map((s) => renderEntry("size", s))}</div>
            </div>
          )}

          {/* Colors + Material chips column */}
          {visibleTypes.includes("color") && (
            <div className="border rounded-lg p-3 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-sm font-medium">Colors</div>
                  <div className="text-xs text-slate-500">{colors.length} items</div>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => addEntry("color")} className="inline-flex items-center gap-2 px-2 py-1 rounded-md border hover:bg-slate-100 text-sm bg-white">
                    <Plus className="w-3 h-3" /> Add
                  </button>
                </div>
              </div>

              <div className="space-y-2">{colors.length === 0 ? <div className="text-sm text-slate-500 p-2">No colors yet.</div> : colors.map((c) => renderEntry("color", c))}</div>

              {/* Material quick chips row */}
              {visibleTypes.includes("material") && (
                <div className="mt-4">
                  <div className="text-sm font-medium mb-2">Quick add materials</div>
                  <div className="flex gap-2">
                    {DEFAULT_MATERIAL_CHIPS.map((m) => (
                      <button key={m} type="button" onClick={() => addEntry("material", m)} className="px-3 py-2 rounded border bg-white text-sm hover:shadow-sm">
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {visibleTypes.includes("material") && (
            <div className="border rounded-lg p-3 bg-gray-50 mb-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-sm font-medium">Materials</div>
                  <div className="text-xs text-slate-500">{materials.length} items</div>
                </div>
                <button type="button" onClick={() => addEntry("material")} className="inline-flex items-center gap-2 px-2 py-1 rounded-md border hover:bg-slate-100 text-sm bg-white">
                  <Plus className="w-3 h-3" /> Add
                </button>
              </div>

              <div className="space-y-2">{materials.length === 0 ? <div className="text-sm text-slate-500 p-2">No materials yet. Use the quick chips above to add common materials.</div> : materials.map((m) => renderEntry("material", m))}</div>
            </div>
          )}
        </div>

        {errors.variants && <div className="text-sm text-red-600 mt-3">{errors.variants}</div>}

        <div className="mt-4 flex justify-end gap-2">
          <Button
            type="button"
            onClick={() => {
              setWeights([]);
              setSizes([]);
              setColors([]);
              setMaterials([]);
              setErrors({});
              snapshotRef.current = {};
            }}
            className="bg-white"
          >
            Reset
          </Button>

          <Button
            onClick={async () => {
              try {
                await saveVariants();
              } catch {
                /* handled in saveVariants */
              }
            }}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : productId ? "Save Variants" : "Create Variants"}
          </Button>
        </div>
      </div>
    </div>
  );
}
