"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Edit, Trash2, Eye, Upload, X } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/ui/data-table"
import { ConfirmDialog } from "@/components/ConfirmDialog"
import { createAdvertisementColumns } from "./columns"
import { advertisementService } from "@/services/advertisementService"
import { toast } from "sonner"

// Import Advertisement interface from columns
import { Advertisement } from "./columns"

// Empty initial data
const initialAdvertisements: Advertisement[] = []

export default function AdvertisementsPage() {
  const [advertisements, setAdvertisements] = useState<Advertisement[]>(initialAdvertisements)
  const [statusFilter, setStatusFilter] = useState("all")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: "" })
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    banner: "",
    target_url: "",
    ad_status: true
  })
  const [bannerPreview, setBannerPreview] = useState<string | null>(null)
  const [bannerFile, setBannerFile] = useState<File | null>(null)

  // Fetch advertisements on component mount
  useEffect(() => {
    fetchAdvertisements()
  }, [])

  const fetchAdvertisements = async () => {
    try {
      setLoading(true)
      const data = await advertisementService.getAdvertisements()
      setAdvertisements(data)
    } catch (error) {
      console.error('Error fetching advertisements:', error)
      toast.error('Failed to fetch advertisements')
    } finally {
      setLoading(false)
    }
  }

  // Filter advertisements by status only (search is handled by DataTable)
  const filteredAdvertisements = advertisements.filter((ad) => {
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && ad.ad_status) || 
      (statusFilter === "inactive" && !ad.ad_status)
    return matchesStatus
  })

  const handleEdit = (advertisement: Advertisement) => {
    setEditingAd(advertisement)
    setFormData({
      title: advertisement.title,
      banner: advertisement.banner,
      target_url: advertisement.target_url,
      ad_status: advertisement.ad_status
    })
    setBannerPreview(advertisement.banner)
    setBannerFile(null) // Reset file since we're editing existing
    setIsFormOpen(true)
  }

  const handleDelete = (id: string) => {
    setDeleteConfirm({ open: true, id })
  }

  const confirmDelete = async () => {
    if (deleteConfirm.id) {
      try {
        setSubmitting(true)
        await advertisementService.deleteAdvertisement(deleteConfirm.id)
        setAdvertisements(prev => prev.filter(ad => ad.ad_id !== deleteConfirm.id))
        setDeleteConfirm({ open: false, id: "" })
        toast.success('Advertisement deleted successfully')
      } catch (error) {
        console.error('Error deleting advertisement:', error)
        toast.error('Failed to delete advertisement')
      } finally {
        setSubmitting(false)
      }
    }
  }

  const handleBannerUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB')
        return
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file')
        return
      }

      setBannerFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setBannerPreview(result)
        setFormData(prev => ({ ...prev, banner: result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const removeBanner = () => {
    setBannerPreview(null)
    setBannerFile(null)
    setFormData(prev => ({ ...prev, banner: "" }))
    // Reset file input
    const fileInput = document.getElementById('banner-upload') as HTMLInputElement
    if (fileInput) {
      fileInput.value = ''
    }
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title) {
      toast.error("Please enter a title")
      return
    }

    if (!editingAd && !bannerFile) {
      toast.error("Please select a banner image")
      return
    }

    try {
      setSubmitting(true)

      if (editingAd) {
        // Update existing advertisement
        const updateData: any = {
          title: formData.title,
          target_url: formData.target_url || undefined,
          ad_status: formData.ad_status,
        }

        // Only include banner if a new file was selected
        if (bannerFile) {
          updateData.banner = bannerFile
        }

        const updatedAd = await advertisementService.updateAdvertisement(editingAd.ad_id, updateData)
        setAdvertisements(prev => 
          prev.map(ad => ad.ad_id === editingAd.ad_id ? updatedAd : ad)
        )
        toast.success('Advertisement updated successfully')
      } else {
        // Create new advertisement
        if (!bannerFile) {
          toast.error("Please select a banner image")
          return
        }

        const createData = {
          title: formData.title,
          banner: bannerFile,
          target_url: formData.target_url || undefined,
          ad_status: formData.ad_status,
        }

        const newAd = await advertisementService.createAdvertisement(createData)
        setAdvertisements(prev => [newAd, ...prev])
        toast.success('Advertisement created successfully')
      }
      
      // Reset form
      setIsFormOpen(false)
      setEditingAd(null)
      setFormData({ title: "", banner: "", target_url: "", ad_status: true })
      setBannerPreview(null)
      setBannerFile(null)
    } catch (error: any) {
      console.error('Error submitting form:', error)
      const errorMessage = error.response?.data?.message || 'Failed to save advertisement'
      toast.error(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  const openCreateForm = () => {
    setEditingAd(null)
    setFormData({ title: "", banner: "", target_url: "", ad_status: true })
    setBannerPreview(null)
    setBannerFile(null)
    setIsFormOpen(true)
  }

  const columns = createAdvertisementColumns(handleEdit, handleDelete)

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Advertisements</h1>
          <p className="text-muted-foreground">
            Manage your advertisement banners and promotional content
          </p>
        </div>
        <Button onClick={openCreateForm} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Advertisement
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{advertisements.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Ads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {advertisements.filter(ad => ad.ad_status === true).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive Ads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {advertisements.filter(ad => ad.ad_status === false).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {advertisements.filter(ad => {
                const adDate = new Date(ad.created_at)
                const currentDate = new Date()
                return adDate.getMonth() === currentDate.getMonth() && 
                       adDate.getFullYear() === currentDate.getFullYear()
              }).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Advertisement Management</CardTitle>
          <CardDescription>
            View and manage all your advertisement banners
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1"></div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Data Table */}
          <DataTable
            columns={columns}
            data={filteredAdvertisements}
            searchKey="title"
            searchPlaceholder="Search advertisements..."
          />
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingAd ? "Edit Advertisement" : "Create New Advertisement"}
            </DialogTitle>
            <DialogDescription>
              {editingAd 
                ? "Update the advertisement details."
                : "Create a new advertisement banner with title, image, and URL."
              }
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleFormSubmit} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Title *</label>
              <Input
                placeholder="Enter advertisement title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>

            {/* Target URL */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Target URL</label>
              <Input
                type="url"
                placeholder="https://example.com (optional)"
                value={formData.target_url}
                onChange={(e) => setFormData(prev => ({ ...prev, target_url: e.target.value }))}
              />
            </div>

            {/* Status */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
       <Select
  value={formData.ad_status ? "true" : "false"} // true → Inactive, false → Active
  onValueChange={(value) =>
    setFormData(prev => ({ ...prev, ad_status: value === "true" }))
  }
>
  <SelectTrigger>
    <SelectValue placeholder="Select status" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="false">Active</SelectItem>
    <SelectItem value="true">Inactive</SelectItem>
  </SelectContent>
</Select>

            </div>

            {/* Banner Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Banner Image</label>
              {bannerPreview ? (
                <Card>
                  <CardContent className="p-4">
                    <div className="relative">
                      <img
                        src={bannerPreview}
                        alt="Banner preview"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={removeBanner}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4">
                      <label htmlFor="banner-upload" className="cursor-pointer">
                        <span className="mt-2 block text-sm font-medium text-gray-900">
                          Upload banner image
                        </span>
                        <span className="mt-1 block text-sm text-gray-500">
                          PNG, JPG, GIF up to 10MB
                        </span>
                      </label>
                      <input
                        id="banner-upload"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleBannerUpload}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsFormOpen(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting 
                  ? (editingAd ? "Updating..." : "Creating...") 
                  : (editingAd ? "Update Advertisement" : "Create Advertisement")
                }
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => setDeleteConfirm({ open, id: "" })}
        onConfirm={confirmDelete}
        title="Delete Advertisement"
        description="Are you sure you want to delete this advertisement? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  )
}