'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { productSchema, ProductInput } from '@/lib/validators'
import { Product } from '@/types'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { CATEGORIES } from '@/lib/utils'
import { api, getErrorMessage } from '@/lib/api'
import { ChevronDown, Link as LinkIcon, Upload, X, ImageIcon } from 'lucide-react'
import { useState, useRef } from 'react'
import Image from 'next/image'
import toast from 'react-hot-toast'

interface Props {
  defaultValues?: Partial<Product>
  onSubmit: (data: ProductInput) => Promise<void>
  loading: boolean
  mode: 'create' | 'edit'
}

type ImageMode = 'url' | 'upload'

export default function ProductForm({ defaultValues, onSubmit, loading, mode }: Props) {
  const [imageMode, setImageMode] = useState<ImageMode>(
    defaultValues?.imageUrl ? 'url' : 'url',
  )
  const [preview, setPreview] = useState<string>(defaultValues?.imageUrl || '')
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: defaultValues
      ? {
          name: defaultValues.name,
          description: defaultValues.description,
          price: defaultValues.price,
          imageUrl: defaultValues.imageUrl || '',
          category: defaultValues.category,
          stockQuantity: defaultValues.stockQuantity,
        }
      : undefined,
  })

  const imageUrl = watch('imageUrl')

  const switchMode = (m: ImageMode) => {
    setImageMode(m)
    setValue('imageUrl', '', { shouldValidate: false })
    setPreview('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await api.post<{ url: string }>('/uploads/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setValue('imageUrl', res.data.url, { shouldValidate: true })
      setPreview(res.data.url)
      toast.success('Image uploaded!')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setUploading(false)
    }
  }

  const clearImage = () => {
    setValue('imageUrl', '', { shouldValidate: true })
    setPreview('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Product Name"
        placeholder="e.g. Premium Leather Wallet"
        error={errors.name?.message}
        {...register('name')}
      />

      <div>
        <label className="label">Description</label>
        <textarea
          className="input-base min-h-[80px] resize-none"
          placeholder="Describe the product..."
          {...register('description')}
        />
        {errors.description && <p className="error-text">{errors.description.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Price (£)"
          type="number"
          step="0.01"
          min="0.01"
          placeholder="0.00"
          error={errors.price?.message}
          {...register('price')}
        />
        <Input
          label="Stock Quantity"
          type="number"
          min="0"
          placeholder="0"
          error={errors.stockQuantity?.message}
          {...register('stockQuantity')}
        />
      </div>

      <div>
        <label className="label">Category</label>
        <div className="relative">
          <select
            className="input-base appearance-none pr-9"
            {...register('category')}
          >
            <option value="">Select category...</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
        </div>
        {errors.category && <p className="error-text">{errors.category.message}</p>}
      </div>

      {/* Image field */}
      <div>
        <label className="label">
          Product Image <span className="text-red-500 ml-0.5">*</span>
        </label>

        {/* Mode toggle */}
        <div className="flex rounded-xl border border-slate-200 overflow-hidden mb-3 text-sm">
          <button
            type="button"
            onClick={() => switchMode('url')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 font-medium transition-colors ${
              imageMode === 'url'
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-500 hover:bg-slate-50'
            }`}
          >
            <LinkIcon className="h-3.5 w-3.5" />
            Image URL
          </button>
          <button
            type="button"
            onClick={() => switchMode('upload')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 font-medium transition-colors ${
              imageMode === 'upload'
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-500 hover:bg-slate-50'
            }`}
          >
            <Upload className="h-3.5 w-3.5" />
            Upload File
          </button>
        </div>

        {/* Hidden input keeps imageUrl always registered regardless of active tab */}
        <input type="hidden" {...register('imageUrl')} />

        {/* URL input */}
        {imageMode === 'url' && (
          <input
            type="url"
            placeholder="https://example.com/product.jpg"
            className={`input-base ${errors.imageUrl ? 'border-red-400 focus:border-red-400 focus:ring-red-200' : ''}`}
            value={imageUrl || ''}
            onChange={(e) => {
              setValue('imageUrl', e.target.value, { shouldValidate: true })
              setPreview(e.target.value)
            }}
          />
        )}

        {/* File upload drop zone */}
        {imageMode === 'upload' && (
          <label
            className={`flex flex-col items-center justify-center h-28 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${
              uploading
                ? 'border-brand-300 bg-brand-50 cursor-wait'
                : preview
                ? 'border-emerald-300 bg-emerald-50'
                : errors.imageUrl
                ? 'border-red-300 bg-red-50'
                : 'border-slate-300 bg-slate-50 hover:border-brand-400 hover:bg-brand-50/30'
            }`}
          >
            {uploading ? (
              <div className="flex flex-col items-center gap-1 text-brand-600">
                <div className="w-5 h-5 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-medium">Uploading...</span>
              </div>
            ) : preview ? (
              <div className="flex flex-col items-center gap-1 text-emerald-600">
                <ImageIcon className="h-5 w-5" />
                <span className="text-xs font-medium">Image uploaded</span>
                <span className="text-xs text-emerald-500">Click to replace</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1 text-slate-400">
                <Upload className="h-6 w-6" />
                <span className="text-sm font-medium text-slate-500">Click to upload</span>
                <span className="text-xs">PNG, JPG, WEBP — max 5 MB</span>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              disabled={uploading}
            />
          </label>
        )}

        {errors.imageUrl && (
          <p className="error-text mt-1">{errors.imageUrl.message}</p>
        )}

        {/* Preview */}
        {preview && (
          <div className="mt-2 flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
            <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border border-slate-200 bg-white">
              <Image
                src={preview}
                alt="Preview"
                fill
                className="object-cover"
                sizes="48px"
                onError={() => setPreview('')}
              />
            </div>
            <p className="text-xs text-slate-500 truncate flex-1">{preview}</p>
            <button
              type="button"
              onClick={clearImage}
              className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
              aria-label="Remove image"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" loading={loading} className="flex-1">
          {mode === 'create' ? 'Create Product' : 'Save Changes'}
        </Button>
      </div>
    </form>
  )
}
