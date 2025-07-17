import { api, ApiResponse } from '../axios';

// Types for Category Management
export interface Category {
  id: string;
  title: string;
  description?: string;
  slug: string;
  parent_category_id?: string;
  image_url?: string;
  meta_title?: string;
  meta_description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  children?: Category[];
}

export interface CategoryFormData {
  title: string;
  description?: string;
  slug: string;
  parent_category_id?: string;
  image?: File;
  meta_title?: string;
  meta_description?: string;
  is_active?: boolean;
}

export interface CategoryListResponse {
  categories: Category[];
  total: number;
  page: number;
  limit: number;
}

// Category API endpoints
export const categoryApi = {
  // Get all categories (flat list)
  getCategories: (params?: { 
    page?: number; 
    limit?: number;
    parent_id?: string;
    is_active?: boolean;
  }) =>
    api.get<CategoryListResponse>('/admin/categories', { params }),

  // Get a specific category by ID
  getCategory: (id: string) =>
    api.get<Category>(`/admin/categories/${id}`),

  // Create a new category
  createCategory: (data: CategoryFormData) => {
    const formData = new FormData();
    
    // Add all text fields
    Object.entries(data).forEach(([key, value]) => {
      if (key !== 'image' && value !== undefined) {
        formData.append(key, String(value));
      }
    });
    
    // Add image if it exists
    if (data.image) {
      formData.append('image', data.image);
    }
    
    return api.post<Category>('/admin/categories', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Update an existing category
  updateCategory: (id: string, data: Partial<CategoryFormData>) => {
    const formData = new FormData();
    
    // Add all text fields
    Object.entries(data).forEach(([key, value]) => {
      if (key !== 'image' && value !== undefined) {
        formData.append(key, String(value));
      }
    });
    
    // Add image if it exists
    if (data.image) {
      formData.append('image', data.image);
    }
    
    return api.patch<Category>(`/admin/categories/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Delete a category
  deleteCategory: (id: string) =>
    api.delete<ApiResponse>(`/admin/categories/${id}`),

  // Toggle category active status
  toggleCategoryStatus: (id: string, is_active: boolean) =>
    api.patch<Category>(`/admin/categories/${id}/status`, { is_active }),
};

// Mock data for development
export const getCategoriesMock = (params?: any): ApiResponse<CategoryListResponse> => {
  const page = params?.page || 1;
  const limit = params?.limit || 20;
  
  const mockCategories: Category[] = [
    {
      id: 'cat-1',
      title: 'Concerts',
      description: 'Live music performances and concerts',
      slug: 'concerts',
      image_url: 'https://placehold.co/400x300/e2e8f0/1e293b?text=Concerts',
      meta_title: 'Concert Tickets | Events2Go',
      meta_description: 'Find and book tickets for the best concerts in your city.',
      is_active: true,
      created_at: '2024-01-10T10:30:00Z',
      updated_at: '2024-03-15T14:45:00Z'
    },
    {
      id: 'cat-2',
      title: 'Workshops',
      description: 'Educational and skill-building workshops',
      slug: 'workshops',
      image_url: 'https://placehold.co/400x300/e2e8f0/1e293b?text=Workshops',
      meta_title: 'Workshop Tickets | Events2Go',
      meta_description: 'Discover workshops and classes to learn new skills.',
      is_active: true,
      created_at: '2024-01-15T11:20:00Z',
      updated_at: '2024-01-15T11:20:00Z'
    },
    {
      id: 'cat-3',
      title: 'Conferences',
      description: 'Professional and academic conferences',
      slug: 'conferences',
      image_url: 'https://placehold.co/400x300/e2e8f0/1e293b?text=Conferences',
      meta_title: 'Conference Tickets | Events2Go',
      meta_description: 'Find industry conferences and professional events.',
      is_active: true,
      created_at: '2024-01-20T09:15:00Z',
      updated_at: '2024-02-10T16:30:00Z'
    },
    {
      id: 'cat-4',
      title: 'Sports',
      description: 'Sporting events and competitions',
      slug: 'sports',
      image_url: 'https://placehold.co/400x300/e2e8f0/1e293b?text=Sports',
      meta_title: 'Sports Events | Events2Go',
      meta_description: 'Get tickets to sporting events and competitions.',
      is_active: true,
      created_at: '2024-02-01T13:45:00Z',
      updated_at: '2024-02-01T13:45:00Z'
    },
    {
      id: 'cat-5',
      title: 'Exhibitions',
      description: 'Art exhibitions and showcases',
      slug: 'exhibitions',
      image_url: 'https://placehold.co/400x300/e2e8f0/1e293b?text=Exhibitions',
      meta_title: 'Art Exhibitions | Events2Go',
      meta_description: 'Explore art exhibitions and cultural showcases.',
      is_active: false,
      created_at: '2024-02-15T10:00:00Z',
      updated_at: '2024-04-05T11:30:00Z'
    },
    {
      id: 'subcat-1',
      title: 'Rock Concerts',
      description: 'Rock and alternative music concerts',
      slug: 'rock-concerts',
      parent_category_id: 'cat-1',
      image_url: 'https://placehold.co/400x300/e2e8f0/1e293b?text=Rock+Concerts',
      meta_title: 'Rock Concert Tickets | Events2Go',
      meta_description: 'Find tickets for rock and alternative music concerts.',
      is_active: true,
      created_at: '2024-01-12T14:30:00Z',
      updated_at: '2024-01-12T14:30:00Z'
    },
    {
      id: 'subcat-2',
      title: 'Jazz & Blues',
      description: 'Jazz and blues music performances',
      slug: 'jazz-blues',
      parent_category_id: 'cat-1',
      image_url: 'https://placehold.co/400x300/e2e8f0/1e293b?text=Jazz+Blues',
      meta_title: 'Jazz & Blues Tickets | Events2Go',
      meta_description: 'Discover jazz and blues concerts in your area.',
      is_active: true,
      created_at: '2024-01-14T15:45:00Z',
      updated_at: '2024-03-20T09:15:00Z'
    },
    {
      id: 'subcat-3',
      title: 'Coding Workshops',
      description: 'Programming and software development workshops',
      slug: 'coding-workshops',
      parent_category_id: 'cat-2',
      image_url: 'https://placehold.co/400x300/e2e8f0/1e293b?text=Coding+Workshops',
      meta_title: 'Coding Workshops | Events2Go',
      meta_description: 'Learn programming skills with hands-on coding workshops.',
      is_active: true,
      created_at: '2024-01-18T11:00:00Z',
      updated_at: '2024-01-18T11:00:00Z'
    },
    {
      id: 'subcat-4',
      title: 'Tech Conferences',
      description: 'Technology and innovation conferences',
      slug: 'tech-conferences',
      parent_category_id: 'cat-3',
      image_url: 'https://placehold.co/400x300/e2e8f0/1e293b?text=Tech+Conferences',
      meta_title: 'Technology Conferences | Events2Go',
      meta_description: 'Attend the latest technology and innovation conferences.',
      is_active: true,
      created_at: '2024-01-25T13:20:00Z',
      updated_at: '2024-01-25T13:20:00Z'
    },
    {
      id: 'subcat-5',
      title: 'Football Matches',
      description: 'Professional and amateur football matches',
      slug: 'football-matches',
      parent_category_id: 'cat-4',
      image_url: 'https://placehold.co/400x300/e2e8f0/1e293b?text=Football+Matches',
      meta_title: 'Football Match Tickets | Events2Go',
      meta_description: 'Get tickets to upcoming football matches and tournaments.',
      is_active: true,
      created_at: '2024-02-05T09:30:00Z',
      updated_at: '2024-02-05T09:30:00Z'
    }
  ];
  
  // Filter by parent_id if provided
  let filteredCategories = mockCategories;
  if (params?.parent_id) {
    filteredCategories = filteredCategories.filter(category => 
      category.parent_category_id === params.parent_id
    );
  } else if (params?.parent_id === '') {
    // If empty string is provided, return only root categories
    filteredCategories = filteredCategories.filter(category => 
      !category.parent_category_id
    );
  }
  
  // Filter by active status if provided
  if (params?.is_active !== undefined) {
    filteredCategories = filteredCategories.filter(category => 
      category.is_active === params.is_active
    );
  }
  
  // Paginate results
  const paginatedCategories = filteredCategories.slice((page - 1) * limit, page * limit);
  
  return {
    statusCode: 200,
    message: 'Categories retrieved successfully',
    timestamp: new Date().toISOString(),
    method: 'GET',
    path: '/admin/categories',
    data: {
      categories: paginatedCategories,
      total: filteredCategories.length,
      page,
      limit
    }
  };
};

// Helper function to transform flat category list to hierarchical structure
export const transformToHierarchy = (categories: Category[]): Category[] => {
  const rootCategories: Category[] = [];
  const categoryMap: Record<string, Category & { children?: Category[] }> = {};
  
  // First pass: create a map of all categories
  categories.forEach(category => {
    categoryMap[category.id] = { ...category, children: [] };
  });
  
  // Second pass: build the hierarchy
  categories.forEach(category => {
    if (category.parent_category_id && categoryMap[category.parent_category_id]) {
      // This is a subcategory, add it to its parent's children
      categoryMap[category.parent_category_id].children?.push(categoryMap[category.id]);
    } else {
      // This is a root category
      rootCategories.push(categoryMap[category.id]);
    }
  });
  
  return rootCategories;
};