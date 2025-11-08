

// import React, { useEffect, useRef, useState } from "react";
// import { useCategories } from "../components/contexts/categoriesContext"; // adjust path
// const ITEMS = [
//   { id: "c1", title: "Millets", subtitle: "Healthy grains", image: "https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?auto=format&fit=crop&w=1200&q=80" },
//   { id: "c2", title: "Sweets", subtitle: "Tasty treats", image: "https://images.unsplash.com/photo-1544085311-84d5c97b82a3?auto=format&fit=crop&w=1200&q=80" },
//   { id: "c3", title: "Flours", subtitle: "Baking essentials", image: "https://images.unsplash.com/photo-1542444459-db5a1f5b8b8e?auto=format&fit=crop&w=1200&q=80" },
//   { id: "c4", title: "Dry Fruits", subtitle: "Nuts & mixes", image: "https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?auto=format&fit=crop&w=1200&q=80" },
//   { id: "c5", title: "Snacks", subtitle: "Ready to eat", image: "https://images.unsplash.com/photo-1543353071-087092ec393e?auto=format&fit=crop&w=1200&q=80" },
//   { id: "c6", title: "Pulses", subtitle: "Protein rich", image: "https://images.unsplash.com/photo-1551218808-94e220e084d2?auto=format&fit=crop&w=1200&q=80" },
//   { id: "c7", title: "Spices", subtitle: "Flavorful", image: "https://images.unsplash.com/photo-1505250469679-203ad9ced0cb?auto=format&fit=crop&w=1200&q=80" },
//   { id: "c8", title: "Herbs", subtitle: "Natural flavors", image: "https://images.unsplash.com/photo-1604754742629-3e572824e1ef?auto=format&fit=crop&w=1200&q=80" },
//    { id: "c5", title: "Snacks", subtitle: "Ready to eat", image: "https://images.unsplash.com/photo-1543353071-087092ec393e?auto=format&fit=crop&w=1200&q=80" },
//   { id: "c6", title: "Pulses", subtitle: "Protein rich", image: "https://images.unsplash.com/photo-1551218808-94e220e084d2?auto=format&fit=crop&w=1200&q=80" },
//   { id: "c7", title: "Spices", subtitle: "Flavorful", image: "https://images.unsplash.com/photo-1505250469679-203ad9ced0cb?auto=format&fit=crop&w=1200&q=80" },
//   { id: "c8", title: "Herbs", subtitle: "Natural flavors", image: "https://images.unsplash.com/photo-1604754742629-3e572824e1ef?auto=format&fit=crop&w=1200&q=80" },
// ];

// export default function CategoryCarousel({
//   items = ITEMS,
//   autoplay = true,
//   interval = 2500,
//   onSelect, // optional callback: (item) => {}
// }) {
//   const scrollerRef = useRef(null);
//   const autoRef = useRef(null);
//   const isHoverRef = useRef(false);

//   // drag state refs
//   const isDraggingRef = useRef(false);
//   const startXRef = useRef(0);
//   const scrollStartRef = useRef(0);
//   const dragMovedRef = useRef(false);

//   const [selectedId, setSelectedId] = useState(null);
//    const { categories, loading, totalItems, page, perPage, totalPages, fetchCategories, createCategory, updateCategory, deleteCategory, fetchSingle } = useCategories();

//  console.log("Categories in Carousel:", categories);
//   // helper to scroll programmatically
//   const scrollBy = (offset) => {
//     const el = scrollerRef.current;
//     if (!el) return;
//     el.scrollBy({ left: offset, behavior: "smooth" });
//   };

//   // autoplay (pauses on hover/drag)
//   useEffect(() => {
//     if (!autoplay) return;
//     const el = scrollerRef.current;
//     if (!el) return;

//     const startAuto = () => {
//       if (autoRef.current) clearInterval(autoRef.current);
//       autoRef.current = setInterval(() => {
//         // if user is interacting, skip
//         if (isHoverRef.current || isDraggingRef.current) return;
//         // scroll by one card width (approx)
//         const step = Math.max(200, Math.floor(el.clientWidth * 0.25));
//         if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 10) {
//           el.scrollTo({ left: 0, behavior: "smooth" }); // loop
//         } else {
//           el.scrollBy({ left: step, behavior: "smooth" });
//         }
//       }, interval);
//     };

//     startAuto();
//     // restart if interval changes etc.
//     return () => {
//       if (autoRef.current) clearInterval(autoRef.current);
//     };
//   }, [autoplay, interval]);

//   // mouse drag handlers
//   useEffect(() => {
//     const el = scrollerRef.current;
//     if (!el) return;

//     const onMouseDown = (e) => {
//       isDraggingRef.current = true;
//       dragMovedRef.current = false;
//       startXRef.current = e.clientX;
//       scrollStartRef.current = el.scrollLeft;
//       el.classList.add("cursor-grabbing");
//     };

//     const onMouseMove = (e) => {
//       if (!isDraggingRef.current) return;
//       const dx = e.clientX - startXRef.current;
//       if (Math.abs(dx) > 5) dragMovedRef.current = true;
//       el.scrollLeft = scrollStartRef.current - dx;
//     };

//     const endDrag = () => {
//       if (!isDraggingRef.current) return;
//       isDraggingRef.current = false;
//       el.classList.remove("cursor-grabbing");
//       const child = el.querySelector("[role='listitem']");
//       if (child) {
//         const itemWidth = child.getBoundingClientRect().width + parseFloat(getComputedStyle(child).marginRight || 0);
//         const targetIndex = Math.round(el.scrollLeft / itemWidth);
//         const targetLeft = targetIndex * itemWidth;
//         el.scrollTo({ left: targetLeft, behavior: "smooth" });
//       }
//     };

//     const onMouseUp = () => endDrag();
//     const onMouseLeave = () => endDrag();

//     el.addEventListener("mousedown", onMouseDown);
//     window.addEventListener("mousemove", onMouseMove);
//     window.addEventListener("mouseup", onMouseUp);
//     el.addEventListener("mouseleave", onMouseLeave);

//     return () => {
//       el.removeEventListener("mousedown", onMouseDown);
//       window.removeEventListener("mousemove", onMouseMove);
//       window.removeEventListener("mouseup", onMouseUp);
//       el.removeEventListener("mouseleave", onMouseLeave);
//     };
//   }, []);

//   // touch drag handlers (mobile)
//   useEffect(() => {
//     const el = scrollerRef.current;
//     if (!el) return;

//     let startX = 0;
//     let startScroll = 0;
//     let moved = false;

//     const onTouchStart = (e) => {
//       isDraggingRef.current = true;
//       moved = false;
//       startX = e.touches[0].clientX;
//       startScroll = el.scrollLeft;
//     };
//     const onTouchMove = (e) => {
//       const dx = e.touches[0].clientX - startX;
//       if (Math.abs(dx) > 5) moved = true;
//       el.scrollLeft = startScroll - dx;
//     };
//     const onTouchEnd = () => {
//       isDraggingRef.current = false;
//       // snap similar to mouse end
//       const child = el.querySelector("[role='listitem']");
//       if (child) {
//         const itemWidth = child.getBoundingClientRect().width + parseFloat(getComputedStyle(child).marginRight || 0);
//         const targetIndex = Math.round(el.scrollLeft / itemWidth);
//         const targetLeft = targetIndex * itemWidth;
//         el.scrollTo({ left: targetLeft, behavior: "smooth" });
//       }
//     };

//     el.addEventListener("touchstart", onTouchStart, { passive: true });
//     el.addEventListener("touchmove", onTouchMove, { passive: true });
//     el.addEventListener("touchend", onTouchEnd);

//     return () => {
//       el.removeEventListener("touchstart", onTouchStart);
//       el.removeEventListener("touchmove", onTouchMove);
//       el.removeEventListener("touchend", onTouchEnd);
//     };
//   }, []);

//   // hover pause
//   const onMouseEnter = () => {
//     isHoverRef.current = true;
//   };
//   const onMouseLeave = () => {
//     isHoverRef.current = false;
//   };

//   // click handler that ignores clicks triggered by dragging
//   const handleClickItem = (item, e) => {
//     // if drag moved, ignore click
//     if (isDraggingRef.current || dragMovedRef.current) {
//       // reset moved flag after ignoring
//       dragMovedRef.current = false;
//       return;
//     }
//     setSelectedId(item.id);
//     if (typeof onSelect === "function") onSelect(item);
//   };

//   return (
//     <div className="relative" onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
//       {/* Left Button */}
//       <button
//         type="button"
//         onClick={() => {
//           const el = scrollerRef.current;
//           if (!el) return;
//           el.scrollBy({ left: -220, behavior: "smooth" });
//         }}
//         aria-label="Scroll left"
//         className="hidden sm:inline-flex items-center justify-center absolute left-0 top-1/2 -translate-y-1/2 z-10 h-9 w-9 rounded-full bg-white shadow-md border"
//       >
//         ‹
//       </button>

//       {/* Scroll Container */}
//       <div
//         ref={scrollerRef}
//         className="flex gap-2 overflow-x-auto scrollbar-none scroll-pl-3 snap-x snap-mandatory px-1 py-1"
//         role="list"
//         aria-label="Product categories"
//       >
//         {items.map((it) => {
//           const active = selectedId === it.id;
//           return (
//             <button
//               key={it.id}
//               type="button"
//               role="listitem"
//               onClick={(e) => handleClickItem(it, e)}
//               className={`snap-start shrink-0 w-32 sm:w-36 md:w-40 lg:w-20 rounded-lg overflow-hidden bg-white border shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-300 ${active ? "ring-2 ring-indigo-500" : ""}`}
//               // style={{border:"1px solid black"}}
//             >
//               <div className="relative h-10 sm:h-24 md:h-20">
//                 <img
//                   src={it.image}
//                   alt={it.title}
//                   loading="lazy"
//                   className="object-cover w-full h-full"
//                   onError={(e) => {
//                     e.currentTarget.src = `https://source.unsplash.com/600x400/?${encodeURIComponent(it.title)}`;
//                   }}
//                 />
//                 <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
//                 <div className="absolute left-2 bottom-2 text-white">
//                   {/* <div className="text-[11px] sm:text-xs font-semibold leading-snug">{it.title}</div> */}
//                 </div>
//               </div>
//               <div className="px-2 py-1 text-left">
//               </div>
//             </button>
//           );
//         })}
//       </div>

//       {/* Right Button */}
//       <button
//         type="button"
//         onClick={() => {
//           const el = scrollerRef.current;
//           if (!el) return;
//           el.scrollBy({ left: 220, behavior: "smooth" });
//         }}
//         aria-label="Scroll right"
//         className="hidden sm:inline-flex items-center justify-center absolute right-0 top-1/2 -translate-y-1/2 z-10 h-9 w-9 rounded-full bg-white shadow-md border"
//       >
//         ›
//       </button>

//       {/* Hide scrollbar on all browsers */}
//       <style>{`
//         .scrollbar-none { scrollbar-width: none; -ms-overflow-style: none; }
//         .scrollbar-none::-webkit-scrollbar { display: none; }
//       `}</style>
//     </div>
//   );
// }


import React, { useEffect, useRef, useState } from "react";
import { useCategories } from "../components/contexts/categoriesContext"; // adjust path if needed

export default function CategoryCarousel({
  items, // optional override (keeps backwards compatibility)
  autoplay = true,
  interval = 2500,
  onSelect, // optional callback: (item) => {}
}) {
  const scrollerRef = useRef(null);
  const autoRef = useRef(null);
  const isHoverRef = useRef(false);

  // drag state refs
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollStartRef = useRef(0);
  const dragMovedRef = useRef(false);

  const [selectedId, setSelectedId] = useState(null);
  const {
    categories, // from context
    loading,
    totalItems,
    page,
    perPage,
    totalPages,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    fetchSingle,
  } = useCategories();

  // If caller passed `items` prop, prefer it; otherwise use categories from context.
  const itemsToRender =
    Array.isArray(items) && items.length > 0
      ? items
      : (Array.isArray(categories) ? categories.map((c) => ({
          id: String(c.id),
          title: c.category,
          subtitle: `${c.productCount ?? 0} Products`,
          image: c.image_url ?? c.image ?? "",
        })) : []);

  // helper to scroll programmatically
  const scrollBy = (offset) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: offset, behavior: "smooth" });
  };

  // autoplay (pauses on hover/drag)
  useEffect(() => {
    if (!autoplay) return;
    const el = scrollerRef.current;
    if (!el) return;

    const startAuto = () => {
      if (autoRef.current) clearInterval(autoRef.current);
      autoRef.current = setInterval(() => {
        // if user is interacting, skip
        if (isHoverRef.current || isDraggingRef.current) return;
        // scroll by one card width (approx)
        const step = Math.max(200, Math.floor(el.clientWidth * 0.25));
        if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 10) {
          el.scrollTo({ left: 0, behavior: "smooth" }); // loop
        } else {
          el.scrollBy({ left: step, behavior: "smooth" });
        }
      }, interval);
    };

    startAuto();
    return () => {
      if (autoRef.current) clearInterval(autoRef.current);
    };
  }, [autoplay, interval, itemsToRender.length]);

  // mouse drag handlers
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const onMouseDown = (e) => {
      isDraggingRef.current = true;
      dragMovedRef.current = false;
      startXRef.current = e.clientX;
      scrollStartRef.current = el.scrollLeft;
      el.classList.add("cursor-grabbing");
    };

    const onMouseMove = (e) => {
      if (!isDraggingRef.current) return;
      const dx = e.clientX - startXRef.current;
      if (Math.abs(dx) > 5) dragMovedRef.current = true;
      el.scrollLeft = scrollStartRef.current - dx;
    };

    const endDrag = () => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      el.classList.remove("cursor-grabbing");
      const child = el.querySelector("[role='listitem']");
      if (child) {
        const itemWidth = child.getBoundingClientRect().width + parseFloat(getComputedStyle(child).marginRight || 0);
        const targetIndex = Math.round(el.scrollLeft / itemWidth);
        const targetLeft = targetIndex * itemWidth;
        el.scrollTo({ left: targetLeft, behavior: "smooth" });
      }
    };

    const onMouseUp = () => endDrag();
    const onMouseLeave = () => endDrag();

    el.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    el.addEventListener("mouseleave", onMouseLeave);

    return () => {
      el.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      el.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [itemsToRender.length]);

  // touch drag handlers (mobile)
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    let startX = 0;
    let startScroll = 0;

    const onTouchStart = (e) => {
      isDraggingRef.current = true;
      startX = e.touches[0].clientX;
      startScroll = el.scrollLeft;
    };
    const onTouchMove = (e) => {
      const dx = e.touches[0].clientX - startX;
      el.scrollLeft = startScroll - dx;
    };
    const onTouchEnd = () => {
      isDraggingRef.current = false;
      const child = el.querySelector("[role='listitem']");
      if (child) {
        const itemWidth = child.getBoundingClientRect().width + parseFloat(getComputedStyle(child).marginRight || 0);
        const targetIndex = Math.round(el.scrollLeft / itemWidth);
        const targetLeft = targetIndex * itemWidth;
        el.scrollTo({ left: targetLeft, behavior: "smooth" });
      }
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: true });
    el.addEventListener("touchend", onTouchEnd);

    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [itemsToRender.length]);

  // hover pause
  const onMouseEnter = () => {
    isHoverRef.current = true;
  };
  const onMouseLeave = () => {
    isHoverRef.current = false;
  };

  // click handler that ignores clicks triggered by dragging
  const handleClickItem = (item, e) => {
    // if drag moved, ignore click
    if (isDraggingRef.current || dragMovedRef.current) {
      dragMovedRef.current = false;
      return;
    }
    setSelectedId(item.id);
    if (typeof onSelect === "function") onSelect(item);
  };

  return (
    <div className="relative" onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      {/* Left Button */}
      <button
        type="button"
        onClick={() => {
          const el = scrollerRef.current;
          if (!el) return;
          el.scrollBy({ left: -220, behavior: "smooth" });
        }}
        aria-label="Scroll left"
        className="hidden sm:inline-flex items-center justify-center absolute left-0 top-1/2 -translate-y-1/2 z-10 h-9 w-9 rounded-full bg-white shadow-md border"
      >
        ‹
      </button>

      {/* Scroll Container */}
      <div
        ref={scrollerRef}
        className="flex gap-2 overflow-x-auto scrollbar-none scroll-pl-3 snap-x snap-mandatory px-1 py-1"
        role="list"
        aria-label="Product categories"
      >
        {itemsToRender.map((it) => {
          const active = selectedId === it.id;
          return (
            <button
  key={it.id}
  type="button"
  role="listitem"
  onClick={(e) => handleClickItem(it, e)}
  className={`snap-start shrink-0 w-32 sm:w-36 md:w-40 lg:w-20 rounded-lg overflow-hidden bg-white border shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-300 ${
    active ? "ring-2 ring-indigo-500" : ""
  }`}

  style={{ border: "1px solid grey" }}
>
  <div className="relative h-10 sm:h-24 md:h-20">
    <img
      src={it.image}
      alt={it.title}
      loading="lazy"
      className="w-full h-full object-cover object-center" 
      onError={(e) => {
        e.currentTarget.src = `https://source.unsplash.com/600x400/?${encodeURIComponent(it.title)}`;
      }}
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
    <div className="absolute left-2 bottom-2 text-white">
    </div>
  </div>

  <div className="px-2 py-1 text-left">
    <div className="text-xs font-medium text-slate-800 truncate">
      {it.title}
    </div>
  </div>
</button>

          );
        })}
      </div>

      {/* Right Button */}
      <button
        type="button"
        onClick={() => {
          const el = scrollerRef.current;
          if (!el) return;
          el.scrollBy({ left: 220, behavior: "smooth" });
        }}
        aria-label="Scroll right"
        className="hidden sm:inline-flex items-center justify-center absolute right-0 top-1/2 -translate-y-1/2 z-10 h-9 w-9 rounded-full bg-white shadow-md border"
      >
        ›
      </button>

      {/* Hide scrollbar on all browsers */}
      <style>{`
        .scrollbar-none { scrollbar-width: none; -ms-overflow-style: none; }
        .scrollbar-none::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
