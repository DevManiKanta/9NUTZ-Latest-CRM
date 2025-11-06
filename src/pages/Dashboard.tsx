
// import React, { useMemo, useState, useEffect } from "react";
// import { useSelector } from "react-redux";
// import { MetricCard } from "@/components/MetricCard";
// import { WeeklyChart } from "@/components/WeeklyChart";
// import { YearlyChart } from "@/components/YearlyChart";
// import { Eye, IndianRupee, ShoppingCart } from "lucide-react";
// import { toast, Toaster } from "react-hot-toast";
// import api from "../api/axios"
// import {
//   selectSalesRows,
//   selectCountsAndRevenue,
// } from "@/redux/slices/SalesSlice";
// import api from "../api/axios";

// function fmtNumber(n) {
//   return Number.isFinite(n) ? n.toLocaleString("en-IN", { maximumFractionDigits: 0 }) : "0";
// }
// function fmtCurrency(n) {
//   return Number.isFinite(n)
//     ? n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
//     : "0.00";
// }

// const Dashboard = () => {
//   // default range = last 30 days
//   const today = new Date();
//   const defaultTo = new Date(today);
//   const defaultFrom = new Date(today);
//   defaultFrom.setDate(today.getDate() - 29);

//   const toIso = (d) => d.toISOString().slice(0, 10);

//   const [from, setFrom] = useState(toIso(defaultFrom));
//   const [to, setTo] = useState(toIso(defaultTo));

//   // redux selectors (unchanged)
//   const rows = useSelector(selectSalesRows) || [];
//   const countsAndRevenue = useSelector(selectCountsAndRevenue) || {};
//   const reduxOnlineCount = Number(countsAndRevenue.onlineCount || 0);
//   const reduxOfflineCount = Number(countsAndRevenue.offlineCount || 0);
//   const reduxOnlineRevenue = Number(countsAndRevenue.onlineRevenue || 0);
//   const reduxOfflineRevenue = Number(countsAndRevenue.offlineRevenue || 0);

//   // server dashboard fetch state
//   const [dashboardData, setDashboardData] = useState(null);
//   const [dashboardLoading, setDashboardLoading] = useState(false);

//   // fetch dashboard KPIs from backend
//   const getToken = () => localStorage.getItem("token") || "";

//   useEffect(() => {
//     const fetchDashboard = async () => {
//       const token = getToken();
//       if (!token) {
//         // don't toast here loudly every time; simply bail silently
//         return;
//       }

//       setDashboardLoading(true);
//       try {
//         const resp = await fetch(`https://9nutsapi.nearbydoctors.in/public/api/dashboard/summary`, {
//           method: "GET",
//           headers: {
//             Accept: "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//         });

//         const json = await resp.json().catch(() => null);
//         if (!resp.ok) {
//           const msg = json?.message || `Failed to load dashboard (${resp.status})`;
//           toast.error(msg);
//           throw new Error(msg);
//         }
//         setDashboardData(json ?? null);
//       } catch (err) {
//         console.error("Dashboard fetch error:", err);
//         toast.error(err?.message || "Unable to load dashboard data");
//         setDashboardData(null);
//       } finally {
//         setDashboardLoading(false);
//       }
//     };

//     fetchDashboard();
//   }, []);

//   // compute combined & filtered orders for charts (inclusive date range)
//   const combinedOrders = useMemo(() => rows || [], [rows]);

//   const filteredOrders = useMemo(() => {
//     const fromD = new Date(from + "T00:00:00");
//     const toD = new Date(to + "T23:59:59.999");
//     return combinedOrders.filter((o) => {
//       // support both date strings and pre-formatted values
//       const raw = o.date ?? o.order_time ?? o.created_at ?? "";
//       try {
//         const od = new Date(raw.length === 10 ? `${raw}T00:00:00` : raw);
//         if (isNaN(od.getTime())) return false;
//         return od.getTime() >= fromD.getTime() && od.getTime() <= toD.getTime();
//       } catch {
//         return false;
//       }
//     });
//   }, [combinedOrders, from, to]);

//   // Metrics derived from filteredOrders (kept as before)
//   const franchiseCount = useMemo(() => new Set((filteredOrders || []).map((o) => o.franchiseId)).size, [filteredOrders]);
//   const revenue = useMemo(() => (filteredOrders || []).reduce((s, o) => s + (Number(o.amount) || 0), 0), [filteredOrders]);
//   const posOrders = useMemo(() => (filteredOrders || []).length, [filteredOrders]);
//   const productsCount = useMemo(() => (filteredOrders || []).reduce((s, o) => s + (Number(o.items) || 0), 0), [filteredOrders]);

//   // Prefer server-provided card counts if available, otherwise fall back to redux-derived values
//   const serverCards = dashboardData?.cards ?? null;
//   const onlineCount = serverCards?.online_orders != null ? Number(serverCards.online_orders) : reduxOnlineCount;
//   const offlineCount = serverCards?.offline_orders != null ? Number(serverCards.offline_orders) : reduxOfflineCount;
//   // If server provided a single total, you could use that for total display; we'll compute totalPaymentsCount as sum (server fallback)
//   const totalPaymentsCount = (Number(onlineCount || 0) + Number(offlineCount || 0));
//   const totalPaymentsRevenue = Number((reduxOnlineRevenue || 0) + (reduxOfflineRevenue || 0));

//   const periodLabel = useMemo(() => {
//     const f = new Date(from);
//     const t = new Date(to);
//     if (f.getFullYear() === t.getFullYear() && f.getMonth() === t.getMonth() && f.getDate() === t.getDate()) {
//       return f.toLocaleDateString("en-IN");
//     }
//     return `${f.toLocaleDateString("en-IN")} — ${t.toLocaleDateString("en-IN")}`;
//   }, [from, to]);

//   const applyReset = (reset = false) => {
//     if (reset) {
//       const defFrom = new Date();
//       defFrom.setDate(defFrom.getDate() - 29);
//       setFrom(toIso(defFrom));
//       setTo(toIso(new Date()));
//     }
//   };

//   // Reuse existing chart components (they still expect orders prop in your code)
//   const Weekly = WeeklyChart;
//   const Yearly = YearlyChart;

//   return (
//     <div className="space-y-8 p-4">
//       <Toaster position="top-right" reverseOrder={false} />
//       <div>
//         <h1 className="text-3xl font-bold text-foreground mb-2">Welcome!</h1>
//         {/* <div className="text-sm text-muted">{periodLabel}</div> */}
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//         <MetricCard
//           title="Online Orders"
//           value={fmtNumber(onlineCount)}
//           subtitle={`Revenue ₹${fmtCurrency(reduxOnlineRevenue)}`}
//           icon={<IndianRupee className="h-8 w-8" />}
//           variant="visits"
//         />
//         <MetricCard
//           title="Offline Orders"
//           value={fmtNumber(offlineCount)}
//           subtitle={`Revenue ₹${fmtCurrency(reduxOfflineRevenue)}`}
//           icon={<ShoppingCart className="h-8 w-8" />}
//           variant="revenue"
//         />
//         <MetricCard
//           title="Total Orders"
//           value={fmtNumber(totalPaymentsCount)}
//           subtitle={`Total Revenue ₹${fmtCurrency(totalPaymentsRevenue)}`}
//           icon={<Eye className="h-8 w-8" />}
//           variant="orders"
//         />
//         {/* reserved slot if you want to display productsCount or franchiseCount */}
//         <MetricCard
//           title="Orders (period)"
//           value={fmtNumber(posOrders)}
//           subtitle={`Revenue ₹${fmtCurrency(revenue)}`}
//           icon={<Eye className="h-8 w-8" />}
//           variant="orders"
//         />
//       </div>

//       <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
//         <Weekly orders={filteredOrders} />
//         <Yearly orders={filteredOrders} toDate={new Date(to)} />
//       </div>
//     </div>
//   );
// };

// export default Dashboard;



import React, { useMemo, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { MetricCard } from "@/components/MetricCard";
import { WeeklyChart } from "@/components/WeeklyChart";
import { YearlyChart } from "@/components/YearlyChart";
import { Eye, IndianRupee, ShoppingCart } from "lucide-react";
import { toast, Toaster } from "react-hot-toast";
import api from "../api/axios";
import {
  selectSalesRows,
  selectCountsAndRevenue,
} from "@/redux/slices/SalesSlice";

function fmtNumber(n) {
  return Number.isFinite(n) ? n.toLocaleString("en-IN", { maximumFractionDigits: 0 }) : "0";
}
function fmtCurrency(n) {
  return Number.isFinite(n)
    ? n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : "0.00";
}

const Dashboard = () => {
  // default range = last 30 days
  const today = new Date();
  const defaultTo = new Date(today);
  const defaultFrom = new Date(today);
  defaultFrom.setDate(today.getDate() - 29);

  const toIso = (d) => d.toISOString().slice(0, 10);

  const [from, setFrom] = useState(toIso(defaultFrom));
  const [to, setTo] = useState(toIso(defaultTo));

  // redux selectors (unchanged)
  const rows = useSelector(selectSalesRows) || [];
  const countsAndRevenue = useSelector(selectCountsAndRevenue) || {};
  const reduxOnlineCount = Number(countsAndRevenue.onlineCount || 0);
  const reduxOfflineCount = Number(countsAndRevenue.offlineCount || 0);
  const reduxOnlineRevenue = Number(countsAndRevenue.onlineRevenue || 0);
  const reduxOfflineRevenue = Number(countsAndRevenue.offlineRevenue || 0);

  // server dashboard fetch state
  const [dashboardData, setDashboardData] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);

  // fetch dashboard KPIs from backend
  const getToken = () => localStorage.getItem("token") || "";

  useEffect(() => {
    const fetchDashboard = async () => {
      const token = getToken();
      if (!token) {
        // don't toast here loudly every time; simply bail silently
        return;
      }

      setDashboardLoading(true);
      try {
        // Use your axios instance 'api' and pass headers
        const resp = await api.get(
          `https://9nutsapi.nearbydoctors.in/public/api/dashboard/summary`,
          {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // axios attaches parsed json in resp.data
        const json = resp?.data ?? null;

        // If server returned a non-OK style payload, we still accept it. Axios throws on HTTP errors,
        // so reaching here means status was 2xx; set dashboard data.
        setDashboardData(json ?? null);
      } catch (err) {
        // axios error handling: err.response may contain server data
        console.error("Dashboard fetch error:", err);
        const serverMsg = err?.response?.data?.message ?? err?.response?.data ?? null;
        const msg = (typeof serverMsg === "string" ? serverMsg : null) ?? err?.message ?? "Unable to load dashboard data";
        toast.error(msg);
        setDashboardData(null);
      } finally {
        setDashboardLoading(false);
      }
    };

    fetchDashboard();
    // empty deps so it runs once (same behaviour as original)
  }, []);

  // compute combined & filtered orders for charts (inclusive date range)
  const combinedOrders = useMemo(() => rows || [], [rows]);

  const filteredOrders = useMemo(() => {
    const fromD = new Date(from + "T00:00:00");
    const toD = new Date(to + "T23:59:59.999");
    return combinedOrders.filter((o) => {
      // support both date strings and pre-formatted values
      const raw = o.date ?? o.order_time ?? o.created_at ?? "";
      try {
        const od = new Date(raw.length === 10 ? `${raw}T00:00:00` : raw);
        if (isNaN(od.getTime())) return false;
        return od.getTime() >= fromD.getTime() && od.getTime() <= toD.getTime();
      } catch {
        return false;
      }
    });
  }, [combinedOrders, from, to]);

  // Metrics derived from filteredOrders (kept as before)
  const franchiseCount = useMemo(() => new Set((filteredOrders || []).map((o) => o.franchiseId)).size, [filteredOrders]);
  const revenue = useMemo(() => (filteredOrders || []).reduce((s, o) => s + (Number(o.amount) || 0), 0), [filteredOrders]);
  const posOrders = useMemo(() => (filteredOrders || []).length, [filteredOrders]);
  const productsCount = useMemo(() => (filteredOrders || []).reduce((s, o) => s + (Number(o.items) || 0), 0), [filteredOrders]);

  // Prefer server-provided card counts if available, otherwise fall back to redux-derived values
  const serverCards = dashboardData?.cards ?? null;
  const onlineCount = serverCards?.online_orders != null ? Number(serverCards.online_orders) : reduxOnlineCount;
  const offlineCount = serverCards?.offline_orders != null ? Number(serverCards.offline_orders) : reduxOfflineCount;
  // If server provided a single total, you could use that for total display; we'll compute totalPaymentsCount as sum (server fallback)
  const totalPaymentsCount = (Number(onlineCount || 0) + Number(offlineCount || 0));
  const totalPaymentsRevenue = Number((reduxOnlineRevenue || 0) + (reduxOfflineRevenue || 0));

  const periodLabel = useMemo(() => {
    const f = new Date(from);
    const t = new Date(to);
    if (f.getFullYear() === t.getFullYear() && f.getMonth() === t.getMonth() && f.getDate() === t.getDate()) {
      return f.toLocaleDateString("en-IN");
    }
    return `${f.toLocaleDateString("en-IN")} — ${t.toLocaleDateString("en-IN")}`;
  }, [from, to]);

  const applyReset = (reset = false) => {
    if (reset) {
      const defFrom = new Date();
      defFrom.setDate(defFrom.getDate() - 29);
      setFrom(toIso(defFrom));
      setTo(toIso(new Date()));
    }
  };

  // Reuse existing chart components (they still expect orders prop in your code)
  const Weekly = WeeklyChart;
  const Yearly = YearlyChart;

  return (
    <div className="space-y-8 p-4">
      <Toaster position="top-right" reverseOrder={false} />
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Welcome!</h1>
        {/* <div className="text-sm text-muted">{periodLabel}</div> */}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Online Orders"
          value={fmtNumber(onlineCount)}
          subtitle={`Revenue ₹${fmtCurrency(reduxOnlineRevenue)}`}
          icon={<IndianRupee className="h-8 w-8" />}
          variant="visits"
        />
        <MetricCard
          title="Offline Orders"
          value={fmtNumber(offlineCount)}
          subtitle={`Revenue ₹${fmtCurrency(reduxOfflineRevenue)}`}
          icon={<ShoppingCart className="h-8 w-8" />}
          variant="revenue"
        />
        <MetricCard
          title="Total Orders"
          value={fmtNumber(totalPaymentsCount)}
          subtitle={`Total Revenue ₹${fmtCurrency(totalPaymentsRevenue)}`}
          icon={<Eye className="h-8 w-8" />}
          variant="orders"
        />
        {/* reserved slot if you want to display productsCount or franchiseCount */}
        <MetricCard
          title="Orders (period)"
          value={fmtNumber(posOrders)}
          subtitle={`Revenue ₹${fmtCurrency(revenue)}`}
          icon={<Eye className="h-8 w-8" />}
          variant="orders"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <Weekly orders={filteredOrders} />
        <Yearly orders={filteredOrders} toDate={new Date(to)} />
      </div>
    </div>
  );
};

export default Dashboard;


