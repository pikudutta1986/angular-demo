import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, NavigationEnd, ActivatedRoute } from '@angular/router';
import { ProductService, ProductDto } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { generateProductSlug } from '../../utils/slug.util';

interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  brand: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  isNew: boolean;
  isSale: boolean;
  tags: string[];
  description: string;
  createdAt?: string;
}

interface FilterOptions {
  categories: string[];
  brands: string[];
  priceRange: { min: number; max: number };
  ratings: number[];
  inStock: boolean;
  isNew: boolean;
  isSale: boolean;
}

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './product.html',
  styleUrl: './product.scss'
})
export class ProductComponent implements OnInit, OnDestroy {
  title = 'Products';
  private destroy$ = new Subject<void>();
  private previousUrl = '';

  // Product data
  products: Product[] = [];
  filteredProducts: Product[] = [];
  totalProducts: number = 0;
  totalPages: number = 0;
  allProductsCache: ProductDto[] = []; // Cache for total count calculation

  // Filter options
  filters: FilterOptions = {
    categories: [],
    brands: [],
    priceRange: { min: 0, max: 0 },
    ratings: [],
    inStock: false,
    isNew: false,
    isSale: false
  };

  // Available filter values
  availableCategories: string[] = [];
  availableBrands: string[] = [];

  // UI state
  sortBy: string = 'name';
  viewMode: 'grid' | 'list' = 'grid';
  showFilters: boolean = true;
  currentPage: number = 1;
  itemsPerPage: number = 12;
  isLoading: boolean = false;
  errorMessage: string | null = null;

  // Sort options
  sortOptions = [
    { value: 'name', label: 'Name A-Z' },
    { value: 'name-desc', label: 'Name Z-A' },
    { value: 'price', label: 'Price Low to High' },
    { value: 'price-desc', label: 'Price High to Low' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'newest', label: 'Newest First' }
  ];

  constructor(
    private productService: ProductService,
    private route: ActivatedRoute,
    private router: Router,
    private cartService: CartService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    // Initialize price range with default max if not set
    if (this.filters.priceRange.max === 0) {
      this.filters.priceRange.max = 10000;
    }
    // Load paginated products immediately
    this.loadProducts();
    // Also load all products in background for filter options and total count
    this.loadAllProductsForFiltering();

    // Listen to router navigation events to reload when navigating to this route
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event: NavigationEnd) => {
        const currentUrl = event.urlAfterRedirects || event.url;

        // Only reload if we're navigating TO /products from a different route
        if ((currentUrl === '/products' || currentUrl.startsWith('/products')) && this.previousUrl !== currentUrl) {
          // Reset to first page when navigating to products page
          this.currentPage = 1;
          // Reset filters if navigating from another page (without query params)
          if (!currentUrl.startsWith('/products?')) {
            // Reset filters without calling loadProducts (we'll call it after)
            const priceRange = this.allProductsCache.length > 0
              ? (() => {
                const allMapped = this.allProductsCache.map(item => this.mapDtoToProduct(item));
                const prices = allMapped.map(p => p.price);
                return {
                  min: Math.floor(Math.min(...prices)),
                  max: Math.ceil(Math.max(...prices))
                };
              })()
              : { min: 0, max: 0 };

            this.filters = {
              categories: [],
              brands: [],
              priceRange: priceRange,
              ratings: [],
              inStock: false,
              isNew: false,
              isSale: false
            };
          }
          this.loadProducts();
        }

        // Update previous URL
        this.previousUrl = currentUrl;
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private mapDtoToProduct(dto: ProductDto): Product {
    // Extract first image from pipe-separated string
    const imageUrl = dto.images?.split('|')[0]?.trim() || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2RkZCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';

    // Extract tags from specification or use empty array
    const tags = dto.specification ? dto.specification.split('|').map(s => s.trim()) : [];

    // Calculate if product is new (created within last 30 days)
    const createdAt = new Date(dto.created_at);
    const daysSinceCreation = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
    const isNew = daysSinceCreation <= 30;

    // Default values for missing fields
    return {
      id: dto.id,
      name: dto.name || '',
      price: dto.price || 0,
      originalPrice: undefined, // API doesn't provide this
      image: imageUrl,
      category: dto.category || 'General',
      brand: 'Brand', // API doesn't provide brand, using default
      rating: 4.0, // Default rating
      reviewCount: 0, // Default review count
      inStock: true, // Default to in stock
      isNew: isNew,
      isSale: false, // API doesn't provide sale status
      tags: tags,
      description: dto.description || '',
      createdAt: dto.created_at
    };
  }

  public loadProducts() {
    this.isLoading = true;
    this.errorMessage = null;

    // Build API parameters
    const apiParams: any = {
      page: this.currentPage,
      pageSize: this.itemsPerPage
    };

    // Add category filter (use first selected category if multiple)
    if (this.filters.categories.length > 0) {
      apiParams.category = this.filters.categories[0];
    }

    // Add price range filter
    if (this.filters.priceRange.min > 0) {
      apiParams.minPrice = this.filters.priceRange.min;
    }
    if (this.filters.priceRange.max > 0) {
      apiParams.maxPrice = this.filters.priceRange.max;
    }

    // Add sort parameter
    if (this.sortBy) {
      apiParams.sort = this.sortBy;
    }

    this.productService.getProducts(apiParams).subscribe({
      next: (res) => {
        this.isLoading = false;
        const items = res?.data || [];

        // Validate response
        if (!res.success) {
          this.errorMessage = res.message || 'Failed to load products';
          this.products = [];
          this.filteredProducts = [];
          return;
        }

        this.products = items.map(item => this.mapDtoToProduct(item));
        
        // Use server-side pagination - always rely on server response
        if (res.total !== undefined) {
          this.totalProducts = res.total;
          this.totalPages = res.totalPages || Math.ceil(res.total / this.itemsPerPage);
        } else {
          // Fallback: if server doesn't provide total, estimate from current page
          if (items.length === this.itemsPerPage) {
            // Assume there are more pages if we got a full page
            this.totalPages = this.currentPage + 1;
            this.totalProducts = this.totalPages * this.itemsPerPage;
          } else {
            // Last page or only page
            this.totalPages = Math.max(1, this.currentPage);
            this.totalProducts = (this.currentPage - 1) * this.itemsPerPage + items.length;
          }
        }

        // Apply client-side filters only for display (brand, rating, stock, new, sale)
        // These don't affect server-side pagination count
        if (this.hasActiveClientSideFilters()) {
          this.applyClientSideFilters();
        } else {
          this.filteredProducts = [...this.products];
        }

        this.initializeFilters();
        this.cdr.detectChanges(); // Trigger change detection for SSR/zoneless mode
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error loading products:', err);

        // Handle different error types
        if (err.status === 404) {
          this.errorMessage = 'No products found';
        } else if (err.status === 400) {
          this.errorMessage = err.error?.message || 'Invalid request';
        } else if (err.status >= 500) {
          this.errorMessage = 'Server error. Please try again later.';
        } else if (err.status === 0) {
          this.errorMessage = 'Network error. Please check your connection.';
        } else {
          this.errorMessage = err.error?.message || err.message || 'Failed to load products';
        }

        this.products = [];
        this.filteredProducts = [];
        this.totalProducts = 0;
        this.totalPages = 0;
        this.cdr.detectChanges(); // Trigger change detection for SSR/zoneless mode
      }
    });
  }

  private calculateTotalFromCache() {
    // Apply same filters to cached products to get total count
    let filtered = [...this.allProductsCache];

    // Category filter
    if (this.filters.categories.length > 0) {
      filtered = filtered.filter(p => this.filters.categories.includes(p.category));
    }

    // Price range filter
    if (this.filters.priceRange.min > 0 || this.filters.priceRange.max > 0) {
      filtered = filtered.filter(p =>
        p.price >= this.filters.priceRange.min && p.price <= this.filters.priceRange.max
      );
    }

    this.totalProducts = filtered.length;
    this.totalPages = Math.ceil(this.totalProducts / this.itemsPerPage);
  }

  private loadAllProductsForFiltering() {
    // Load all products without pagination to get filter options only
    // Note: This is only for initializing filter dropdowns, not for pagination
    this.productService.getProducts({ pageSize: 1000 }).subscribe({
      next: (res) => {
        const allItems = res?.data || [];
        this.allProductsCache = allItems;

        // Initialize filters from all products (for dropdown options only)
        this.initializeFiltersFromAllProducts(allItems);
      },
      error: (err) => {
        console.error('Error loading all products for filtering:', err);
        // Don't block UI if cache fails, but try to use current products for filters
        if (this.products.length > 0) {
          this.initializeFilters();
        }
      }
    });
  }

  private initializeFiltersFromAllProducts(allProducts: ProductDto[]) {
    const allMapped = allProducts.map(item => this.mapDtoToProduct(item));
    this.availableCategories = [...new Set(allMapped.map(p => p.category))];
    this.availableBrands = [...new Set(allMapped.map(p => p.brand))];

    if (allMapped.length > 0) {
      const prices = allMapped.map(p => p.price);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      if (this.filters.priceRange.min === 0 && this.filters.priceRange.max === 0) {
        this.filters.priceRange = {
          min: Math.floor(minPrice),
          max: Math.ceil(maxPrice)
        };
      }
    }
  }

  private initializeFilters() {
    // Extract categories and brands from current page products
    this.availableCategories = [...new Set(this.products.map(p => p.category))];
    this.availableBrands = [...new Set(this.products.map(p => p.brand))];

    // Set price range based on actual products if not already set
    if (this.products.length > 0 && (this.filters.priceRange.min === 0 && this.filters.priceRange.max === 0)) {
      const prices = this.products.map(p => p.price);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      this.filters.priceRange = {
        min: Math.floor(minPrice),
        max: Math.ceil(maxPrice)
      };
    }
  }

  onCategoryChange(category: string, checked: boolean) {
    if (checked) {
      this.filters.categories.push(category);
    } else {
      this.filters.categories = this.filters.categories.filter(c => c !== category);
    }
    this.currentPage = 1;
    this.loadProducts();
  }

  onBrandChange(brand: string, checked: boolean) {
    if (checked) {
      this.filters.brands.push(brand);
    } else {
      this.filters.brands = this.filters.brands.filter(b => b !== brand);
    }
    this.currentPage = 1;
    this.applyClientSideFilters();
  }

  onPriceRangeChange() {
    this.currentPage = 1;
    this.loadProducts();
  }

  onRatingChange(rating: number, checked: boolean) {
    if (checked) {
      this.filters.ratings.push(rating);
    } else {
      this.filters.ratings = this.filters.ratings.filter(r => r !== rating);
    }
    this.currentPage = 1;
    this.applyClientSideFilters();
  }

  onFilterToggle(filter: keyof FilterOptions) {
    this.filters[filter] = !this.filters[filter] as any;
    this.currentPage = 1;
    this.applyClientSideFilters();
  }

  onSortChange() {
    this.currentPage = 1;
    this.loadProducts();
  }

  onViewModeChange(mode: 'grid' | 'list') {
    this.viewMode = mode;
  }

  toggleFilters() {
    this.showFilters = !this.showFilters;
  }

  clearAllFilters() {
    // Reset filters - price range will be set after loading products
    this.filters = {
      categories: [],
      brands: [],
      priceRange: { min: 0, max: 0 },
      ratings: [],
      inStock: false,
      isNew: false,
      isSale: false
    };
    this.currentPage = 1;
    this.loadProducts();
  }

  private hasActiveClientSideFilters(): boolean {
    return this.filters.brands.length > 0 ||
      this.filters.ratings.length > 0 ||
      this.filters.inStock ||
      this.filters.isNew ||
      this.filters.isSale;
  }

  private applyClientSideFilters() {
    // Apply client-side filters that API doesn't support (brand, rating, stock, new, sale)
    let filtered = [...this.products];

    // Brand filter (client-side)
    if (this.filters.brands.length > 0) {
      filtered = filtered.filter(p => this.filters.brands.includes(p.brand));
    }

    // Rating filter (client-side)
    if (this.filters.ratings.length > 0) {
      filtered = filtered.filter(p =>
        this.filters.ratings.some(rating => p.rating >= rating)
      );
    }

    // Stock filter (client-side)
    if (this.filters.inStock) {
      filtered = filtered.filter(p => p.inStock);
    }

    // New filter (client-side)
    if (this.filters.isNew) {
      filtered = filtered.filter(p => p.isNew);
    }

    // Sale filter (client-side)
    if (this.filters.isSale) {
      filtered = filtered.filter(p => p.isSale);
    }

    // Client-side sorting (if server didn't sort)
    this.sortProducts(filtered);

    this.filteredProducts = filtered;
  }

  private sortProducts(products: Product[]) {
    switch (this.sortBy) {
      case 'name':
        products.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        products.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'price':
        products.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        products.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        products.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        products.sort((a, b) => {
          if (a.createdAt && b.createdAt) {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          }
          return b.id - a.id;
        });
        break;
    }
  }

  getPagedProducts() {
    // With server-side pagination, products are already paged from server
    // Client-side filters (brand, rating, etc.) are applied for display only
    return this.filteredProducts;
  }

  getTotalPages(): number {
    // Always use server-side totalPages
    return this.totalPages || 1;
  }

  getPageNumbers(): number[] {
    const total = this.getTotalPages();
    const pages: number[] = [];
    for (let i = 1; i <= total; i++) {
      pages.push(i);
    }
    return pages;
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  getDiscountPercentage(originalPrice: number, currentPrice: number): number {
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  }

  onAddToCart(product: Product) {
    const productDto: ProductDto = {
      id: product.id,
      name: product.name,
      code: `PROD-${product.id}`,
      category: product.category,
      price: product.price,
      specification: '',
      description: product.description,
      images: product.image,
      created_at: product.createdAt || new Date().toISOString()
    };
    this.cartService.addToCart(productDto, 1);
  }

  onAddToWishlist(product: Product) {
    // Implement add to wishlist logic (if wishlist service exists)
    // For now, this is a placeholder
  }

  getFloorRating(rating: number): number {
    return Math.floor(rating);
  }

  getCategoryCount(category: string): number {
    return this.products.filter(p => p.category === category).length;
  }

  getBrandCount(brand: string): number {
    return this.products.filter(p => p.brand === brand).length;
  }

  getMaxPrice(): number {
    // Always use 10000 as the maximum for the slider range
    // The actual max price from products is used for filtering, but slider needs a fixed max
    return 10000;
  }

  getMinPrice(): number {
    // Ensure min is at least 0 and not greater than the current min value
    return Math.max(0, this.filters.priceRange.min || 0);
  }

  getRangeLeft(): number {
    const maxPrice = this.getMaxPrice();
    const minValue = this.filters.priceRange.min || 0;
    // Return percentage (0-100) for the left position
    return (minValue / maxPrice) * 100;
  }

  getRangeWidth(): number {
    const maxPrice = this.getMaxPrice();
    const minValue = this.filters.priceRange.min || 0;
    const maxValue = this.filters.priceRange.max || maxPrice;
    const leftPercent = (minValue / maxPrice) * 100;
    const rightPercent = (maxValue / maxPrice) * 100;
    return Math.max(0, rightPercent - leftPercent);
  }

  getProductSlug(product: Product): string {
    return generateProductSlug(product.name, product.id);
  }
}
