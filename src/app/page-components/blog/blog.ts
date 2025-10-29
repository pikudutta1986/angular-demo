import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  author: {
    name: string;
    avatar: string;
    bio: string;
  };
  category: string;
  tags: string[];
  featuredImage: string;
  publishDate: string;
  readTime: number;
  views: number;
  likes: number;
  isFeatured: boolean;
  slug: string;
}

interface BlogCategory {
  name: string;
  count: number;
  slug: string;
}

interface BlogTag {
  name: string;
  count: number;
  slug: string;
}

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './blog.html',
  styleUrl: './blog.scss'
})
export class BlogComponent implements OnInit {
  title = 'Blog';
  
  // Blog data
  blogPosts: BlogPost[] = [];
  filteredPosts: BlogPost[] = [];
  featuredPost: BlogPost | null = null;
  
  // Filter options
  searchQuery = '';
  selectedCategory = '';
  selectedTag = '';
  sortBy = 'newest';
  
  // Available filters
  categories: BlogCategory[] = [];
  tags: BlogTag[] = [];
  
  // UI state
  currentPage = 1;
  postsPerPage = 9;
  showFilters = false;
  
  // Sort options
  sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'trending', label: 'Trending' }
  ];

  constructor() {}

  ngOnInit() {
    this.initializeBlogData();
    this.initializeFilters();
    this.applyFilters();
  }

  private initializeBlogData() {
    this.blogPosts = [
      {
        id: 1,
        title: 'The Future of Web Development: Trends to Watch in 2024',
        excerpt: 'Explore the latest trends in web development including AI integration, WebAssembly, and modern frameworks that are shaping the future of the web.',
        content: 'Full blog post content here...',
        author: {
          name: 'Sarah Johnson',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100',
          bio: 'Senior Web Developer with 8+ years experience'
        },
        category: 'Web Development',
        tags: ['web development', 'trends', '2024', 'technology'],
        featuredImage: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800',
        publishDate: '2024-01-15',
        readTime: 8,
        views: 1250,
        likes: 89,
        isFeatured: true,
        slug: 'future-web-development-trends-2024'
      },
      {
        id: 2,
        title: 'Getting Started with Angular 17: A Complete Guide',
        excerpt: 'Learn the fundamentals of Angular 17 with this comprehensive guide covering components, services, routing, and best practices.',
        content: 'Full blog post content here...',
        author: {
          name: 'Mike Chen',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
          bio: 'Angular Expert and Technical Writer'
        },
        category: 'Angular',
        tags: ['angular', 'tutorial', 'javascript', 'framework'],
        featuredImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
        publishDate: '2024-01-12',
        readTime: 12,
        views: 980,
        likes: 67,
        isFeatured: false,
        slug: 'getting-started-angular-17-complete-guide'
      },
      {
        id: 3,
        title: 'CSS Grid vs Flexbox: When to Use Which',
        excerpt: 'A detailed comparison of CSS Grid and Flexbox, including practical examples and guidelines for choosing the right layout method.',
        content: 'Full blog post content here...',
        author: {
          name: 'Emily Rodriguez',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
          bio: 'Frontend Developer and CSS Specialist'
        },
        category: 'CSS',
        tags: ['css', 'grid', 'flexbox', 'layout'],
        featuredImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
        publishDate: '2024-01-10',
        readTime: 6,
        views: 756,
        likes: 45,
        isFeatured: false,
        slug: 'css-grid-vs-flexbox-when-to-use-which'
      },
      {
        id: 4,
        title: 'Building Scalable React Applications: Best Practices',
        excerpt: 'Discover essential patterns and practices for building large-scale React applications that are maintainable and performant.',
        content: 'Full blog post content here...',
        author: {
          name: 'David Kim',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
          bio: 'React Developer and Open Source Contributor'
        },
        category: 'React',
        tags: ['react', 'scalability', 'best practices', 'architecture'],
        featuredImage: 'https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?w=800',
        publishDate: '2024-01-08',
        readTime: 10,
        views: 1100,
        likes: 78,
        isFeatured: true,
        slug: 'building-scalable-react-applications-best-practices'
      },
      {
        id: 5,
        title: 'JavaScript ES2024: New Features and Improvements',
        excerpt: 'Explore the latest JavaScript features introduced in ES2024 and how they can improve your development workflow.',
        content: 'Full blog post content here...',
        author: {
          name: 'Alex Thompson',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
          bio: 'JavaScript Developer and Language Enthusiast'
        },
        category: 'JavaScript',
        tags: ['javascript', 'es2024', 'new features', 'programming'],
        featuredImage: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=800',
        publishDate: '2024-01-05',
        readTime: 7,
        views: 890,
        likes: 56,
        isFeatured: false,
        slug: 'javascript-es2024-new-features-improvements'
      },
      {
        id: 6,
        title: 'The Complete Guide to TypeScript 5.0',
        excerpt: 'Master TypeScript 5.0 with this comprehensive guide covering new features, improvements, and advanced techniques.',
        content: 'Full blog post content here...',
        author: {
          name: 'Lisa Wang',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100',
          bio: 'TypeScript Expert and Software Architect'
        },
        category: 'TypeScript',
        tags: ['typescript', 'guide', 'types', 'development'],
        featuredImage: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800',
        publishDate: '2024-01-03',
        readTime: 15,
        views: 1340,
        likes: 92,
        isFeatured: true,
        slug: 'complete-guide-typescript-5-0'
      },
      {
        id: 7,
        title: 'Node.js Performance Optimization Techniques',
        excerpt: 'Learn how to optimize your Node.js applications for better performance, scalability, and resource efficiency.',
        content: 'Full blog post content here...',
        author: {
          name: 'James Wilson',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
          bio: 'Backend Developer and Performance Engineer'
        },
        category: 'Node.js',
        tags: ['nodejs', 'performance', 'optimization', 'backend'],
        featuredImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800',
        publishDate: '2024-01-01',
        readTime: 9,
        views: 720,
        likes: 41,
        isFeatured: false,
        slug: 'nodejs-performance-optimization-techniques'
      },
      {
        id: 8,
        title: 'Design Systems: Building Consistent UI Components',
        excerpt: 'Create a cohesive design system that ensures consistency across your applications and improves developer experience.',
        content: 'Full blog post content here...',
        author: {
          name: 'Maria Garcia',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
          bio: 'UI/UX Designer and Design System Expert'
        },
        category: 'Design',
        tags: ['design systems', 'ui', 'ux', 'components'],
        featuredImage: 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=800',
        publishDate: '2023-12-28',
        readTime: 11,
        views: 950,
        likes: 63,
        isFeatured: false,
        slug: 'design-systems-building-consistent-ui-components'
      },
      {
        id: 9,
        title: 'Microservices Architecture: A Practical Approach',
        excerpt: 'Implement microservices architecture effectively with practical patterns, tools, and real-world examples.',
        content: 'Full blog post content here...',
        author: {
          name: 'Robert Lee',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
          bio: 'Software Architect and Microservices Expert'
        },
        category: 'Architecture',
        tags: ['microservices', 'architecture', 'distributed systems', 'scalability'],
        featuredImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800',
        publishDate: '2023-12-25',
        readTime: 14,
        views: 1080,
        likes: 74,
        isFeatured: true,
        slug: 'microservices-architecture-practical-approach'
      }
    ];

    // Set featured post
    this.featuredPost = this.blogPosts.find(post => post.isFeatured) || this.blogPosts[0];
  }

  private initializeFilters() {
    // Extract categories
    const categoryMap = new Map<string, number>();
    this.blogPosts.forEach(post => {
      const count = categoryMap.get(post.category) || 0;
      categoryMap.set(post.category, count + 1);
    });

    this.categories = Array.from(categoryMap.entries()).map(([name, count]) => ({
      name,
      count,
      slug: name.toLowerCase().replace(/\s+/g, '-')
    }));

    // Extract tags
    const tagMap = new Map<string, number>();
    this.blogPosts.forEach(post => {
      post.tags.forEach(tag => {
        const count = tagMap.get(tag) || 0;
        tagMap.set(tag, count + 1);
      });
    });

    this.tags = Array.from(tagMap.entries())
      .map(([name, count]) => ({ name, count, slug: name.toLowerCase().replace(/\s+/g, '-') }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20); // Top 20 tags
  }

  onSearch() {
    this.applyFilters();
  }

  onCategoryChange(category: string) {
    this.selectedCategory = category;
    this.applyFilters();
  }

  onTagChange(tag: string) {
    this.selectedTag = tag;
    this.applyFilters();
  }

  onSortChange() {
    this.applyFilters();
  }

  clearFilters() {
    this.searchQuery = '';
    this.selectedCategory = '';
    this.selectedTag = '';
    this.sortBy = 'newest';
    this.applyFilters();
  }

  toggleFilters() {
    this.showFilters = !this.showFilters;
  }

  private applyFilters() {
    let filtered = [...this.blogPosts];

    // Search filter
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(post => 
        post.title.toLowerCase().includes(query) ||
        post.excerpt.toLowerCase().includes(query) ||
        post.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Category filter
    if (this.selectedCategory) {
      filtered = filtered.filter(post => post.category === this.selectedCategory);
    }

    // Tag filter
    if (this.selectedTag) {
      filtered = filtered.filter(post => 
        post.tags.some(tag => tag.toLowerCase() === this.selectedTag.toLowerCase())
      );
    }

    // Sorting
    this.sortPosts(filtered);

    this.filteredPosts = filtered;
    this.currentPage = 1;
  }

  private sortPosts(posts: BlogPost[]) {
    switch (this.sortBy) {
      case 'newest':
        posts.sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());
        break;
      case 'oldest':
        posts.sort((a, b) => new Date(a.publishDate).getTime() - new Date(b.publishDate).getTime());
        break;
      case 'popular':
        posts.sort((a, b) => b.views - a.views);
        break;
      case 'trending':
        posts.sort((a, b) => b.likes - a.likes);
        break;
    }
  }

  getPagedPosts() {
    const startIndex = (this.currentPage - 1) * this.postsPerPage;
    const endIndex = startIndex + this.postsPerPage;
    return this.filteredPosts.slice(startIndex, endIndex);
  }

  getTotalPages() {
    return Math.ceil(this.filteredPosts.length / this.postsPerPage);
  }

  onPageChange(page: number) {
    this.currentPage = page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
