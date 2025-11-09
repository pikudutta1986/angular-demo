import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {BlogService, BlogPostDto} from '../../services/blog.service';
import {tap} from 'rxjs/operators';

interface BlogPost
{
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  image_url: string;
  isFeatured: boolean;
}

interface BlogCategory
{
  name: string;
  count: number;
  slug: string;
}

interface BlogTag
{
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

export class BlogComponent implements OnInit
{
  // page title
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
  totalPages = 0;
  postsPerPage = 8;
  showFilters = false;

  // Sort options
  sortOptions = [
    {value: 'newest', label: 'Newest First'},
    {value: 'oldest', label: 'Oldest First'},
    {value: 'popular', label: 'Most Popular'},
    {value: 'trending', label: 'Trending'}
  ];

  constructor(private blogService: BlogService) { }

  ngOnInit() 
  {
    // Load blogs
    this.loadBlogs();
  }

  // Load blogs
  public loadBlogs() 
  {
    this.blogService.getBlogs().pipe(
      tap(res => {
        const items = res?.data || [];
        this.blogPosts = items.map(i => this.mapDtoToPost(i));
        this.initializeFilters();
        this.applyFilters();
        this.featuredPost = this.blogPosts.find(post => post.isFeatured) || this.blogPosts[0] || null;
      })
    ).subscribe(()=>{
      console.log(this.blogPosts);
    });
  }

  // Map DTO to BlogPost
  private mapDtoToPost(dto: BlogPostDto): BlogPost 
  {
    return {
      title: dto.title,
      slug: dto.slug,
      excerpt: dto.content?.slice(0, 140) || '',
      content: dto.content,
      category: dto.category || 'General',
      tags: dto.tags || [],
      image_url: dto.image_url || 'https://via.placeholder.com/800x400',
      isFeatured: false
    };
  }


  private initializeFilters()
  {
    // Extract categories
    const categoryMap = new Map<string, number>();
    this.blogPosts.forEach(post =>
    {
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
    this.blogPosts.forEach(post =>
    {
      post.tags.forEach(tag =>
      {
        const count = tagMap.get(tag) || 0;
        tagMap.set(tag, count + 1);
      });
    });

    this.tags = Array.from(tagMap.entries())
      .map(([name, count]) => ({name, count, slug: name.toLowerCase().replace(/\s+/g, '-')}))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20); // Top 20 tags
  }

  onSearch()
  {
    this.currentPage = 1;
    this.applyFilters();
  }

  onCategoryChange(category: string)
  {
    this.selectedCategory = category;
    this.currentPage = 1;
    this.loadBlogs(); // Reload from API with category filter
  }

  onTagChange(tag: string)
  {
    this.selectedTag = tag;
    this.currentPage = 1;
    this.applyFilters();
  }

  onSortChange()
  {
    this.currentPage = 1;
    this.applyFilters();
  }

  clearFilters()
  {
    this.searchQuery = '';
    this.selectedCategory = '';
    this.selectedTag = '';
    this.sortBy = 'newest';
    this.currentPage = 1;
    this.applyFilters();
  }

  toggleFilters()
  {
    this.showFilters = !this.showFilters;
  }

  private applyFilters()
  {
    let filtered = [...this.blogPosts];

    // Search filter
    if (this.searchQuery.trim())
    {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(query) ||
        post.content.toLowerCase().includes(query) ||
        post.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Category filter
    if (this.selectedCategory)
    {
      filtered = filtered.filter(post => post.category === this.selectedCategory);
    }

    // Tag filter
    if (this.selectedTag)
    {
      filtered = filtered.filter(post =>
        post.tags.some(tag => tag.toLowerCase() === this.selectedTag.toLowerCase())
      );
    }

    this.filteredPosts = filtered;
    this.currentPage = 1;
    this.getTotalPages();
  }

  getPagedPosts()
  {
    const startIndex = (this.currentPage - 1) * this.postsPerPage;
    const endIndex = startIndex + this.postsPerPage;
    return this.filteredPosts.slice(startIndex, endIndex);
  }

  getTotalPages()
  {
    let totalPages = Math.ceil((this.filteredPosts?.length || 0) / this.postsPerPage);
    this.totalPages = totalPages;
  }

  getPageNumbers(): number[]
  {
    return Array.from({length: this.totalPages}, (_, i) => i);
  }

  onPageChange(page: number)
  {
    this.currentPage = page;
    window.scrollTo({top: 0, behavior: 'smooth'});
  }

  formatDate(dateString: string): string
  {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getReadingTimeText(minutes: number): string
  {
    return `${minutes} min read`;
  }

  formatNumber(num: number): string
  {
    if (num >= 1000)
    {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  }
}
