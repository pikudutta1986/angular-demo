import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { ProductService, ProductDto } from '../../services/product.service';
import { BlogService, BlogPostDto } from '../../services/blog.service';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { generateProductSlug } from '../../utils/slug.util';

interface FeaturedProduct {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  rating: number;
  reviewCount: number;
  isNew: boolean;
  isSale: boolean;
  slug: string;
}

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  author: {
    name: string;
    avatar: string;
  };
  category: string;
  featuredImage: string;
  publishDate: string;
  readTime: number;
  slug: string;
}

interface Testimonial {
  id: number;
  name: string;
  role: string;
  company: string;
  avatar: string;
  content: string;
  rating: number;
}

interface Feature {
  id: number;
  title: string;
  description: string;
  icon: string;
  color: string;
}

interface Statistic {
  id: number;
  number: string;
  label: string;
  suffix: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class HomeComponent implements OnInit, OnDestroy {
  title = 'Home';
  private destroy$ = new Subject<void>();
  private previousUrl = '';

  // Hero section
  heroTitle = 'Discover Amazing Products';
  heroSubtitle = 'Shop the latest trends and find everything you need in one place';
  heroButtonText = 'Shop Now';
  heroImage = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200';

  // Featured products
  featuredProducts: FeaturedProduct[] = [];

  // Latest blog posts
  latestPosts: BlogPost[] = [];

  // Testimonials
  testimonials: Testimonial[] = [];

  // Features
  features: Feature[] = [];

  // Statistics
  statistics: Statistic[] = [];

  // UI state
  currentTestimonial = 0;
  isTestimonialAutoPlay = true;
  isLoadingProducts = true;
  isLoadingBlogs = true;
  errorMessage: string | null = null;

  constructor(
    private productService: ProductService,
    private blogService: BlogService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    console.log('[HOME] Component initialized - ngOnInit called');
    // Load data immediately on component init
    this.loadFeaturedProducts();
    this.loadLatestBlogs();
    this.initializeStaticData();
    this.startTestimonialAutoPlay();

    // Listen to router navigation events to reload when navigating to home
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event: NavigationEnd) => {
        const currentUrl = event.urlAfterRedirects || event.url;
        console.log('[HOME] Navigation detected:', currentUrl, 'Previous:', this.previousUrl);

        // Reload if we're navigating TO home from a different route
        if ((currentUrl === '/' || currentUrl === '/home') && this.previousUrl && this.previousUrl !== currentUrl) {
          console.log('[HOME] Reloading data after navigation to home');
          this.loadFeaturedProducts();
          this.loadLatestBlogs();
        }

        // Update previous URL
        this.previousUrl = currentUrl;
      });
  }

  ngOnDestroy() {
    console.log('[HOME] Component destroyed - ngOnDestroy called');
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadFeaturedProducts() {
    console.log('[HOME] loadFeaturedProducts() called');
    this.isLoadingProducts = true;
    this.productService.getProducts({ pageSize: 8, sort: 'newest' }).subscribe({
      next: (response) => {
        console.log('[HOME] API Response received:', response);
        if (response.success && response.data) {
          console.log('[HOME] Products count:', response.data.length);
          // Ensure we only show exactly 8 products, even if API returns more
          this.featuredProducts = response.data.slice(0, 8).map(product => this.mapProductDtoToFeatured(product));
          console.log('[HOME] Featured products set:', this.featuredProducts.length);
          // Manually trigger change detection for zoneless/SSR mode
          this.cdr.detectChanges();
          console.log('[HOME] Change detection triggered');
        } else {
          console.warn('[HOME] API response not successful or no data:', response);
        }
        this.isLoadingProducts = false;
      },
      error: (error) => {
        console.error('[HOME] Error loading featured products:', error);
        this.errorMessage = 'Failed to load featured products';
        this.isLoadingProducts = false;
        // Fallback to empty array instead of showing error to user
        this.featuredProducts = [];
      }
    });
  }

  private loadLatestBlogs() {
    this.isLoadingBlogs = true;
    this.blogService.getBlogs().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          // Take only first 3 blog posts
          this.latestPosts = response.data.slice(0, 3).map(blog => this.mapBlogDtoToPost(blog));
        }
        this.isLoadingBlogs = false;
      },
      error: (error) => {
        console.error('Error loading blog posts:', error);
        this.isLoadingBlogs = false;
        // Fallback to empty array
        this.latestPosts = [];
      }
    });
  }

  private mapProductDtoToFeatured(dto: ProductDto): FeaturedProduct {
    const imageUrl = dto.images?.split('|')[0]?.trim() || 'https://via.placeholder.com/400';
    const createdAt = new Date(dto.created_at);
    const daysSinceCreation = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);

    return {
      id: dto.id,
      name: dto.name,
      price: dto.price,
      originalPrice: undefined,
      image: imageUrl,
      category: dto.category,
      rating: 4.5,
      reviewCount: Math.floor(Math.random() * 200) + 50,
      isNew: daysSinceCreation <= 30,
      isSale: false,
      slug: generateProductSlug(dto.name, dto.id)
    };
  }

  private mapBlogDtoToPost(dto: BlogPostDto): BlogPost {
    return {
      id: Math.floor(Math.random() * 1000),
      title: dto.title,
      excerpt: dto.content?.slice(0, 150) + '...' || '',
      author: {
        name: 'Admin',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100'
      },
      category: dto.category || 'General',
      featuredImage: dto.image_url || 'https://via.placeholder.com/400',
      publishDate: dto.createdAt || new Date().toISOString(),
      readTime: Math.ceil(dto.content?.length / 1000) || 5,
      slug: dto.slug
    };
  }

  private initializeStaticData() {



    // Testimonials
    this.testimonials = [
      {
        id: 1,
        name: 'Emily Rodriguez',
        role: 'Product Manager',
        company: 'TechCorp',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
        content: 'This platform has completely transformed how we manage our projects. The interface is intuitive and the features are exactly what we needed.',
        rating: 5
      },
      {
        id: 2,
        name: 'James Wilson',
        role: 'Software Engineer',
        company: 'InnovateLab',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
        content: 'The quality of products and the shopping experience is outstanding. Fast delivery and excellent customer service.',
        rating: 5
      },
      {
        id: 3,
        name: 'Maria Garcia',
        role: 'Designer',
        company: 'CreativeStudio',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100',
        content: 'I love the variety of products available. The search functionality makes it easy to find exactly what I need.',
        rating: 4
      }
    ];

    // Features
    this.features = [
      {
        id: 1,
        title: 'Fast Delivery',
        description: 'Get your orders delivered within 24-48 hours with our express shipping options.',
        icon: '🚚',
        color: '#667eea'
      },
      {
        id: 2,
        title: 'Secure Payment',
        description: 'Your payments are protected with industry-standard encryption and security measures.',
        icon: '🔒',
        color: '#48bb78'
      },
      {
        id: 3,
        title: '24/7 Support',
        description: 'Our customer support team is available around the clock to help you with any questions.',
        icon: '💬',
        color: '#ed8936'
      },
      {
        id: 4,
        title: 'Easy Returns',
        description: 'Not satisfied? Return your items within 30 days for a full refund, no questions asked.',
        icon: '↩️',
        color: '#e53e3e'
      }
    ];

    // Statistics
    this.statistics = [
      {
        id: 1,
        number: '10',
        label: 'Years of Experience',
        suffix: '+'
      },
      {
        id: 2,
        number: '50',
        label: 'Happy Customers',
        suffix: 'K+'
      },
      {
        id: 3,
        number: '1000',
        label: 'Products Available',
        suffix: '+'
      },
      {
        id: 4,
        number: '99',
        label: 'Customer Satisfaction',
        suffix: '%'
      }
    ];
  }

  private startTestimonialAutoPlay() {
    if (this.isTestimonialAutoPlay) {
      setInterval(() => {
        this.nextTestimonial();
      }, 5000);
    }
  }

  nextTestimonial() {
    this.currentTestimonial = (this.currentTestimonial + 1) % this.testimonials.length;
  }

  previousTestimonial() {
    this.currentTestimonial = this.currentTestimonial === 0
      ? this.testimonials.length - 1
      : this.currentTestimonial - 1;
  }

  goToTestimonial(index: number) {
    this.currentTestimonial = index;
  }

  getDiscountPercentage(originalPrice: number, currentPrice: number): number {
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  }

  getFloorRating(rating: number): number {
    return Math.floor(rating);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getReadingTimeText(minutes: number): string {
    return `${minutes} min read`;
  }

  formatNumber(num: number): string {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  }
}
