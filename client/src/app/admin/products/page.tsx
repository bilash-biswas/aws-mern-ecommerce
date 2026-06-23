'use client';

import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { fetchProducts, deleteProduct } from '@/store/slices/productSlice';
import { createProduct, updateProduct } from '@/store/slices/adminSlice';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Loader from '@/components/Loader';
import Message from '@/components/Message';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Toaster, toast } from 'react-hot-toast';

export default function AdminProductsPage() {
  const dispatch = useAppDispatch();
  const { 
    products, 
    loading, 
    error, 
    page, 
    pages, 
    total, 
    hasNext, 
    hasPrev 
  } = useAppSelector((state) => state.products);
  
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    category: '',
    stock: ''
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    dispatch(fetchProducts({ page: currentPage, pageSize }));
  }, [dispatch, currentPage, pageSize]);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(createProduct({
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        image: formData.image,
        category: formData.category,
        stock: parseInt(formData.stock)
      })).unwrap();

      setShowModal(false);
      setFormData({ name: '', description: '', price: '', image: '', category: '', stock: '' });
      toast.success('Product created successfully');
      dispatch(fetchProducts({ page: currentPage, pageSize }));
    } catch (error) {
      toast.error('Failed to create product');
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(updateProduct({
        _id: editingProduct._id,
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        image: formData.image,
        category: formData.category,
        stock: parseInt(formData.stock)
      })).unwrap();

      setShowModal(false);
      setEditingProduct(null);
      setFormData({ name: '', description: '', price: '', image: '', category: '', stock: '' });
      toast.success('Product updated successfully');
      dispatch(fetchProducts({ page: currentPage, pageSize }));
    } catch (error) {
      toast.error('Failed to update product');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await dispatch(deleteProduct(productId)).unwrap();
        toast.success('Product deleted successfully');
        dispatch(fetchProducts({ page: currentPage, pageSize }));
      } catch (error) {
        toast.error('Failed to delete product');
      }
    }
  };

  const openEditModal = (product: any) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      image: product.image,
      category: product.category,
      stock: product.stock.toString()
    });
    setShowModal(true);
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({ name: '', description: '', price: '', image: '', category: '', stock: '' });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProduct(null);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  const renderPagination = () => {
    if (pages <= 1) return null;

    return (
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8 bg-card border border-card-border rounded-2xl p-4 shadow-md">
        <p className="text-text-muted text-sm font-medium">
          Page {currentPage} of {pages} • {total} total products
        </p>

        <div className="flex items-center gap-3">
          <div className="flex space-x-1.5">
            <button
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={!hasPrev}
              className="px-3.5 py-1.5 border border-card-border hover:bg-border-dark disabled:opacity-30 disabled:cursor-not-allowed rounded-xl text-xs font-bold transition-all text-white cursor-pointer"
            >
              Prev
            </button>

            {/* Always show first page */}
            <button
              onClick={() => handlePageChange(1)}
              className={`px-3 py-1.5 border rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                currentPage === 1
                  ? "bg-primary-indigo/15 border-primary-indigo text-primary-indigo"
                  : "border-card-border text-gray-300 hover:text-white"
              }`}
            >
              1
            </button>

            {currentPage > 3 && (
              <span className="px-1 py-1 text-text-muted text-xs">...</span>
            )}

            {/* Show pages around current page */}
            {(() => {
              const pageButtons = [];
              const startPage = Math.max(2, currentPage - 1);
              const endPage = Math.min(pages - 1, currentPage + 1);

              for (
                let pageNum = startPage;
                pageNum <= endPage;
                pageNum++
              ) {
                if (pageNum > 1 && pageNum < pages) {
                  pageButtons.push(
                    <button
                      key={`page-${pageNum}`}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-1.5 border rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                        currentPage === pageNum
                          ? "bg-primary-indigo/15 border-primary-indigo text-primary-indigo"
                          : "border-card-border text-gray-300 hover:text-white"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                }
              }
              return pageButtons;
            })()}

            {currentPage < pages - 2 && (
              <span className="px-1 py-1 text-text-muted text-xs">...</span>
            )}

            {/* Always show last page if there is more than 1 page */}
            {pages > 1 && (
              <button
                onClick={() => handlePageChange(pages)}
                className={`px-3 py-1.5 border rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  currentPage === pages
                    ? "bg-primary-indigo/15 border-primary-indigo text-primary-indigo"
                    : "border-card-border text-gray-300 hover:text-white"
                }`}
              >
                {pages}
              </button>
            )}

            <button
              onClick={() => handlePageChange(Math.min(pages, currentPage + 1))}
              disabled={!hasNext}
              className="px-3.5 py-1.5 border border-card-border hover:bg-border-dark disabled:opacity-30 disabled:cursor-not-allowed rounded-xl text-xs font-bold transition-all text-white cursor-pointer"
            >
              Next
            </button>
          </div>

          {/* Page size selector */}
          <div className="flex items-center space-x-2 border-l border-card-border/60 pl-3">
            <span className="text-xs text-text-muted font-medium">Per Page:</span>
            <select
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className="px-2.5 py-1.5 bg-background border border-card-border rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary-indigo cursor-pointer"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
          </div>
        </div>
      </div>
    );
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
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-extrabold text-white tracking-tight">Product Catalog</h1>
                <p className="text-text-muted mt-1 text-sm">Add, update, and manage your online catalog items</p>
              </div>
              <button
                onClick={openCreateModal}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all text-sm shadow-md cursor-pointer active:scale-95"
              >
                Add Product
              </button>
            </div>

            {error && <Message variant="error">{error}</Message>}

            <div className="bg-card border border-card-border rounded-3xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-card-border">
                  <thead className="bg-card">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-text-muted uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-text-muted uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-text-muted uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-text-muted uppercase tracking-wider">
                        Stock Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-text-muted uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-card-border/60 bg-transparent">
                    {products.map((product) => (
                      <tr key={product._id} className="hover:bg-card/40 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-4">
                            <div className="flex-shrink-0 h-10 w-10 relative bg-background border border-card-border/60 rounded-xl overflow-hidden">
                              <img
                                src={product.image}
                                alt={product.name}
                                className="h-full w-full object-contain p-0.5"
                              />
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm font-bold text-white truncate max-w-[200px] sm:max-w-[300px]">{product.name}</div>
                              <div className="text-xs text-text-muted truncate max-w-[200px] sm:max-w-[300px] mt-0.5">
                                {product.description}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-accent-emerald">
                          ${product.price.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 font-medium">
                          {product.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${
                              product.stock === 0 ? 'bg-red-500 shadow-[0_0_8px_#ef4444]' :
                              product.stock < 10 ? 'bg-amber-500 shadow-[0_0_8px_#f59e0b]' :
                              'bg-emerald-500 shadow-[0_0_8px_#10b981]'
                            }`}></span>
                            <span className={`text-sm font-semibold ${
                              product.stock === 0 ? 'text-red-400' :
                              product.stock < 10 ? 'text-amber-400 font-bold' :
                              'text-gray-300'
                            }`}>
                              {product.stock === 0 ? 'Out of Stock' : `${product.stock} items`}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                          <button
                            onClick={() => openEditModal(product)}
                            className="text-primary-indigo hover:text-indigo-400 font-bold transition-colors cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product._id)}
                            className="text-red-400 hover:text-red-300 font-bold transition-colors cursor-pointer"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {products.length === 0 && !loading && (
                <div className="text-center py-12">
                  <Message variant="info">No products found</Message>
                </div>
              )}
            </div>

            {/* Pagination */}
            {renderPagination()}

            {/* Product Modal */}
            {showModal && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
                <div className="bg-card border border-card-border rounded-3xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl relative">
                  <h2 className="text-xl font-bold mb-6 text-white tracking-tight border-b border-card-border/60 pb-3">
                    {editingProduct ? 'Edit Product' : 'Create New Product'}
                  </h2>
                  <form onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-300 mb-2 uppercase tracking-wider">
                        Product Name
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-2.5 bg-background border border-card-border rounded-xl text-white placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary-indigo transition-all duration-200 text-sm"
                        placeholder="Premium Leather Wallet"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-bold text-gray-300 mb-2 uppercase tracking-wider">
                        Description
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-4 py-2.5 bg-background border border-card-border rounded-xl text-white placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary-indigo transition-all duration-200 text-sm"
                        placeholder="Enter full product overview and specs..."
                        rows={3}
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-300 mb-2 uppercase tracking-wider">
                          Price ($)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          className="w-full px-4 py-2.5 bg-background border border-card-border rounded-xl text-white placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary-indigo transition-all duration-200 text-sm"
                          placeholder="29.99"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-300 mb-2 uppercase tracking-wider">
                          Stock Units
                        </label>
                        <input
                          type="number"
                          value={formData.stock}
                          onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                          className="w-full px-4 py-2.5 bg-background border border-card-border rounded-xl text-white placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary-indigo transition-all duration-200 text-sm"
                          placeholder="50"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-bold text-gray-300 mb-2 uppercase tracking-wider">
                        Image URL
                      </label>
                      <input
                        type="url"
                        value={formData.image}
                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                        className="w-full px-4 py-2.5 bg-background border border-card-border rounded-xl text-white placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary-indigo transition-all duration-200 text-sm"
                        placeholder="https://images.unsplash.com/photo-..."
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-bold text-gray-300 mb-2 uppercase tracking-wider">
                        Category
                      </label>
                      <input
                        type="text"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-4 py-2.5 bg-background border border-card-border rounded-xl text-white placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary-indigo transition-all duration-200 text-sm"
                        placeholder="Accessories"
                        required
                      />
                    </div>
                    
                    <div className="flex justify-end space-x-3 pt-4 border-t border-card-border/60">
                      <button
                        type="button"
                        onClick={closeModal}
                        className="bg-background border border-card-border hover:bg-border-dark text-white hover:border-gray-600 px-5 py-2.5 rounded-xl font-bold transition-all text-sm cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all text-sm shadow-md cursor-pointer active:scale-95"
                      >
                        {editingProduct ? 'Save Changes' : 'Create Product'}
                      </button>
                    </div>
                  </form>
                </div>
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