import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

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
    private router: Router
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const slug = params['id'];
      this.loadBlogPost(slug);
    });
  }

  private loadBlogPost(slug: string) {
    // Mock blog post data - in real app, this would come from a service
    const mockPost: BlogPost = {
      id: 1,
      title: 'The Future of Web Development: Trends to Watch in 2024',
      excerpt: 'Explore the latest trends in web development including AI integration, WebAssembly, and modern frameworks that are shaping the future of the web.',
      content: `
        <p>Web development is evolving at an unprecedented pace, with new technologies and frameworks emerging constantly. As we move through 2024, several key trends are shaping the future of how we build and interact with web applications.</p>

        <h2>1. Artificial Intelligence Integration</h2>
        <p>AI is becoming increasingly integrated into web development workflows. From code generation tools like GitHub Copilot to AI-powered design systems, developers are leveraging machine learning to streamline their processes.</p>

        <h3>Code Generation and Assistance</h3>
        <p>AI-powered tools are helping developers write code faster and more efficiently. These tools can suggest code completions, generate boilerplate code, and even help debug issues.</p>

        <h3>Intelligent User Interfaces</h3>
        <p>Web applications are becoming smarter with AI-driven features like personalized content, intelligent search, and predictive user interfaces.</p>

        <h2>2. WebAssembly (WASM) Adoption</h2>
        <p>WebAssembly is gaining traction as a way to run high-performance code in browsers. This technology allows developers to use languages like Rust, C++, and Go for web development.</p>

        <h3>Performance Benefits</h3>
        <p>WASM offers near-native performance for computationally intensive tasks, making it ideal for applications like games, image processing, and scientific computing.</p>

        <h3>Use Cases</h3>
        <ul>
          <li>Gaming applications</li>
          <li>Image and video processing</li>
          <li>Scientific simulations</li>
          <li>CAD applications</li>
        </ul>

        <h2>3. Modern JavaScript Frameworks</h2>
        <p>Frameworks like React, Vue, and Angular continue to evolve, with new features and improvements being released regularly.</p>

        <h3>React 18+ Features</h3>
        <p>React 18 introduced concurrent features, automatic batching, and improved server-side rendering capabilities.</p>

        <h3>Vue 3 Composition API</h3>
        <p>Vue 3's Composition API provides a more flexible way to organize component logic and promotes better code reuse.</p>

        <h2>4. Serverless and Edge Computing</h2>
        <p>Serverless architectures and edge computing are changing how we deploy and scale web applications.</p>

        <h3>Edge Functions</h3>
        <p>Edge functions allow code to run closer to users, reducing latency and improving performance.</p>

        <h3>JAMstack Evolution</h3>
        <p>The JAMstack (JavaScript, APIs, Markup) approach is evolving with new tools and services that make it easier to build fast, secure websites.</p>

        <h2>5. Web3 and Blockchain Integration</h2>
        <p>While still emerging, Web3 technologies are beginning to influence web development with decentralized applications and blockchain integration.</p>

        <h3>Decentralized Applications (DApps)</h3>
        <p>DApps are web applications that interact with blockchain networks, offering new possibilities for user ownership and data control.</p>

        <h2>Conclusion</h2>
        <p>The future of web development is exciting and full of possibilities. As these trends continue to evolve, developers who stay informed and adapt to new technologies will be well-positioned to build the next generation of web applications.</p>

        <p>Whether you're a seasoned developer or just starting out, embracing these trends and continuously learning will help you stay relevant in this rapidly changing field.</p>
      `,
      author: {
        name: 'Sarah Johnson',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100',
        bio: 'Senior Web Developer with 8+ years experience in modern web technologies',
        social: {
          twitter: 'https://twitter.com/sarahjohnson',
          linkedin: 'https://linkedin.com/in/sarahjohnson',
          github: 'https://github.com/sarahjohnson'
        }
      },
      category: 'Web Development',
      tags: ['web development', 'trends', '2024', 'technology', 'ai', 'webassembly'],
      featuredImage: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800',
      publishDate: '2024-01-15',
      readTime: 8,
      views: 1250,
      likes: 89,
      isFeatured: true,
      slug: 'future-web-development-trends-2024'
    };

    this.blogPost = mockPost;
    this.loadRelatedPosts();
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
