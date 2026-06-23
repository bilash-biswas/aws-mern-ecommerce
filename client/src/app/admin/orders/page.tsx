"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import {
  getAllOrders,
  markOrderAsShipped,
  markOrderAsDelivered,
} from "@/store/slices/orderSlice";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Loader from "@/components/Loader";
import Message from "@/components/Message";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Toaster, toast } from "react-hot-toast";
import Link from "next/link";

export default function AdminOrdersPage() {
  const dispatch = useAppDispatch();
  const { orders, loading, error } = useAppSelector((state) => state.orders);
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);

  useEffect(() => {
    dispatch(getAllOrders());
  }, [dispatch]);

  const handleMarkAsShipped = async (orderId: string) => {
    setUpdatingOrder(orderId);
    try {
      await dispatch(markOrderAsShipped(orderId)).unwrap();
      toast.success("Order marked as shipped!");
    } catch (error: any) {
      toast.error(error || "Failed to update order status");
    } finally {
      setUpdatingOrder(null);
    }
  };

  const handleMarkAsDelivered = async (orderId: string) => {
    setUpdatingOrder(orderId);
    try {
      await dispatch(markOrderAsDelivered(orderId)).unwrap();
      toast.success("Order marked as delivered!");
    } catch (error: any) {
      toast.error(error || "Failed to update order status");
    } finally {
      setUpdatingOrder(null);
    }
  };

  const getStatusBadge = (order: any) => {
    if (order.isDelivered) {
      return (
        <span className="bg-emerald-950/40 text-emerald-400 border border-emerald-500/20 text-xs font-bold px-2.5 py-1 rounded-lg">
          Delivered
        </span>
      );
    } else if (order.isShipped) {
      return (
        <span className="bg-blue-950/40 text-blue-400 border border-blue-500/20 text-xs font-bold px-2.5 py-1 rounded-lg">
          Shipped
        </span>
      );
    } else if (order.isPaid) {
      return (
        <span className="bg-amber-950/40 text-amber-400 border border-amber-500/20 text-xs font-bold px-2.5 py-1 rounded-lg">
          Processing
        </span>
      );
    } else {
      return (
        <span className="bg-red-950/40 text-red-400 border border-red-500/20 text-xs font-bold px-2.5 py-1 rounded-lg">
          Pending Payment
        </span>
      );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-foreground animate-fadeIn">
        <Header />
        <main className="container mx-auto px-4 py-8 flex-grow flex justify-center items-center">
          <Loader />
        </main>
        <Footer />
        <Toaster />
      </div>
    );
  }

  return (
    <ProtectedRoute adminOnly>
      <div className="min-h-screen flex flex-col bg-background text-foreground animate-fadeIn">
        <Header />
        <main className="container mx-auto px-4 py-8 flex-grow">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-extrabold text-white tracking-tight">
                  Order Management
                </h1>
                <p className="text-text-muted mt-1 text-sm">
                  Manage and track all customer orders
                </p>
              </div>
              <Link
                href="/admin/dashboard"
                className="bg-background border border-card-border hover:bg-border-dark text-white hover:border-gray-600 px-5 py-2.5 rounded-xl font-bold transition-all text-sm shadow-md cursor-pointer active:scale-95"
              >
                Back to Dashboard
              </Link>
            </div>

            {error && <Message variant="error">{error}</Message>}

            <div className="bg-card border border-card-border rounded-3xl overflow-hidden shadow-xl mb-8">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-card-border">
                  <thead className="bg-card">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-text-muted uppercase tracking-wider">
                        Order ID
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-text-muted uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-text-muted uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-text-muted uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-text-muted uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-text-muted uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-card-border/60 bg-transparent">
                    {orders.map((order) => (
                      <tr key={order._id} className="hover:bg-card/40 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-white">
                            #{order._id.substring(0, 8)}
                          </div>
                          <div className="text-xs text-text-muted mt-0.5">
                            {order.paymentMethod}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-white">
                            {typeof order.user === "object" && order.user !== null
                              ? order.user.name || "Customer"
                              : "Customer"}
                          </div>
                          <div className="text-xs text-text-muted mt-0.5">
                            {typeof order.user === "object" && order.user !== null
                              ? order.user.email || ""
                              : typeof order.user === "string"
                              ? order.user
                              : ""}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 font-medium">
                          {formatDate(order.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-accent-emerald">
                          ${order.totalPrice.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(order)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                          <Link
                            href={`/orders/${order._id}`}
                            className="text-primary-indigo hover:text-indigo-400 font-bold transition-colors"
                          >
                            View
                          </Link>
                          {order.isPaid && !order.isShipped && (
                            <button
                              onClick={() => handleMarkAsShipped(order._id)}
                              disabled={updatingOrder === order._id}
                              className="text-blue-400 hover:text-blue-300 font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            >
                              {updatingOrder === order._id
                                ? "Shipping..."
                                : "Mark Shipped"}
                            </button>
                          )}
                          {order.isShipped && !order.isDelivered && (
                            <button
                              onClick={() => handleMarkAsDelivered(order._id)}
                              disabled={updatingOrder === order._id}
                              className="text-emerald-400 hover:text-emerald-300 font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            >
                              {updatingOrder === order._id
                                ? "Delivering..."
                                : "Mark Delivered"}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {orders.length === 0 && !loading && (
                <div className="text-center py-12 bg-transparent">
                  <Message variant="info">No orders found</Message>
                </div>
              )}
            </div>

            {/* Order Statistics Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
              <div className="bg-card border border-card-border rounded-3xl p-6 shadow-xl relative overflow-hidden group hover:border-primary-indigo/35 transition-all duration-200">
                <div className="text-3xl font-black text-white tracking-tight">
                  {orders.length}
                </div>
                <div className="text-xs font-semibold text-text-muted mt-2 uppercase tracking-wider">Total Orders</div>
              </div>
              <div className="bg-card border border-card-border rounded-3xl p-6 shadow-xl relative overflow-hidden group hover:border-amber-500/35 transition-all duration-200">
                <div className="text-3xl font-black text-amber-400 tracking-tight">
                  {orders.filter((order) => order.isPaid && !order.isShipped).length}
                </div>
                <div className="text-xs font-semibold text-text-muted mt-2 uppercase tracking-wider">Processing</div>
              </div>
              <div className="bg-card border border-card-border rounded-3xl p-6 shadow-xl relative overflow-hidden group hover:border-blue-500/35 transition-all duration-200">
                <div className="text-3xl font-black text-blue-400 tracking-tight">
                  {orders.filter((order) => order.isShipped && !order.isDelivered).length}
                </div>
                <div className="text-xs font-semibold text-text-muted mt-2 uppercase tracking-wider">Shipped</div>
              </div>
              <div className="bg-card border border-card-border rounded-3xl p-6 shadow-xl relative overflow-hidden group hover:border-accent-emerald/35 transition-all duration-200">
                <div className="text-3xl font-black text-accent-emerald tracking-tight">
                  {orders.filter((order) => order.isDelivered).length}
                </div>
                <div className="text-xs font-semibold text-text-muted mt-2 uppercase tracking-wider">Delivered</div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
        <Toaster />
      </div>
    </ProtectedRoute>
  );
}
