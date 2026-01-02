import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService, ProductDto } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { generateProductSlug, extractIdFromSlug } from '../../utils/slug.util';

interface ProductImage {
  id: number;
  url: string;
  alt: string;
  isMain: boolean;
}

interface ProductVariant {
  id: number;
  name: string;
  value: string;
  price?: number;
  inStock: boolean;
}

interface ProductReview {
  id: number;
  userName: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
  verified: boolean;
  helpful: number;
}

interface ProductDetails {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  images: ProductImage[];
  category: string;
  brand: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  isNew: boolean;
  isSale: boolean;
  tags: string[];
  description: string;
  longDescription: string;
  specifications: { [key: string]: string };
  variants: ProductVariant[];
  reviews: ProductReview[];
  relatedProducts: any[];
}

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './product-details.html',
  styleUrl: './product-details.scss'
})
export class ProductDetailsComponent implements OnInit, OnDestroy {
  title = 'Product Details';
  product: ProductDetails | null = null;
  productDto: ProductDto | null = null;
  selectedImageIndex = 0;
  selectedVariants: { [key: string]: string } = {};
  quantity = 1;
  activeTab = 'description';
  showImageModal = false;
  selectedImageForModal = '';
  isLoading = true;
  errorMessage: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cartService: CartService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    // Load product immediately from route snapshot (for initial load)
    const slug = this.route.snapshot.paramMap.get('slug');
    if (slug) {
      this.loadProductBySlug(slug);
    } else {
      this.isLoading = false;
      this.errorMessage = 'Invalid product slug';
    }

    // Subscribe to route parameter changes (for navigation between products)
    this.route.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const newSlug = params.get('slug');
        if (newSlug) {
          // Only reload if the slug actually changed (avoid reload on same product)
          if (!this.product || this.getCurrentSlug() !== newSlug) {
            this.loadProductBySlug(newSlug);
          }
        } else {
          this.isLoading = false;
          this.errorMessage = 'Invalid product slug';
        }
      });
  }

  private getCurrentSlug(): string {
    if (!this.product) return '';
    return generateProductSlug(this.product.name, this.product.id);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public loadProductBySlug(slug: string) {
    // Reset state when loading new product
    this.isLoading = true;
    this.errorMessage = null;
    this.product = null;
    this.selectedImageIndex = 0;
    this.selectedVariants = {};
    this.quantity = 1;
    this.activeTab = 'description';

    if (!slug || slug.trim() === '') {
      this.isLoading = false;
      this.errorMessage = 'Invalid product slug';
      return;
    }

    // Try to get product by slug first, fallback to extracting ID from slug
    this.productService.getProductBySlug(slug).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.error) {
          this.errorMessage = res.error || 'Product not found';
          this.product = null;
          return;
        }
        const dto = res?.data;
        if (!dto) {
          this.errorMessage = 'Product not found';
          this.product = null;
          this.productDto = null;
          return;
        }
        this.productDto = dto;
        this.product = this.mapDtoToProductDetails(dto);
        this.initializeVariants();
        this.loadRelatedProducts(dto.category);
        this.cdr.detectChanges(); // Trigger change detection for SSR/zoneless mode
      },
      error: (err) => {
        // If slug-based lookup fails, try extracting ID from slug as fallback
        const productId = extractIdFromSlug(slug);
        if (productId && err.status === 404) {
          // Fallback to ID-based lookup
          this.loadProductById(productId);
          return;
        }

        this.isLoading = false;
        console.error('Error loading product:', err);

        // Handle different error types
        if (err.status === 404) {
          this.errorMessage = 'Product not found';
        } else if (err.status === 400) {
          this.errorMessage = err.error?.message || 'Invalid product request';
        } else if (err.status >= 500) {
          this.errorMessage = 'Server error. Please try again later.';
        } else {
          this.errorMessage = err.error?.message || err.message || 'Failed to load product';
        }
        this.product = null;
      }
    });
  }

  private loadProductById(id: number) {
    // Reset state when loading new product
    this.isLoading = true;
    this.errorMessage = null;
    this.product = null;
    this.selectedImageIndex = 0;
    this.selectedVariants = {};
    this.quantity = 1;
    this.activeTab = 'description';

    if (!id || isNaN(id)) {
      this.isLoading = false;
      this.errorMessage = 'Invalid product ID';
      return;
    }

    this.productService.getProductById(id).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.error) {
          this.errorMessage = res.error || 'Product not found';
          this.product = null;
          return;
        }
        const dto = res?.data;
        if (!dto) {
          this.errorMessage = 'Product not found';
          this.product = null;
          this.productDto = null;
          return;
        }
        this.productDto = dto;
        this.product = this.mapDtoToProductDetails(dto);
        this.initializeVariants();
        this.loadRelatedProducts(dto.category);
        
        // Update URL to use slug if it's currently using ID
        const currentSlug = this.route.snapshot.paramMap.get('slug');
        const expectedSlug = generateProductSlug(dto.name, dto.id);
        if (currentSlug !== expectedSlug) {
          this.router.navigate(['/product', expectedSlug], { replaceUrl: true });
        }
        
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error loading product:', err);

        // Handle different error types
        if (err.status === 404) {
          this.errorMessage = 'Product not found';
        } else if (err.status === 400) {
          this.errorMessage = err.error?.message || 'Invalid product request';
        } else if (err.status >= 500) {
          this.errorMessage = 'Server error. Please try again later.';
        } else {
          this.errorMessage = err.error?.message || err.message || 'Failed to load product';
        }
        this.product = null;
      }
    });
  }

  private mapDtoToProductDetails(dto: ProductDto): ProductDetails {
    // Validate required fields
    if (!dto || !dto.id) {
      throw new Error('Invalid product data');
    }

    // Parse images from pipe-separated string
    const imageUrls = dto.images?.split('|').map(url => url.trim()).filter(url => url && url.length > 0) || [];
    const images: ProductImage[] = imageUrls.map((url, index) => ({
      id: index + 1,
      url: url,
      alt: `${dto.name || 'Product'} - Image ${index + 1}`,
      isMain: index === 0
    }));

    // If no images, add a placeholder
    if (images.length === 0) {
      images.push({
        id: 1,
        url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjgwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjgwMCIgZmlsbD0iI2RkZCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=',
        alt: dto.name || 'Product image',
        isMain: true
      });
    }

    // Parse specifications from pipe-separated string
    const specifications: { [key: string]: string } = {};
    if (dto.specification && dto.specification.trim()) {
      const specs = dto.specification.split('|').map(s => s.trim()).filter(s => s.length > 0);
      specs.forEach(spec => {
        const parts = spec.split(':').map(p => p.trim());
        if (parts.length >= 2) {
          const key = parts[0];
          const value = parts.slice(1).join(': ').trim();
          if (key) {
            specifications[key] = value || '';
          }
        } else if (spec) {
          specifications[spec] = '';
        }
      });
    }

    // Calculate if product is new (created within last 30 days)
    let isNew = false;
    if (dto.created_at) {
      try {
        const createdAt = new Date(dto.created_at);
        if (!isNaN(createdAt.getTime())) {
          const daysSinceCreation = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
          isNew = daysSinceCreation <= 30;
        }
      } catch (e) {
        console.warn('Invalid created_at date:', dto.created_at);
      }
    }

    // Extract tags from specification or use empty array
    const tags: string[] = [];
    if (dto.specification && dto.specification.trim()) {
      const specParts = dto.specification.split('|').map(s => s.trim()).filter(s => s.length > 0);
      specParts.forEach(spec => {
        const key = spec.split(':')[0]?.trim();
        if (key && !tags.includes(key)) {
          tags.push(key);
        }
      });
    }

    return {
      id: dto.id,
      name: dto.name || '',
      price: dto.price || 0,
      originalPrice: undefined, // API doesn't provide original price
      images: images,
      category: dto.category || 'General',
      brand: 'Brand', // API doesn't provide brand
      rating: 4.0, // Default rating
      reviewCount: 0, // Default review count
      inStock: true, // Default to in stock
      isNew: isNew,
      isSale: false, // API doesn't provide sale status
      tags: tags,
      description: dto.description || '',
      longDescription: dto.description || '', // Use description as long description
      specifications: specifications,
      variants: [], // API doesn't provide variants
      reviews: [], // API doesn't provide reviews
      relatedProducts: []
    };
  }

  private loadRelatedProducts(category?: string) {
    if (!category) {
      return;
    }

    this.productService.getProducts({ category, pageSize: 4 }).subscribe({
      next: (res) => {
        const items = res?.data || [];
        const related = items
          .filter(item => item.id !== this.product?.id)
          .slice(0, 3)
          .map(item => {
            const imageUrl = item.images?.split('|')[0]?.trim() || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2RkZCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
            return {
              id: item.id,
              name: item.name || '',
              price: item.price || 0,
              image: imageUrl,
              rating: 4.0
            };
          });
        if (this.product) {
          this.product.relatedProducts = related;
        }
      },
      error: (err) => {
        console.error('Error loading related products:', err);
        // Don't show error to user, just log it
        if (this.product) {
          this.product.relatedProducts = [];
        }
      }
    });
  }

  private initializeVariants() {
    if (this.product) {
      const variantGroups = this.product.variants.reduce((acc, variant) => {
        if (!acc[variant.name]) {
          acc[variant.name] = [];
        }
        acc[variant.name].push(variant);
        return acc;
      }, {} as { [key: string]: ProductVariant[] });

      // Set default selections
      Object.keys(variantGroups).forEach(groupName => {
        const availableVariant = variantGroups[groupName].find(v => v.inStock);
        if (availableVariant) {
          this.selectedVariants[groupName] = availableVariant.value;
        }
      });
    }
  }

  getVariantGroups() {
    if (!this.product) return {};

    return this.product.variants.reduce((acc, variant) => {
      if (!acc[variant.name]) {
        acc[variant.name] = [];
      }
      acc[variant.name].push(variant);
      return acc;
    }, {} as { [key: string]: ProductVariant[] });
  }

  onVariantChange(groupName: string, value: string) {
    this.selectedVariants[groupName] = value;
  }

  onImageSelect(index: number) {
    this.selectedImageIndex = index;
  }

  onImageClick(imageUrl: string) {
    this.selectedImageForModal = imageUrl;
    this.showImageModal = true;
  }

  closeImageModal() {
    this.showImageModal = false;
  }

  onQuantityChange(change: number) {
    const newQuantity = this.quantity + change;
    if (newQuantity >= 1 && newQuantity <= 10) {
      this.quantity = newQuantity;
    }
  }

  onAddToCart() {
    if (this.productDto) {
      this.cartService.addToCart(this.productDto, this.quantity);
    }
  }

  onAddToWishlist() {
    // Implement add to wishlist logic (if wishlist service exists)
    // For now, this is a placeholder
  }

  onShare() {
    if (navigator.share) {
      navigator.share({
        title: this.product?.name,
        text: this.product?.description,
        url: window.location.href
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  }

  onTabChange(tab: string) {
    this.activeTab = tab;
  }

  getDiscountPercentage(originalPrice: number, currentPrice: number): number {
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  }

  getFloorRating(rating: number): number {
    return Math.floor(rating);
  }

  onRelatedProductClick(product: any) {
    const slug = generateProductSlug(product.name, product.id);
    this.router.navigate(['/product', slug]);
  }

  goToProducts() {
    this.router.navigate(['/products']);
  }

  retryLoad() {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (slug) {
      this.loadProductBySlug(slug);
    }
  }
}
