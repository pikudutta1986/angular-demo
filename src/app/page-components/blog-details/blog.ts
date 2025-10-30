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
    this.blogService.getBlogById(id).subscribe((res) => {
      const dto = res?.data as BlogPostDto | undefined;
      if (!dto) {
        this.blogPost = null;
        return;
      }
      this.blogPost = this.mapDtoToPost(dto);
      this.loadRelatedPosts();
    });
  }

  private mapDtoToPost(dto: BlogPostDto): BlogPost {
    return {
      id: 0,
      title: dto.title,
      excerpt: dto.content?.slice(0, 180) || '',
      content: dto.content,
      author: {
        name: 'Unknown',
        avatar: 'https://via.placeholder.com/100',
        bio: '',
        social: {}
      },
      category: dto.category || 'General',
      tags: [],
      featuredImage: 'https://via.placeholder.com/800x400',
      publishDate: dto.createdAt || new Date().toISOString(),
      readTime: 6,
      views: 0,
      likes: 0,
      isFeatured: false,
      slug: dto._id
    };
  }

  private loadRelatedPosts() {
    this.relatedPosts = [
      {
        id: 2,
        title: 'Getting Started with Angular 17: A Complete Guide',
        excerpt: 'Learn the fundamentals of Angular 17 with this comprehensive guide covering components, services, routing, and best practices.',
        featuredImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400',
        publishDate: '2024-01-12',
        readTime: 12,
        slug: 'getting-started-angular-17-complete-guide'
      },
      {
        id: 4,
        title: 'Building Scalable React Applications: Best Practices',
        excerpt: 'Discover essential patterns and practices for building large-scale React applications that are maintainable and performant.',
        featuredImage: 'https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?w=400',
        publishDate: '2024-01-08',
        readTime: 10,
        slug: 'building-scalable-react-applications-best-practices'
      },
      {
        id: 6,
        title: 'The Complete Guide to TypeScript 5.0',
        excerpt: 'Master TypeScript 5.0 with this comprehensive guide covering new features, improvements, and advanced techniques.',
        featuredImage: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400',
        publishDate: '2024-01-03',
        readTime: 15,
        slug: 'complete-guide-typescript-5-0'
      }
    ];
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
}
