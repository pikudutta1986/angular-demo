import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
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
    social: {
      twitter?: string;
      linkedin?: string;
      github?: string;
    };
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

interface RelatedPost {
  id: number;
  title: string;
  excerpt: string;
  featuredImage: string;
  publishDate: string;
  readTime: number;
  slug: string;
}

@Component({
  selector: 'app-blog-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './blog.html',
  styleUrl: './blog.scss'
})
export class BlogDetailsComponent implements OnInit {
  title = 'Blog Details';
  blogPost: BlogPost | null = null;
  relatedPosts: RelatedPost[] = [];
  showTableOfContents = false;
  currentHeading = '';
  isLoading = true;
  errorMessage: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private blogService: BlogService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadBlogPost(id);
      }
    });
  }

  public loadBlogPost(id: string) {
    this.isLoading = true;
    this.errorMessage = null;
    this.blogPost = null;
    
    this.blogService.getBlogById(id).subscribe({
      next: (res) => {
        this.isLoading = false;
        // Handle error response from API
        if (res.error || !res.success || !res.data) {
          this.errorMessage = res.error || res.message || 'Blog post not found';
          this.blogPost = null;
          return;
        }
        
        const dto = res.data;
        this.blogPost = this.mapDtoToPost(dto);
        this.loadRelatedPosts(dto.category);
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error loading blog post:', err);
        this.errorMessage = err.error?.error || err.error?.message || err.message || 'Failed to load blog post';
        this.blogPost = null;
      }
    });
  }

  private mapDtoToPost(dto: BlogPostDto): BlogPost {
    // Calculate reading time (average 200 words per minute)
    const wordCount = dto.content?.split(/\s+/).length || 0;
    const readTime = Math.max(1, Math.ceil(wordCount / 200));
    
    return {
      id: 0,
      title: dto.title || '',
      excerpt: dto.content?.slice(0, 180) || '',
      content: dto.content || '',
      author: {
        name: 'Unknown',
        avatar: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2RkZCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=',
        bio: '',
        social: {}
      },
      category: dto.category || 'General',
      tags: dto.tags || [],
      featuredImage: dto.image_url || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2RkZCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=',
      publishDate: dto.createdAt || new Date().toISOString(),
      readTime: readTime,
      views: 0,
      likes: 0,
      isFeatured: false,
      slug: dto._id
    };
  }

  private loadRelatedPosts(category?: string) {
    // Load related posts from the same category
    this.blogService.getBlogs(category).subscribe({
      next: (res) => {
        const items = res?.data || [];
        // Exclude current post and limit to 3 related posts
        const related = items
          .filter(item => item._id !== this.blogPost?.slug)
          .slice(0, 3)
          .map(item => {
            const wordCount = item.content?.split(/\s+/).length || 0;
            const readTime = Math.max(1, Math.ceil(wordCount / 200));
            return {
              id: 0,
              title: item.title || '',
              excerpt: item.content?.slice(0, 120) || '',
              featuredImage: item.image_url || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2RkZCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=',
              publishDate: item.createdAt || new Date().toISOString(),
              readTime: readTime,
              slug: item._id
            };
          });
        this.relatedPosts = related;
      },
      error: (err) => {
        console.error('Error loading related posts:', err);
        this.relatedPosts = [];
      }
    });
  }

  onRelatedPostClick(slug: string) {
    this.router.navigate(['/blog', slug]);
  }

  onLike() {
    if (this.blogPost) {
      this.blogPost.likes++;
    }
  }

  onShare() {
    if (navigator.share) {
      navigator.share({
        title: this.blogPost?.title,
        text: this.blogPost?.excerpt,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
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

  toggleTableOfContents() {
    this.showTableOfContents = !this.showTableOfContents;
  }

  goToBlogList() {
    this.router.navigate(['/blog']);
  }
}
