"use client";

import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { updateUserProfile, updateUser } from "@/store/slices/authSlice";
import { getUsers } from "@/store/slices/adminSlice";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Message from "@/components/Message";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Toaster } from "react-hot-toast";
import { showToast } from "@/utils/toast";

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const { user, loading, error } = useAppSelector((state) => state.auth);
  const { users } = useAppSelector((state) => state.admin);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    isAdmin: false,
  });
  const [message, setMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (user && isMounted) {
      setFormData({
        name: user.name,
        email: user.email,
        password: "",
        confirmPassword: "",
        isAdmin: user.isAdmin,
      });
    }
  }, [user, isMounted]);

  useEffect(() => {
    // Load users if current user is admin
    if (user?.isAdmin && isMounted) {
      dispatch(getUsers());
    }
  }, [dispatch, user, isMounted]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (formData.password !== formData.confirmPassword) {
      showToast("Passwords do not match", "error");
      setMessage("Passwords do not match");
      return;
    }

    try {
      await dispatch(
        updateUserProfile({
          name: formData.name,
          email: formData.email,
          password: formData.password || undefined,
          isAdmin: formData.isAdmin,
        })
      ).unwrap();

      showToast("Profile updated successfully!", "success");
      setMessage("Profile updated successfully!");
      // Clear password fields
      setFormData({
        ...formData,
        password: "",
        confirmPassword: "",
      });
      setIsEditing(false);
    } catch (error) {
      showToast("Failed to update profile", "error");
      setMessage("Failed to update profile");
    }
  };

  const handleAdminToggle = async (targetUser: any) => {
    if (
      window.confirm(
        `Are you sure you want to ${
          targetUser.isAdmin ? "remove" : "grant"
        } admin privileges for ${targetUser.name}?`
      )
    ) {
      try {
        await dispatch(
          updateUser({
            _id: targetUser._id,
            name: targetUser.name,
            email: targetUser.email,
            isAdmin: !targetUser.isAdmin,
          })
        ).unwrap();
        showToast(
          `Admin privileges ${
            !targetUser.isAdmin ? "granted" : "removed"
          } successfully`,
          "success"
        );
      } catch (error) {
        showToast("Failed to update user privileges", "error");
      }
    }
  };

  const cancelEdit = () => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        password: "",
        confirmPassword: "",
        isAdmin: user.isAdmin,
      });
    }
    setIsEditing(false);
    setMessage("");
  };

  // Show loading state during SSR to prevent hydration mismatch
  if (!isMounted) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <Header />
        <main className="container mx-auto px-4 py-8 flex-grow">
          <div className="max-w-4xl mx-auto">
            <div className="h-10 bg-card-border rounded w-48 mx-auto mb-8 animate-pulse"></div>

            <div className="bg-card border border-card-border rounded-2xl p-6 mb-8 animate-pulse">
              <div className="flex justify-between items-center mb-6">
                <div className="h-7 bg-card-border rounded w-40"></div>
                <div className="h-10 bg-card-border rounded w-32"></div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((item) => (
                    <div key={item}>
                      <div className="h-4 bg-card-border rounded w-20 mb-2"></div>
                      <div className="h-5 bg-card-border rounded w-32"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
        <Toaster />
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col bg-background text-foreground animate-fadeIn">
        <Header />
        <main className="container mx-auto px-4 py-8 flex-grow">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-extrabold mb-8 text-center text-white tracking-tight">
              User Profile
            </h1>

            {message && <Message variant={message.includes("success") ? "success" : "error"}>{message}</Message>}
            {error && <Message variant="error">{error}</Message>}

            <div className="bg-card border border-card-border rounded-3xl p-6 md:p-8 shadow-xl mb-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-72 h-72 bg-primary-indigo/5 blur-3xl rounded-full pointer-events-none"></div>
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 relative z-10">
                <h2 className="text-xl text-primary-indigo font-extrabold tracking-tight">
                  Personal Information
                </h2>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-background border border-card-border hover:bg-border-dark text-white hover:border-gray-600 px-5 py-2.5 rounded-xl font-bold transition-all text-sm shadow-md cursor-pointer active:scale-95"
                  >
                    Edit Profile
                  </button>
                )}
              </div>

              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-semibold text-gray-300 mb-2"
                      >
                        Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-background border border-card-border rounded-xl text-white placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary-indigo transition-all duration-200"
                        required
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-semibold text-gray-300 mb-2"
                      >
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-background border border-card-border rounded-xl text-white placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary-indigo transition-all duration-200"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label
                        htmlFor="password"
                        className="block text-sm font-semibold text-gray-300 mb-2"
                      >
                        New Password
                      </label>
                      <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-background border border-card-border rounded-xl text-white placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary-indigo transition-all duration-200"
                        placeholder="Leave blank to keep current"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="confirmPassword"
                        className="block text-sm font-semibold text-gray-300 mb-2"
                      >
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-background border border-card-border rounded-xl text-white placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary-indigo transition-all duration-200"
                        placeholder="Confirm new password"
                      />
                    </div>
                  </div>

                  {user?.isAdmin && (
                    <div className="p-4 bg-background/50 border border-card-border rounded-2xl space-y-2">
                      <label className="flex items-center cursor-pointer select-none">
                        <div className="relative">
                          <input
                            type="checkbox"
                            id="isAdmin"
                            name="isAdmin"
                            checked={formData.isAdmin}
                            onChange={handleChange}
                            className="sr-only"
                          />
                          <div className={`w-5 h-5 rounded border transition-all flex items-center justify-center ${formData.isAdmin ? 'bg-primary-indigo border-primary-indigo' : 'border-card-border bg-background'}`}>
                            {formData.isAdmin && (
                              <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                              </svg>
                            )}
                          </div>
                        </div>
                        <span className="ml-3 text-sm font-semibold text-gray-200">
                          Administrator Account Privilege
                        </span>
                      </label>
                    </div>
                  )}

                  <div className="flex justify-end space-x-3 pt-4 border-t border-card-border/60">
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="bg-background border border-card-border hover:bg-border-dark text-white hover:border-gray-600 px-5 py-2.5 rounded-xl font-bold transition-all text-sm cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-2.5 px-6 rounded-xl transition-all duration-200 shadow-md shadow-indigo-500/25 active:scale-95 text-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {loading ? "Updating..." : "Save Changes"}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4 relative z-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 bg-background/40 border border-card-border/60 rounded-2xl">
                      <h3 className="text-xs font-semibold text-text-muted mb-1 uppercase tracking-wider">
                        Name
                      </h3>
                      <p className="text-white font-bold text-base">{user?.name}</p>
                    </div>
                    <div className="p-4 bg-background/40 border border-card-border/60 rounded-2xl">
                      <h3 className="text-xs font-semibold text-text-muted mb-1 uppercase tracking-wider">
                        Email Address
                      </h3>
                      <p className="text-white font-bold text-base">{user?.email}</p>
                    </div>
                    <div className="p-4 bg-background/40 border border-card-border/60 rounded-2xl">
                      <h3 className="text-xs font-semibold text-text-muted mb-1 uppercase tracking-wider">
                        Account Type
                      </h3>
                      <span className={`inline-block mt-1 px-3 py-1 text-xs font-bold rounded-lg ${user?.isAdmin ? 'bg-purple-950/40 text-purple-400 border border-purple-500/20' : 'bg-indigo-950/40 text-indigo-400 border border-indigo-500/20'}`}>
                        {user?.isAdmin ? "Administrator" : "Standard User"}
                      </span>
                    </div>
                    <div className="p-4 bg-background/40 border border-card-border/60 rounded-2xl">
                      <h3 className="text-xs font-semibold text-text-muted mb-1 uppercase tracking-wider">
                        Member Since
                      </h3>
                      <p className="text-white font-bold text-base">
                        {user?.createdAt
                          ? new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Admin Section - Only visible to admins */}
            {user?.isAdmin && (
              <div className="bg-card border border-card-border rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
                <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/3 w-72 h-72 bg-emerald-500/5 blur-3xl rounded-full pointer-events-none"></div>
                
                <h2 className="text-xl text-emerald-400 font-extrabold mb-6 tracking-tight relative z-10">
                  User Management
                </h2>

                <div className="overflow-x-auto rounded-2xl border border-card-border bg-background/50 relative z-10">
                  <table className="min-w-full divide-y divide-card-border">
                    <thead className="bg-card">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-text-muted uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-text-muted uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-text-muted uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-text-muted uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-card-border/60 bg-transparent">
                      {users.map((targetUser) => (
                        <tr key={targetUser._id} className="hover:bg-card/40 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-bold text-white flex items-center gap-2">
                              {targetUser.name}
                              {targetUser._id === user._id && (
                                <span className="text-xs text-primary-indigo font-bold bg-primary-indigo/10 border border-primary-indigo/25 px-2 py-0.5 rounded-md">
                                  You
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 font-medium">
                            {targetUser.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${
                                targetUser.isAdmin
                                  ? "bg-purple-950/40 text-purple-400 border-purple-500/20"
                                  : "bg-emerald-950/40 text-emerald-400 border-emerald-500/20"
                              }`}
                            >
                              {targetUser.isAdmin ? "Admin" : "User"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleAdminToggle(targetUser)}
                              disabled={targetUser._id === user._id}
                              className="text-primary-indigo hover:text-indigo-400 font-bold transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                            >
                              {targetUser.isAdmin
                                ? "Remove Admin"
                                : "Make Admin"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {users.length === 0 && (
                  <div className="text-center py-8 relative z-10">
                    <Message variant="info">No users found</Message>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
        <Footer />
        <Toaster />
      </div>
    </ProtectedRoute>
  );
}
