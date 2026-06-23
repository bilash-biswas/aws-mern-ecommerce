'use client';

import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { getUsers, updateUser, createUser, deleteUser } from '@/store/slices/adminSlice';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Loader from '@/components/Loader';
import Message from '@/components/Message';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Toaster, toast } from 'react-hot-toast';

export default function AdminUsersPage() {
  const dispatch = useAppDispatch();
  const { users, loading, error } = useAppSelector((state) => state.admin);
  const { user: currentUser } = useAppSelector((state) => state.auth);
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    isAdmin: false
  });
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      dispatch(getUsers());
    }
  }, [dispatch, isMounted]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(createUser(formData)).unwrap();
      setShowCreateModal(false);
      setFormData({ name: '', email: '', password: '', isAdmin: false });
      toast.success('User created successfully');
    } catch (error) {
      toast.error('Failed to create user');
    }
  };

  const handleUpdateUser = async (userData: any) => {
    try {
      await dispatch(updateUser(userData)).unwrap();
      toast.success('User updated successfully');
    } catch (error) {
      toast.error('Failed to update user');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await dispatch(deleteUser(userId)).unwrap();
        toast.success('User deleted successfully');
      } catch (error) {
        toast.error('Failed to delete user');
      }
    }
  };

  const toggleAdminStatus = (user: any) => {
    handleUpdateUser({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: !user.isAdmin
    });
  };

  // Show loading state during SSR to prevent hydration mismatch
  if (!isMounted) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-foreground animate-fadeIn">
        <Header />
        <main className="container mx-auto px-4 py-8 flex-grow">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <div className="h-8 bg-card-border rounded w-48 animate-pulse"></div>
              <div className="h-10 bg-card-border rounded w-40 animate-pulse"></div>
            </div>
            
            <div className="bg-card border border-card-border rounded-3xl overflow-hidden shadow-xl p-4 animate-pulse">
              <div className="h-12 bg-card-border/60 rounded-xl mb-4"></div>
              {[1, 2, 3, 4, 5].map((row) => (
                <div key={row} className="py-4 border-b border-card-border/40 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-card-border rounded-full"></div>
                    <div className="ml-4 space-y-2">
                      <div className="h-4 bg-card-border rounded w-32"></div>
                      <div className="h-3 bg-card-border rounded w-24"></div>
                    </div>
                  </div>
                  <div className="h-4 bg-card-border rounded w-20"></div>
                </div>
              ))}
            </div>
          </div>
        </main>
        <Footer />
        <Toaster />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-foreground animate-fadeIn">
        <Header />
        <main className="container mx-auto px-4 py-8 flex-grow">
          <div className="max-w-6xl mx-auto">
            <Loader variant="table" />
          </div>
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
                <h1 className="text-3xl font-extrabold text-white tracking-tight">User Accounts</h1>
                <p className="text-text-muted mt-1 text-sm">View, edit role status, and remove user registrations</p>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all text-sm shadow-md cursor-pointer active:scale-95"
              >
                Create User
              </button>
            </div>

            {error && <Message variant="error">{error}</Message>}

            <div className="bg-card border border-card-border rounded-3xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
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
                        Created
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-text-muted uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-card-border/60 bg-transparent">
                    {users.map((user) => (
                      <tr key={user._id} className="hover:bg-card/40 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-primary-indigo/10 border border-primary-indigo/20 rounded-full flex items-center justify-center">
                              <span className="text-primary-indigo font-bold text-sm">
                                {user.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-bold text-white">{user.name}</div>
                              <div className="text-[10px] text-text-muted font-mono mt-0.5">ID: {user._id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 font-medium">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${
                            user.isAdmin 
                              ? 'bg-purple-950/40 text-purple-400 border-purple-500/20' 
                              : 'bg-emerald-950/40 text-emerald-400 border-emerald-500/20'
                          }`}>
                            {user.isAdmin ? 'Admin' : 'User'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 font-medium">
                          {new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold space-x-3">
                          <button
                            onClick={() => toggleAdminStatus(user)}
                            disabled={user._id === currentUser?._id}
                            className="text-primary-indigo hover:text-indigo-400 font-bold transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                          >
                            {user.isAdmin ? 'Remove Admin' : 'Make Admin'}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user._id)}
                            disabled={user._id === currentUser?._id}
                            className="text-red-400 hover:text-red-300 font-bold transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {users.length === 0 && !loading && (
                <div className="text-center py-12">
                  <Message variant="info">No users found</Message>
                </div>
              )}
            </div>
          </div>

          {/* Create User Modal */}
          {showCreateModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
              <div className="bg-card border border-card-border rounded-3xl p-6 w-full max-w-md shadow-2xl relative">
                <h2 className="text-xl font-bold mb-6 text-white tracking-tight border-b border-card-border/60 pb-3">Create New User</h2>
                <form onSubmit={handleCreateUser} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-2 uppercase tracking-wider">
                      Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2.5 bg-background border border-card-border rounded-xl text-white placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary-indigo transition-all duration-200 text-sm"
                      placeholder="Jane Doe"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-2 uppercase tracking-wider">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2.5 bg-background border border-card-border rounded-xl text-white placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary-indigo transition-all duration-200 text-sm"
                      placeholder="jane@example.com"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-2 uppercase tracking-wider">
                      Password
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-4 py-2.5 bg-background border border-card-border rounded-xl text-white placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary-indigo transition-all duration-200 text-sm"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  
                  {/* Admin toggle checkbox */}
                  <div className="p-4 bg-background/50 border border-card-border rounded-2xl">
                    <label className="flex items-center cursor-pointer select-none">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={formData.isAdmin}
                          onChange={(e) => setFormData({ ...formData, isAdmin: e.target.checked })}
                          className="sr-only"
                          id="isAdmin"
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
                        Grant Administrator Privilege
                      </span>
                    </label>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4 border-t border-card-border/60">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="bg-background border border-card-border hover:bg-border-dark text-white hover:border-gray-600 px-5 py-2.5 rounded-xl font-bold transition-all text-sm cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all text-sm shadow-md cursor-pointer active:scale-95"
                    >
                      Create User
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
        <Footer />
        <Toaster />
      </div>
    </ProtectedRoute>
  );
}