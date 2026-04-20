import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import {
  FaChartLine, FaShoppingCart, FaUsers, FaBox,
  FaArrowUp, FaArrowDown, FaClock
} from "react-icons/fa";
import '../styles/adminDashboard.css';

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

const StatCard = ({ title, value, icon: Icon, color, trend }) => (
  <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-shadow">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-sm font-semibold text-gray-600">{title}</h3>
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="text-white text-lg" />
      </div>
    </div>
    <div className="flex items-end justify-between">
      <div>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        {trend !== undefined && trend !== null && (
          <p className={`text-xs font-semibold mt-2 flex items-center gap-1 ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend >= 0
              ? <FaArrowUp className="text-xs" />
              : <FaArrowDown className="text-xs" />
            }
            {Math.abs(trend)}% from last month
          </p>
        )}
      </div>
    </div>
  </div>
);

const AdminDashboard = () => {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { "auth-token": token };

        const [productsRes, ordersRes, usersRes] = await Promise.all([
          axios.get(`${API_BASE}/api/products`),
          axios.get(`${API_BASE}/api/admin/orders`, { headers }),
          axios.get(`${API_BASE}/api/admin/users`, { headers })
        ]);

        setProducts(productsRes.data);
        setOrders(ordersRes.data);
        setUsers(usersRes.data);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Calculate metrics
  const totalProducts = products.length;
  const totalSales = orders.reduce((sum, o) => {
    if (o.status === 'cancelled') return sum;
    return sum + Number(o.total || 0);
  }, 0);
  const totalUsers = users.length;

  // Derive real revenue trend from orders grouped by month
  const revenueTrend = useMemo(() => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const revenueByMonth = {};

    orders.forEach((order) => {
      if (order.status === 'cancelled') return;
      const date = new Date(order.createdAt || order.date);
      if (isNaN(date)) return;
      const key = monthNames[date.getMonth()];
      revenueByMonth[key] = (revenueByMonth[key] || 0) + Number(order.total || 0);
    });

    // Return last 6 months with real data (0 if no orders that month)
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
      const label = monthNames[d.getMonth()];
      return { month: label, revenue: revenueByMonth[label] || 0 };
    });
  }, [orders]);

  // Compute trend % between last two months (null if not enough data)
  const revenueTrend2Month = useMemo(() => {
    if (revenueTrend.length < 2) return null;
    const prev = revenueTrend[revenueTrend.length - 2].revenue;
    const curr = revenueTrend[revenueTrend.length - 1].revenue;
    if (prev === 0) return null;
    return Math.round(((curr - prev) / prev) * 100);
  }, [revenueTrend]);

  const orderCountTrend = useMemo(() => {
    if (revenueTrend.length < 2) return null;
    // Use order count per month for order trend
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const countByMonth = {};
    orders.forEach((order) => {
      const date = new Date(order.createdAt || order.date);
      if (isNaN(date)) return;
      const key = monthNames[date.getMonth()];
      countByMonth[key] = (countByMonth[key] || 0) + 1;
    });
    const lastTwo = revenueTrend.slice(-2).map(r => countByMonth[r.month] || 0);
    if (lastTwo[0] === 0) return null;
    return Math.round(((lastTwo[1] - lastTwo[0]) / lastTwo[0]) * 100);
  }, [orders, revenueTrend]);

  // Order status pie data
  const orderStatusData = [
    { name: 'Pending',   value: orders.filter(o => o.status === 'pending').length,   color: '#FFA500' },
    { name: 'Confirmed', value: orders.filter(o => o.status === 'confirmed').length, color: '#3B82F6' },
    { name: 'Shipped',   value: orders.filter(o => o.status === 'shipped').length,   color: '#8B5CF6' },
    { name: 'Delivered', value: orders.filter(o => o.status === 'delivered').length, color: '#10B981' },
    { name: 'Cancelled', value: orders.filter(o => o.status === 'cancelled').length, color: '#EF4444' },
  ].filter(item => item.value > 0);

  // Top products by stock
  const topProducts = useMemo(() =>
    [...products]
      .sort((a, b) => (b.instock || 0) - (a.instock || 0))
      .slice(0, 5),
    [products]
  );

  // Recent orders
  const recentOrders = orders.slice(0, 5);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's your store overview.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard
            title="Total Revenue"
            value={`Rs ${(totalSales / 1000).toFixed(1)}K`}
            icon={FaChartLine}
            color="bg-gradient-to-br from-green-500 to-emerald-600"
            trend={revenueTrend2Month}
          />
          <StatCard
            title="Total Orders"
            value={orders.length}
            icon={FaShoppingCart}
            color="bg-gradient-to-br from-blue-500 to-cyan-600"
            trend={orderCountTrend}
          />
          <StatCard
            title="Active Products"
            value={totalProducts}
            icon={FaBox}
            color="bg-gradient-to-br from-purple-500 to-pink-600"
            trend={null}
          />
          <StatCard
            title="Total Users"
            value={totalUsers}
            icon={FaUsers}
            color="bg-gradient-to-br from-orange-500 to-red-600"
            trend={null}
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          {/* Revenue Trend */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900">Revenue Trend</h2>
              <p className="text-sm text-gray-600 mt-1">Monthly revenue overview</p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueTrend} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                  formatter={(value) => [`Rs ${value.toLocaleString()}`, 'Revenue']}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#1f2937"
                  strokeWidth={3}
                  dot={{ fill: '#1f2937', r: 6 }}
                  activeDot={{ r: 8 }}
                  name="Monthly Revenue"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Order Status */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900">Order Status</h2>
              <p className="text-sm text-gray-600 mt-1">Distribution breakdown</p>
            </div>
            {orderStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={orderStatusData}
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {orderStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} orders`]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-80 flex items-center justify-center text-gray-400">
                No order data available
              </div>
            )}
          </div>
        </div>

        {/* Tables Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <FaClock className="text-gray-600" />
                Recent Orders
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Order ID</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentOrders.length > 0 ? (
                    recentOrders.map((order) => (
                      <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 truncate">
                          {order._id?.substring(0, 8)}...
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                          Rs {order.total?.toLocaleString() || 0}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            order.status === 'pending'   ? 'bg-yellow-100 text-yellow-800' :
                            order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'shipped'   ? 'bg-purple-100 text-purple-800' :
                            order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="px-6 py-8 text-center text-gray-500">
                        No orders yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <FaBox className="text-gray-600" />
                Top Products by Stock
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Stock</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {topProducts.length > 0 ? (
                    topProducts.map((product) => (
                      <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 line-clamp-1">
                          {product.title}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold ${
                            product.instock > 10 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {product.instock}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                          Rs {product.price}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="px-6 py-8 text-center text-gray-500">
                        No products yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;