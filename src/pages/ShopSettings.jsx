
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

// export default function VariantsEditor({ productId = null, initialVariants = {}, onChange = null }) {
//   // NOTE: removed any static/dummy entries as requested.
//   const normalizeIncoming = (arr) =>
//     Array.isArray(arr)
//       ? arr.map((it) => ({
//           uid: it.uid || makeUid("v"),
//           id: it.id ?? it.ID ?? null,
//           value: it.value ?? it.attribute_name ?? "",
//           price: it.price ?? it.amount ?? "",
//           imageFile: null,
//           imagePreview: it.image_url ?? it.imagePreview ?? "",
//           editing: false,
//         }))
//       : [];

//   // Start empty (no static data). If initialVariants provided, normalize them.
//   const [weights, setWeights] = useState(normalizeIncoming(initialVariants.weight));
//   const [sizes, setSizes] = useState(normalizeIncoming(initialVariants.size));
//   const [colors, setColors] = useState(normalizeIncoming(initialVariants.color));
//   const [materials, setMaterials] = useState(normalizeIncoming(initialVariants.material));

//   const [errors, setErrors] = useState({});
//   const [isSaving, setIsSaving] = useState(false);

//   // Store type kept (unchanged)
//   const STORE_OPTIONS = [
//     { value: "9Nutz", label: "9Nutz Sweet" },
//     { value: "Fashion", label: "Fashion" },
//     { value: "Gold", label: "Gold" },
//   ];
//   const [storeType, setStoreType] = useState(STORE_OPTIONS[0].value);

//   const DEFAULT_MATERIAL_CHIPS = ["Cotton", "Leather", "Metal", "Silk"];
//   const snapshotRef = useRef({});

//   // server-side variations
//   const [variationsList, setVariationsList] = useState([]);
//   const [variationsLoading, setVariationsLoading] = useState(false);
//   const [variationsError, setVariationsError] = useState(null);
//   const [selectedVariation, setSelectedVariation] = useState(null);

//   // attributes list (raw) - we will populate panels from this for the selected variation
//   // but we also maintain panel-specific arrays (weights/sizes/colors/materials) for editing UI
//   const [attributesRaw, setAttributesRaw] = useState([]);
//   const [attrsLoading, setAttrsLoading] = useState(false);

//   // variation modal (unchanged)
//   const [isVariationModalOpen, setIsVariationModalOpen] = useState(false);
//   const [variationFormName, setVariationFormName] = useState("");
//   const [variationEditingId, setVariationEditingId] = useState(null);
//   const [variationSubmitting, setVariationSubmitting] = useState(false);

//   // notify parent on change (keeps your original onChange behaviour)
//   useEffect(() => {
//     if (onChange) {
//       const stripMeta = (arr) => arr.map((it) => ({ id: it.id, uid: it.uid, value: it.value, price: it.price, imagePreview: it.imagePreview }));
//       onChange({
//         weight: stripMeta(weights),
//         size: stripMeta(sizes),
//         color: stripMeta(colors),
//         material: stripMeta(materials),
//       });
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [weights, sizes, colors, materials]);

//   /* ------------------------------
//      Helper: mapping variation name -> type(s)
//      ------------------------------ */
//   const mapVariationNameToType = (name = "") => {
//     if (!name) return null;
//     const s = String(name).trim().toLowerCase();
//     if (!s) return null;

//     // If server returns multiple names comma-separated, handle that:
//     if (s.includes(",")) {
//       const parts = s.split(",").map((p) => p.trim());
//       return parts.map((p) => mapVariationNameToType(p)).flat().filter(Boolean);
//     }

//     if (s.includes("weight")) return "weight";
//     if (s.includes("size")) return "size";
//     if (s.includes("color")) return "color";
//     if (s.includes("material")) return "material";
//     // fallback: if unknown, return null so storeType mapping is used
//     return null;
//   };

//   const visibleTypesForStore = (st, selectedVariationArg = null) => {
//     if (selectedVariationArg) {
//       const mapped = mapVariationNameToType(selectedVariationArg?.name ?? selectedVariationArg?.value ?? "");
//       if (mapped) return Array.isArray(mapped) ? mapped : [mapped];
//     }
//     // fallback (original behavior)
//     switch (st) {
//       case "9Nutz":
//         return ["weight"];
//       case "Fashion":
//         return ["size", "color", "material"];
//       case "Gold":
//         return ["weight"];
//       default:
//         return ["weight", "size", "color", "material"];
//     }
//   };

//   /* ------------------------------
//      Generic entry operations (unchanged behaviour)
//      ------------------------------ */
//   const addEntry = (type, preset = "") => {
//     const entry = { uid: makeUid("v"), id: null, value: preset, price: "", imageFile: null, imagePreview: "", editing: true };
//     if (type === "weight") setWeights((p) => [...p, entry]);
//     if (type === "size") setSizes((p) => [...p, entry]);
//     if (type === "color") setColors((p) => [...p, entry]);
//     if (type === "material") setMaterials((p) => [...p, entry]);
//   };

//   const removeEntry = async (type, uid) => {
//     const arr = getArrayByType(type);
//     const target = arr.find((it) => it.uid === uid);
//     // if entry has server id -> delete via API
//     if (target?.id) {
//       // confirm deletion
//       // eslint-disable-next-line no-restricted-globals
//       if (!confirm("Delete attribute? This cannot be undone.")) return;
//       try {
//         await api.delete(`/admin/attributes/delete/${target.id}`);
//         toast.success("Attribute deleted");
//       } catch (err) {
//         console.error("delete attribute error", err);
//         toast.error("Failed to delete attribute");
//         return;
//       }
//     }
//     // remove locally
//     if (type === "weight") setWeights((p) => p.filter((it) => it.uid !== uid));
//     if (type === "size") setSizes((p) => p.filter((it) => it.uid !== uid));
//     if (type === "color") setColors((p) => p.filter((it) => it.uid !== uid));
//     if (type === "material") setMaterials((p) => p.filter((it) => it.uid !== uid));
//     delete snapshotRef.current[uid];
//   };

//   const updateField = (type, uid, key, val) => {
//     const updater = (arr) => arr.map((it) => (it.uid === uid ? { ...it, [key]: val } : it));
//     if (type === "weight") setWeights((p) => updater(p));
//     if (type === "size") setSizes((p) => updater(p));
//     if (type === "color") setColors((p) => updater(p));
//     if (type === "material") setMaterials((p) => updater(p));
//   };

//   const startEdit = (type, uid) => {
//     const arr = getArrayByType(type);
//     const target = arr.find((x) => x.uid === uid);
//     if (target) snapshotRef.current[uid] = { ...target };
//     setEditingFlag(type, uid, true);
//   };

//   // saveEdit now also persists attribute to attributes API (add/update) when variation selected
//   const saveEdit = async (type, uid) => {
//     const arr = getArrayByType(type);
//     const target = arr.find((x) => x.uid === uid);
//     if (!target) return;

//     if (!String(target.value).trim()) {
//       toast.error("Value required");
//       setErrors((e) => ({ ...e, [`value-${uid}`]: "Value required" }));
//       return;
//     }
//     if (target.price && !isValidMoney(target.price)) {
//       toast.error("Invalid price");
//       setErrors((e) => ({ ...e, [`price-${uid}`]: "Invalid price" }));
//       return;
//     }

//     // If a server variation is selected, persist this attribute via Attributes API:
//     if (selectedVariation && selectedVariation.id) {
//       try {
//         const fd = new FormData();
//         fd.append("variation_id", String(selectedVariation.id));
//         fd.append("attribute_name", String(target.value));
//         fd.append("price", String(target.price ?? ""));
//         if (target.imageFile) fd.append("image", target.imageFile);

//         if (!target.id) {
//           // create attribute
//           const res = await api.post("/admin/attributes/add", fd, {
//             headers: { "Content-Type": "multipart/form-data" },
//           });
//           // server should return created attribute (id, image_url, etc.)
//           const created = res?.data ?? res;
//           // attempt to extract id and image url from response
//           const newId = created?.id ?? created?.data?.id ?? null;
//           const image_url = created?.image_url ?? created?.data?.image_url ?? created?.data?.image ?? null;

//           // update local entry with id and image url
//           updateField(type, uid, "id", newId);
//           if (image_url) updateField(type, uid, "imagePreview", image_url);
//           toast.success("Attribute created");
//         } else {
//           // update attribute
//           await api.post(`/admin/attributes/update/${target.id}`, fd, {
//             headers: { "Content-Type": "multipart/form-data" },
//           });
//           toast.success("Attribute updated");
//         }
//       } catch (err) {
//         console.error("persist attribute error", err);
//         const msg = err?.response?.data?.message ?? err?.message ?? "Failed to save attribute";
//         toast.error(String(msg));
//         setErrors((e) => ({ ...e, [`save-${uid}`]: String(msg) }));
//         return;
//       }
//     }

//     // finalize editing locally
//     delete snapshotRef.current[uid];
//     setEditingFlag(type, uid, false);
//     setErrors((e) => {
//       const copy = { ...e };
//       delete copy[`value-${uid}`];
//       delete copy[`price-${uid}`];
//       delete copy[`save-${uid}`];
//       return copy;
//     });
//   };

//   const cancelEdit = (type, uid) => {
//     const snap = snapshotRef.current[uid];
//     if (snap) {
//       const restore = (arr) => arr.map((it) => (it.uid === uid ? { ...snap } : it));
//       if (type === "weight") setWeights((p) => restore(p));
//       if (type === "size") setSizes((p) => restore(p));
//       if (type === "color") setColors((p) => restore(p));
//       if (type === "material") setMaterials((p) => restore(p));
//       delete snapshotRef.current[uid];
//     } else {
//       // newly added row with no snapshot -> remove on cancel
//       if (type === "weight") setWeights((p) => p.filter((it) => it.uid !== uid));
//       if (type === "size") setSizes((p) => p.filter((it) => it.uid !== uid));
//       if (type === "color") setColors((p) => p.filter((it) => it.uid !== uid));
//       if (type === "material") setMaterials((p) => p.filter((it) => it.uid !== uid));
//       return;
//     }
//     setEditingFlag(type, uid, false);
//     setErrors((e) => {
//       const copy = { ...e };
//       delete copy[`value-${uid}`];
//       delete copy[`price-${uid}`];
//       return copy;
//     });
//   };

//   const setEditingFlag = (type, uid, flag) => {
//     const updater = (arr) => arr.map((it) => (it.uid === uid ? { ...it, editing: flag } : it));
//     if (type === "weight") setWeights((p) => updater(p));
//     if (type === "size") setSizes((p) => updater(p));
//     if (type === "color") setColors((p) => updater(p));
//     if (type === "material") setMaterials((p) => updater(p));
//   };

//   const getArrayByType = (type) => {
//     if (type === "weight") return weights;
//     if (type === "size") return sizes;
//     if (type === "color") return colors;
//     if (type === "material") return materials;
//     return [];
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
//       try {
//         e.currentTarget.value = "";
//       } catch {}
//       return;
//     }
//     if (file.size > MAX_IMAGE_BYTES) {
//       toast.error("Image too large (max 2MB).");
//       try {
//         e.currentTarget.value = "";
//       } catch {}
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
//     try {
//       e.currentTarget.value = "";
//     } catch {}
//   };

//   /* ------------------------------
//      Attributes API integration
//      ------------------------------ */

//   // fetch attributes (all) and keep in attributesRaw; we will filter by variation_id when mapping to panels
//   const fetchAttributes = async () => {
//     setAttrsLoading(true);
//     try {
//       // prefer server filter if available; many APIs support query param like ?variation_id=...
//       // Try using it (safe) — if server doesn't support, fallback to full list.
//       let res;
//       try {
//         res = await api.get("/admin/attributes");
//       } catch (err) {
//         // If server supports query param, attempt with selectedVariation
//         res = await api.get("/admin/attributes");
//       }
//       const data = res?.data ?? res;
//       const list = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
//       setAttributesRaw(list);
//     } catch (err) {
//       console.error("fetchAttributes error", err);
//       toast.error("Failed to load attributes");
//       setAttributesRaw([]);
//     } finally {
//       setAttrsLoading(false);
//     }
//   };

//   // fetch a single attribute (useful after create/update to refresh metadata)
//   const fetchAttributeById = async (id) => {
//     if (!id) return null;
//     try {
//       const res = await api.get(`/admin/attributes/show/${id}`);
//       const data = res?.data ?? res;
//       return data;
//     } catch (err) {
//       console.error("fetchAttributeById error", err);
//       return null;
//     }
//   };

//   // map attributesRaw (filtered by selected variation) into the appropriate panels
//   const populatePanelsFromAttributes = (variation) => {
//     if (!variation || !variation.id) return;
//     const vid = variation.id;
//     // try to filter server-side if API returns variation_id field
//     const list = (attributesRaw || []).filter((a) => {
//       // attribute object shape may vary; check common fields
//       const attrVid = a.variation_id ?? a.variationId ?? a.variation ?? a.variations_id ?? a.variationId;
//       if (attrVid != null) return String(attrVid) === String(vid);
//       // fallback: some APIs include variation nested: a.variation.id
//       const nested = a.variation?.id ?? a.Variation?.id;
//       if (nested != null) return String(nested) === String(vid);
//       // if there's no variation field, we can't determine — ignore
//       return false;
//     });

//     // map to panels based on variation name mapping (most UIs the variation name indicates which panel)
//     const mappedType = mapVariationNameToType(variation.name ?? variation.value ?? "");
//     const targetType = Array.isArray(mappedType) ? mappedType[0] : mappedType; // usually single

//     // For safety, if mappedType missing, we attempt to use variation.name as panel type exact.
//     // but the UI will show only the panel(s) visibleTypesForStore returns, so we still guard.

//     const toEntry = (a) => ({
//       uid: makeUid("v"),
//       id: a.id ?? a.ID ?? null,
//       value: a.attribute_name ?? a.attribute ?? a.value ?? "",
//       price: a.price ?? a.amount ?? a.price ?? "",
//       imageFile: null,
//       imagePreview: a.image_url ?? a.image ?? "",
//       editing: false,
//     });

//     // Clear existing panels for the variation's type(s) and populate with fetched attributes
//     const typesToPopulate = Array.isArray(mappedType) ? mappedType : mappedType ? [mappedType] : [];

//     // If no mapping found, don't populate automatically — keep panels as-is (let user pick)
//     if (typesToPopulate.length === 0) return;

//     typesToPopulate.forEach((t) => {
//       const items = list.map(toEntry);
//       if (t === "weight") setWeights(items);
//       if (t === "size") setSizes(items);
//       if (t === "color") setColors(items);
//       if (t === "material") setMaterials(items);
//     });
//   };

//   // initial fetch variations & attributes
//   const fetchVariationsList = async () => {
//     setVariationsLoading(true);
//     setVariationsError(null);
//     try {
//       const res = await api.get("/admin/variation");
//       const data = res?.data ?? res;
//       const list = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
//       setVariationsList(list);
//     } catch (err) {
//       console.error("fetchVariationsList error", err);
//       setVariationsError(err?.response?.data?.message ?? err?.message ?? "Failed to fetch variations");
//       toast.error("Failed to load variations");
//     } finally {
//       setVariationsLoading(false);
//     }
//   };

//   useEffect(() => {
//     // load variations + attributes once
//     fetchVariationsList();
//     fetchAttributes();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   // Whenever attributesRaw changes and a variation is selected, repopulate panels
//   useEffect(() => {
//     if (selectedVariation) populatePanelsFromAttributes(selectedVariation);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [attributesRaw, selectedVariation]);

//   // Called when user picks a variation from dropdown
//   const onVariationSelectChange = async (val) => {
//     if (!val) {
//       setSelectedVariation(null);
//       // clear panels if you want, or keep them — I keep them but you can clear if desired
//       return;
//     }
//     const found = variationsList.find((v) => String(v.id ?? v.ID ?? v.value) === String(val));
//     setSelectedVariation(found ?? null);

//     // after selecting variation, attempt to fetch attributes filtered by variation id:
//     try {
//       let res;
//       // attempt query param approach (if supported by API)
//       try {
//         res = await api.get(`/admin/attributes?variation_id=${String(found.id ?? found.ID ?? found.value)}`);
//       } catch {
//         // fallback to full list (we already fetched attributesRaw earlier)
//         res = await api.get(`/admin/attributes`);
//       }
//       const data = res?.data ?? res;
//       const list = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
//       setAttributesRaw(list);
//       // populatePanelsFromAttributes will be called via useEffect when attributesRaw updates
//     } catch (err) {
//       console.error("onVariationSelectChange fetch attributes error", err);
//       // fallback: populate from existing attributesRaw
//       populatePanelsFromAttributes(found);
//     }
//   };

//   /* ------------------------------
//      Build JSON / collect variant images (keeps your existing variant API behaviour)
//      ------------------------------ */
//   const buildVariantsJson = () => ({
//     weight: weights.map((w) => ({ uid: w.uid, id: w.id, value: w.value, price: w.price })),
//     size: sizes.map((s) => ({ uid: s.uid, id: s.id, value: s.value, price: s.price })),
//     color: colors.map((c) => ({ uid: c.uid, id: c.id, value: c.value, price: c.price })),
//     material: materials.map((m) => ({ uid: m.uid, id: m.id, value: m.value, price: m.price })),
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
//     const visible = visibleTypesForStore(storeType, selectedVariation);
//     const total =
//       (visible.includes("weight") ? weights.length : 0) +
//       (visible.includes("size") ? sizes.length : 0) +
//       (visible.includes("color") ? colors.length : 0) +
//       (visible.includes("material") ? materials.length : 0);
//     if (total === 0) err.variants = "Add at least one variant (visible for the selected variation).";
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

//       console.log("Saving variants — productId:", productId ?? "(none)");
//       console.log("variantsJson:", JSON.stringify(variantsJson, null, 2));
//       console.log("variantFiles:", variantFiles.map((f) => ({ name: f.name, size: f.size, type: f.type })));

//       let res;
//       if (productId) {
//         // keep your update variants API (unchanged)
//         res = await updateVariantsApi(productId, variantsJson, variantFiles);
//       } else {
//         res = await createVariantsApi(variantsJson, variantFiles);
//       }

//       toast.success("Variants saved ✅");
//       // do not repopulate from static data; we clear local panels as before
//       setWeights([]);
//       setSizes([]);
//       setColors([]);
//       setMaterials([]);
//       setErrors({});
//       snapshotRef.current = {};
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
//   const fileLabelShort = (f) => {
//     if (!f) return "Choose";
//     const name = f.name ? String(f.name).split("/").pop() : "";
//     return name.length > 18 ? `${name.slice(0, 15)}…` : name;
//   };

//   const renderEntry = (type, e) => {
//     const fileInputId = `file-${type}-${e.uid}`;
//     const filename = e.imageFile?.name ? String(e.imageFile.name).split("/").pop() : "";
//     const shortName = filename ? (filename.length > 18 ? filename.slice(0, 15) + "…" : filename) : "Choose";
//     const editable = Boolean(e.editing);

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
//                 disabled={!editable}
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
//                 readOnly={!editable}
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
//               readOnly={!editable}
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
//               <input id={fileInputId} type="file" accept="image/*" onChange={(ev) => handleImageChange(type, e.uid, ev)} className="hidden" disabled={!editable} />
//               <label
//                 htmlFor={fileInputId}
//                 className={`inline-flex items-center gap-2 px-2 py-1 rounded border border-slate-200 text-xs cursor-pointer ${editable ? "hover:bg-slate-50" : "opacity-60 cursor-not-allowed"}`}
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

//           {/* Edit / Save / Cancel / Delete buttons */}
//           <div className="ml-auto flex flex-col gap-2">
//             {!editable ? (
//               <div className="flex gap-2">
//                 <button
//                   type="button"
//                   onClick={() => startEdit(type, e.uid)}
//                   className="inline-flex items-center gap-2 px-2 py-1 rounded border bg-white text-xs hover:bg-slate-50"
//                 >
//                   Edit
//                 </button>
//                 <button
//                   type="button"
//                   onClick={() => removeEntry(type, e.uid)}
//                   className="inline-flex items-center gap-2 px-2 py-1 rounded border text-xs hover:bg-red-50"
//                 >
//                   Delete
//                 </button>
//               </div>
//             ) : (
//               <div className="flex gap-2">
//                 <button
//                   type="button"
//                   onClick={() => saveEdit(type, e.uid)}
//                   className="inline-flex items-center gap-2 px-2 py-1 rounded border bg-emerald-600 text-white text-xs hover:bg-emerald-700"
//                 >
//                   Save
//                 </button>
//                 <button
//                   type="button"
//                   onClick={() => cancelEdit(type, e.uid)}
//                   className="inline-flex items-center gap-2 px-2 py-1 rounded border text-xs hover:bg-slate-100"
//                 >
//                   Cancel
//                 </button>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     );
//   };

//   /* ------------------------------
//      Render
//      ------------------------------ */
//   const visibleTypes = visibleTypesForStore(storeType, selectedVariation);

//   return (
//     <div className="w-full max-w-full mx-auto p-4 flex flex-col items-start justify-start">
//       <h3 className="text-lg font-semibold mb-3">Manage Variants</h3>

//       <div className="bg-white p-4 rounded-lg shadow-sm w-full">
//         <div className="flex items-center justify-flex-start gap-4 mb-4">
//           <div className="flex items-center gap-3">
//             <div className="text-sm font-medium">Variation</div>
//             <select
//               className="border rounded px-3 py-2 text-sm"
//               disabled={variationsLoading || variationsError}
//               value={selectedVariation ? String(selectedVariation.id ?? selectedVariation.ID ?? selectedVariation.value) : ""}
//               onChange={(e) => onVariationSelectChange(e.target.value)}
//             >
//               <option value="">-- Select --</option>
//               {variationsList.map((s) => (
//                 <option key={s.id ?? s.ID ?? s.value} value={s.id ?? s.ID ?? s.value}>
//                   {s.name ?? s.value ?? `#${s.id ?? s.ID}`}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div>
//             <Button onClick={() => setIsVariationModalOpen(true)}>Add Variants</Button>
//           </div>

//           <div className="text-sm text-slate-500 ml-auto">{attrsLoading ? "Loading attributes..." : `${(attributesRaw || []).length} attributes`}</div>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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

//               <div className="space-y-2">{weights.length === 0 ? <div className="text-sm text-slate-500 p-2">No weights yet.</div> : weights.map((w) => renderEntry("weight", w))}</div>
//             </div>
//           )}

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

//               <div className="space-y-2">{sizes.length === 0 ? <div className="text-sm text-slate-500 p-2">No sizes yet.</div> : sizes.map((s) => renderEntry("size", s))}</div>
//             </div>
//           )}

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

//               <div className="space-y-2">{colors.length === 0 ? <div className="text-sm text-slate-500 p-2">No colors yet.</div> : colors.map((c) => renderEntry("color", c))}</div>

//               {visibleTypes.includes("material") && (
//                 <div className="mt-4">
//                   <div className="text-sm font-medium mb-2">Quick add materials</div>
//                   <div className="flex gap-2">
//                     {DEFAULT_MATERIAL_CHIPS.map((m) => (
//                       <button key={m} type="button" onClick={() => addEntry("material", m)} className="px-3 py-2 rounded border bg-white text-sm hover:shadow-sm">
//                         {m}
//                       </button>
//                     ))}
//                   </div>
//                 </div>
//               )}
//             </div>
//           )}

//           {visibleTypes.includes("material") && (
//             <div className="border rounded-lg p-3 bg-gray-50 mb-4">
//               <div className="flex items-center justify-between mb-3">
//                 <div>
//                   <div className="text-sm font-medium">Materials</div>
//                   <div className="text-xs text-slate-500">{materials.length} items</div>
//                 </div>
//                 <button type="button" onClick={() => addEntry("material")} className="inline-flex items-center gap-2 px-2 py-1 rounded-md border hover:bg-slate-100 text-sm bg-white">
//                   <Plus className="w-3 h-3" /> Add
//                 </button>
//               </div>

//               <div className="space-y-2">{materials.length === 0 ? <div className="text-sm text-slate-500 p-2">No materials yet. Use the quick chips above to add common materials.</div> : materials.map((m) => renderEntry("material", m))}</div>
//             </div>
//           )}
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
//               snapshotRef.current = {};
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

//       {/* Variation modal (unchanged) */}
//       {isVariationModalOpen && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
//           <div
//             className="absolute inset-0 bg-black/40"
//             onClick={() => {
//               if (!variationSubmitting) setIsVariationModalOpen(false);
//             }}
//           />
//           <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md p-4 z-10">
//             <div className="flex items-center justify-between mb-3">
//               <h4 className="text-lg font-semibold">{variationEditingId ? "Edit Variant (Server)" : "Add Variant"}</h4>
//               <button
//                 type="button"
//                 onClick={() => {
//                   if (!variationSubmitting) {
//                     setIsVariationModalOpen(false);
//                     setVariationFormName("");
//                     setVariationEditingId(null);
//                   }
//                 }}
//                 className="text-sm px-2 py-1 rounded hover:bg-slate-100"
//               >
//                 Close
//               </button>
//             </div>

//             <div>
//               <label className="text-xs text-slate-600">Name</label>
//               <input
//                 value={variationFormName}
//                 onChange={(e) => setVariationFormName(e.target.value)}
//                 placeholder="Enter variant name"
//                 className="w-full border rounded px-3 py-2 mt-1 text-sm"
//                 disabled={variationSubmitting}
//               />
//             </div>

//             <div className="mt-4 flex justify-between items-center gap-2">
//               <div>{variationSubmitting ? <div className="text-sm text-slate-500">Saving...</div> : null}</div>

//               <div className="flex gap-2">
//                 <Button
//                   onClick={() => {
//                     setIsVariationModalOpen(false);
//                     setVariationFormName("");
//                     setVariationEditingId(null);
//                   }}
//                   className="bg-white"
//                   disabled={variationSubmitting}
//                 >
//                   Cancel
//                 </Button>

//                 <Button
//                   onClick={async () => {
//                     try {
//                       if (variationEditingId) {
//                         await updateVariation();
//                       } else {
//                         await createVariation();
//                       }
//                     } catch {
//                       /* handled above */
//                     }
//                   }}
//                   disabled={variationSubmitting}
//                 >
//                   {variationSubmitting ? "Saving..." : variationEditingId ? "Update" : "Create"}
//                 </Button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Server variations quick list (unchanged) */}
//       <div className="mt-4 w-full max-w-full">
//         <div className="bg-white p-3 rounded shadow-sm">
//           <div className="flex items-center justify-between mb-2">
//             <div className="text-xs text-slate-500">{variationsLoading ? "Loading..." : `${variationsList.length} items`}</div>
//           </div>

//           {variationsError ? (
//             <div className="text-sm text-red-600">Error: {variationsError}</div>
//           ) : variationsList.length === 0 ? (
//             <div className="text-sm text-slate-500"></div>
//           ) : (
//             <div className="space-y-2">
//               {variationsList.map((v) => (
//                 <div key={v.id ?? v.ID ?? v.value} className="flex items-center justify-between border rounded p-2">
//                   <div className="text-sm">{v.name ?? v.value ?? `#${v.id ?? v.ID}`}</div>
//                   <div className="flex items-center gap-2">
//                     <Button
//                       onClick={() => {
//                         setVariationEditingId(v?.id ?? v?.ID ?? null);
//                         setVariationFormName(String(v?.name ?? v?.value ?? ""));
//                         setIsVariationModalOpen(true);
//                       }}
//                       className="text-xs py-1 px-2"
//                     >
//                       Edit
//                     </Button>
//                     <button
//                       type="button"
//                       onClick={async () => {
//                         // delete variation (unchanged)
//                         // eslint-disable-next-line no-restricted-globals
//                         if (!confirm("Delete this variation? This cannot be undone.")) return;
//                         try {
//                           await api.delete(`/admin/variation/delete/${v.id ?? v.ID}`);
//                           toast.success("Variation deleted");
//                           await fetchVariationsList();
//                         } catch (err) {
//                           console.error("deleteVariation error", err);
//                           toast.error("Failed to delete variation");
//                         }
//                       }}
//                       title="Delete"
//                       className="inline-flex items-center gap-2 px-2 py-1 rounded border text-xs hover:bg-red-50"
//                     >
//                       <Trash2 className="w-4 h-4 text-red-600" />
//                       Delete
//                     </button>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// /* -------------------------
//    Helper API functions used earlier by your code (kept as-is)
//    -------------------------*/
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
//   const res = await api.post(`/admin/products/${productId}/variants`, fd, { headers: { "Content-Type": "multipart/form-data" } }).catch(() => ({}));
//   return res.data ?? res;
// }

// /* -------------------------
//    Additional server-attribute helper functions (you can reuse elsewhere)
//    -------------------------*/
// // create attribute
// export async function createAttributeApi({ variation_id, attribute_name, price, imageFile = null }) {
//   const fd = new FormData();
//   fd.append("variation_id", String(variation_id));
//   fd.append("attribute_name", String(attribute_name));
//   fd.append("price", String(price ?? ""));
//   if (imageFile) fd.append("image", imageFile);
//   const res = await api.post("/admin/attributes/add", fd, { headers: { "Content-Type": "multipart/form-data" } });
//   return res.data ?? res;
// }

// // update attribute
// export async function updateAttributeApi(id, { variation_id, attribute_name, price, imageFile = null }) {
//   const fd = new FormData();
//   if (variation_id != null) fd.append("variation_id", String(variation_id));
//   if (attribute_name != null) fd.append("attribute_name", String(attribute_name));
//   if (price != null) fd.append("price", String(price));
//   if (imageFile) fd.append("image", imageFile);
//   const res = await api.post(`/admin/attributes/update/${id}`, fd, { headers: { "Content-Type": "multipart/form-data" } });
//   return res.data ?? res;
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

export default function VariantsEditor({ productId = null, initialVariants = {}, onChange = null }) {
  // normalize incoming attributes (if provided)
  const normalizeIncoming = (arr) =>
    Array.isArray(arr)
      ? arr.map((it) => ({
          uid: it.uid || makeUid("v"),
          id: it.id ?? it.ID ?? null,
          value: it.value ?? it.attribute_name ?? "",
          price: it.price ?? it.amount ?? "",
          imageFile: null,
          imagePreview: it.image_url ?? it.imagePreview ?? "",
          editing: false,
        }))
      : [];

  const [weights, setWeights] = useState(normalizeIncoming(initialVariants.weight));
  const [sizes, setSizes] = useState(normalizeIncoming(initialVariants.size));
  const [colors, setColors] = useState(normalizeIncoming(initialVariants.color));
  const [materials, setMaterials] = useState(normalizeIncoming(initialVariants.material));

  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const STORE_OPTIONS = [
    { value: "9Nutz", label: "9Nutz Sweet" },
    { value: "Fashion", label: "Fashion" },
    { value: "Gold", label: "Gold" },
  ];
  const [storeType, setStoreType] = useState(STORE_OPTIONS[0].value);

  const DEFAULT_MATERIAL_CHIPS = ["Cotton", "Leather", "Metal", "Silk"];
  const snapshotRef = useRef({});

  // server-side variations & attributes
  const [variationsList, setVariationsList] = useState([]);
  const [variationsLoading, setVariationsLoading] = useState(false);
  const [variationsError, setVariationsError] = useState(null);
  const [selectedVariation, setSelectedVariation] = useState(null);

  const [attributesRaw, setAttributesRaw] = useState([]);
  const [attrsLoading, setAttrsLoading] = useState(false);

  // modal state for variation create/edit
  const [isVariationModalOpen, setIsVariationModalOpen] = useState(false);
  const [variationFormName, setVariationFormName] = useState("");
  const [variationEditingId, setVariationEditingId] = useState(null);
  const [variationSubmitting, setVariationSubmitting] = useState(false);

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

  /* ------------------------------
     mapping helpers
  ------------------------------ */
  const mapVariationNameToType = (name = "") => {
    if (!name) return null;
    const s = String(name).trim().toLowerCase();
    if (!s) return null;
    if (s.includes(",")) {
      const parts = s.split(",").map((p) => p.trim());
      return parts.map((p) => mapVariationNameToType(p)).flat().filter(Boolean);
    }
    if (s.includes("weight")) return "weight";
    if (s.includes("size")) return "size";
    if (s.includes("color")) return "color";
    if (s.includes("material")) return "material";
    return null;
  };

  const visibleTypesForStore = (st, selectedVariationArg = null) => {
    if (selectedVariationArg) {
      const mapped = mapVariationNameToType(selectedVariationArg?.name ?? selectedVariationArg?.value ?? "");
      if (mapped) return Array.isArray(mapped) ? mapped : [mapped];
    }
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

  /* ------------------------------
     Basic panel operations (add/edit/delete local + server attribute persistence)
  ------------------------------ */
  const addEntry = (type, preset = "") => {
    const entry = { uid: makeUid("v"), id: null, value: preset, price: "", imageFile: null, imagePreview: "", editing: true };
    if (type === "weight") setWeights((p) => [...p, entry]);
    if (type === "size") setSizes((p) => [...p, entry]);
    if (type === "color") setColors((p) => [...p, entry]);
    if (type === "material") setMaterials((p) => [...p, entry]);
  };

  const removeEntry = async (type, uid) => {
    const arr = getArrayByType(type);
    const target = arr.find((it) => it.uid === uid);
    if (target?.id) {
      // server delete
      // eslint-disable-next-line no-restricted-globals
      if (!confirm("Delete attribute? This cannot be undone.")) return;
      try {
        await api.delete(`/admin/attributes/delete/${target.id}`);
        toast.success("Attribute deleted");
      } catch (err) {
        console.error("delete attribute error", err);
        toast.error("Failed to delete attribute");
        return;
      }
    }
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

  const startEdit = (type, uid) => {
    const arr = getArrayByType(type);
    const target = arr.find((x) => x.uid === uid);
    if (target) snapshotRef.current[uid] = { ...target };
    setEditingFlag(type, uid, true);
  };

  const saveEdit = async (type, uid) => {
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

    // persist via attributes API when variation selected
    if (selectedVariation && selectedVariation.id) {
      try {
        const fd = new FormData();
        fd.append("variation_id", String(selectedVariation.id));
        fd.append("attribute_name", String(target.value));
        fd.append("price", String(target.price ?? ""));
        if (target.imageFile) fd.append("image", target.imageFile);

        if (!target.id) {
          const res = await api.post("/admin/attributes/add", fd, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          const created = res?.data ?? res;
          const newId = created?.id ?? created?.data?.id ?? null;
          const image_url = created?.image_url ?? created?.data?.image_url ?? created?.data?.image ?? null;
          updateField(type, uid, "id", newId);
          if (image_url) updateField(type, uid, "imagePreview", image_url);
          toast.success("Attribute created");
        } else {
          await api.post(`/admin/attributes/update/${target.id}`, fd, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          toast.success("Attribute updated");
        }
      } catch (err) {
        console.error("persist attribute error", err);
        const msg = err?.response?.data?.message ?? err?.message ?? "Failed to save attribute";
        toast.error(String(msg));
        setErrors((e) => ({ ...e, [`save-${uid}`]: String(msg) }));
        return;
      }
    }

    delete snapshotRef.current[uid];
    setEditingFlag(type, uid, false);
    setErrors((e) => {
      const copy = { ...e };
      delete copy[`value-${uid}`];
      delete copy[`price-${uid}`];
      delete copy[`save-${uid}`];
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
      if (type === "weight") setWeights((p) => p.filter((it) => it.uid !== uid));
      if (type === "size") setSizes((p) => p.filter((it) => it.uid !== uid));
      if (type === "color") setColors((p) => p.filter((it) => it.uid !== uid));
      if (type === "material") setMaterials((p) => p.filter((it) => it.uid !== uid));
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

  /* ------------------------------
     Attributes API integration: fetch & populate
  ------------------------------ */
  const fetchAttributes = async () => {
    setAttrsLoading(true);
    try {
      const res = await api.get("/admin/attributes");
      const data = res?.data ?? res;
      const list = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
      setAttributesRaw(list);
    } catch (err) {
      console.error("fetchAttributes error", err);
      toast.error("Failed to load attributes");
      setAttributesRaw([]);
    } finally {
      setAttrsLoading(false);
    }
  };

  const populatePanelsFromAttributes = (variation) => {
    if (!variation || !variation.id) return;
    const vid = variation.id;
    const list = (attributesRaw || []).filter((a) => {
      const attrVid = a.variation_id ?? a.variationId ?? a.variation ?? a.variations_id ?? a.variationId;
      if (attrVid != null) return String(attrVid) === String(vid);
      const nested = a.variation?.id ?? a.Variation?.id;
      if (nested != null) return String(nested) === String(vid);
      return false;
    });

    const mappedType = mapVariationNameToType(variation.name ?? variation.value ?? "");
    const typesToPopulate = Array.isArray(mappedType) ? mappedType : mappedType ? [mappedType] : [];
    if (typesToPopulate.length === 0) return;

    const toEntry = (a) => ({
      uid: makeUid("v"),
      id: a.id ?? a.ID ?? null,
      value: a.attribute_name ?? a.attribute ?? a.value ?? "",
      price: a.price ?? a.amount ?? a.price ?? "",
      imageFile: null,
      imagePreview: a.image_url ?? a.image ?? "",
      editing: false,
    });

    typesToPopulate.forEach((t) => {
      const items = list.map(toEntry);
      if (t === "weight") setWeights(items);
      if (t === "size") setSizes(items);
      if (t === "color") setColors(items);
      if (t === "material") setMaterials(items);
    });
  };

  /* ------------------------------
     fetch variations (server) and attributes on mount
  ------------------------------ */
  const fetchVariationsList = async () => {
    setVariationsLoading(true);
    setVariationsError(null);
    try {
      const res = await api.get("/admin/variation");
      const data = res?.data ?? res;
      const list = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
      setVariationsList(list);
    } catch (err) {
      console.error("fetchVariationsList error", err);
      setVariationsError(err?.response?.data?.message ?? err?.message ?? "Failed to fetch variations");
      toast.error("Failed to load variations");
    } finally {
      setVariationsLoading(false);
    }
  };

  useEffect(() => {
    fetchVariationsList();
    fetchAttributes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedVariation) populatePanelsFromAttributes(selectedVariation);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attributesRaw, selectedVariation]);

  const onVariationSelectChange = async (val) => {
    if (!val) {
      setSelectedVariation(null);
      return;
    }
    const found = variationsList.find((v) => String(v.id ?? v.ID ?? v.value) === String(val));
    setSelectedVariation(found ?? null);

    try {
      // try filtered fetch (if API supports query param)
      let res;
      try {
        res = await api.get(`/admin/attributes?variation_id=${String(found.id ?? found.ID ?? found.value)}`);
      } catch {
        res = await api.get(`/admin/attributes`);
      }
      const data = res?.data ?? res;
      const list = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
      setAttributesRaw(list);
    } catch (err) {
      console.error("onVariationSelectChange fetch attributes error", err);
      populatePanelsFromAttributes(found);
    }
  };

  /* ------------------------------
     Variant JSON building + save (unchanged)
  ------------------------------ */
  const buildVariantsJson = () => ({
    weight: weights.map((w) => ({ uid: w.uid, id: w.id, value: w.value, price: w.price })),
    size: sizes.map((s) => ({ uid: s.uid, id: s.id, value: s.value, price: s.price })),
    color: colors.map((c) => ({ uid: c.uid, id: c.id, value: c.value, price: c.price })),
    material: materials.map((m) => ({ uid: m.uid, id: m.id, value: m.value, price: m.price })),
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
    const visible = visibleTypesForStore(storeType, selectedVariation);
    const total =
      (visible.includes("weight") ? weights.length : 0) +
      (visible.includes("size") ? sizes.length : 0) +
      (visible.includes("color") ? colors.length : 0) +
      (visible.includes("material") ? materials.length : 0);
    if (total === 0) err.variants = "Add at least one variant (visible for the selected variation).";
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

  /* ------------------------------
     Small UI helpers & renderEntry (kept same)
  ------------------------------ */
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

          <div className="flex items-center gap-2 ml-1 mt-5">
            <div className="w-8 h-8 rounded-sm overflow-hidden border bg-slate-50 flex items-center justify-center">
              {e.imagePreview ? <img src={e.imagePreview} alt={`variant-${e.uid}`} className="w-full h-full object-cover" /> : <div className="text-[11px] text-slate-400">No</div>}
            </div>
          </div>

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

          <div className="ml-auto flex flex-col gap-2">
            {!editable ? (
              <div className="flex gap-2">
                <button type="button" onClick={() => startEdit(type, e.uid)} className="inline-flex items-center gap-2 px-2 py-1 rounded border bg-white text-xs hover:bg-slate-50">
                  Edit
                </button>
                <button type="button" onClick={() => removeEntry(type, e.uid)} className="inline-flex items-center gap-2 px-2 py-1 rounded border text-xs hover:bg-red-50">
                  Delete
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <button type="button" onClick={() => saveEdit(type, e.uid)} className="inline-flex items-center gap-2 px-2 py-1 rounded border bg-emerald-600 text-white text-xs hover:bg-emerald-700">
                  Save
                </button>
                <button type="button" onClick={() => cancelEdit(type, e.uid)} className="inline-flex items-center gap-2 px-2 py-1 rounded border text-xs hover:bg-slate-100">
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const visibleTypes = visibleTypesForStore(storeType, selectedVariation);

  /* ------------------------------
     --- MISSING functions fixed below ---
     createVariation / updateVariation / deleteVariation
     (these were missing in your last paste — that produced the issue)
  ------------------------------ */

  const createVariation = async () => {
    const name = String(variationFormName || "").trim();
    if (!name) {
      toast.error("Name required");
      return;
    }
    setVariationSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("name", name);
      const res = await api.post("/admin/variation/add", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Variation created");
      setIsVariationModalOpen(false);
      setVariationFormName("");
      await fetchVariationsList();
      return res;
    } catch (err) {
      console.error("createVariation error", err);
      const msg = err?.response?.data?.message ?? err?.message ?? "Failed to create variation";
      toast.error(String(msg));
      throw err;
    } finally {
      setVariationSubmitting(false);
    }
  };

  const updateVariation = async () => {
    const name = String(variationFormName || "").trim();
    if (!name) {
      toast.error("Name required");
      return;
    }
    if (!variationEditingId) {
      toast.error("No variation selected to update");
      return;
    }
    setVariationSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("name", name);
      const res = await api.post(`/admin/variation/update/${variationEditingId}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Variation updated");
      setIsVariationModalOpen(false);
      setVariationFormName("");
      setVariationEditingId(null);
      await fetchVariationsList();
      return res;
    } catch (err) {
      console.error("updateVariation error", err);
      const msg = err?.response?.data?.message ?? err?.message ?? "Failed to update variation";
      toast.error(String(msg));
      throw err;
    } finally {
      setVariationSubmitting(false);
    }
  };

  const deleteVariation = async (id) => {
    if (!id) return;
    // eslint-disable-next-line no-restricted-globals
    if (!confirm("Delete this variation? This cannot be undone.")) return;
    try {
      await api.delete(`/admin/variation/delete/${id}`);
      toast.success("Variation deleted");
      await fetchVariationsList();
    } catch (err) {
      console.error("deleteVariation error", err);
      const msg = err?.response?.data?.message ?? err?.message ?? "Failed to delete variation";
      toast.error(String(msg));
      throw err;
    }
  };

  /* ------------------------------
     Render (kept your layout + behaviour)
  ------------------------------ */
  return (
    <div className="w-full max-w-full mx-auto p-4 flex flex-col items-start justify-start">
      <h3 className="text-lg font-semibold mb-3">Manage Variants</h3>

      <div className="bg-white p-4 rounded-lg shadow-sm w-full">
        <div className="flex items-center justify-flex-start gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="text-sm font-medium">Variation</div>
            <select
              className="border rounded px-3 py-2 text-sm"
              disabled={variationsLoading || variationsError}
              value={selectedVariation ? String(selectedVariation.id ?? selectedVariation.ID ?? selectedVariation.value) : ""}
              onChange={(e) => onVariationSelectChange(e.target.value)}
            >
              <option value="">-- Select --</option>
              {variationsList.map((s) => (
                <option key={s.id ?? s.ID ?? s.value} value={s.id ?? s.ID ?? s.value}>
                  {s.name ?? s.value ?? `#${s.id ?? s.ID}`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Button
              onClick={() => {
                setVariationEditingId(null);
                setVariationFormName("");
                setIsVariationModalOpen(true);
              }}
            >
              Add Variants
            </Button>
          </div>

          <div className="text-sm text-slate-500 ml-auto">{attrsLoading ? "Loading attributes..." : `${(attributesRaw || []).length} attributes`}</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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

      {/* Variation modal */}
      {isVariationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => {
              if (!variationSubmitting) setIsVariationModalOpen(false);
            }}
          />
          <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md p-4 z-10">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-lg font-semibold">{variationEditingId ? "Edit Variant (Server)" : "Add Variant"}</h4>
              <button
                type="button"
                onClick={() => {
                  if (!variationSubmitting) {
                    setIsVariationModalOpen(false);
                    setVariationFormName("");
                    setVariationEditingId(null);
                  }
                }}
                className="text-sm px-2 py-1 rounded hover:bg-slate-100"
              >
                Close
              </button>
            </div>

            <div>
              <label className="text-xs text-slate-600">Name</label>
              <input
                value={variationFormName}
                onChange={(e) => setVariationFormName(e.target.value)}
                placeholder="Enter variant name"
                className="w-full border rounded px-3 py-2 mt-1 text-sm"
                disabled={variationSubmitting}
              />
            </div>

            <div className="mt-4 flex justify-between items-center gap-2">
              <div>{variationSubmitting ? <div className="text-sm text-slate-500">Saving...</div> : null}</div>

              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    setIsVariationModalOpen(false);
                    setVariationFormName("");
                    setVariationEditingId(null);
                  }}
                  className="bg-white"
                  disabled={variationSubmitting}
                >
                  Cancel
                </Button>

                <Button
                  onClick={async () => {
                    try {
                      if (variationEditingId) {
                        await updateVariation();
                      } else {
                        await createVariation();
                      }
                    } catch {
                      /* handled above */
                    }
                  }}
                  disabled={variationSubmitting || !String(variationFormName || "").trim()}
                >
                  {variationSubmitting ? "Saving..." : variationEditingId ? "Update" : "Create"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Server variations quick list */}
      <div className="border rounded-lg p-3 bg-gray-50 wmt-4" >
        <div className="bg-white p-3 rounded shadow-sm">
          <div className="flex items-center justify-evenly mb-2">
            <div className="text-xs text-slate-500">{variationsLoading ? "Loading..." : `${variationsList.length} items`}</div>
          </div>

          {variationsError ? (
            <div className="text-sm text-red-600">Error: {variationsError}</div>
          ) : variationsList.length === 0 ? (
            <div className="text-sm text-slate-500"></div>
          ) : (
            <div className="space-y-2">
              {variationsList.map((v) => (
                <div key={v.id ?? v.ID ?? v.value} className="flex items-center justify-between border rounded p-2">
                  <div className="text-sm">{v.name ?? v.value ?? `#${v.id ?? v.ID}`}</div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => {
                        setVariationEditingId(v?.id ?? v?.ID ?? null);
                        setVariationFormName(String(v?.name ?? v?.value ?? ""));
                        setIsVariationModalOpen(true);
                      }}
                      className="text-xs py-1 px-2"
                    >
                      Edit
                    </Button>
                    <button
                      type="button"
                      onClick={async () => {
                        // delete variation (unchanged)
                        // eslint-disable-next-line no-restricted-globals
                        if (!confirm("Delete this variation? This cannot be undone.")) return;
                        try {
                          await api.delete(`/admin/variation/delete/${v.id ?? v.ID}`);
                          toast.success("Variation deleted");
                          await fetchVariationsList();
                        } catch (err) {
                          console.error("deleteVariation error", err);
                          toast.error("Failed to delete variation");
                        }
                      }}
                      title="Delete"
                      className="inline-flex items-center gap-2 px-2 py-1 rounded border text-xs hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* -------------------------
   Helper API functions used earlier by your code (kept as-is)
   -------------------------*/
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
  const res = await api.post(`/admin/products/${productId}/variants`, fd, { headers: { "Content-Type": "multipart/form-data" } }).catch(() => ({}));
  return res.data ?? res;
}

/* -------------------------
   Additional server-attribute helper functions (optional exports)
   -------------------------*/
export async function createAttributeApi({ variation_id, attribute_name, price, imageFile = null }) {
  const fd = new FormData();
  fd.append("variation_id", String(variation_id));
  fd.append("attribute_name", String(attribute_name));
  fd.append("price", String(price ?? ""));
  if (imageFile) fd.append("image", imageFile);
  const res = await api.post("/admin/attributes/add", fd, { headers: { "Content-Type": "multipart/form-data" } });
  return res.data ?? res;
}

export async function updateAttributeApi(id, { variation_id, attribute_name, price, imageFile = null }) {
  const fd = new FormData();
  if (variation_id != null) fd.append("variation_id", String(variation_id));
  if (attribute_name != null) fd.append("attribute_name", String(attribute_name));
  if (price != null) fd.append("price", String(price));
  if (imageFile) fd.append("image", imageFile);
  const res = await api.post(`/admin/attributes/update/${id}`, fd, { headers: { "Content-Type": "multipart/form-data" } });
  return res.data ?? res;
}
