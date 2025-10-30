import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BlogService, BlogPostDto } from '../../services/blog.service';

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

  constructor(private blogService: BlogService) {}

  ngOnInit() {
    this.loadBlogs();
  }

  private mapDtoToPost(dto: BlogPostDto): BlogPost {
    return {
      id: 0,
      title: dto.title,
      excerpt: dto.content?.slice(0, 140) || '',
      content: dto.content,
      author: {
        name: 'Unknown',
        avatar: 'https://via.placeholder.com/100',
        bio: ''
      },
      category: dto.category || 'General',
      tags: [],
      featuredImage: 'https://via.placeholder.com/800x400',
      publishDate: dto.createdAt || new Date().toISOString(),
      readTime: 5,
      views: 0,
      likes: 0,
      isFeatured: false,
      slug: dto._id
    };
  }

  public loadBlogs() {
    this.blogService
      .getBlogs({
        search: this.searchQuery || undefined,
        category: this.selectedCategory || undefined,
        tag: this.selectedTag || undefined,
        sort: this.sortBy || undefined,
        page: this.currentPage,
        pageSize: this.postsPerPage
      })
      .subscribe((res) => {
        const items = res?.data || [];
        this.blogPosts = items.map(i => this.mapDtoToPost(i));
        this.initializeFilters();
        this.applyFilters();
        this.featuredPost = this.blogPosts.find(post => post.isFeatured) || this.blogPosts[0] || null;
      });
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
    this.currentPage = 1;
    this.applyFilters();
  }

  onCategoryChange(category: string) {
    this.selectedCategory = category;
    this.currentPage = 1;
    this.applyFilters();
  }

  onTagChange(tag: string) {
    this.selectedTag = tag;
    this.currentPage = 1;
    this.applyFilters();
  }

  onSortChange() {
    this.currentPage = 1;
    this.applyFilters();
  }

  clearFilters() {
    this.searchQuery = '';
    this.selectedCategory = '';
    this.selectedTag = '';
    this.sortBy = 'newest';
    this.currentPage = 1;
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
