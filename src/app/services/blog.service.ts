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

  getBlogs(): Observable<BlogApiResponse>
  {
    return this.http.get<BlogApiResponse>(`${this.baseUrl}/blog`);
  }

  getBlogById(id: string): Observable<{success: boolean; data: BlogPostDto; message?: string}>
  {
    return this.http.get<{success: boolean; data: BlogPostDto; message?: string}>(
      `${this.baseUrl}/blog/${id}`
    );
  }
}


