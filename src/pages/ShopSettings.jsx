


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
//   // Example endpoint: adjust to your route
//   // const res = await api.post(`/admin/products/${productId}/variants`, fd, { headers: { "Content-Type": "multipart/form-data" } });
//   return res.data ?? res;
// }

// /* ---------------- Component ---------------- */
// export default function VariantsEditor({ productId = null, initialVariants = {}, onChange = null }) {
//   // Order: weight -> size -> color
//   const [tab, setTab] = useState("weight"); // "weight" | "size" | "color"

//   const normalizeInitial = (arr = []) =>
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

//   const [weights, setWeights] = useState(normalizeInitial(initialVariants.weight));
//   const [sizes, setSizes] = useState(normalizeInitial(initialVariants.size));
//   const [colors, setColors] = useState(normalizeInitial(initialVariants.color));

//   // errors
//   const [errors, setErrors] = useState({});
//   const [isSaving, setIsSaving] = useState(false);

//   const fileInputRef = useRef(null);

//   useEffect(() => {
//     if (onChange) {
//       onChange({
//         weight: weights.map((w) => ({ id: w.id, uid: w.uid, value: w.value, price: w.price, imagePreview: w.imagePreview })),
//         size: sizes.map((s) => ({ id: s.id, uid: s.uid, value: s.value, price: s.price, imagePreview: s.imagePreview })),
//         color: colors.map((c) => ({ id: c.id, uid: c.uid, value: c.value, price: c.price, imagePreview: c.imagePreview })),
//       });
//     }
//   }, [weights, sizes, colors, onChange]);

//   const addEntry = (type) => {
//     const entry = { uid: makeUid("v"), value: "", price: "", imageFile: null, imagePreview: "" };
//     if (type === "weight") setWeights((p) => [...p, entry]);
//     if (type === "size") setSizes((p) => [...p, entry]);
//     if (type === "color") setColors((p) => [...p, entry]);
//   };

//   const removeEntry = (type, uid) => {
//     if (type === "weight") setWeights((p) => p.filter((it) => it.uid !== uid));
//     if (type === "size") setSizes((p) => p.filter((it) => it.uid !== uid));
//     if (type === "color") setColors((p) => p.filter((it) => it.uid !== uid));
//   };

//   const updateField = (type, uid, key, val) => {
//     const updater = (arr) => arr.map((it) => (it.uid === uid ? { ...it, [key]: val } : it));
//     if (type === "weight") setWeights((p) => updater(p));
//     if (type === "size") setSizes((p) => updater(p));
//     if (type === "color") setColors((p) => updater(p));
//   };

//   const handleImageChange = (type, uid, e) => {
//     const file = e.target.files?.[0] ?? null;
//     const clear = () => {
//       const c = (arr) => arr.map((it) => (it.uid === uid ? { ...it, imageFile: null, imagePreview: "" } : it));
//       if (type === "weight") setWeights((p) => c(p));
//       if (type === "size") setSizes((p) => c(p));
//       if (type === "color") setColors((p) => c(p));
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
//     };
//     reader.readAsDataURL(file);
//     try { e.currentTarget.value = ""; } catch {}
//   };

//   // build variants JSON expected by server
//   const buildVariantsJson = () => ({
//     weight: weights.map((w) => ({ uid: w.uid, value: w.value, price: w.price })),
//     size: sizes.map((s) => ({ uid: s.uid, value: s.value, price: s.price })),
//     color: colors.map((c) => ({ uid: c.uid, value: c.value, price: c.price })),
//   });

//   // collect variant files renamed to uid__originalName
//   const collectVariantFiles = () => {
//     const files = [];
//     const collect = (arr) => {
//       for (const v of arr) {
//         if (v.imageFile) {
//           try {
//             // create a new File with the uid prefix so server can map by filename
//             const f = new File([v.imageFile], `${v.uid}__${v.imageFile.name}`, { type: v.imageFile.type });
//             files.push(f);
//           } catch (err) {
//             // older browsers may not allow File constructor; fallback
//             files.push(v.imageFile);
//           }
//         }
//       }
//     };
//     collect(weights);
//     collect(sizes);
//     collect(colors);
//     return files;
//   };

//   // validation: ensure at least one variant and values set
//   const validate = () => {
//     const err = {};
//     const total = weights.length + sizes.length + colors.length;
//     if (total === 0) err.variants = "Add at least one variant (weight, size or color)";
//     [...weights, ...sizes, ...colors].forEach((v) => {
//       if (!String(v.value).trim()) err[`value-${v.uid}`] = "Value required";
//       if (v.price && !isValidMoney(v.price)) err[`price-${v.uid}`] = "Invalid price";
//     });
//     setErrors(err);
//     return Object.keys(err).length === 0;
//   };

 
//   const saveVariants = async () => {
//   if (!validate()) {
//     toast.error("Fix variant errors");
//     return;
//   }
//   setIsSaving(true);
//   try {
//     const variantsJson = buildVariantsJson();
//     const variantFiles = collectVariantFiles();

//     // Console logs for debugging
//     console.log("Saving variants — productId:", productId ?? "(none)");
//     console.log("variantsJson:", JSON.stringify(variantsJson, null, 2));
//     console.log(
//       "variantFiles:",
//       variantFiles.map((f) => ({ name: f.name, size: f.size, type: f.type }))
//     );

//     let res;
//     if (productId) {
//       // console.log(`Calling updateVariantsApi for productId=${productId}`);
//       res = await updateVariantsApi(productId, variantsJson, variantFiles);
//     } else {
//       console.log("Calling createVariantsApi (no productId)");
//       res = await createVariantsApi(variantsJson, variantFiles);
//     }

//     // console.log("saveVariants response:", res);
//     toast.success("Variants saved ✅");

//     // ✅ Clear all variant fields after successful save
//     setWeights([]);
//     setSizes([]);
//     setColors([]);
//     setErrors({});
//     return res;
//   } catch (err) {
//     console.error("saveVariants error:", err, err?.response?.data);
//     const msg = err?.response?.data?.message ?? err?.message ?? "Failed to save variants";
//     toast.error(String(msg));
//     throw err;
//        setWeights([]);
//     setSizes([]);
//     setColors([]);
//   } finally {
//     setIsSaving(false);
//        setWeights([]);
//     setSizes([]);
//     setColors([]);
//   }
// };

//   const renderEntry = (type, e) => (
//     <div key={e.uid} className="p-3 border rounded grid gap-2">
//       <div className="flex gap-3">
//         <div className="flex-1">
//           <label className="text-xs text-slate-600">{type === "size" ? "Size" : type === "color" ? "Color" : "Weight"}</label>
//           {type === "size" ? (
//             <select
//               value={e.value}
//               onChange={(ev) => updateField(type, e.uid, "value", ev.target.value)}
//               className="mt-1 block w-full border rounded p-2 text-sm"
//             >
//               <option value="">Select size</option>
//               <option value="S">S</option>
//               <option value="M">M</option>
//               <option value="L">L</option>
//               <option value="XL">XL</option>
//               <option value="XXL">XXL</option>
//                {/* <option value="XS">XXL</option> */}
//             </select>
//           ) : (
//             <input
//               value={e.value}
//               onChange={(ev) => updateField(type, e.uid, "value", ev.target.value)}
//               className="mt-1 block w-full border rounded p-2 text-sm"
//               placeholder={type === "color" ? "e.g. Red" : "e.g. 250g"}
//             />
//           )}
//           {errors[`value-${e.uid}`] && <div className="text-xs text-red-600 mt-1">{errors[`value-${e.uid}`]}</div>}
//         </div>

//         <div className="w-48">
//           <label className="text-xs text-slate-600">Price</label>
//           <input
//             value={e.price}
//             onChange={(ev) => updateField(type, e.uid, "price", ev.target.value)}
//             className="mt-1 block w-full border rounded p-2 text-sm"
//             placeholder="₹ 0.00"
//           />
//           {errors[`price-${e.uid}`] && <div className="text-xs text-red-600 mt-1">{errors[`price-${e.uid}`]}</div>}
//         </div>
//       </div>

//       <div className="flex items-center gap-3">
//         <div className="w-12 h-12 rounded overflow-hidden border bg-slate-100 flex items-center justify-center">
//           {e.imagePreview ? <img src={e.imagePreview} alt={`variant-${e.uid}`} className="w-full h-full object-cover" /> : <div className="text-xs text-slate-400">No</div>}
//         </div>

//         <input
//           type="file"
//           accept="image/*"
//           onChange={(ev) => handleImageChange(type, e.uid, ev)}
//           aria-label={`Upload image for ${type} ${e.value || ""}`}
//         />

//         <div className="flex-1 text-right">
//           <button
//             type="button"
//             onClick={() => removeEntry(type, e.uid)}
//             className="inline-flex items-center justify-center p-1 rounded border hover:bg-red-50"
//             aria-label={`Remove ${type} variant`}
//           >
//             <Trash2 className="w-4 h-4 text-red-600" />
//           </button>
//         </div>
//       </div>
//     </div>
//   );
//   return (
//     <div className="w-[100%] max-w-full mx-auto p-6 flex flex-col items-start justify-start">
//       <h3 className="text-lg font-semibold mb-3">Add Variant</h3>

//       <div className="bg-white p-4 rounded shadow">
//         {/* tabs */}
//         <div className="flex items-center gap-2 mb-4">
//           <button type="button" onClick={() => setTab("weight")} className={`px-3 py-1 rounded ${tab === "weight" ? "bg-slate-900 text-white" : "bg-slate-50"}`}>Weights</button>
//           <button type="button" onClick={() => setTab("size")} className={`px-3 py-1 rounded ${tab === "size" ? "bg-slate-900 text-white" : "bg-slate-50"}`}>Sizes</button>
//           <button type="button" onClick={() => setTab("color")} className={`px-3 py-1 rounded ${tab === "color" ? "bg-slate-900 text-white" : "bg-slate-50"}`}>Colors</button>

//           <div/>

//           <button type="button" onClick={() => addEntry(tab)} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border hover:bg-slate-50 text-sm">
//             <Plus className="w-3 h-3" /> Add {tab}
//           </button>
//         </div>

//         {/* body */}
//         <div className="space-y-3">
//           {tab === "weight" && (
//             <>
//               {weights.length === 0 ? (
//                 <div className="text-sm text-slate-500 p-2">No weights yet. Click Add weight to create.</div>
//               ) : (
//                 <div className="grid gap-3">{weights.map((w) => renderEntry("weight", w))}</div>
//               )}
//             </>
//           )}

//           {tab === "size" && (
//             <>
//               {sizes.length === 0 ? (
//                 <div className="text-sm text-slate-500 p-2">No sizes yet. Click Add size to create.</div>
//               ) : (
//                 <div className="grid gap-3">{sizes.map((s) => renderEntry("size", s))}</div>
//               )}
//             </>
//           )}

//           {tab === "color" && (
//             <>
//               {colors.length === 0 ? (
//                 <div className="text-sm text-slate-500 p-2">No colors yet. Click Add color to create.</div>
//               ) : (
//                 <div className="grid gap-3">{colors.map((c) => renderEntry("color", c))}</div>
//               )}
//             </>
//           )}
//         </div>

//         {errors.variants && <div className="text-sm text-red-600 mt-3">{errors.variants}</div>}

//         <div className="mt-4 flex justify-end gap-2">
//           <Button
//             type="button"
//             onClick={() => {
//               // reset only variants
//               setWeights([]);
//               setSizes([]);
//               setColors([]);
//               setErrors({});
//             }}
//           >
//             Reset
//           </Button>

//           <Button
//             // type="button"
//             onClick={async () => {
//               try {
//                 await saveVariants();
//               } catch {
//                 /* errors handled in saveVariants */
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
  // adjust endpoint if needed
  const res = await api.post(`/admin/products/${productId}/variants`, fd, { headers: { "Content-Type": "multipart/form-data" } }).catch(() => ({}));
  return res.data ?? res;
}

/* ---------------- Component ---------------- */
export default function VariantsEditor({ productId = null, initialVariants = {}, onChange = null }) {
  const [weights, setWeights] = useState(
    Array.isArray(initialVariants.weight)
      ? initialVariants.weight.map((it) => ({ uid: it.uid || makeUid("v"), id: it.id, value: it.value ?? "", price: it.price ?? "", imageFile: null, imagePreview: it.image_url ?? it.imagePreview ?? "" }))
      : []
  );
  const [sizes, setSizes] = useState(
    Array.isArray(initialVariants.size)
      ? initialVariants.size.map((it) => ({ uid: it.uid || makeUid("v"), id: it.id, value: it.value ?? "", price: it.price ?? "", imageFile: null, imagePreview: it.image_url ?? it.imagePreview ?? "" }))
      : []
  );
  const [colors, setColors] = useState(
    Array.isArray(initialVariants.color)
      ? initialVariants.color.map((it) => ({ uid: it.uid || makeUid("v"), id: it.id, value: it.value ?? "", price: it.price ?? "", imageFile: null, imagePreview: it.image_url ?? it.imagePreview ?? "" }))
      : []
  );

  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (onChange) {
      onChange({
        weight: weights.map((w) => ({ id: w.id, uid: w.uid, value: w.value, price: w.price, imagePreview: w.imagePreview })),
        size: sizes.map((s) => ({ id: s.id, uid: s.uid, value: s.value, price: s.price, imagePreview: s.imagePreview })),
        color: colors.map((c) => ({ id: c.id, uid: c.uid, value: c.value, price: c.price, imagePreview: c.imagePreview })),
      });
    }
  }, [weights, sizes, colors, onChange]);

  const addEntry = (type) => {
    const entry = { uid: makeUid("v"), value: "", price: "", imageFile: null, imagePreview: "" };
    if (type === "weight") setWeights((p) => [...p, entry]);
    if (type === "size") setSizes((p) => [...p, entry]);
    if (type === "color") setColors((p) => [...p, entry]);
  };

  const removeEntry = (type, uid) => {
    if (type === "weight") setWeights((p) => p.filter((it) => it.uid !== uid));
    if (type === "size") setSizes((p) => p.filter((it) => it.uid !== uid));
    if (type === "color") setColors((p) => p.filter((it) => it.uid !== uid));
  };

  const updateField = (type, uid, key, val) => {
    const updater = (arr) => arr.map((it) => (it.uid === uid ? { ...it, [key]: val } : it));
    if (type === "weight") setWeights((p) => updater(p));
    if (type === "size") setSizes((p) => updater(p));
    if (type === "color") setColors((p) => updater(p));
  };

  const handleImageChange = (type, uid, e) => {
    const file = e.target.files?.[0] ?? null;
    const clear = () => {
      const c = (arr) => arr.map((it) => (it.uid === uid ? { ...it, imageFile: null, imagePreview: "" } : it));
      if (type === "weight") setWeights((p) => c(p));
      if (type === "size") setSizes((p) => c(p));
      if (type === "color") setColors((p) => c(p));
    };

    if (!file) {
      clear();
      return;
    }
    if (!file.type || !file.type.startsWith("image/")) {
      toast.error("Selected file is not an image.");
      try { e.currentTarget.value = ""; } catch {}
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      toast.error("Image too large (max 2MB).");
      try { e.currentTarget.value = ""; } catch {}
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const preview = String(reader.result ?? "");
      const updater = (arr) => arr.map((it) => (it.uid === uid ? { ...it, imageFile: file, imagePreview: preview } : it));
      if (type === "weight") setWeights((p) => updater(p));
      if (type === "size") setSizes((p) => updater(p));
      if (type === "color") setColors((p) => updater(p));
    };
    reader.readAsDataURL(file);
    try { e.currentTarget.value = ""; } catch {}
  };

  const buildVariantsJson = () => ({
    weight: weights.map((w) => ({ uid: w.uid, value: w.value, price: w.price })),
    size: sizes.map((s) => ({ uid: s.uid, value: s.value, price: s.price })),
    color: colors.map((c) => ({ uid: c.uid, value: c.value, price: c.price })),
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
    return files;
  };

  const validate = () => {
    const err = {};
    const total = weights.length + sizes.length + colors.length;
    if (total === 0) err.variants = "Add at least one variant (weight, size or color)";
    [...weights, ...sizes, ...colors].forEach((v) => {
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
      setErrors({});
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

  const renderEntry = (type, e) => {
    const fileInputId = `file-${e.uid}`;
    const filename = e.imageFile?.name ? String(e.imageFile.name).split("/").pop() : "";
    const shortName = filename ? (filename.length > 18 ? filename.slice(0, 15) + "…" : filename) : "Choose";

    return (
      <div key={e.uid} className="p-2 border rounded-md bg-white shadow-sm">
        <div className="flex items-center gap-2">
          {/* Value - compact */}
          <div className="flex flex-col">
            <label className="text-xs text-slate-500">{type === "size" ? "Size" : type === "color" ? "Color" : "Weight"}</label>
            {type === "size" ? (
              <select
                value={e.value}
                onChange={(ev) => updateField(type, e.uid, "value", ev.target.value)}
                className="mt-1 block w-28 border border-slate-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-300"
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
                placeholder={type === "color" ? "Red" : "250g"}
              />
            )}
            {errors[`value-${e.uid}`] && <div className="text-[11px] text-red-600 mt-1">{errors[`value-${e.uid}`]}</div>}
          </div>

          {/* Price - compact */}
          <div className="flex flex-col">
            <label className="text-xs text-slate-500">Price</label>
            <input
              value={e.price}
              onChange={(ev) => updateField(type, e.uid, "price", ev.target.value)}
              className="mt-1 block w-20 border border-slate-200 rounded px-2 py-1 text-sm text-right focus:outline-none focus:ring-1 focus:ring-indigo-300"
              placeholder="0.00"
            />
            {errors[`price-${e.uid}`] && <div className="text-[11px] text-red-600 mt-1">{errors[`price-${e.uid}`]}</div>}
          </div>

          {/* Inline preview */}
          <div className="flex items-center gap-2 ml-1 mt-5">
            <div className="w-8 h-8 rounded-sm overflow-hidden border bg-slate-50 flex items-center justify-center">
              {e.imagePreview ? (
                <img src={e.imagePreview} alt={`variant-${e.uid}`} className="w-full h-full object-cover" />
              ) : (
                <div className="text-[11px] text-slate-400">No</div>
              )}
            </div>
          </div>

          {/* Compact file chooser (hidden input + label button) */}
          <div className="flex flex-col">
            <label className="text-xs text-slate-500">Image</label>
            <div className="mt-1 flex items-center gap-2">
              <input id={fileInputId} type="file" accept="image/*" onChange={(ev) => handleImageChange(type, e.uid, ev)} className="hidden" />
              <label
                htmlFor={fileInputId}
                className="inline-flex items-center gap-2 px-2 py-1 rounded border border-slate-200 text-xs cursor-pointer hover:bg-slate-50"
                title={filename || "Choose file"}
              >
                {shortName}
              </label>
              {filename ? (
                <button
                  type="button"
                  onClick={() => {
                    // clear file selection visually & state
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

          {/* Delete entry */}
          <div className="ml-auto">
            <button
              type="button"
              onClick={() => removeEntry(type, e.uid)}
              className="inline-flex items-center justify-center p-1.5 rounded border hover:bg-red-50 mt-5"
              aria-label={`Remove ${type} variant`}
            >
              <Trash2 className="w-4 h-4 text-red-600" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-full mx-auto p-4 flex flex-col items-start justify-start">
      <h3 className="text-lg font-semibold mb-3">Add Variants</h3>

      <div className="bg-white p-4 rounded-lg shadow-sm w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Weight column */}
          <div className="border rounded-lg p-3 bg-gray-50">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-sm font-medium">Weights</div>
                <div className="text-xs text-slate-500">{weights.length} items</div>
              </div>
              <button type="button" onClick={() => addEntry("weight")} className="inline-flex items-center gap-2 px-2 py-1 rounded-md border hover:bg-slate-100 text-sm bg-white">
                <Plus className="w-3 h-3" /> Add
              </button>
            </div>

            <div className="space-y-2">
              {weights.length === 0 ? <div className="text-sm text-slate-500 p-2">No weights yet.</div> : weights.map((w) => renderEntry("weight", w))}
            </div>
          </div>

          {/* Size column */}
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

            <div className="space-y-2">
              {sizes.length === 0 ? <div className="text-sm text-slate-500 p-2">No sizes yet.</div> : sizes.map((s) => renderEntry("size", s))}
            </div>
          </div>

          {/* Color column */}
          <div className="border rounded-lg p-3 bg-gray-50">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-sm font-medium">Colors</div>
                <div className="text-xs text-slate-500">{colors.length} items</div>
              </div>
              <button type="button" onClick={() => addEntry("color")} className="inline-flex items-center gap-2 px-2 py-1 rounded-md border hover:bg-slate-100 text-sm bg-white">
                <Plus className="w-3 h-3" /> Add
              </button>
            </div>

            <div className="space-y-2">
              {colors.length === 0 ? <div className="text-sm text-slate-500 p-2">No colors yet.</div> : colors.map((c) => renderEntry("color", c))}
            </div>
          </div>
        </div>

        {errors.variants && <div className="text-sm text-red-600 mt-3">{errors.variants}</div>}

        <div className="mt-4 flex justify-end gap-2">
          <Button
            type="button"
            onClick={() => {
              setWeights([]);
              setSizes([]);
              setColors([]);
              setErrors({});
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
