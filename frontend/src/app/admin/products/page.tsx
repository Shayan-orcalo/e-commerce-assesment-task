'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, getErrorMessage } from '@/lib/api'
import { Product } from '@/types'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import ProductForm from '@/components/admin/ProductForm'
import { ProductInput } from '@/lib/validators'
import { formatCurrency, getCategoryColor } from '@/lib/utils'
import { PageSpinner } from '@/components/ui/Spinner'
import { Plus, Pencil, Trash2, Package, Search, ChevronDown, Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'
import toast from 'react-hot-toast'

export default function AdminProductsPage() {
  const qc = useQueryClient()
  const [createOpen, setCreateOpen] = useState(false)
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')

  const { data: products, isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const res = await api.get<{ data: Product[] }>('/products', { params: { limit: 200 } })
      return res.data.data
    },
  })

  const createMutation = useMutation({
    mutationFn: (data: ProductInput) => api.post('/products', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-products'] })
      setCreateOpen(false)
      toast.success('Product created!')
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const editMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProductInput }) => api.patch(`/products/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-products'] })
      setEditProduct(null)
      toast.success('Product updated!')
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/products/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-products'] })
      setDeleteProduct(null)
      toast.success('Product deleted!')
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const filtered = products?.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
    const matchCat = !categoryFilter || p.category === categoryFilter
    return matchSearch && matchCat
  }) ?? []

  const categories = Array.from(new Set(products?.map((p) => p.category) ?? []))

  if (isLoading) return <PageSpinner />

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Products</h1>
          <p className="text-slate-500 text-sm mt-1">{products?.length ?? 0} total products</p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="gap-2 sm:flex-shrink-0">
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-base pl-10 h-10"
          />
        </div>
        <div className="relative">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="input-base h-10 appearance-none pr-8 w-full sm:w-44"
          >
            <option value="">All Categories</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left py-3.5 px-5 text-slate-500 font-medium">Product</th>
                <th className="text-left py-3.5 px-4 text-slate-500 font-medium">Category</th>
                <th className="text-right py-3.5 px-4 text-slate-500 font-medium">Price</th>
                <th className="text-right py-3.5 px-4 text-slate-500 font-medium">Stock</th>
                <th className="text-right py-3.5 px-5 text-slate-500 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-slate-400">
                    <Package className="h-10 w-10 mx-auto mb-3 text-slate-300" />
                    No products found
                  </td>
                </tr>
              ) : filtered.map((product) => (
                <tr key={product.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200">
                        {product.imageUrl ? (
                          <Image src={product.imageUrl} alt={product.name} fill className="object-cover" sizes="48px" />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <ImageIcon className="h-5 w-5 text-slate-300" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 line-clamp-1 max-w-[200px]">{product.name}</p>
                        <p className="text-xs text-slate-400 line-clamp-1 max-w-[200px]">{product.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${getCategoryColor(product.category)}`}>
                      {product.category}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right font-bold gradient-text">
                    {formatCurrency(product.price)}
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className={`font-semibold text-sm ${
                      product.stockQuantity === 0 ? 'text-red-500' :
                      product.stockQuantity <= 5 ? 'text-amber-500' :
                      'text-emerald-600'
                    }`}>
                      {product.stockQuantity === 0 ? 'Out of Stock' : product.stockQuantity}
                    </span>
                  </td>
                  <td className="py-4 px-5">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setEditProduct(product)}
                        className="p-2 text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                        aria-label="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeleteProduct(product)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        aria-label="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Add New Product" size="lg">
        <ProductForm
          mode="create"
          loading={createMutation.isPending}
          onSubmit={async (data) => { await createMutation.mutateAsync(data) }}
        />
      </Modal>

      {/* Edit modal */}
      <Modal open={!!editProduct} onClose={() => setEditProduct(null)} title="Edit Product" size="lg">
        {editProduct && (
          <ProductForm
            mode="edit"
            defaultValues={editProduct}
            loading={editMutation.isPending}
            onSubmit={async (data) => { await editMutation.mutateAsync({ id: editProduct.id, data }) }}
          />
        )}
      </Modal>

      {/* Delete confirmation */}
      <Modal open={!!deleteProduct} onClose={() => setDeleteProduct(null)} title="Delete Product" size="sm">
        {deleteProduct && (
          <div>
            <p className="text-slate-600 mb-6">
              Are you sure you want to delete <strong className="text-slate-900">{deleteProduct.name}</strong>?
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteProduct(null)} className="btn-ghost flex-1">Cancel</button>
              <button
                onClick={() => deleteMutation.mutate(deleteProduct.id)}
                className="btn-danger flex-1"
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
