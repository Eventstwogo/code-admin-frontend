"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X } from "lucide-react";
import { PartnerFormData } from "../types";

interface PartnerFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: PartnerFormData) => Promise<boolean>;
  initialData?: PartnerFormData;
  title: string;
  submitText: string;
}

export function PartnerFormDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  title,
  submitText,
}: PartnerFormDialogProps) {
  const [formData, setFormData] = useState<PartnerFormData>(
    initialData || { logo: null, url: "", existingLogo: undefined }
  );
  const [loading, setLoading] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [showExistingLogo, setShowExistingLogo] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update form data when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setShowExistingLogo(!!initialData.existingLogo);
    } else {
      setFormData({ logo: null, url: "", existingLogo: undefined });
      setShowExistingLogo(false);
    }
    setLogoPreview(null);
  }, [initialData, open]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, logo: file }));
      setShowExistingLogo(false); // Hide existing logo when new file is selected
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setFormData(prev => ({ ...prev, logo: null }));
    setLogoPreview(null);
    setShowExistingLogo(!!formData.existingLogo); // Show existing logo again if available
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveExistingLogo = () => {
    setShowExistingLogo(false);
    setFormData(prev => ({ ...prev, existingLogo: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.url.trim()) {
      return;
    }

    setLoading(true);
    const success = await onSubmit(formData);
    setLoading(false);

    if (success) {
      setFormData({ logo: null, url: "" });
      setLogoPreview(null);
      onOpenChange(false);
    }
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };
console.log("Form Data:", formData.existingLogo);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Add partner information including logo and website URL.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Logo Upload */}
          <div className="space-y-2">
            <Label htmlFor="logo">Partner Logo</Label>
            <div className="flex flex-col gap-2">
              {logoPreview ? (
                // Show new logo preview
                <div className="relative w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
                  <img
                    src={logoPreview}
                    alt="New logo preview"
                    className="w-full h-full object-contain bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  <div className="absolute bottom-1 left-1 bg-blue-500 text-white text-xs px-1 rounded">
                    New
                  </div>
                </div>
              ) : showExistingLogo && formData.existingLogo ? (
                // Show existing logo
                <div className="relative w-32 h-32 border-2 border-solid border-gray-300 rounded-lg overflow-hidden">
                  <img
                    src={formData.existingLogo}
                    alt="Current logo"
                    className="w-full h-full object-contain bg-white"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/placeholder-logo.svg";
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleRemoveExistingLogo}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    title="Remove current logo"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  <div className="absolute bottom-1 left-1 bg-green-500 text-white text-xs px-1 rounded">
                    Current
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0  bg-opacity-0 hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center"
                  >
                    <div className="bg-white bg-opacity-90 rounded-full p-2 opacity-0 hover:opacity-100 transition-opacity">
                      <Upload className="w-4 h-4 text-gray-600" />
                    </div>
                  </button>
                </div>
              ) : (
                // Show upload area
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors"
                >
                  <Upload className="w-8 h-8 text-gray-400" />
                  <span className="text-sm text-gray-500 mt-1">Upload Logo</span>
                </div>
              )}
              
              {/* Additional upload button when showing existing logo */}
              {showExistingLogo && formData.existingLogo && !logoPreview && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-32"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Change Logo
                </Button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>

          {/* URL Input */}
          <div className="space-y-2">
            <Label htmlFor="url">Website URL *</Label>
            <Input
              id="url"
              type="url"
              placeholder="https://example.com"
              value={formData.url}
              onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
              required
            />
            {formData.url && !isValidUrl(formData.url) && (
              <p className="text-sm text-red-500">Please enter a valid URL</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.url.trim() || !isValidUrl(formData.url)}
            >
              {loading ? "Saving..." : submitText}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}