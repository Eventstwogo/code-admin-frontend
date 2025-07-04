
// "use client";

// import React, { useEffect, useState } from "react";
// import slugify from "slugify";
// import { useRouter, useSearchParams } from "next/navigation";
// import { useForm } from "react-hook-form";
// import { z } from "zod";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { Input } from "@/components/ui/input";
// import axiosInstance from "@/lib/axiosInstance";
// import { toast } from "sonner";

// // Zod Schema
// const categorySchema = z.object({
//   name: z
//     .string()
//     .min(3, "Category name must be at least 3 characters")
//     .max(50, "Category name must not exceed 50 characters")
//     .regex(/^[A-Za-z0-9\s-]+$/, "Only letters, numbers, spaces, and hyphens allowed")
//     .refine((val) => val.trim().length > 0, {
//       message: "Category name cannot be just spaces",
//     }),
//   slug: z
//     .string()
//     .min(1, "Slug is required")
//     .refine((val) => !/<[^>]*script.*?>|('|--|;|\/\*|\*\/|xp_)/gi.test(val), {
//       message: "Slug contains potentially dangerous content",
//     }),
//   description: z
//     .string()
//     .max(500, "Description must be less than 500 characters")
//     .optional()
//     .or(z.literal("")),
//   metaTitle: z
//     .string()
//     .max(70, "Meta title must be less than 70 characters")
//     .optional()
//     .or(z.literal("")),
//   metaDescription: z
//     .string()
//     .max(160, "Meta description must be less than 160 characters")
//     .optional()
//     .or(z.literal("")),
//   parent: z.string().optional(),
//   features: z.object({
//     featured: z.boolean(),
//     homepage: z.boolean(),
//     promotions: z.boolean(),
//   }),
// });

// type CategoryFormData = z.infer<typeof categorySchema>;

// const CategoryCreation = () => {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const categoryId = searchParams.get("id");

//   const [categories, setCategories] = useState([]);
//   const [imagePreview, setImagePreview] = useState<string | null>(null);
//   const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);

//   const {
//     register,
//     handleSubmit,
//     watch,
//     setValue,
//     formState: { errors },
//   } = useForm<CategoryFormData>({
//     resolver: zodResolver(categorySchema),
//     defaultValues: {
//       name: "",
//       slug: "",
//       description: "",
//       metaTitle: "",
//       metaDescription: "",
//       parent: "",
//       features: {
//         featured: false,
//         homepage: false,
//         promotions: false,
//       },
//     },
//   });

//   const name = watch("name");



//   const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     setSelectedImageFile(file);
//     if (file) {
//       const reader = new FileReader();
//       reader.onloadend = () => setImagePreview(reader.result as string);
//       reader.readAsDataURL(file);
//     }
//   };

//   const handleImageRemove = () => {
//     setImagePreview(null);
//     setSelectedImageFile(null);
//   };

//   const handleBack = () => {
//     router.push("/Categories");
//   };

//   const fetchCategories = async () => {
//     try {
//       const response = await axiosInstance.get("/api/v1/categories/?status_filter=false");
//       setCategories(response.data.data);
//     } catch (error) {
//       console.error("Failed to fetch categories:", error);
//     }
//   };

//   const fetchCategory = async (id: string) => {
//     try {
//       const response = await axiosInstance.get(`api/v1/categories_or_subcategories_by_id/details/${id}`);
//       const category = response.data.data;
// console.log(category)
//       setValue("name", category.category_name || category.subcategory_name);
//       setValue("slug", category.category_slug|| category.subcategory_slug);
//       setValue("description", category.category_description ||category.subcategory_description || "");
//       setValue("metaTitle", category.category_meta_title ||category.subcategory_meta_titl||'');
//       setValue("metaDescription", category.category_meta_description ||category.subcategory_meta_description|| "");
//       setValue("parent", category.category_id || "");
//       setValue("features", {
//         featured: category.featured_category || category.featured_subcategory,
//         homepage: category.show_in_menu,
//         promotions: false,
//       });

//       if (category.category_img_thumbnail||category.subcategory_img_thumbnail) {
//         setImagePreview(`${category.category_img_thumbnail || category.subcategory_img_thumbnail}`);
//       }
//     } catch (error) {
//       console.error("Failed to fetch category:", error);
//     }
//   };

//   useEffect(() => {
//     fetchCategories();
//     if (categoryId) fetchCategory(categoryId);
//   }, [categoryId]);
// console.log(imagePreview)
//   const onSubmit = async (data: CategoryFormData) => {
//     try {
//       const formData = new FormData();

//       formData.append("name", data.name);
//       formData.append("slug", data.slug);
//       formData.append("description", data.description || "");
//       formData.append("meta_title", data.metaTitle || "");
//       formData.append("meta_description", data.metaDescription || "");
//       formData.append("category_id", data.parent || "");
//       formData.append("featured", String(data.features.featured));
//       formData.append("show_in_menu", String(data.features.homepage));

//       if (selectedImageFile) {
//         formData.append("file", selectedImageFile);
//       }

//       const endpoint = categoryId
//         ? `/api/v1/categories_or_subcategories_by_id/update/${categoryId}`
//         : "/api/v1/categories/create";
//       const method = categoryId ? "put" : "post";

//       const response = await axiosInstance[method](endpoint, formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });

//       if (response.data.statusCode === 200 || response.data.statusCode === 201) {
//         toast.success(response.data.message);
//         router.push("/Categories");
//       }
//     } catch (error: any) {
//       const message =
//         error?.response?.data?.detail?.message || "Failed to save category.";
//       toast.error(message);
//       console.error("Error saving category:", error);
//     }
//   };

//   return (
//     <div className="bg-gray-50 pt-6 pb-6 px-4 md:px-8">
//       <div className="max-w-6xl mx-auto text-sm">
//         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
//           <button
//             onClick={handleBack}
//             className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 cursor-pointer"
//           >
//             ← Back
//           </button>
//           <div className="flex gap-2">
//             <button
//               type="submit"
//               form="category-form"
//               className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 cursor-pointer"
//             >
//               {categoryId ? "Update Category" : "Save Category"}
//             </button>
//             <button
//               onClick={handleBack}
//               className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-100 cursor-pointer"
//             >
//               Cancel
//             </button>
//           </div>
//         </div>

//         <form
//           id="category-form"
//           onSubmit={handleSubmit(onSubmit)}
//           className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"
//         >
//           {/* Upload Image Card */}
//           <div className="bg-white rounded-xl shadow-md p-4 md:p-6">
//             <h2 className="text-lg font-semibold text-gray-800 mb-2">Upload Image</h2>
//             <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center relative">
//               {imagePreview ? (
//                 <>
//                   <img
//                     src={imagePreview}
//                     alt="Preview"
//                     className="mx-auto mb-4 h-52 object-contain rounded"
//                   />
//                   <button
//                     type="button"
//                     onClick={handleImageRemove}
//                     className="absolute top-2 right-2 text-sm bg-red-500 text-white rounded px-2 py-1 cursor-pointer"
//                   >
//                     Remove
//                   </button>
//                 </>
//               ) : (
//                 <>
//                   <svg
//                     className="mx-auto h-20 w-20 text-gray-400"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth="2"
//                       d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
//                     />
//                   </svg>
//                   <p className="mt-2 text-sm text-gray-600">Drag and drop your image here, or</p>
//                   <label className="inline-block mt-2 cursor-pointer px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
//                     Browse Files
//                     <input
//                       type="file"
//                       accept="image/*"
//                       className="hidden"
//                       onChange={handleImageChange}
//                     />
//                   </label>
//                 </>
//               )}
//             </div>
//           </div>

//           {/* Category Details */}
//           <div className="bg-white rounded-xl shadow-md p-4 md:p-6">
//             <h2 className="text-lg font-semibold text-gray-800 mb-2">Category Details</h2>
//             <div>
//               <label className="block mb-1 font-medium text-gray-700">Category Name</label>
//               <input
//                 type="text"
//                 {...register("name")}
//                 className="w-full px-3 py-2 border rounded-md"
//                 placeholder="Enter category name"
//               />
//               {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}

//               <label className="block mt-3 mb-1 font-medium text-gray-700">Slug</label>
//               <Input
//                 type="text"
//                 {...register("slug")}
//                 className="w-full px-3 py-2 border rounded-md"
//                 placeholder="Slug"
//                 disabled
//               />
//               {errors.slug && <p className="text-red-500 text-sm mt-1">{errors.slug.message}</p>}

//               <label className="block mt-3 mb-1 font-medium text-gray-700">Description</label>
//               <textarea
//                 {...register("description")}
//                 rows={4}
//                 className="w-full px-3 py-2 border rounded-md max-h-50 min-h-10"
//                 placeholder="Description"
//                 maxLength={501}
//               />
//               {errors.description && (
//                 <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
//               )}

//               <label className="block mt-3 mb-1 font-medium text-gray-700">Parent Category</label>
//               <select {...register("parent")} className="w-full px-3 py-2 border rounded-md">
//                 <option value="">Select parent category (if applicable)</option>
//                 {categories.map((category: any) => (
//                   <option key={category.id} value={category.category_id}>
//                     {category.category_name}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           </div>

//           {/* Features */}
//           <div className="bg-white rounded-xl shadow-md p-4 md:p-6">
//             <h2 className="text-lg font-semibold text-gray-800 mb-2">Features</h2>
//             <div className="space-y-3">
//               {["featured", "homepage", "promotions"].map((feature) => (
//                 <label key={feature} className="flex items-center gap-2">
//                   <input
//                     type="checkbox"
//                     {...register(`features.${feature}` as const)}
//                     className="h-4 w-4"
//                   />
//                   {feature.charAt(0).toUpperCase() + feature.slice(1)}
//                 </label>
//               ))}
//             </div>
//           </div>

//           {/* SEO Fields */}
//           <div className="bg-white rounded-xl shadow-md p-4 md:p-6">
//             <h2 className="text-lg font-semibold text-gray-800 mb-2">SEO Optimization</h2>

//             <label className="block mb-1 font-medium text-gray-700">Meta Title</label>
//             <input
//               type="text"
//               {...register("metaTitle")}
//               className="w-full px-3 py-2 border rounded-md"
//               placeholder="SEO title"
//             />
//             {errors.metaTitle && (
//               <p className="text-red-500 text-sm mt-1">{errors.metaTitle.message}</p>
//             )}

//             <label className="block mt-3 mb-1 font-medium text-gray-700">Meta Description</label>
//             <textarea
//               {...register("metaDescription")}
//               rows={3}
//               className="w-full px-3 py-2 border rounded-md max-h-40 min-h-10"
//               placeholder="Short SEO description"
//               maxLength={161}
//             />
//             {errors.metaDescription && (
//               <p className="text-red-500 text-sm mt-1">{errors.metaDescription.message}</p>
//             )}
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default CategoryCreation;


"use client";

import React, { useEffect, useState } from "react";
import slugify from "slugify";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import axiosInstance from "@/lib/axiosInstance";
import { toast } from "sonner";

// Zod Schema
const categorySchema = z.object({
  name: z
    .string()
    .min(3, "Category name must be at least 3 characters")
    .max(50, "Category name must not exceed 50 characters")
    .regex(/^[A-Za-z\s-]+$/, "Only letters,  spaces, and hyphens allowed")
    .refine((val) => val.trim().length > 0, {
      message: "Category name cannot be just spaces",
    }),
  slug: z
    .string()
    .min(1, "Slug is required")
    .refine((val) => !/<[^>]*script.*?>|('|--|;|\/\*|\*\/|xp_)/gi.test(val), {
      message: "Slug contains potentially dangerous content",
    }),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional()
    .or(z.literal("")),
  metaTitle: z
    .string()
    .max(70, "Meta title must be less than 70 characters")
    .optional()
    .or(z.literal("")),
  metaDescription: z
    .string()
    .max(160, "Meta description must be less than 160 characters")
    .optional()
    .or(z.literal("")),
  parent: z.string().optional(),
  features: z.object({
    featured: z.boolean(),
    homepage: z.boolean(),
    promotions: z.boolean(),
  }),
});

type CategoryFormData = z.infer<typeof categorySchema>;

const CategoryCreation = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryId = searchParams.get("id");

  const [categories, setCategories] = useState([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [nameTouched, setNameTouched] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      metaTitle: "",
      metaDescription: "",
      parent: "",
      features: {
        featured: false,
        homepage: false,
        promotions: false,
      },
    },
  });

  const name = watch("name");

  // Auto-generate slug *only* if user has touched name
  useEffect(() => {
    if (nameTouched) {
      setValue("slug", slugify(name || "", { lower: true, strict: true }));
    }
  }, [name, nameTouched, setValue]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setSelectedImageFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleImageRemove = () => {
    setImagePreview(null);
    setSelectedImageFile(null);
  };

  const handleBack = () => {
    router.push("/Categories");
  };

  const fetchCategories = async () => {
    try {
      const response = await axiosInstance.get("/api/v1/categories/?status_filter=false");
      setCategories(response.data.data);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const fetchCategory = async (id: string) => {
    try {
      const response = await axiosInstance.get(`api/v1/categories_or_subcategories_by_id/details/${id}`);
      const category = response.data.data;

      setValue("name", category.category_name || category.subcategory_name || "");
      setValue("slug", category.category_slug || category.subcategory_slug || "");
      setValue("description", category.category_description || category.subcategory_description || "");
      setValue("metaTitle", category.category_meta_title || category.subcategory_meta_titl || "");
      setValue("metaDescription", category.category_meta_description || category.subcategory_meta_description || "");
      setValue("parent", category.category_id || "");
      setValue("features", {
        featured: category.featured_category || category.featured_subcategory,
        homepage: category.show_in_menu,
        promotions: false,
      });

      setNameTouched(false);

      if (category.category_img_thumbnail || category.subcategory_img_thumbnail) {
        setImagePreview(`${category.category_img_thumbnail || category.subcategory_img_thumbnail}`);
      }
    } catch (error) {
      console.error("Failed to fetch category:", error);
    }
  };

  useEffect(() => {
    fetchCategories();
    if (categoryId) fetchCategory(categoryId);
  }, [categoryId]);

  const onSubmit = async (data: CategoryFormData) => {
    try {
      const formData = new FormData();

      formData.append("name", data.name);
      formData.append("slug", data.slug);
      formData.append("description", data.description || "");
      formData.append("meta_title", data.metaTitle || "");
      formData.append("meta_description", data.metaDescription || "");
      formData.append("category_id", data.parent || "");
      formData.append("featured", String(data.features.featured));
      formData.append("show_in_menu", String(data.features.homepage));

      if (selectedImageFile) {
        formData.append("file", selectedImageFile);
      }

      const endpoint = categoryId
        ? `/api/v1/categories_or_subcategories_by_id/update/${categoryId}`
        : "/api/v1/categories/create";
      const method = categoryId ? "put" : "post";

      const response = await axiosInstance[method](endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.statusCode === 200 || response.data.statusCode === 201) {
        toast.success(response.data.message);
        router.push("/Categories");
      }
    } catch (error: any) {
      const message =
        error?.response?.data?.detail?.message || "Failed to save category.";
      toast.error(message);
      console.error("Error saving category:", error);
    }
  };

  return (
    <div className="bg-gray-50 pt-6 pb-6 px-4 md:px-8">
      <div className="max-w-6xl mx-auto text-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 cursor-pointer"
          >
            ← Back
          </button>
          <div className="flex gap-2">
            <button
              type="submit"
              form="category-form"
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 cursor-pointer"
            >
              {categoryId ? "Update Category" : "Save Category"}
            </button>
            <button
              onClick={handleBack}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-100 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>

        <form
          id="category-form"
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"
        >
          {/* Upload Image Card */}
          <div className="bg-white rounded-xl shadow-md p-4 md:p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Upload Image</h2>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center relative">
              {imagePreview ? (
                <>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="mx-auto mb-4 h-52 object-contain rounded"
                  />
                  <button
                    type="button"
                    onClick={handleImageRemove}
                    className="absolute top-2 right-2 text-sm bg-red-500 text-white rounded px-2 py-1 cursor-pointer"
                  >
                    Remove
                  </button>
                </>
              ) : (
                <>
                  <svg
                    className="mx-auto h-20 w-20 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                    />
                  </svg>
                  <p className="mt-2 text-sm text-gray-600">Drag and drop your image here, or</p>
                  <label className="inline-block mt-2 cursor-pointer px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                    Browse Files
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </label>
                </>
              )}
            </div>
          </div>

          {/* Category Details */}
          <div className="bg-white rounded-xl shadow-md p-4 md:p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Category Details</h2>
            <div>
              <label className="block mb-1 font-medium text-gray-700">Category Name</label>
              <input
                type="text"
                {...register("name")}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Enter category name"
                onChange={(e) => {
                  setValue("name", e.target.value);
                  setNameTouched(true);
                }}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}

              <label className="block mt-3 mb-1 font-medium text-gray-700">Slug</label>
              <Input
                type="text"
                {...register("slug")}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Slug"
                disabled
              />
              {errors.slug && <p className="text-red-500 text-sm mt-1">{errors.slug.message}</p>}

              <label className="block mt-3 mb-1 font-medium text-gray-700">Description</label>
              <textarea
                {...register("description")}
                rows={4}
                className="w-full px-3 py-2 border rounded-md max-h-50 min-h-10"
                placeholder="Description"
                maxLength={501}
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
              )}

              <label className="block mt-3 mb-1 font-medium text-gray-700">Parent Category</label>
              <select {...register("parent")} className="w-full px-3 py-2 border rounded-md">
                <option value="">Select parent category (if applicable)</option>
                {categories.map((category: any) => (
                  <option key={category.id} value={category.category_id}>
                    {category.category_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Features */}
          <div className="bg-white rounded-xl shadow-md p-4 md:p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Features</h2>
            <div className="space-y-3">
              {["featured", "homepage", "promotions"].map((feature) => (
                <label key={feature} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    {...register(`features.${feature}` as const)}
                    className="h-4 w-4"
                  />
                  {feature.charAt(0).toUpperCase() + feature.slice(1)}
                </label>
              ))}
            </div>
          </div>

          {/* SEO Fields */}
          <div className="bg-white rounded-xl shadow-md p-4 md:p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">SEO Optimization</h2>

            <label className="block mb-1 font-medium text-gray-700">Meta Title</label>
            <input
              type="text"
              {...register("metaTitle")}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="SEO title"
            />
            {errors.metaTitle && (
              <p className="text-red-500 text-sm mt-1">{errors.metaTitle.message}</p>
            )}

            <label className="block mt-3 mb-1 font-medium text-gray-700">Meta Description</label>
            <textarea
              {...register("metaDescription")}
              rows={3}
              className="w-full px-3 py-2 border rounded-md max-h-40 min-h-10"
              placeholder="Short SEO description"
              maxLength={161}
            />
            {errors.metaDescription && (
              <p className="text-red-500 text-sm mt-1">{errors.metaDescription.message}</p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryCreation;
