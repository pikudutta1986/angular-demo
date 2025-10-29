import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

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
export class HomeComponent implements OnInit {
  title = 'Home';
  
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

  constructor() {}

  ngOnInit() {
    this.initializeData();
    this.startTestimonialAutoPlay();
  }

  private initializeData() {
    // Featured Products
    this.featuredProducts = [
      {
        id: 1,
        name: 'Wireless Bluetooth Headphones',
        price: 99.99,
        originalPrice: 149.99,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
        category: 'Electronics',
        rating: 4.5,
        reviewCount: 128,
        isNew: false,
        isSale: true,
        slug: 'wireless-bluetooth-headphones'
      },
      {
        id: 2,
        name: 'Smart Fitness Watch',
        price: 199.99,
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
        category: 'Electronics',
        rating: 4.8,
        reviewCount: 256,
        isNew: true,
        isSale: false,
        slug: 'smart-fitness-watch'
      },
      {
        id: 3,
        name: 'Professional Camera Lens',
        price: 599.99,
        originalPrice: 799.99,
        image: 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=400',
        category: 'Electronics',
        rating: 4.9,
        reviewCount: 67,
        isNew: false,
        isSale: true,
        slug: 'professional-camera-lens'
      },
      {
        id: 4,
        name: 'Gaming Mechanical Keyboard',
        price: 129.99,
        image: 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400',
        category: 'Electronics',
        rating: 4.8,
        reviewCount: 187,
        isNew: true,
        isSale: false,
        slug: 'gaming-mechanical-keyboard'
      }
    ];

    // Latest Blog Posts
    this.latestPosts = [
      {
        id: 1,
        title: 'The Future of Web Development: Trends to Watch in 2024',
        excerpt: 'Explore the latest trends in web development including AI integration, WebAssembly, and modern frameworks.',
        author: {
          name: 'Sarah Johnson',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100'
        },
        category: 'Web Development',
        featuredImage: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400',
        publishDate: '2024-01-15',
        readTime: 8,
        slug: 'future-web-development-trends-2024'
      },
      {
        id: 2,
        title: 'Getting Started with Angular 17: A Complete Guide',
        excerpt: 'Learn the fundamentals of Angular 17 with this comprehensive guide covering components, services, and routing.',
        author: {
          name: 'Mike Chen',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100'
        },
        category: 'Angular',
        featuredImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400',
        publishDate: '2024-01-12',
        readTime: 12,
        slug: 'getting-started-angular-17-complete-guide'
      },
      {
        id: 3,
        title: 'Building Scalable React Applications: Best Practices',
        excerpt: 'Discover essential patterns and practices for building large-scale React applications that are maintainable.',
        author: {
          name: 'David Kim',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'
        },
        category: 'React',
        featuredImage: 'https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?w=400',
        publishDate: '2024-01-08',
        readTime: 10,
        slug: 'building-scalable-react-applications-best-practices'
      }
    ];

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
