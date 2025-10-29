import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

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
export class ProductDetailsComponent implements OnInit {
  title = 'Product Details';
  product: ProductDetails | null = null;
  selectedImageIndex = 0;
  selectedVariants: { [key: string]: string } = {};
  quantity = 1;
  activeTab = 'description';
  showImageModal = false;
  selectedImageForModal = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const productId = +params['id'];
      this.loadProduct(productId);
    });
  }

  private loadProduct(id: number) {
    // Mock product data - in real app, this would come from a service
    const mockProduct: ProductDetails = {
      id: id,
      name: 'Wireless Bluetooth Headphones',
      price: 99.99,
      originalPrice: 149.99,
      images: [
        { id: 1, url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800', alt: 'Headphones front view', isMain: true },
        { id: 2, url: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800', alt: 'Headphones side view', isMain: false },
        { id: 3, url: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800', alt: 'Headphones in case', isMain: false },
        { id: 4, url: 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=800', alt: 'Headphones with phone', isMain: false }
      ],
      category: 'Electronics',
      brand: 'TechSound',
      rating: 4.5,
      reviewCount: 128,
      inStock: true,
      isNew: false,
      isSale: true,
      tags: ['wireless', 'bluetooth', 'audio', 'noise-cancelling'],
      description: 'High-quality wireless headphones with noise cancellation',
      longDescription: 'Experience premium sound quality with our advanced wireless Bluetooth headphones. Featuring active noise cancellation technology, these headphones provide crystal-clear audio and exceptional comfort for extended listening sessions. Perfect for music lovers, professionals, and anyone who appreciates superior sound quality.',
      specifications: {
        'Connectivity': 'Bluetooth 5.0',
        'Battery Life': '30 hours',
        'Charging Time': '2 hours',
        'Weight': '250g',
        'Driver Size': '40mm',
        'Frequency Response': '20Hz - 20kHz',
        'Impedance': '32 Ohms',
        'Noise Cancellation': 'Active',
        'Water Resistance': 'IPX4',
        'Warranty': '2 years'
      },
      variants: [
        { id: 1, name: 'Color', value: 'Black', inStock: true },
        { id: 2, name: 'Color', value: 'White', inStock: true },
        { id: 3, name: 'Color', value: 'Blue', inStock: false },
        { id: 4, name: 'Size', value: 'Small', inStock: true },
        { id: 5, name: 'Size', value: 'Medium', inStock: true },
        { id: 6, name: 'Size', value: 'Large', inStock: true }
      ],
      reviews: [
        {
          id: 1,
          userName: 'John Smith',
          rating: 5,
          date: '2024-01-15',
          title: 'Excellent sound quality!',
          comment: 'These headphones exceeded my expectations. The noise cancellation is incredible and the sound quality is top-notch. Highly recommended!',
          verified: true,
          helpful: 12
        },
        {
          id: 2,
          userName: 'Sarah Johnson',
          rating: 4,
          date: '2024-01-10',
          title: 'Great value for money',
          comment: 'Good headphones for the price. Battery life is excellent and they are very comfortable to wear for long periods.',
          verified: true,
          helpful: 8
        },
        {
          id: 3,
          userName: 'Mike Wilson',
          rating: 5,
          date: '2024-01-08',
          title: 'Perfect for work from home',
          comment: 'I use these for video calls and music while working. The microphone quality is great and the noise cancellation helps me focus.',
          verified: false,
          helpful: 5
        }
      ],
      relatedProducts: [
        { id: 2, name: 'Smart Fitness Watch', price: 199.99, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300', rating: 4.8 },
        { id: 4, name: 'Professional Camera Lens', price: 599.99, image: 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=300', rating: 4.9 },
        { id: 9, name: 'Gaming Mechanical Keyboard', price: 129.99, image: 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=300', rating: 4.8 }
      ]
    };

    this.product = mockProduct;
    this.initializeVariants();
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
    if (this.product) {
      console.log('Added to cart:', {
        product: this.product,
        variants: this.selectedVariants,
        quantity: this.quantity
      });
      // Implement add to cart logic
    }
  }

  onAddToWishlist() {
    if (this.product) {
      console.log('Added to wishlist:', this.product);
      // Implement add to wishlist logic
    }
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

  onRelatedProductClick(productId: number) {
    this.router.navigate(['/product', productId]);
  }
}
