import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface BlogPostDto {
  _id: string;
  title: string;
  slug: string;
  image_url: string;
  tags: string[];
  category: string;
  content: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BlogApiResponse {
  success: boolean;
  data: BlogPostDto[];
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class BlogService {
  private readonly baseUrl = environment.apiBase;

  constructor(private http: HttpClient) {}

  getBlogs(params?: {
    category?: string;
  }): Observable<BlogApiResponse> {
    let httpParams = new HttpParams();
    if (params?.category) {
      httpParams = httpParams.set('category', params.category);
    }
    return this.http.get<BlogApiResponse>(`${this.baseUrl}/blog`, {
      params: httpParams
    });
  }

  getBlogById(id: string): Observable<{ success: boolean; data: BlogPostDto; message?: string; error?: string }> {
    return this.http.get<{ success: boolean; data: BlogPostDto; message?: string; error?: string }>(
      `${this.baseUrl}/blog/${id}`
    );
  }
}


