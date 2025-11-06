

// import React, { useEffect, useRef, useState } from "react";
// import { Card } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Plus, RefreshCw, Trash2, Edit3, Eye, X } from "lucide-react";
// import toast, { Toaster } from "react-hot-toast";
// import api from "../api/axios";
// import { IMAGES } from "../assets/images";
// import Editor from "./Editor";

// const defaultForm = {
//   name: "",
//   grams: "",
//   category: "",
//   price: "",
//   discount_amount: "",
//   discount_price: "",
//   sku: "",           // <-- added SKU
//   image: "",
//   description: "",
//   video_url: "",
// };

// export default function TestProducts() {
//   const basePath = "/admin/products";

//   // state
//   const [products, setProducts] = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);

//   // drawers & view
//   const [isDrawerOpen, setIsDrawerOpen] = useState(false);
//   const [isViewOpen, setIsViewOpen] = useState(false);
//   const [isEditMode, setIsEditMode] = useState(false);
//   const [editingId, setEditingId] = useState(null);
//   const [selectedProduct, setSelectedProduct] = useState(null);

//   // form
//   const [form, setForm] = useState({ ...defaultForm });
//   const [imageFile, setImageFile] = useState(null); // main image
//   const [errors, setErrors] = useState({});
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   // extra images
//   const [existingExtraImages, setExistingExtraImages] = useState([]);
//   const [removedExistingImageIds, setRemovedExistingImageIds] = useState([]);
//   const [newExtraFiles, setNewExtraFiles] = useState([]);
//   const [newExtraPreviews, setNewExtraPreviews] = useState([]);

//   // editor modal for description
//   const [isEditorOpen, setIsEditorOpen] = useState(false);
//   const descInputRef = useRef(null);
//   const firstInputRef = useRef(null);
//   const drawerRef = useRef(null);
//   const viewDrawerRef = useRef(null);
//   const catFileRef = useRef(null);

//   // category drawer
//   const [isCatDrawerOpen, setIsCatDrawerOpen] = useState(false);
//   const [catForm, setCatForm] = useState({ name: "", imagePreview: "" });
//   const [catEditingId, setCatEditingId] = useState(null);
//   const [catSubmitting, setCatSubmitting] = useState(false);
//   const [catLoading, setCatLoading] = useState(false);
//   const [catFile, setCatFile] = useState(null);

//   const MAX_IMAGE_BYTES = 2 * 1024 * 1024; // 2MB

//   const safeTrim = (v) => {
//     if (v === undefined || v === null) return undefined;
//     const s = String(v).trim();
//     return s === "" ? undefined : s;
//   };

//   const resolveImage = (p) => {
//     if (!p) return IMAGES.DummyImage;
//     if (typeof p === "string") {
//       const str = p.trim();
//       return str ? str : IMAGES.DummyImage;
//     }
//     const raw = p.image_url ?? p.image ?? p.imageUrl ?? p.photo ?? p.thumbnail ?? "";
//     const str = String(raw ?? "").trim();
//     if (!str) return IMAGES.DummyImage;
//     if (/^https?:\/\//i.test(str)) return str;
//     try {
//       const base = api?.defaults?.baseURL ?? window.location.origin;
//       const baseClean = base.endsWith("/") ? base : base + "/";
//       return new URL(str.replace(/^\/+/, ""), baseClean).toString();
//     } catch {
//       return IMAGES.Nutz;
//     }
//   };

//   function normalizeProduct(raw) {
//     if (!raw) return { id: `local-${Date.now()}`, name: "Untitled", price: "0" };
//     const id = raw.id ?? raw._id ?? raw.product_id ?? raw.slug ?? `local-${Date.now()}`;
//     let catRaw = raw.category ?? raw.cat ?? raw.category_id ?? null;
//     if (catRaw === "" || catRaw === 0) catRaw = null;
//     const category = catRaw && typeof catRaw === "object" ? { id: catRaw.id ?? catRaw._id, name: catRaw.name ?? catRaw.title ?? "" } : catRaw ?? null;
//     let imagesArr = [];
//     if (Array.isArray(raw.images)) imagesArr = raw.images;
//     else if (Array.isArray(raw.extra_images)) imagesArr = raw.extra_images;
//     const normalizedImages = imagesArr
//       .map((it) => {
//         if (!it) return null;
//         if (typeof it === "string") return { url: String(it) };
//         if (typeof it === "object") {
//           const url = it.url ?? it.path ?? it.image ?? it.image_url ?? "";
//           const idVal = it.id ?? it.image_id ?? it._id ?? undefined;
//           return url ? { id: idVal, url: String(url) } : null;
//         }
//         return null;
//       })
//       .filter(Boolean);
//     const variantsRaw = raw.variants ?? raw.options ?? raw.product_variants ?? undefined;
//     let finalVariants = undefined;
//     if (variantsRaw && typeof variantsRaw === "object") finalVariants = variantsRaw;
//     return {
//       id,
//       name: String(raw.name ?? raw.title ?? "Untitled"),
//       price: String(raw.price ?? raw.amount ?? raw.cost ?? "0"),
//       grams: raw.grams ?? raw.gram ?? raw.weight ?? "",
//       discount_amount: safeTrim(raw.discount_amount ?? raw.discountAmount) ?? "",
//       discount_price: safeTrim(raw.discount_price ?? raw.discountPrice) ?? "",
//       sku: safeTrim(raw.sku ?? raw.SKU ?? "") ?? "", // include SKU if present in raw
//       image: raw.image ?? raw.image_url ?? undefined,
//       image_url: raw.image_url ?? raw.image ?? undefined,
//       images: normalizedImages.length ? normalizedImages : undefined,
//       category,
//       stock: raw.stock ?? raw.qty ?? null,
//       slug: raw.slug ?? "",
//       video_url: raw.video_url ?? raw.videoUrl ?? null,
//       variants: finalVariants,
//       ...raw,
//     };
//   }

//   // ---------------- API calls (unchanged)
//   const fetchCategories = async () => {
//     setCatLoading(true);
//     try {
//       const res = await api.get("/admin/categories/show");
//       const body = res.data ?? res;
//       let rows = [];
//       if (Array.isArray(body)) rows = body;
//       else if (Array.isArray(body.data)) rows = body.data;
//       else {
//         const arr = Object.values(body || {}).find((v) => Array.isArray(v));
//         if (Array.isArray(arr)) rows = arr;
//       }
//       const normalizedCats = rows
//         .map((r) => {
//           const id = String(r.id ?? r._id ?? r.category_id ?? "").trim();
//           const name = String(r.name ?? r.title ?? r.label ?? "");
//           const image_url = r.image_url ?? r.image ?? null;
//           return id ? { id, name, image_url } : null;
//         })
//         .filter(Boolean);
//       const dedup = {};
//       normalizedCats.forEach((c) => (dedup[c.id] = c));
//       setCategories(Object.values(dedup));
//     } catch (err) {
//       console.error("fetchCategories failed:", err, err?.response?.data);
//       toast.error("Failed to load categories (dropdown may be incomplete)");
//     } finally {
//       setCatLoading(false);
//     }
//   };

//   const fetchProducts = async () => {
//     setIsLoading(true);
//     try {
//       const res = await api.get(`${basePath}/show`);
//       const body = res.data ?? res;
//       if (!body || typeof body !== "object") throw new Error("Unexpected response from server");
//       let rows = [];
//       const payload = body.data ?? body;
//       if (Array.isArray(payload)) rows = payload;
//       else if (Array.isArray(payload.data)) rows = payload.data;
//       else {
//         const arr = Object.values(payload || {}).find((v) => Array.isArray(v));
//         if (Array.isArray(arr)) rows = arr;
//       }
//       const normalized = rows.map((r) => normalizeProduct(r));
//       setProducts(normalized);
//     } catch (err) {
//       console.error("fetchProducts failed:", err, err?.response?.data);
//       const message = err?.response?.data?.message ?? err?.message ?? "Failed to load products";
//       toast.error(message);
//       setProducts([]);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const createProductApi = async (payload, file, extraFiles) => {
//     const fd = new FormData();
//     if (payload.name !== undefined) fd.append("name", String(payload.name));
//     if (payload.price !== undefined) fd.append("price", String(payload.price));
//     if (payload.discount_price !== undefined) fd.append("discount_price", String(payload.discount_price));
//     if (payload.discount_amount !== undefined) fd.append("discount_amount", String(payload.discount_amount));
//     if (payload.grams !== undefined) fd.append("grams", String(payload.grams));
//     if (payload.category !== undefined && payload.category !== null) fd.append("category", String(payload.category));
//     if (payload.description !== undefined) fd.append("description", String(payload.description));
//     if (payload.video_url !== undefined && String(payload.video_url).trim() !== "") fd.append("video_url", String(payload.video_url));
//     if (payload.sku !== undefined && String(payload.sku).trim() !== "") fd.append("sku", String(payload.sku)); // <-- send SKU
//     if (file) fd.append("image", file);
//     if (Array.isArray(extraFiles)) extraFiles.forEach((f) => fd.append("images[]", f));
//     const res = await api.post(`${basePath}/add`, fd, { headers: { "Content-Type": "multipart/form-data" } });
//     return res.data ?? res;
//   };

//   const updateProductApi = async (id, payload, file, extraFiles, removeImageIds) => {
//     const fd = new FormData();
//     if (payload.name !== undefined) fd.append("name", String(payload.name));
//     if (payload.price !== undefined) fd.append("price", String(payload.price));
//     if (payload.discount_price !== undefined) fd.append("discount_price", String(payload.discount_price));
//     if (payload.discount_amount !== undefined) fd.append("discount_amount", String(payload.discount_amount));
//     if (payload.grams !== undefined) fd.append("grams", String(payload.grams));
//     if (payload.category !== undefined && payload.category !== null) fd.append("category", String(payload.category));
//     if (payload.description !== undefined) fd.append("description", String(payload.description));
//     if (payload.video_url !== undefined && String(payload.video_url).trim() !== "") fd.append("video_url", String(payload.video_url));
//     if (payload.sku !== undefined && String(payload.sku).trim() !== "") fd.append("sku", String(payload.sku)); // <-- send SKU
//     if (file) fd.append("image", file);
//     if (Array.isArray(extraFiles)) extraFiles.forEach((f) => fd.append("images[]", f));
//     if (Array.isArray(removeImageIds) && removeImageIds.length) fd.append("remove_image_ids", removeImageIds.join(","));
//     const res = await api.post(`${basePath}/update/${id}`, fd, { headers: { "Content-Type": "multipart/form-data" } });
//     return res.data ?? res;
//   };

//   const deleteProductApi = async (id) => {
//     const res = await api.delete(`${basePath}/delete/${id}`);
//     return res.data ?? res;
//   };

//   // lifecycle
//   useEffect(() => {
//     void fetchProducts();
//     void fetchCategories();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   // open add drawer
//   const openAddDrawer = () => {
//     setForm({ ...defaultForm });
//     setImageFile(null);
//     setNewExtraFiles([]);
//     setNewExtraPreviews([]);
//     setExistingExtraImages([]);
//     setRemovedExistingImageIds([]);
//     setErrors({});
//     setIsEditMode(false);
//     setEditingId(null);
//     setIsDrawerOpen(true);
//     setTimeout(() => firstInputRef.current?.focus(), 100);
//   };

//   const openEditDrawer = (p) => {
//     setIsEditMode(true);
//     setEditingId(p.id);
//     setForm({
//       name: safeTrim(p.name) ?? String(p.name ?? ""),
//       grams: safeTrim(p.grams) ?? String(p.grams ?? ""),
//       category: p.category && typeof p.category === "object" ? String(p.category.id ?? p.category.name ?? "") : String(p.category ?? ""),
//       price: safeTrim(p.price) ?? String(p.price ?? ""),
//       discount_amount: safeTrim(p.discount_amount) ?? String(p.discount_amount ?? ""),
//       discount_price: safeTrim(p.discount_price) ?? String(p.discount_price ?? ""),
//       sku: safeTrim(p.sku ?? "") ?? "", // populate SKU when editing
//       image: (p.image_url ?? p.image ?? ""),
//       description: safeTrim(p.description ?? "") ?? "",
//       video_url: safeTrim(p.video_url ?? "") ?? "",
//     });
//     setImageFile(null);

//     const extrasRaw = p.images ?? p.extra_images ?? [];
//     let extras = [];
//     if (Array.isArray(extrasRaw)) {
//       extras = extrasRaw
//         .map((it) => {
//           if (!it) return null;
//           if (typeof it === "string") return { url: String(it) };
//           if (typeof it === "object") {
//             const url = it.url ?? it.path ?? it.image ?? it.image_url ?? "";
//             const idVal = it.id ?? it.image_id ?? it._id ?? undefined;
//             return url ? { id: idVal, url: String(url) } : null;
//           }
//           return null;
//         })
//         .filter(Boolean);
//     }
//     setExistingExtraImages(extras);
//     setRemovedExistingImageIds([]);
//     setNewExtraFiles([]);
//     setNewExtraPreviews([]);
//     setIsDrawerOpen(true);
//     setTimeout(() => firstInputRef.current?.focus(), 120);
//   };

//   const openView = (p) => {
//     setSelectedProduct(p);
//     setIsViewOpen(true);
//     setTimeout(() => viewDrawerRef.current?.focus(), 120);
//   };

//   const resetForm = () => {
//     setForm({ ...defaultForm });
//     setImageFile(null);
//     setErrors({});
//     setIsEditMode(false);
//     setEditingId(null);
//     setExistingExtraImages([]);
//     setRemovedExistingImageIds([]);
//     setNewExtraFiles([]);
//     setNewExtraPreviews([]);
//   };

//   const validateForm = () => {
//     const e = {};
//     if (!String(form.name ?? "").trim()) e.name = "Name is required";
//     if (!String(form.price ?? "").trim()) e.price = "Price is required";
//     if (!String(form.category ?? "").trim()) e.category = "Category is required";
//     setErrors(e);
//     return Object.keys(e).length === 0;
//   };

//   const handleImageChange = (ev) => {
//     const file = ev.target.files?.[0] ?? null;
//     if (!file) return;
//     if (file.size > MAX_IMAGE_BYTES) {
//       toast.error("Image too large (max 2MB)");
//       try { ev.currentTarget.value = ""; } catch {}
//       return;
//     }
//     setImageFile(file);
//     setErrors((prev) => ({ ...prev, image: undefined }));
//     const reader = new FileReader();
//     reader.onload = () => setForm((f) => ({ ...f, image: reader.result }));
//     reader.readAsDataURL(file);
//   };

//   const handleAdditionalImagesChange = (ev) => {
//     const files = Array.from(ev.target.files ?? []);
//     if (!files.length) return;
//     const accepted = [];
//     for (const f of files) {
//       if (!f.type || !f.type.startsWith("image/")) {
//         toast.error(`${f.name} is not an image. Skipping.`);
//         continue;
//       }
//       if (f.size > MAX_IMAGE_BYTES) {
//         toast.error(`${f.name} is too large (max 2MB). Skipping.`);
//         continue;
//       }
//       accepted.push(f);
//     }
//     if (!accepted.length) {
//       try { ev.currentTarget.value = ""; } catch {}
//       return;
//     }
//     const mergedFiles = [...newExtraFiles, ...accepted].slice(0, 10);
//     const readers = accepted.map((f) => new Promise((res) => {
//       const r = new FileReader();
//       r.onload = () => res(String(r.result ?? ""));
//       r.readAsDataURL(f);
//     }));
//     Promise.all(readers)
//       .then((resArr) => {
//         const mergedPreviews = [...newExtraPreviews, ...resArr].slice(0, 10);
//         setNewExtraFiles(mergedFiles);
//         setNewExtraPreviews(mergedPreviews);
//       })
//       .catch(() => {
//         setNewExtraFiles(mergedFiles);
//       });
//     try { ev.currentTarget.value = ""; } catch {}
//   };

//   const removeNewExtraAt = (index) => {
//     setNewExtraFiles((prev) => prev.filter((_, i) => i !== index));
//     setNewExtraPreviews((prev) => prev.filter((_, i) => i !== index));
//   };

//   const removeExistingExtraByIndex = (index) => {
//     const toRemove = existingExtraImages[index];
//     if (!toRemove) return;
//     if (toRemove.id != null) {
//       setRemovedExistingImageIds((prev) => [...prev, toRemove.id]);
//     }
//     setExistingExtraImages((prev) => prev.filter((_, i) => i !== index));
//   };

//   // ---------- submit (create/update) without variants
//   const handleSubmit = async (e) => {
//     if (e) e.preventDefault();
//     setErrors((prev) => ({ ...prev, image: undefined }));

//     if (!validateForm()) {
//       toast.error("Please fix the highlighted fields");
//       return;
//     }

//     const nameTrimmed = safeTrim(form.name) ?? "";
//     const priceTrimmed = safeTrim(form.price) ?? "";
//     const discount_price_trimmed = safeTrim(form.discount_price);
//     const discount_amount_trimmed = safeTrim(form.discount_amount);
//     const grams_trimmed = safeTrim(form.grams);
//     const descriptionTrimmed = safeTrim(form.description) ?? "";
//     const videoUrlTrimmed = safeTrim(form.video_url) ?? "";
//     const skuTrimmed = safeTrim(form.sku) ?? ""; // get sku

//     let categoryToSend;
//     if (form.category !== "" && form.category != null) {
//       const trimmed = String(form.category).trim();
//       const asNum = Number(trimmed);
//       categoryToSend = !Number.isNaN(asNum) && /^\d+$/.test(trimmed) ? asNum : trimmed;
//     }

//     const payload = {
//       name: nameTrimmed,
//       price: priceTrimmed,
//       discount_price: discount_price_trimmed,
//       discount_amount: discount_amount_trimmed,
//       grams: grams_trimmed,
//       category: categoryToSend,
//       ...(descriptionTrimmed ? { description: descriptionTrimmed } : {}),
//       ...(videoUrlTrimmed ? { video_url: videoUrlTrimmed } : {}),
//       ...(skuTrimmed ? { sku: skuTrimmed } : {}), // include sku in payload
//     };

//     setIsSubmitting(true);
//     setErrors({});

//     if (isEditMode && editingId != null) {
//       const prev = products;
//       const updatedLocal = normalizeProduct({ ...payload, id: editingId });
//       setProducts((cur) => cur.map((p) => (String(p.id) === String(editingId) ? { ...p, ...updatedLocal } : p)));
//       try {
//         const res = await updateProductApi(editingId, payload, imageFile, newExtraFiles, removedExistingImageIds);
//         const body = res.data ?? res;
//         if (body && body.status === false) {
//           const msg = body.message ?? "Update failed";
//           toast.error(String(msg));
//           setProducts(prev);
//           setIsSubmitting(false);
//           return;
//         }
//         const updatedRaw = body?.data ?? body?.product ?? body;
//         const updated = normalizeProduct(updatedRaw);
//         setProducts((cur) => {
//           const without = cur.filter((x) => String(x.id) !== String(updated.id));
//           return [updated, ...without];
//         });
//         await fetchCategories();
//         toast.success("Product updated");
//         setIsDrawerOpen(false);
//         resetForm();
//       } catch (err) {
//         console.error("handleSubmit (update) error:", err, err?.response?.data);
//         setProducts(prev);
//         const rdata = err?.response?.data;
//         if (rdata && typeof rdata === "object") {
//           if (rdata.errors && typeof rdata.errors === "object") {
//             const mapped = {};
//             Object.keys(rdata.errors).forEach((k) => {
//               const val = rdata.errors[k];
//               mapped[k] = Array.isArray(val) ? String(val[0]) : String(val);
//             });
//             setErrors((p) => ({ ...p, ...mapped }));
//             toast.error("Fix validation errors");
//           } else {
//             toast.error(rdata.message ?? rdata.error ?? err?.message ?? "Update failed");
//           }
//         } else {
//           toast.error(err?.message ?? "Update failed");
//         }
//       } finally {
//         setIsSubmitting(false);
//         setImageFile(null);
//         setNewExtraFiles([]);
//         setNewExtraPreviews([]);
//         setRemovedExistingImageIds([]);
//       }
//     } else {
//       const tempId = `local-${Date.now()}`;
//       const tempProd = normalizeProduct({
//         id: tempId,
//         ...payload,
//         image: form.image ?? undefined,
//         images: newExtraPreviews,
//         video_url: payload.video_url ?? undefined,
//         sku: payload.sku ?? undefined,
//       });
//       setProducts((prev) => [tempProd, ...prev]);
//       try {
//         const res = await createProductApi(payload, imageFile, newExtraFiles);
//         const body = res.data ?? res;
//         if (body && body.status === false) {
//           const msg = body.message ?? "Add failed";
//           toast.error(String(msg));
//           setProducts((cur) => cur.filter((p) => String(p.id) !== String(tempId)));
//           setIsSubmitting(false);
//           return;
//         }
//         const createdRaw = body?.data ?? body?.product ?? body;
//         const created = normalizeProduct(createdRaw);
//         setProducts((cur) => {
//           const withoutTemp = cur.filter((p) => String(p.id) !== String(tempId));
//           return [created, ...withoutTemp];
//         });
//         await fetchCategories();
//         toast.success("Product added");
//         setIsDrawerOpen(false);
//         resetForm();
//       } catch (err) {
//         console.error("handleSubmit (create) error:", err, err?.response?.data);
//         setProducts((cur) => cur.filter((p) => String(p.id) !== String(tempId)));
//         const rdata = err?.response?.data;
//         if (rdata && typeof rdata === "object") {
//           if (rdata.errors && typeof rdata.errors === "object") {
//             const mapped = {};
//             Object.keys(rdata.errors).forEach((k) => {
//               const val = rdata.errors[k];
//               mapped[k] = Array.isArray(val) ? String(val[0]) : String(val);
//             });
//             setErrors((p) => ({ ...p, ...mapped }));
//             toast.error("Fix validation errors");
//           } else {
//             toast.error(rdata.message ?? err?.message ?? "Add failed");
//           }
//         } else {
//           toast.error(err?.message ?? "Add failed");
//         }
//       } finally {
//         setIsSubmitting(false);
//         setImageFile(null);
//         setNewExtraFiles([]);
//         setNewExtraPreviews([]);
//       }
//     }
//   };

//   const askDelete = (id) => {
//     if (!window.confirm("Delete this product? This cannot be undone.")) return;
//     confirmDelete(id);
//   };

//   const confirmDelete = async (id) => {
//     if (id == null) return;
//     const prev = products;
//     setProducts((cur) => cur.filter((p) => String(p.id) !== String(id)));
//     try {
//       const res = await deleteProductApi(id);
//       const body = res.data ?? res;
//       if (body && body.status === false) {
//         toast.error(body.message ?? "Delete failed");
//         setProducts(prev);
//       } else {
//         toast.success("Product deleted");
//         setSelectedProduct((s) => (s && String(s.id) === String(id) ? null : s));
//       }
//     } catch (err) {
//       console.error("Delete error:", err, err?.response?.data);
//       const message = err?.response?.data?.message ?? err?.message ?? "Failed to delete product";
//       toast.error(message);
//       setProducts(prev);
//     }
//   };

//   const handleRefresh = async () => {
//     await fetchProducts();
//     await fetchCategories();
//     toast.success("Refreshed");
//   };

//   useEffect(() => {
//     const onKey = (ev) => {
//       if (ev.key === "Escape") {
//         if (isDrawerOpen) setIsDrawerOpen(false);
//         if (isViewOpen) setIsViewOpen(false);
//         if (isCatDrawerOpen) setIsCatDrawerOpen(false);
//       }
//     };
//     window.addEventListener("keydown", onKey);
//     return () => window.removeEventListener("keydown", onKey);
//   }, [isDrawerOpen, isViewOpen, isCatDrawerOpen]);

//   // Category handlers (kept intact)
//   const openCatDrawer = () => {
//     setCatForm({ name: "", imagePreview: "" });
//     setCatEditingId(null);
//     setCatFile(null);
//     if (catFileRef.current) catFileRef.current.value = "";
//     setIsCatDrawerOpen(true);
//   };

//   const openCatEdit = (c) => {
//     setCatEditingId(c.id);
//     setCatForm({ name: c.name ?? "", imagePreview: c.image_url ?? "" });
//     setCatFile(null);
//     if (catFileRef.current) catFileRef.current.value = "";
//     setIsCatDrawerOpen(true);
//   };

//   const handleCatImageChange = (e) => {
//     const f = e.target.files?.[0] ?? null;
//     if (!f) {
//       setCatFile(null);
//       setCatForm((s) => ({ ...s, imagePreview: "" }));
//       return;
//     }
//     if (!f.type || !f.type.startsWith("image/")) {
//       toast.error("Selected file is not an image. Please choose a valid image file.");
//       if (catFileRef.current) catFileRef.current.value = "";
//       setCatFile(null);
//       setCatForm((s) => ({ ...s, imagePreview: "" }));
//       return;
//     }
//     if (f.size > MAX_IMAGE_BYTES) {
//       toast.error("Image too large (max 2MB). Please select a smaller file.");
//       if (catFileRef.current) catFileRef.current.value = "";
//       setCatFile(null);
//       setCatForm((s) => ({ ...s, imagePreview: "" }));
//       return;
//     }
//     setCatFile(f);
//     const r = new FileReader();
//     r.onload = () => setCatForm((s) => ({ ...s, imagePreview: String(r.result ?? "") }));
//     r.readAsDataURL(f);
//   };

//   const submitCategory = async (ev) => {
//     ev?.preventDefault();
//     const name = String(catForm.name ?? "").trim();
//     if (!name) {
//       toast.error("Category name is required");
//       return;
//     }
//     setCatSubmitting(true);
//     try {
//       if (catEditingId) {
//         const fd = new FormData();
//         fd.append("name", name);
//         if (catFile) fd.append("image", catFile);
//         const res = await api.post(`/admin/categories/update/${catEditingId}`, fd, { headers: { "Content-Type": "multipart/form-data" } });
//         const body = res.data ?? res;
//         if (body && body.status === false) throw new Error(String(body.message ?? "Update failed"));
//         toast.success("Category updated");
//       } else {
//         const fd = new FormData();
//         fd.append("name", name);
//         if (catFile) fd.append("image", catFile);
//         const res = await api.post("/admin/categories/add", fd, { headers: { "Content-Type": "multipart/form-data" } });
//         const body = res.data ?? res;
//         if (body && body.status === false) throw new Error(String(body.message ?? "Create failed"));
//         toast.success("Category created");
//       }
//       await fetchCategories();
//       setIsCatDrawerOpen(false);
//       setCatForm({ name: "", imagePreview: "" });
//       setCatEditingId(null);
//       setCatFile(null);
//       if (catFileRef.current) catFileRef.current.value = "";
//     } catch (err) {
//       console.error("category CRUD error:", err, err?.response?.data);
//       const msg = err?.response?.data?.message ?? err?.message ?? "Category save failed";
//       toast.error(String(msg));
//     } finally {
//       setCatSubmitting(false);
//     }
//   };
//   return (
//     <>
//       <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
//       <div className="w-full px-4 md:px-6 lg:px-8">
//         <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 w-full">
//           <div><h1 className="text-2xl sm:text-3xl font-bold">Products</h1></div>

//           <div className="flex items-center gap-2 w-full sm:w-auto p-2">
//             <Button variant="ghost" onClick={() => void handleRefresh()} aria-label="Refresh products" className="ml-2">
//               <RefreshCw className="h-4 w-4" />
//             </Button>
//             <Button onClick={() => openCatDrawer()} className="ml-2 "><Plus className="h-4 w-4 mr-2" /> Add Category</Button>
//             <Button onClick={() => openAddDrawer()} className="ml-2"><Plus className="h-4 w-4 mr-2" /> Add Product</Button>
//           </div>
//         </div>
//         <Card className="shadow-sm w-full">
//           <div className="w-full overflow-x-auto">
//             <table className="w-full min-w-[700px] md:min-w-full divide-y divide-slate-200">
//               <thead className="bg-slate-50">
//                 <tr>
//                   <th className="px-4 py-3 text-left text-sm font-medium w-12">S.no</th>
//                   <th className="px-4 py-3 text-left text-sm font-medium w-20">Image</th>
//                   <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
//                   <th className="px-4 py-3 text-left text-sm font-medium hidden sm:table-cell">Category (id)</th>
//                   <th className="px-4 py-3 text-left text-sm font-medium hidden md:table-cell">Grams</th>
//                   <th className="px-4 py-3 text-left text-sm font-medium">Price</th>
//                   <th className="px-4 py-3 text-left text-sm font-medium hidden lg:table-cell">Discount</th>
//                   <th className="px-4 py-3 text-left text-sm font-medium hidden lg:table-cell">Stock</th>
//                   <th className="px-4 py-3 text-right text-sm font-medium w-36">Actions</th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-slate-100">
//                 {isLoading ? (
//                   <tr><td colSpan={9} className="p-6 text-center">Loading products…</td></tr>
//                 ) : products.length === 0 ? (
//                   <tr><td colSpan={9} className="p-6 text-center text-slate-500">No products found.</td></tr>
//                 ) : (
//                   products.map((p, i) => (
//                     <tr key={String(p.id)}>
//                       <td className="px-4 py-3 text-sm align-middle">{i + 1}</td>
//                       <td className="px-4 py-3 align-middle">
//                         <div className="w-12 h-12 rounded-full overflow-hidden bg-white border">
//                           <img src={resolveImage(p)} alt={p.name ?? "product"} className="object-cover w-full h-full" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = IMAGES.DummyImage; }} />
//                         </div>
//                       </td>
//                       <td className="px-4 py-3 align-middle">
//                         <div className="text-sm font-medium truncate max-w-[220px] sm:max-w-none">{p.name}</div>
//                         <div className="text-xs text-slate-400 mt-1">{p.slug ?? ""}</div>
//                       </td>
//                       <td className="px-4 py-3 text-sm text-slate-600 align-middle hidden sm:table-cell">{p.category && typeof p.category === "object" ? p.category.name ?? "-" : p.category ?? "-"}</td>
//                       <td className="px-4 py-3 text-sm align-middle hidden md:table-cell">{p.grams ?? "-"}</td>
//                       <td className="px-4 py-3 text-sm align-middle">₹ {p.price}</td>
//                       <td className="px-4 py-3 text-sm align-middle hidden lg:table-cell">{p.discount_price ? `₹ ${p.discount_price}` : "-"}</td>
//                       <td className="px-4 py-3 text-sm align-middle hidden lg:table-cell">{p.stock ?? "-"}</td>
//                       <td className="px-4 py-3 text-sm text-right align-middle">
//                         <div className="flex items-center justify-end gap-2">
//                           <button onClick={() => openEditDrawer(p)} title="Edit" className="inline-flex items-center justify-center p-2 rounded border hover:bg-slate-50"><Edit3 className="w-4 h-4" /></button>
//                           <button onClick={() => askDelete(p.id)} title="Delete" className="inline-flex items-center justify-center p-2 rounded border hover:bg-slate-50"><Trash2 className="w-4 h-4" /></button>
//                           <button onClick={() => openView(p)} title="View" className="inline-flex items-center justify-center p-2 rounded border hover:bg-slate-50 md:hidden"><Eye className="w-4 h-4" /></button>
//                         </div>
//                       </td>
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </Card>
//         {isDrawerOpen && (
//           <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
//             <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => { setIsDrawerOpen(false); resetForm(); }} aria-hidden="true" />

//             <aside ref={drawerRef} className="fixed top-0 right-0 h-screen bg-white shadow-2xl overflow-auto rounded-l-2xl transform transition-transform duration-300 ease-in-out w-[50%]">
//               <div className="flex items-start justify-between p-6 border-b">
//                 <div><h3 className="text-xl font-semibold">{isEditMode ? "Edit Product" : "Add Product"}</h3></div>
//                 <button onClick={() => { setIsDrawerOpen(false); resetForm(); }} aria-label="Close drawer" className="inline-flex items-center justify-center h-10 w-10 rounded-md hover:bg-slate-100"><X className="h-5 w-5" /></button>
//               </div>

//               <div className="p-6">
//                 <form onSubmit={handleSubmit} className="space-y-4 w-full">
//                   <div className="flex flex-wrap gap-4">
//                     <div className="w-[30%] min-w-[220px]">
//                       <label className="block text-sm font-medium mb-1">Product Name <span className="text-red-500">*</span></label>
//                       <input ref={firstInputRef} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className={`block w-full border rounded-md p-2 focus:outline-none ${errors.name ? "border-red-400" : "border-slate-200"}`} placeholder="e.g. Shimla Apple" />
//                       {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
//                     </div>

//                     <div className="w-[30%] min-w-[220px]">
//                       <label className="block text-sm font-medium mb-1">Price <span className="text-red-500">*</span></label>
//                       <input value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} className={`block w-full border rounded-md p-2 ${errors.price ? "border-red-400" : "border-slate-200"}`} placeholder="1000.00" />
//                       {errors.price && <p className="text-xs text-red-500">{errors.price}</p>}
//                     </div>

//                     <div className="w-[30%] min-w-[220px]">
//                       <label className="block text-sm font-medium mb-1">Category <span className="text-red-500">*</span></label>
//                       <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className={`block w-full border rounded-md p-2 ${errors.category ? "border-red-400" : "border-slate-200"}`}>
//                         <option value="">-- Select category (id) --</option>
//                         {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
//                       </select>
//                       {errors.category && <p className="text-xs text-red-500">{errors.category}</p>}
//                     </div>

//                     <div className="w-[30%] min-w-[220px]">
//                       <label className="block text-sm font-medium mb-1">Discount Price</label>
//                       <input value={form.discount_price} onChange={(e) => setForm((f) => ({ ...f, discount_price: e.target.value }))} className="block w-full border rounded-md p-2" placeholder="800.00" />
//                     </div>

//                     {/* SKU field placed where Video URL previously was */}
//                     <div className="w-[30%] min-w-[220px]">
//                       <label className="block text-sm font-medium mb-1">SKU Code</label>
//                       <input value={form.sku} onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))} className="block w-full border rounded-md p-2" placeholder="e.g. SKU-12345" />
//                     </div>

//                     <div className="w-[30%] min-w-[220px]">
//                       <label className="block text-sm font-medium mb-1">Description <span className="text-red-500">*</span></label>
//                       <input
//                         ref={descInputRef}
//                         value={form.description}
//                         onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
//                         onFocus={() => setIsEditorOpen(true)}
//                         className={`block w-full border rounded-md p-2 focus:outline-none ${errors.description ? "border-red-400" : "border-slate-200"}`}
//                         placeholder="Click to edit description (rich text)"
//                         readOnly
//                       />
//                       {/* <div className="text-xs text-slate-400 mt-1">Click the field to open the rich text editor.</div> */}
//                       {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
//                     </div>
//                     <div className="w-[30%] min-w-[220px]">
//                       <label className="block text-sm font-medium mb-1">Upload Image</label>
//                       <input type="file" accept="image/*" onChange={handleImageChange} className="block w-full text-sm" />
//                       {errors.image && <p className="text-xs text-red-500 mt-1">{errors.image}</p>}
//                     </div>

//                     {/* Additional images + Video URL moved beside it */}
//                     <div className="w-[30%] min-w-[220px]">
//                       <label className="block text-sm font-medium mb-1">Additional images</label>
//                       <input type="file" accept="image/*" multiple onChange={handleAdditionalImagesChange} className="block w-full text-sm" />
//                     </div>

//                     <div className="w-[30%] min-w-[220px]">
//                       <label className="block text-sm font-medium mb-1">Video URL</label>
//                       <input value={form.video_url} onChange={(e) => setForm((f) => ({ ...f, video_url: e.target.value }))} className="block w-full border rounded-md p-2" placeholder="https://www.youtube.com/watch?v=" />
//                     </div>

//                     <div className="w-full mt-2">
//                       {existingExtraImages.length > 0 && (
//                         <div className="mt-3 grid grid-cols-4 gap-2">
//                           {existingExtraImages.map((img, idx) => (
//                             <div key={String(img.id ?? img.url)} className="relative w-full h-20 rounded-md overflow-hidden border">
//                               <img src={/^https?:\/\//.test(img.url) ? img.url : img.url} alt={`extra-${idx}`} className="w-full h-full object-cover" onError={(e)=>{ e.currentTarget.onerror=null; e.currentTarget.src = IMAGES.DummyImage; }} />
//                               <button type="button" onClick={() => removeExistingExtraByIndex(idx)} className="absolute top-1 right-1 p-1 rounded-full bg-white/80 hover:bg-white" title="Remove"><X className="w-3 h-3" /></button>
//                             </div>
//                           ))}
//                         </div>
//                       )}

//                       {newExtraPreviews.length > 0 && (
//                         <div className="mt-3 grid grid-cols-4 gap-2">
//                           {newExtraPreviews.map((p, idx) => (
//                             <div key={idx} className="relative w-full h-20 rounded-md overflow-hidden border">
//                               <img src={p} alt={`new-extra-${idx}`} className="w-full h-full object-cover" />
//                               <button type="button" onClick={() => removeNewExtraAt(idx)} className="absolute top-1 right-1 p-1 rounded-full bg-white/80 hover:bg-white" title="Remove"><X className="w-3 h-3" /></button>
//                             </div>
//                           ))}
//                         </div>
//                       )}
//                     </div>
//                   </div>

//                   <div className="flex items-center justify-end gap-3 mt-4">
//                     <Button variant="ghost" onClick={() => { resetForm(); setIsDrawerOpen(false); }}>Cancel</Button>
//                     <Button type="submit" disabled={isSubmitting}>{isSubmitting ? (isEditMode ? "Saving..." : "Adding...") : (isEditMode ? "Save" : "Add Product")}</Button>
//                   </div>
//                 </form>
//               </div>
//             </aside>
//           </div>
//         )}
//         {isCatDrawerOpen && (
//           <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Category management">
//             <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => { setIsCatDrawerOpen(false); setCatEditingId(null); setCatForm({ name: "", imagePreview: "" }); setCatFile(null); if (catFileRef.current) catFileRef.current.value = ""; }} aria-hidden="true" />
//             <aside className="fixed top-0 right-0 h-screen bg-white shadow-2xl overflow-auto rounded-l-2xl transform transition-transform duration-300 ease-in-out md:w-96 w-full" style={{ transform: isCatDrawerOpen ? "translateX(0)" : "translateX(100%)" }}>
//               <div className="flex items-start justify-between p-6 border-b">
//                 <div><h3 className="text-xl font-semibold">Categories</h3></div>
//                 <button onClick={() => { setIsCatDrawerOpen(false); setCatEditingId(null); setCatForm({ name: "", imagePreview: "" }); setCatFile(null); if (catFileRef.current) catFileRef.current.value = ""; }} className="inline-flex items-center justify-center h-10 w-10 rounded-md hover:bg-slate-100"><X className="h-5 w-5" /></button>
//               </div>
//               <div className="p-6 space-y-6">
//                 <form onSubmit={submitCategory} className="space-y-3">
//                   <div>
//                     <label className="block text-sm font-medium mb-1">Name</label>
//                     <input value={catForm.name} onChange={(e) => setCatForm((s) => ({ ...s, name: e.target.value }))} className="block w-full border rounded-md p-2" placeholder="e.g. Beverages" />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium mb-1">Image {catEditingId ? "(optional to replace)" : "(required)"}</label>
//                     <div className="flex items-start gap-3">
//                       <div className="w-20 h-20 rounded-md overflow-hidden bg-slate-100 border flex items-center justify-center">{catForm.imagePreview ? <img src={catForm.imagePreview} alt={catForm.name || "preview"} className="w-full h-full object-cover" /> : <div className="text-xs text-slate-400">No image</div>}</div>
//                       <div className="flex-1"><input ref={catFileRef} type="file" accept="image/*" onChange={handleCatImageChange} className="block w-full text-sm" /><p className="text-xs text-slate-400 mt-2">Max 2MB. Square images work best.</p></div>
//                     </div>
//                   </div>
//                   <div className="flex justify-end gap-2">
//                     {catEditingId && (<button type="button" onClick={() => { setCatEditingId(null); setCatForm({ name: "", imagePreview: "" }); setCatFile(null); if (catFileRef.current) catFileRef.current.value = ""; }} className="px-3 py-2 rounded-md border">New</button>)}
//                     <button type="submit" disabled={catSubmitting} className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700">{catSubmitting ? (catEditingId ? "Saving..." : "Creating...") : (catEditingId ? "Save" : "Create")}</button>
//                   </div>
//                 </form>

//                 <div>
//                   <div className="text-sm text-slate-600 mb-3">Available categories</div>
//                   <div className="space-y-2">
//                     {catLoading ? <div className="text-sm text-slate-500">Loading categories…</div> : categories.length === 0 ? <div className="text-sm text-slate-500">No categories yet.</div> : categories.map((c) => (
//                       <div key={c.id} className="flex items-center justify-between gap-3 p-2 rounded border">
//                         <div className="flex items-center gap-3 min-w-0">
//                           <div className="w-10 h-10 rounded-full overflow-hidden bg-white border flex-shrink-0"><img src={c.image_url ?? IMAGES.DummyImage} alt={c.name} className="w-full h-full object-cover" onError={(e)=>{e.currentTarget.onerror=null; e.currentTarget.src = IMAGES.DummyImage}} /></div>
//                           <div className="text-sm text-slate-800 truncate">{c.name}</div>
//                         </div>
//                         <div className="flex items-center gap-2">
//                           <button onClick={() => openCatEdit(c)} className="px-2 py-1 rounded border hover:bg-slate-50"><Edit3 className="w-4 h-4" /></button>
//                           <button onClick={() => { if (window.confirm("Delete category?")) { api.delete(`/admin/categories/delete/${c.id}`).then(()=>{ toast.success("Category deleted"); fetchCategories(); }).catch(()=>toast.error("Delete failed")); } }} className="px-2 py-1 rounded border hover:bg-red-50"><Trash2 className="w-4 h-4 text-red-600" /></button>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               </div>
//             </aside>
//           </div>
//         )}
//         {isViewOpen && selectedProduct && (
//           <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
//             <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsViewOpen(false)} />
//             <aside ref={viewDrawerRef} tabIndex={-1} className="fixed top-0 right-0 h-screen bg-white shadow-2xl overflow-auto rounded-l-2xl md:w-96 w-full p-6">
//               <div className="flex items-start justify-between border-b pb-3 mb-4">
//                 <div><h3 className="text-xl font-semibold">Product details</h3></div>
//                 <button onClick={() => setIsViewOpen(false)} className="inline-flex items-center justify-center h-10 w-10 rounded-md hover:bg-slate-100"><X className="h-5 w-5" /></button>
//               </div>
//               <div>
//                 <img src={resolveImage(selectedProduct)} alt={selectedProduct?.name ?? "product"} className="w-full h-44 object-cover rounded-md mb-4" onError={(e)=>{e.currentTarget.onerror=null; e.currentTarget.src = IMAGES.DummyImage}} />
//                 <div className="space-y-3">
//                   <div><div className="text-sm font-medium text-slate-500">Name</div><div className="mt-1 rounded-md border p-2 bg-gray-50">{selectedProduct.name}</div></div>
//                   <div><div className="text-sm font-medium text-slate-500">Price</div><div className="mt-1 rounded-md border p-2 bg-gray-50">₹ {selectedProduct.price}</div></div>
//                   <div><div className="text-sm font-medium text-slate-500">Grams</div><div className="mt-1 rounded-md border p-2 bg-gray-50">{selectedProduct.grams ?? "-"}</div></div>
//                   <div><div className="text-sm font-medium text-slate-500">Category</div><div className="mt-1 rounded-md border p-2 bg-gray-50">{selectedProduct.category && typeof selectedProduct.category === "object" ? (selectedProduct.category.name ?? selectedProduct.category.id) : (selectedProduct.category ?? "-")}</div></div>

//                   {selectedProduct.video_url && (<div><div className="text-sm font-medium text-slate-500">Video URL</div><div className="mt-1 rounded-md border p-2 bg-gray-50 break-all"><a href={selectedProduct.video_url} target="_blank" rel="noreferrer" className="text-indigo-600 underline">{selectedProduct.video_url}</a></div></div>)}
//                   <div>
//                     <div className="text-sm font-medium text-slate-500">Description</div>
//                     <div className="mt-1 rounded-md border p-2 bg-gray-50" dangerouslySetInnerHTML={{ __html: selectedProduct.description ?? "<em>No description</em>" }} />
//                   </div>
//                 </div>
//                 <div className="flex items-center justify-end mt-4"><Button variant="ghost" onClick={() => setIsViewOpen(false)}>Close</Button></div>
//               </div>
//             </aside>
//           </div>
//         )}
//         <Editor
//           open={isEditorOpen}
//           initialHtml={form.description || ""}
//           onClose={() => setIsEditorOpen(false)}
//           onSave={(html) => setForm((f) => ({ ...f, description: html }))}
//         />
//       </div>
//     </>
//   );
// }




import React, { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw, Trash2, Edit3, Eye, X } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import api from "../api/axios";
import { IMAGES } from "../assets/images";
import Editor from "./Editor";

const defaultForm = {
  name: "",
  grams: "",
  category: "",
  price: "",
  discount_amount: "",
  discount_price: "",
  sku: "",
  image: "",
  description: "",
  video_url: "",
  product_type: "", // new field
};

export default function TestProducts() {
  const basePath = "/admin/products";

  // state
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // drawers & view
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // form
  const [form, setForm] = useState({ ...defaultForm });
  const [imageFile, setImageFile] = useState(null); // main image
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // variant UI state (local/dummy)
  const [formVariants, setFormVariants] = useState([]); // array of variant objects

  // extra images
  const [existingExtraImages, setExistingExtraImages] = useState([]);
  const [removedExistingImageIds, setRemovedExistingImageIds] = useState([]);
  const [newExtraFiles, setNewExtraFiles] = useState([]);
  const [newExtraPreviews, setNewExtraPreviews] = useState([]);

  // editor modal for description
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const descInputRef = useRef(null);
  const firstInputRef = useRef(null);
  const drawerRef = useRef(null);
  const viewDrawerRef = useRef(null);
  const catFileRef = useRef(null);

  // category drawer
  const [isCatDrawerOpen, setIsCatDrawerOpen] = useState(false);
  const [catForm, setCatForm] = useState({ name: "", imagePreview: "" });
  const [catEditingId, setCatEditingId] = useState(null);
  const [catSubmitting, setCatSubmitting] = useState(false);
  const [catLoading, setCatLoading] = useState(false);
  const [catFile, setCatFile] = useState(null);

  const MAX_IMAGE_BYTES = 2 * 1024 * 1024; // 2MB

  const safeTrim = (v) => {
    if (v === undefined || v === null) return undefined;
    const s = String(v).trim();
    return s === "" ? undefined : s;
  };

  const resolveImage = (p) => {
    if (!p) return IMAGES.DummyImage;
    if (typeof p === "string") {
      const str = p.trim();
      return str ? str : IMAGES.DummyImage;
    }
    const raw = p.image_url ?? p.image ?? p.imageUrl ?? p.photo ?? p.thumbnail ?? "";
    const str = String(raw ?? "").trim();
    if (!str) return IMAGES.DummyImage;
    if (/^https?:\/\//i.test(str)) return str;
    try {
      const base = api?.defaults?.baseURL ?? window.location.origin;
      const baseClean = base.endsWith("/") ? base : base + "/";
      return new URL(str.replace(/^\/+/, ""), baseClean).toString();
    } catch {
      return IMAGES.Nutz;
    }
  };

  function normalizeProduct(raw) {
    if (!raw) return { id: `local-${Date.now()}`, name: "Untitled", price: "0" };
    const id = raw.id ?? raw._id ?? raw.product_id ?? raw.slug ?? `local-${Date.now()}`;
    let catRaw = raw.category ?? raw.cat ?? raw.category_id ?? null;
    if (catRaw === "" || catRaw === 0) catRaw = null;
    const category = catRaw && typeof catRaw === "object" ? { id: catRaw.id ?? catRaw._id, name: catRaw.name ?? catRaw.title ?? "" } : catRaw ?? null;
    let imagesArr = [];
    if (Array.isArray(raw.images)) imagesArr = raw.images;
    else if (Array.isArray(raw.extra_images)) imagesArr = raw.extra_images;
    const normalizedImages = imagesArr
      .map((it) => {
        if (!it) return null;
        if (typeof it === "string") return { url: String(it) };
        if (typeof it === "object") {
          const url = it.url ?? it.path ?? it.image ?? it.image_url ?? "";
          const idVal = it.id ?? it.image_id ?? it._id ?? undefined;
          return url ? { id: idVal, url: String(url) } : null;
        }
        return null;
      })
      .filter(Boolean);
    const variantsRaw = raw.variants ?? raw.options ?? raw.product_variants ?? undefined;
    let finalVariants = undefined;
    if (variantsRaw && typeof variantsRaw === "object") finalVariants = variantsRaw;
    return {
      id,
      name: String(raw.name ?? raw.title ?? "Untitled"),
      price: String(raw.price ?? raw.amount ?? raw.cost ?? "0"),
      grams: raw.grams ?? raw.gram ?? raw.weight ?? "",
      discount_amount: safeTrim(raw.discount_amount ?? raw.discountAmount) ?? "",
      discount_price: safeTrim(raw.discount_price ?? raw.discountPrice) ?? "",
      sku: safeTrim(raw.sku ?? raw.SKU ?? "") ?? "",
      image: raw.image ?? raw.image_url ?? undefined,
      image_url: raw.image_url ?? raw.image ?? undefined,
      images: normalizedImages.length ? normalizedImages : undefined,
      category,
      stock: raw.stock ?? raw.qty ?? null,
      slug: raw.slug ?? "",
      video_url: raw.video_url ?? raw.videoUrl ?? null,
      variants: finalVariants ?? raw.variants ?? raw.formVariants ?? undefined, // display variants if present
      product_type: raw.product_type ?? "",
      ...raw,
    };
  }

  // ---------------- API calls (unchanged)
  const fetchCategories = async () => {
    setCatLoading(true);
    try {
      const res = await api.get("/admin/categories/show");
      const body = res.data ?? res;
      let rows = [];
      if (Array.isArray(body)) rows = body;
      else if (Array.isArray(body.data)) rows = body.data;
      else {
        const arr = Object.values(body || {}).find((v) => Array.isArray(v));
        if (Array.isArray(arr)) rows = arr;
      }
      const normalizedCats = rows
        .map((r) => {
          const id = String(r.id ?? r._id ?? r.category_id ?? "").trim();
          const name = String(r.name ?? r.title ?? r.label ?? "");
          const image_url = r.image_url ?? r.image ?? null;
          return id ? { id, name, image_url } : null;
        })
        .filter(Boolean);
      const dedup = {};
      normalizedCats.forEach((c) => (dedup[c.id] = c));
      setCategories(Object.values(dedup));
    } catch (err) {
      console.error("fetchCategories failed:", err, err?.response?.data);
      toast.error("Failed to load categories (dropdown may be incomplete)");
    } finally {
      setCatLoading(false);
    }
  };

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`${basePath}/show`);
      const body = res.data ?? res;
      if (!body || typeof body !== "object") throw new Error("Unexpected response from server");
      let rows = [];
      const payload = body.data ?? body;
      if (Array.isArray(payload)) rows = payload;
      else if (Array.isArray(payload.data)) rows = payload.data;
      else {
        const arr = Object.values(payload || {}).find((v) => Array.isArray(v));
        if (Array.isArray(arr)) rows = arr;
      }
      const normalized = rows.map((r) => normalizeProduct(r));
      setProducts(normalized);
    } catch (err) {
      console.error("fetchProducts failed:", err, err?.response?.data);
      const message = err?.response?.data?.message ?? err?.message ?? "Failed to load products";
      toast.error(message);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const createProductApi = async (payload, file, extraFiles) => {
    const fd = new FormData();
    if (payload.name !== undefined) fd.append("name", String(payload.name));
    if (payload.price !== undefined) fd.append("price", String(payload.price));
    if (payload.discount_price !== undefined) fd.append("discount_price", String(payload.discount_price));
    if (payload.discount_amount !== undefined) fd.append("discount_amount", String(payload.discount_amount));
    if (payload.grams !== undefined) fd.append("grams", String(payload.grams));
    if (payload.category !== undefined && payload.category !== null) fd.append("category", String(payload.category));
    if (payload.description !== undefined) fd.append("description", String(payload.description));
    if (payload.video_url !== undefined && String(payload.video_url).trim() !== "") fd.append("video_url", String(payload.video_url));
    if (payload.sku !== undefined && String(payload.sku).trim() !== "") fd.append("sku", String(payload.sku));
    // NOTE: intentionally not changing API signature to send variants/product_type
    if (file) fd.append("image", file);
    if (Array.isArray(extraFiles)) extraFiles.forEach((f) => fd.append("images[]", f));
    const res = await api.post(`${basePath}/add`, fd, { headers: { "Content-Type": "multipart/form-data" } });
    return res.data ?? res;
  };

  const updateProductApi = async (id, payload, file, extraFiles, removeImageIds) => {
    const fd = new FormData();
    if (payload.name !== undefined) fd.append("name", String(payload.name));
    if (payload.price !== undefined) fd.append("price", String(payload.price));
    if (payload.discount_price !== undefined) fd.append("discount_price", String(payload.discount_price));
    if (payload.discount_amount !== undefined) fd.append("discount_amount", String(payload.discount_amount));
    if (payload.grams !== undefined) fd.append("grams", String(payload.grams));
    if (payload.category !== undefined && payload.category !== null) fd.append("category", String(payload.category));
    if (payload.description !== undefined) fd.append("description", String(payload.description));
    if (payload.video_url !== undefined && String(payload.video_url).trim() !== "") fd.append("video_url", String(payload.video_url));
    if (payload.sku !== undefined && String(payload.sku).trim() !== "") fd.append("sku", String(payload.sku));
    // NOTE: intentionally not changing API signature to send variants/product_type
    if (file) fd.append("image", file);
    if (Array.isArray(extraFiles)) extraFiles.forEach((f) => fd.append("images[]", f));
    if (Array.isArray(removeImageIds) && removeImageIds.length) fd.append("remove_image_ids", removeImageIds.join(","));
    const res = await api.post(`${basePath}/update/${id}`, fd, { headers: { "Content-Type": "multipart/form-data" } });
    return res.data ?? res;
  };

  const deleteProductApi = async (id) => {
    const res = await api.delete(`${basePath}/delete/${id}`);
    return res.data ?? res;
  };

  // lifecycle
  useEffect(() => {
    void fetchProducts();
    void fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // helper: generate dummy variants depending on type
  const dummyVariantsForType = (type) => {
    if (!type) return [];
    if (type === "9Nutz Sweet") {
      // weight variants
      return [
        { id: `v-${Date.now()}-1`, label: "100g", price: "120", stock: 50 },
        { id: `v-${Date.now()}-2`, label: "250g", price: "280", stock: 30 },
      ];
    }
    if (type === "Clothing") {
      // clothing variants with colors & price
      return [
        { id: `v-${Date.now()}-1`, color: "Red", size: "M", price: "799", stock: 20 },
        { id: `v-${Date.now()}-2`, color: "Blue", size: "L", price: "799", stock: 12 },
      ];
    }
    if (type === "Gold") {
      // gold grams variants
      return [
        { id: `v-${Date.now()}-1`, grams: "1g", price: "5000", purity: "24K" },
        { id: `v-${Date.now()}-2`, grams: "5g", price: "24000", purity: "24K" },
      ];
    }
    return [];
  };

  // open add drawer
  const openAddDrawer = () => {
    setForm({ ...defaultForm });
    setFormVariants([]); // reset variants
    setImageFile(null);
    setNewExtraFiles([]);
    setNewExtraPreviews([]);
    setExistingExtraImages([]);
    setRemovedExistingImageIds([]);
    setErrors({});
    setIsEditMode(false);
    setEditingId(null);
    setIsDrawerOpen(true);
    setTimeout(() => firstInputRef.current?.focus(), 100);
  };

  const openEditDrawer = (p) => {
    setIsEditMode(true);
    setEditingId(p.id);
    setForm({
      name: safeTrim(p.name) ?? String(p.name ?? ""),
      grams: safeTrim(p.grams) ?? String(p.grams ?? ""),
      category: p.category && typeof p.category === "object" ? String(p.category.id ?? p.category.name ?? "") : String(p.category ?? ""),
      price: safeTrim(p.price) ?? String(p.price ?? ""),
      discount_amount: safeTrim(p.discount_amount) ?? String(p.discount_amount ?? ""),
      discount_price: safeTrim(p.discount_price) ?? String(p.discount_price ?? ""),
      sku: safeTrim(p.sku ?? "") ?? "",
      image: (p.image_url ?? p.image ?? ""),
      description: safeTrim(p.description ?? "") ?? "",
      video_url: safeTrim(p.video_url ?? "") ?? "",
      product_type: p.product_type ?? "",
    });

    // If product has variants (from server), populate them; otherwise use dummy depending on category/type
    const incomingVariants = p.variants ?? p.options ?? p.product_variants ?? p.formVariants ?? null;
    if (incomingVariants && Array.isArray(incomingVariants) && incomingVariants.length) {
      setFormVariants(
        incomingVariants.map((v, idx) => ({ id: v.id ?? v._id ?? `v-${Date.now()}-${idx}`, ...v }))
      );
    } else {
      // load dummy variants if product_type known
      const type = p.product_type ?? "";
      setFormVariants(dummyVariantsForType(type));
    }

    setImageFile(null);

    const extrasRaw = p.images ?? p.extra_images ?? [];
    let extras = [];
    if (Array.isArray(extrasRaw)) {
      extras = extrasRaw
        .map((it) => {
          if (!it) return null;
          if (typeof it === "string") return { url: String(it) };
          if (typeof it === "object") {
            const url = it.url ?? it.path ?? it.image ?? it.image_url ?? "";
            const idVal = it.id ?? it.image_id ?? it._id ?? undefined;
            return url ? { id: idVal, url: String(url) } : null;
          }
          return null;
        })
        .filter(Boolean);
    }
    setExistingExtraImages(extras);
    setRemovedExistingImageIds([]);
    setNewExtraFiles([]);
    setNewExtraPreviews([]);
    setIsDrawerOpen(true);
    setTimeout(() => firstInputRef.current?.focus(), 120);
  };

  const openView = (p) => {
    setSelectedProduct(p);
    setIsViewOpen(true);
    setTimeout(() => viewDrawerRef.current?.focus(), 120);
  };

  const resetForm = () => {
    setForm({ ...defaultForm });
    setFormVariants([]);
    setImageFile(null);
    setErrors({});
    setIsEditMode(false);
    setEditingId(null);
    setExistingExtraImages([]);
    setRemovedExistingImageIds([]);
    setNewExtraFiles([]);
    setNewExtraPreviews([]);
  };

  const validateForm = () => {
    const e = {};
    if (!String(form.name ?? "").trim()) e.name = "Name is required";
    if (!String(form.price ?? "").trim()) e.price = "Price is required";
    if (!String(form.category ?? "").trim()) e.category = "Category is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleImageChange = (ev) => {
    const file = ev.target.files?.[0] ?? null;
    if (!file) return;
    if (file.size > MAX_IMAGE_BYTES) {
      toast.error("Image too large (max 2MB)");
      try { ev.currentTarget.value = ""; } catch {}
      return;
    }
    setImageFile(file);
    setErrors((prev) => ({ ...prev, image: undefined }));
    const reader = new FileReader();
    reader.onload = () => setForm((f) => ({ ...f, image: reader.result }));
    reader.readAsDataURL(file);
  };

  const handleAdditionalImagesChange = (ev) => {
    const files = Array.from(ev.target.files ?? []);
    if (!files.length) return;
    const accepted = [];
    for (const f of files) {
      if (!f.type || !f.type.startsWith("image/")) {
        toast.error(`${f.name} is not an image. Skipping.`);
        continue;
      }
      if (f.size > MAX_IMAGE_BYTES) {
        toast.error(`${f.name} is too large (max 2MB). Skipping.`);
        continue;
      }
      accepted.push(f);
    }
    if (!accepted.length) {
      try { ev.currentTarget.value = ""; } catch {}
      return;
    }
    const mergedFiles = [...newExtraFiles, ...accepted].slice(0, 10);
    const readers = accepted.map((f) => new Promise((res) => {
      const r = new FileReader();
      r.onload = () => res(String(r.result ?? ""));
      r.readAsDataURL(f);
    }));
    Promise.all(readers)
      .then((resArr) => {
        const mergedPreviews = [...newExtraPreviews, ...resArr].slice(0, 10);
        setNewExtraFiles(mergedFiles);
        setNewExtraPreviews(mergedPreviews);
      })
      .catch(() => {
        setNewExtraFiles(mergedFiles);
      });
    try { ev.currentTarget.value = ""; } catch {}
  };

  const removeNewExtraAt = (index) => {
    setNewExtraFiles((prev) => prev.filter((_, i) => i !== index));
    setNewExtraPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingExtraByIndex = (index) => {
    const toRemove = existingExtraImages[index];
    if (!toRemove) return;
    if (toRemove.id != null) {
      setRemovedExistingImageIds((prev) => [...prev, toRemove.id]);
    }
    setExistingExtraImages((prev) => prev.filter((_, i) => i !== index));
  };

  // variant helpers
  const onProductTypeChange = (type) => {
    setForm((f) => ({ ...f, product_type: type }));
    // set dummy variants for selected type
    setFormVariants(dummyVariantsForType(type));
  };

  const addVariantRow = () => {
    const type = form.product_type;
    if (!type) {
      toast.error("Please select product type first");
      return;
    }
    if (type === "9Nutz Sweet") {
      setFormVariants((prev) => [...prev, { id: `v-${Date.now()}`, label: "New weight", price: "", stock: 0 }]);
    } else if (type === "Clothing") {
      setFormVariants((prev) => [...prev, { id: `v-${Date.now()}`, color: "", size: "", price: "", stock: 0 }]);
    } else if (type === "Gold") {
      setFormVariants((prev) => [...prev, { id: `v-${Date.now()}`, grams: "", price: "", purity: "24K" }]);
    } else {
      setFormVariants((prev) => [...prev, { id: `v-${Date.now()}`, label: "Variant", price: "" }]);
    }
  };

  const removeVariantRow = (index) => {
    setFormVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const updateVariantField = (index, field, value) => {
    setFormVariants((prev) => prev.map((v, i) => (i === index ? { ...v, [field]: value } : v)));
  };

  // ---------- submit (create/update) without changing API calls
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setErrors((prev) => ({ ...prev, image: undefined }));

    if (!validateForm()) {
      toast.error("Please fix the highlighted fields");
      return;
    }

    const nameTrimmed = safeTrim(form.name) ?? "";
    const priceTrimmed = safeTrim(form.price) ?? "";
    const discount_price_trimmed = safeTrim(form.discount_price);
    const discount_amount_trimmed = safeTrim(form.discount_amount);
    const grams_trimmed = safeTrim(form.grams);
    const descriptionTrimmed = safeTrim(form.description) ?? "";
    const videoUrlTrimmed = safeTrim(form.video_url) ?? "";
    const skuTrimmed = safeTrim(form.sku) ?? "";

    let categoryToSend;
    if (form.category !== "" && form.category != null) {
      const trimmed = String(form.category).trim();
      const asNum = Number(trimmed);
      categoryToSend = !Number.isNaN(asNum) && /^\d+$/.test(trimmed) ? asNum : trimmed;
    }

    const payload = {
      name: nameTrimmed,
      price: priceTrimmed,
      discount_price: discount_price_trimmed,
      discount_amount: discount_amount_trimmed,
      grams: grams_trimmed,
      category: categoryToSend,
      ...(descriptionTrimmed ? { description: descriptionTrimmed } : {}),
      ...(videoUrlTrimmed ? { video_url: videoUrlTrimmed } : {}),
      ...(skuTrimmed ? { sku: skuTrimmed } : {}),
      // NOTE: we intentionally do NOT attach variants/product_type to API payload (preserve API calls)
    };

    setIsSubmitting(true);
    setErrors({});

    if (isEditMode && editingId != null) {
      const prev = products;
      const updatedLocal = normalizeProduct({ ...payload, id: editingId, product_type: form.product_type, formVariants });
      setProducts((cur) => cur.map((p) => (String(p.id) === String(editingId) ? { ...p, ...updatedLocal } : p)));
      try {
        const res = await updateProductApi(editingId, payload, imageFile, newExtraFiles, removedExistingImageIds);
        const body = res.data ?? res;
        if (body && body.status === false) {
          const msg = body.message ?? "Update failed";
          toast.error(String(msg));
          setProducts(prev);
          setIsSubmitting(false);
          return;
        }
        const updatedRaw = body?.data ?? body?.product ?? body;
        const updated = normalizeProduct(updatedRaw);
        // include local variants in display if server returns nothing
        if (!updated.variants && formVariants.length) updated.variants = formVariants;
        if (!updated.product_type && form.product_type) updated.product_type = form.product_type;
        setProducts((cur) => {
          const without = cur.filter((x) => String(x.id) !== String(updated.id));
          return [updated, ...without];
        });
        await fetchCategories();
        toast.success("Product updated");
        setIsDrawerOpen(false);
        resetForm();
      } catch (err) {
        console.error("handleSubmit (update) error:", err, err?.response?.data);
        setProducts(prev);
        const rdata = err?.response?.data;
        if (rdata && typeof rdata === "object") {
          if (rdata.errors && typeof rdata.errors === "object") {
            const mapped = {};
            Object.keys(rdata.errors).forEach((k) => {
              const val = rdata.errors[k];
              mapped[k] = Array.isArray(val) ? String(val[0]) : String(val);
            });
            setErrors((p) => ({ ...p, ...mapped }));
            toast.error("Fix validation errors");
          } else {
            toast.error(rdata.message ?? rdata.error ?? err?.message ?? "Update failed");
          }
        } else {
          toast.error(err?.message ?? "Update failed");
        }
      } finally {
        setIsSubmitting(false);
        setImageFile(null);
        setNewExtraFiles([]);
        setNewExtraPreviews([]);
        setRemovedExistingImageIds([]);
      }
    } else {
      const tempId = `local-${Date.now()}`;
      const tempProd = normalizeProduct({
        id: tempId,
        ...payload,
        image: form.image ?? undefined,
        images: newExtraPreviews,
        video_url: payload.video_url ?? undefined,
        sku: payload.sku ?? undefined,
        product_type: form.product_type ?? undefined,
        formVariants, // local only for immediate preview
      });
      setProducts((prev) => [tempProd, ...prev]);
      try {
        const res = await createProductApi(payload, imageFile, newExtraFiles);
        const body = res.data ?? res;
        if (body && body.status === false) {
          const msg = body.message ?? "Add failed";
          toast.error(String(msg));
          setProducts((cur) => cur.filter((p) => String(p.id) !== String(tempId)));
          setIsSubmitting(false);
          return;
        }
        const createdRaw = body?.data ?? body?.product ?? body;
        const created = normalizeProduct(createdRaw);
        // if server doesn't return variants but we have local variants, keep them in UI
        if (!created.variants && formVariants.length) created.variants = formVariants;
        if (!created.product_type && form.product_type) created.product_type = form.product_type;
        setProducts((cur) => {
          const withoutTemp = cur.filter((p) => String(p.id) !== String(tempId));
          return [created, ...withoutTemp];
        });
        await fetchCategories();
        toast.success("Product added");
        setIsDrawerOpen(false);
        resetForm();
        setFormVariants([]);
      } catch (err) {
        console.error("handleSubmit (create) error:", err, err?.response?.data);
        setProducts((cur) => cur.filter((p) => String(p.id) !== String(tempId)));
        const rdata = err?.response?.data;
        if (rdata && typeof rdata === "object") {
          if (rdata.errors && typeof rdata.errors === "object") {
            const mapped = {};
            Object.keys(rdata.errors).forEach((k) => {
              const val = rdata.errors[k];
              mapped[k] = Array.isArray(val) ? String(val[0]) : String(val);
            });
            setErrors((p) => ({ ...p, ...mapped }));
            toast.error("Fix validation errors");
          } else {
            toast.error(rdata.message ?? err?.message ?? "Add failed");
          }
        } else {
          toast.error(err?.message ?? "Add failed");
        }
      } finally {
        setIsSubmitting(false);
        setImageFile(null);
        setNewExtraFiles([]);
        setNewExtraPreviews([]);
      }
    }
  };

  const askDelete = (id) => {
    if (!window.confirm("Delete this product? This cannot be undone.")) return;
    confirmDelete(id);
  };

  const confirmDelete = async (id) => {
    if (id == null) return;
    const prev = products;
    setProducts((cur) => cur.filter((p) => String(p.id) !== String(id)));
    try {
      const res = await deleteProductApi(id);
      const body = res.data ?? res;
      if (body && body.status === false) {
        toast.error(body.message ?? "Delete failed");
        setProducts(prev);
      } else {
        toast.success("Product deleted");
        setSelectedProduct((s) => (s && String(s.id) === String(id) ? null : s));
      }
    } catch (err) {
      console.error("Delete error:", err, err?.response?.data);
      const message = err?.response?.data?.message ?? err?.message ?? "Failed to delete product";
      toast.error(message);
      setProducts(prev);
    }
  };

  const handleRefresh = async () => {
    await fetchProducts();
    await fetchCategories();
    toast.success("Refreshed");
  };

  useEffect(() => {
    const onKey = (ev) => {
      if (ev.key === "Escape") {
        if (isDrawerOpen) setIsDrawerOpen(false);
        if (isViewOpen) setIsViewOpen(false);
        if (isCatDrawerOpen) setIsCatDrawerOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isDrawerOpen, isViewOpen, isCatDrawerOpen]);

  // Category handlers (kept intact)
  const openCatDrawer = () => {
    setCatForm({ name: "", imagePreview: "" });
    setCatEditingId(null);
    setCatFile(null);
    if (catFileRef.current) catFileRef.current.value = "";
    setIsCatDrawerOpen(true);
  };

  const openCatEdit = (c) => {
    setCatEditingId(c.id);
    setCatForm({ name: c.name ?? "", imagePreview: c.image_url ?? "" });
    setCatFile(null);
    if (catFileRef.current) catFileRef.current.value = "";
    setIsCatDrawerOpen(true);
  };

  const handleCatImageChange = (e) => {
    const f = e.target.files?.[0] ?? null;
    if (!f) {
      setCatFile(null);
      setCatForm((s) => ({ ...s, imagePreview: "" }));
      return;
    }
    if (!f.type || !f.type.startsWith("image/")) {
      toast.error("Selected file is not an image. Please choose a valid image file.");
      if (catFileRef.current) catFileRef.current.value = "";
      setCatFile(null);
      setCatForm((s) => ({ ...s, imagePreview: "" }));
      return;
    }
    if (f.size > MAX_IMAGE_BYTES) {
      toast.error("Image too large (max 2MB). Please select a smaller file.");
      if (catFileRef.current) catFileRef.current.value = "";
      setCatFile(null);
      setCatForm((s) => ({ ...s, imagePreview: "" }));
      return;
    }
    setCatFile(f);
    const r = new FileReader();
    r.onload = () => setCatForm((s) => ({ ...s, imagePreview: String(r.result ?? "") }));
    r.readAsDataURL(f);
  };

  const submitCategory = async (ev) => {
    ev?.preventDefault();
    const name = String(catForm.name ?? "").trim();
    if (!name) {
      toast.error("Category name is required");
      return;
    }
    setCatSubmitting(true);
    try {
      if (catEditingId) {
        const fd = new FormData();
        fd.append("name", name);
        if (catFile) fd.append("image", catFile);
        const res = await api.post(`/admin/categories/update/${catEditingId}`, fd, { headers: { "Content-Type": "multipart/form-data" } });
        const body = res.data ?? res;
        if (body && body.status === false) throw new Error(String(body.message ?? "Update failed"));
        toast.success("Category updated");
      } else {
        const fd = new FormData();
        fd.append("name", name);
        if (catFile) fd.append("image", catFile);
        const res = await api.post("/admin/categories/add", fd, { headers: { "Content-Type": "multipart/form-data" } });
        const body = res.data ?? res;
        if (body && body.status === false) throw new Error(String(body.message ?? "Create failed"));
        toast.success("Category created");
      }
      await fetchCategories();
      setIsCatDrawerOpen(false);
      setCatForm({ name: "", imagePreview: "" });
      setCatEditingId(null);
      setCatFile(null);
      if (catFileRef.current) catFileRef.current.value = "";
    } catch (err) {
      console.error("category CRUD error:", err, err?.response?.data);
      const msg = err?.response?.data?.message ?? err?.message ?? "Category save failed";
      toast.error(String(msg));
    } finally {
      setCatSubmitting(false);
    }
  };
  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      <div className="w-full px-4 md:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 w-full">
          <div><h1 className="text-2xl sm:text-3xl font-bold">Products</h1></div>

          <div className="flex items-center gap-2 w-full sm:w-auto p-2">
            <Button variant="ghost" onClick={() => void handleRefresh()} aria-label="Refresh products" className="ml-2">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button onClick={() => openCatDrawer()} className="ml-2 "><Plus className="h-4 w-4 mr-2" /> Add Category</Button>
            <Button onClick={() => openAddDrawer()} className="ml-2"><Plus className="h-4 w-4 mr-2" /> Add Product</Button>
          </div>
        </div>
        <Card className="shadow-sm w-full">
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[700px] md:min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium w-12">S.no</th>
                  <th className="px-4 py-3 text-left text-sm font-medium w-20">Image</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-medium hidden sm:table-cell">Category (id)</th>
                  <th className="px-4 py-3 text-left text-sm font-medium hidden md:table-cell">Grams</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Price</th>
                  <th className="px-4 py-3 text-left text-sm font-medium hidden lg:table-cell">Discount</th>
                  <th className="px-4 py-3 text-left text-sm font-medium hidden lg:table-cell">Stock</th>
                  <th className="px-4 py-3 text-right text-sm font-medium w-36">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {isLoading ? (
                  <tr><td colSpan={9} className="p-6 text-center">Loading products…</td></tr>
                ) : products.length === 0 ? (
                  <tr><td colSpan={9} className="p-6 text-center text-slate-500">No products found.</td></tr>
                ) : (
                  products.map((p, i) => (
                    <tr key={String(p.id)}>
                      <td className="px-4 py-3 text-sm align-middle">{i + 1}</td>
                      <td className="px-4 py-3 align-middle">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-white border">
                          <img src={resolveImage(p)} alt={p.name ?? "product"} className="object-cover w-full h-full" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = IMAGES.DummyImage; }} />
                        </div>
                      </td>
                      <td className="px-4 py-3 align-middle">
                        <div className="text-sm font-medium truncate max-w-[220px] sm:max-w-none">{p.name}</div>
                        <div className="text-xs text-slate-400 mt-1">{p.slug ?? ""}</div>
                        {p.product_type && <div className="text-xs mt-1 inline-block px-2 py-1 rounded bg-indigo-50 text-indigo-600 border border-indigo-100">{p.product_type}</div>}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600 align-middle hidden sm:table-cell">{p.category && typeof p.category === "object" ? p.category.name ?? "-" : p.category ?? "-"}</td>
                      <td className="px-4 py-3 text-sm align-middle hidden md:table-cell">{p.grams ?? "-"}</td>
                      <td className="px-4 py-3 text-sm align-middle">₹ {p.price}</td>
                      <td className="px-4 py-3 text-sm align-middle hidden lg:table-cell">{p.discount_price ? `₹ ${p.discount_price}` : "-"}</td>
                      <td className="px-4 py-3 text-sm align-middle hidden lg:table-cell">{p.stock ?? "-"}</td>
                      <td className="px-4 py-3 text-sm text-right align-middle">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openEditDrawer(p)} title="Edit" className="inline-flex items-center justify-center p-2 rounded border hover:bg-slate-50"><Edit3 className="w-4 h-4" /></button>
                          <button onClick={() => askDelete(p.id)} title="Delete" className="inline-flex items-center justify-center p-2 rounded border hover:bg-slate-50"><Trash2 className="w-4 h-4" /></button>
                          <button onClick={() => openView(p)} title="View" className="inline-flex items-center justify-center p-2 rounded border hover:bg-slate-50 md:hidden"><Eye className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {isDrawerOpen && (
          <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => { setIsDrawerOpen(false); resetForm(); }} aria-hidden="true" />

            <aside ref={drawerRef} className="fixed top-0 right-0 h-screen bg-white shadow-2xl overflow-auto rounded-l-2xl transform transition-transform duration-300 ease-in-out w-[50%]">
              <div className="flex items-start justify-between p-6 border-b">
                <div><h3 className="text-xl font-semibold">{isEditMode ? "Edit Product" : "Add Product"}</h3></div>
                <button onClick={() => { setIsDrawerOpen(false); resetForm(); }} aria-label="Close drawer" className="inline-flex items-center justify-center h-10 w-10 rounded-md hover:bg-slate-100"><X className="h-5 w-5" /></button>
              </div>

              <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4 w-full">
                  <div className="flex flex-wrap gap-4">
                    <div className="w-[30%] min-w-[220px]">
                      <label className="block text-sm font-medium mb-1">Product Name <span className="text-red-500">*</span></label>
                      <input ref={firstInputRef} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className={`block w-full border rounded-md p-2 focus:outline-none ${errors.name ? "border-red-400" : "border-slate-200"}`} placeholder="e.g. Shimla Apple" />
                      {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                    </div>

                    <div className="w-[30%] min-w-[220px]">
                      <label className="block text-sm font-medium mb-1">Price <span className="text-red-500">*</span></label>
                      <input value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} className={`block w-full border rounded-md p-2 ${errors.price ? "border-red-400" : "border-slate-200"}`} placeholder="1000.00" />
                      {errors.price && <p className="text-xs text-red-500">{errors.price}</p>}
                    </div>

                    <div className="w-[30%] min-w-[220px]">
                      <label className="block text-sm font-medium mb-1">Category <span className="text-red-500">*</span></label>
                      <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className={`block w-full border rounded-md p-2 ${errors.category ? "border-red-400" : "border-slate-200"}`}>
                        <option value="">-- Select category (id) --</option>
                        {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                      {errors.category && <p className="text-xs text-red-500">{errors.category}</p>}
                    </div>

                    {/* Product Type dropdown */}
                    <div className="w-[30%] min-w-[220px]">
                      <label className="block text-sm font-medium mb-1">Store Type</label>
                      <select value={form.product_type} onChange={(e) => onProductTypeChange(e.target.value)} className="block w-full border rounded-md p-2">
                        <option value="">-- Select type --</option>
                        <option value="9Nutz Sweet">9Nutz Sweet</option>
                        <option value="Clothing">Clothing</option>
                        <option value="Gold">Gold</option>
                      </select>
                      <p className="text-xs text-slate-400 mt-1">Variants change based on this type.</p>
                    </div>

                    <div className="w-[30%] min-w-[220px]">
                      <label className="block text-sm font-medium mb-1">Discount Price</label>
                      <input value={form.discount_price} onChange={(e) => setForm((f) => ({ ...f, discount_price: e.target.value }))} className="block w-full border rounded-md p-2" placeholder="800.00" />
                    </div>

                    <div className="w-[30%] min-w-[220px]">
                      <label className="block text-sm font-medium mb-1">SKU Code</label>
                      <input value={form.sku} onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))} className="block w-full border rounded-md p-2" placeholder="e.g. SKU-12345" />
                    </div>

                    <div className="w-[30%] min-w-[220px]">
                      <label className="block text-sm font-medium mb-1">Description <span className="text-red-500">*</span></label>
                      <input
                        ref={descInputRef}
                        value={form.description}
                        onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                        onFocus={() => setIsEditorOpen(true)}
                        className={`block w-full border rounded-md p-2 focus:outline-none ${errors.description ? "border-red-400" : "border-slate-200"}`}
                        placeholder="Click to edit description (rich text)"
                        readOnly
                      />
                      {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
                    </div>

                    <div className="w-[30%] min-w-[220px]">
                      <label className="block text-sm font-medium mb-1">Upload Image</label>
                      <input type="file" accept="image/*" onChange={handleImageChange} className="block w-full text-sm" />
                      {errors.image && <p className="text-xs text-red-500 mt-1">{errors.image}</p>}
                    </div>

                    <div className="w-[30%] min-w-[220px]">
                      <label className="block text-sm font-medium mb-1">Additional images</label>
                      <input type="file" accept="image/*" multiple onChange={handleAdditionalImagesChange} className="block w-full text-sm" />
                    </div>

                    <div className="w-[30%] min-w-[220px]">
                      <label className="block text-sm font-medium mb-1">Video URL</label>
                      <input value={form.video_url} onChange={(e) => setForm((f) => ({ ...f, video_url: e.target.value }))} className="block w-full border rounded-md p-2" placeholder="https://www.youtube.com/watch?v=" />
                    </div>

                    <div className="w-full mt-2">
                      {existingExtraImages.length > 0 && (
                        <div className="mt-3 grid grid-cols-4 gap-2">
                          {existingExtraImages.map((img, idx) => (
                            <div key={String(img.id ?? img.url)} className="relative w-full h-20 rounded-md overflow-hidden border">
                              <img src={/^https?:\/\//.test(img.url) ? img.url : img.url} alt={`extra-${idx}`} className="w-full h-full object-cover" onError={(e)=>{ e.currentTarget.onerror=null; e.currentTarget.src = IMAGES.DummyImage; }} />
                              <button type="button" onClick={() => removeExistingExtraByIndex(idx)} className="absolute top-1 right-1 p-1 rounded-full bg-white/80 hover:bg-white" title="Remove"><X className="w-3 h-3" /></button>
                            </div>
                          ))}
                        </div>
                      )}

                      {newExtraPreviews.length > 0 && (
                        <div className="mt-3 grid grid-cols-4 gap-2">
                          {newExtraPreviews.map((p, idx) => (
                            <div key={idx} className="relative w-full h-20 rounded-md overflow-hidden border">
                              <img src={p} alt={`new-extra-${idx}`} className="w-full h-full object-cover" />
                              <button type="button" onClick={() => removeNewExtraAt(idx)} className="absolute top-1 right-1 p-1 rounded-full bg-white/80 hover:bg-white" title="Remove"><X className="w-3 h-3" /></button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Variants Panel */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold">Variants</h4>
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={addVariantRow} className="inline-flex items-center gap-2 px-3 py-1 rounded border hover:bg-slate-50">
                          <Plus className="w-4 h-4" /> Add Variant
                        </button>
                        {/* <div className="text-xs text-slate-400">Dummy variants — replace with API later.</div> */}
                      </div>
                    </div>

                    <div className="space-y-3">
                      {form.product_type ? (
                        formVariants.length === 0 ? (
                          <div className="text-sm text-slate-500">No variants yet. Click "Add Variant" to create one.</div>
                        ) : (
                          formVariants.map((v, idx) => (
                            <div key={v.id ?? idx} className="p-3 border rounded-md bg-gray-50 flex flex-wrap gap-3 items-center">
                              {/* 9Nutz Sweet -> weight + price */}
                              {form.product_type === "9Nutz Sweet" && (
                                <>
                                  <div className="flex-1 min-w-[160px]">
                                    <label className="block text-xs text-slate-600">Weight</label>
                                    <input value={v.label ?? ""} onChange={(e) => updateVariantField(idx, "label", e.target.value)} className="block w-full border rounded-md p-2" />
                                  </div>
                                  <div className="w-[140px]">
                                    <label className="block text-xs text-slate-600">Price</label>
                                    <input value={v.price ?? ""} onChange={(e) => updateVariantField(idx, "price", e.target.value)} className="block w-full border rounded-md p-2" />
                                  </div>
                                  <div className="w-[120px]">
                                    <label className="block text-xs text-slate-600">Stock</label>
                                    <input type="number" value={v.stock ?? 0} onChange={(e) => updateVariantField(idx, "stock", Number(e.target.value))} className="block w-full border rounded-md p-2" />
                                  </div>
                                </>
                              )}

                              {/* Clothing -> color, size, price, stock */}
                              {form.product_type === "Clothing" && (
                                <>
                                  <div className="flex-1 min-w-[140px]">
                                    <label className="block text-xs text-slate-600">Color</label>
                                    <input value={v.color ?? ""} onChange={(e) => updateVariantField(idx, "color", e.target.value)} className="block w-full border rounded-md p-2" />
                                  </div>
                                  <div className="w-[110px]">
                                    <label className="block text-xs text-slate-600">Size</label>
                                    <input value={v.size ?? ""} onChange={(e) => updateVariantField(idx, "size", e.target.value)} className="block w-full border rounded-md p-2" />
                                  </div>
                                  <div className="w-[120px]">
                                    <label className="block text-xs text-slate-600">Price</label>
                                    <input value={v.price ?? ""} onChange={(e) => updateVariantField(idx, "price", e.target.value)} className="block w-full border rounded-md p-2" />
                                  </div>
                                  <div className="w-[100px]">
                                    <label className="block text-xs text-slate-600">Stock</label>
                                    <input type="number" value={v.stock ?? 0} onChange={(e) => updateVariantField(idx, "stock", Number(e.target.value))} className="block w-full border rounded-md p-2" />
                                  </div>
                                </>
                              )}

                              {/* Gold -> grams + price + purity */}
                              {form.product_type === "Gold" && (
                                <>
                                  <div className="flex-1 min-w-[160px]">
                                    <label className="block text-xs text-slate-600">Grams</label>
                                    <input value={v.grams ?? ""} onChange={(e) => updateVariantField(idx, "grams", e.target.value)} className="block w-full border rounded-md p-2" />
                                  </div>
                                  <div className="w-[140px]">
                                    <label className="block text-xs text-slate-600">Price</label>
                                    <input value={v.price ?? ""} onChange={(e) => updateVariantField(idx, "price", e.target.value)} className="block w-full border rounded-md p-2" />
                                  </div>
                                  <div className="w-[110px]">
                                    <label className="block text-xs text-slate-600">Purity</label>
                                    <select value={v.purity ?? "24K"} onChange={(e) => updateVariantField(idx, "purity", e.target.value)} className="block w-full border rounded-md p-2">
                                      <option value="24K">24K</option>
                                      <option value="22K">22K</option>
                                    </select>
                                  </div>
                                </>
                              )}

                              <div className="ml-auto">
                                <button type="button" onClick={() => removeVariantRow(idx)} className="inline-flex items-center gap-2 px-3 py-1 rounded border hover:bg-red-50 text-red-600">
                                  <X className="w-4 h-4" /> Remove
                                </button>
                              </div>
                            </div>
                          ))
                        )
                      ) : (
                        <div className="text-sm text-slate-500">Choose a product type to configure variants.</div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 mt-4">
                    <Button variant="ghost" onClick={() => { resetForm(); setIsDrawerOpen(false); }}>Cancel</Button>
                    <Button type="submit" disabled={isSubmitting}>{isSubmitting ? (isEditMode ? "Saving..." : "Adding...") : (isEditMode ? "Save" : "Add Product")}</Button>
                  </div>
                </form>
              </div>
            </aside>
          </div>
        )}

        {isCatDrawerOpen && (
          <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Category management">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => { setIsCatDrawerOpen(false); setCatEditingId(null); setCatForm({ name: "", imagePreview: "" }); setCatFile(null); if (catFileRef.current) catFileRef.current.value = ""; }} aria-hidden="true" />
            <aside className="fixed top-0 right-0 h-screen bg-white shadow-2xl overflow-auto rounded-l-2xl transform transition-transform duration-300 ease-in-out md:w-96 w-full" style={{ transform: isCatDrawerOpen ? "translateX(0)" : "translateX(100%)" }}>
              <div className="flex items-start justify-between p-6 border-b">
                <div><h3 className="text-xl font-semibold">Categories</h3></div>
                <button onClick={() => { setIsCatDrawerOpen(false); setCatEditingId(null); setCatForm({ name: "", imagePreview: "" }); setCatFile(null); if (catFileRef.current) catFileRef.current.value = ""; }} className="inline-flex items-center justify-center h-10 w-10 rounded-md hover:bg-slate-100"><X className="h-5 w-5" /></button>
              </div>
              <div className="p-6 space-y-6">
                <form onSubmit={submitCategory} className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Name</label>
                    <input value={catForm.name} onChange={(e) => setCatForm((s) => ({ ...s, name: e.target.value }))} className="block w-full border rounded-md p-2" placeholder="e.g. Beverages" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Image {catEditingId ? "(optional to replace)" : "(required)"}</label>
                    <div className="flex items-start gap-3">
                      <div className="w-20 h-20 rounded-md overflow-hidden bg-slate-100 border flex items-center justify-center">{catForm.imagePreview ? <img src={catForm.imagePreview} alt={catForm.name || "preview"} className="w-full h-full object-cover" /> : <div className="text-xs text-slate-400">No image</div>}</div>
                      <div className="flex-1"><input ref={catFileRef} type="file" accept="image/*" onChange={handleCatImageChange} className="block w-full text-sm" /><p className="text-xs text-slate-400 mt-2">Max 2MB. Square images work best.</p></div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    {catEditingId && (<button type="button" onClick={() => { setCatEditingId(null); setCatForm({ name: "", imagePreview: "" }); setCatFile(null); if (catFileRef.current) catFileRef.current.value = ""; }} className="px-3 py-2 rounded-md border">New</button>)}
                    <button type="submit" disabled={catSubmitting} className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700">{catSubmitting ? (catEditingId ? "Saving..." : "Creating...") : (catEditingId ? "Save" : "Create")}</button>
                  </div>
                </form>

                <div>
                  <div className="text-sm text-slate-600 mb-3">Available categories</div>
                  <div className="space-y-2">
                    {catLoading ? <div className="text-sm text-slate-500">Loading categories…</div> : categories.length === 0 ? <div className="text-sm text-slate-500">No categories yet.</div> : categories.map((c) => (
                      <div key={c.id} className="flex items-center justify-between gap-3 p-2 rounded border">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-white border flex-shrink-0"><img src={c.image_url ?? IMAGES.DummyImage} alt={c.name} className="w-full h-full object-cover" onError={(e)=>{e.currentTarget.onerror=null; e.currentTarget.src = IMAGES.DummyImage}} /></div>
                          <div className="text-sm text-slate-800 truncate">{c.name}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => openCatEdit(c)} className="px-2 py-1 rounded border hover:bg-slate-50"><Edit3 className="w-4 h-4" /></button>
                          <button onClick={() => { if (window.confirm("Delete category?")) { api.delete(`/admin/categories/delete/${c.id}`).then(()=>{ toast.success("Category deleted"); fetchCategories(); }).catch(()=>toast.error("Delete failed")); } }} className="px-2 py-1 rounded border hover:bg-red-50"><Trash2 className="w-4 h-4 text-red-600" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </aside>
          </div>
        )}

        {isViewOpen && selectedProduct && (
          <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsViewOpen(false)} />
            <aside ref={viewDrawerRef} tabIndex={-1} className="fixed top-0 right-0 h-screen bg-white shadow-2xl overflow-auto rounded-l-2xl md:w-96 w-full p-6">
              <div className="flex items-start justify-between border-b pb-3 mb-4">
                <div><h3 className="text-xl font-semibold">Product details</h3></div>
                <button onClick={() => setIsViewOpen(false)} className="inline-flex items-center justify-center h-10 w-10 rounded-md hover:bg-slate-100"><X className="h-5 w-5" /></button>
              </div>
              <div>
                <img src={resolveImage(selectedProduct)} alt={selectedProduct?.name ?? "product"} className="w-full h-44 object-cover rounded-md mb-4" onError={(e)=>{e.currentTarget.onerror=null; e.currentTarget.src = IMAGES.DummyImage}} />
                <div className="space-y-3">
                  <div><div className="text-sm font-medium text-slate-500">Name</div><div className="mt-1 rounded-md border p-2 bg-gray-50">{selectedProduct.name}</div></div>
                  <div><div className="text-sm font-medium text-slate-500">Price</div><div className="mt-1 rounded-md border p-2 bg-gray-50">₹ {selectedProduct.price}</div></div>
                  <div><div className="text-sm font-medium text-slate-500">Grams</div><div className="mt-1 rounded-md border p-2 bg-gray-50">{selectedProduct.grams ?? "-"}</div></div>
                  <div><div className="text-sm font-medium text-slate-500">Category</div><div className="mt-1 rounded-md border p-2 bg-gray-50">{selectedProduct.category && typeof selectedProduct.category === "object" ? (selectedProduct.category.name ?? selectedProduct.category.id) : (selectedProduct.category ?? "-")}</div></div>

                  {selectedProduct.product_type && (<div><div className="text-sm font-medium text-slate-500">Type</div><div className="mt-1 rounded-md border p-2 bg-gray-50">{selectedProduct.product_type}</div></div>)}

                  {selectedProduct.variants && Array.isArray(selectedProduct.variants) && (
                    <div>
                      <div className="text-sm font-medium text-slate-500">Variants</div>
                      <div className="mt-2 space-y-2">
                        {selectedProduct.variants.map((v, idx) => (
                          <div key={v.id ?? idx} className="rounded-md border p-2 bg-white">
                            <div className="text-sm text-slate-700">
                              {selectedProduct.product_type === "9Nutz Sweet" && `${v.label ?? "-"} — ₹ ${v.price ?? "-"}` }
                              {selectedProduct.product_type === "Clothing" && `${v.color ?? "-"} ${v.size ? `(${v.size})` : ""} — ₹ ${v.price ?? "-"}` }
                              {selectedProduct.product_type === "Gold" && `${v.grams ?? "-"} — ₹ ${v.price ?? "-"} (${v.purity ?? "-"})` }
                              {!selectedProduct.product_type && JSON.stringify(v)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedProduct.video_url && (<div><div className="text-sm font-medium text-slate-500">Video URL</div><div className="mt-1 rounded-md border p-2 bg-gray-50 break-all"><a href={selectedProduct.video_url} target="_blank" rel="noreferrer" className="text-indigo-600 underline">{selectedProduct.video_url}</a></div></div>)}

                  <div>
                    <div className="text-sm font-medium text-slate-500">Description</div>
                    <div className="mt-1 rounded-md border p-2 bg-gray-50" dangerouslySetInnerHTML={{ __html: selectedProduct.description ?? "<em>No description</em>" }} />
                  </div>
                </div>
                <div className="flex items-center justify-end mt-4"><Button variant="ghost" onClick={() => setIsViewOpen(false)}>Close</Button></div>
              </div>
            </aside>
          </div>
        )}

        <Editor
          open={isEditorOpen}
          initialHtml={form.description || ""}
          onClose={() => setIsEditorOpen(false)}
          onSave={(html) => setForm((f) => ({ ...f, description: html }))}
        />
      </div>
    </>
  );
}
