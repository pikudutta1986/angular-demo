import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../environments/environment';

// SINGLE BLOG POST DTO
export interface BlogPostDto
{
  _id: string;
  createdAt?: string;
  updatedAt?: string;
  title: string;
  slug: string;
  content: string;
  image_url: string;
  tags: string[];
  category: string;
}

export interface BlogApiResponse
{
  success: boolean;
  data: BlogPostDto[];
  message?: string;
}

@Injectable({providedIn: 'root'})
export class BlogService
{
  private readonly baseUrl = environment.apiBase;

  constructor(private http: HttpClient) { }

  getBlogs(category?: string): Observable<BlogApiResponse>
  {
    let params = new HttpParams();
    if (category) {
      params = params.set('category', category);
    }
    return this.http.get<BlogApiResponse>(`${this.baseUrl}/blog`, { params });
  }

  getBlogById(id: string): Observable<{success: boolean; data: BlogPostDto; message?: string; error?: string}>
  {
    return this.http.get<{success: boolean; data: BlogPostDto; message?: string; error?: string}>(
      `${this.baseUrl}/blog/${id}`
    );
  }

  /**
   * Create a new blog post (Admin only)
   */
  createBlog(blogData: {
    title: string;
    slug: string;
    content: string;
    image_url: string;
    tags: string[];
    category: string;
  }): Observable<{success: boolean; data: BlogPostDto; message?: string; error?: string}>
  {
    return this.http.post<{success: boolean; data: BlogPostDto; message?: string; error?: string}>(
      `${this.baseUrl}/blog`,
      blogData
    );
  }

  /**
   * Update a blog post (Admin only)
   */
  updateBlog(id: string, blogData: {
    title?: string;
    slug?: string;
    content?: string;
    image_url?: string;
    tags?: string[];
    category?: string;
  }): Observable<{success: boolean; data: BlogPostDto; message?: string; error?: string}>
  {
    return this.http.put<{success: boolean; data: BlogPostDto; message?: string; error?: string}>(
      `${this.baseUrl}/blog/${id}`,
      blogData
    );
  }

  /**
   * Delete a blog post (Admin only)
   */
  deleteBlog(id: string): Observable<{success: boolean; message?: string; error?: string}>
  {
    return this.http.delete<{success: boolean; message?: string; error?: string}>(
      `${this.baseUrl}/blog/${id}`
    );
  }
}


