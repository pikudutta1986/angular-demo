import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ProductDto {
  id: number;
  name: string;
  code: string;
  category: string;
  price: number;
  specification: string;
  description: string;
  images: string;
  created_at: string;
}

export interface ProductApiResponse {
  success: boolean;
  data: ProductDto[];
  message?: string;
  total?: number;
  page?: number;
  pageSize?: number;
  totalPages?: number;
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly baseUrl = environment.apiBase;

  constructor(private http: HttpClient) {}

  getProducts(params?: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    pageSize?: number;
    sort?: string;
  }): Observable<ProductApiResponse> {
    let httpParams = new HttpParams();
    
    if (params?.category) {
      httpParams = httpParams.set('category', params.category);
    }
    if (params?.minPrice !== undefined && params.minPrice > 0) {
      httpParams = httpParams.set('minPrice', params.minPrice.toString());
    }
    if (params?.maxPrice !== undefined && params.maxPrice > 0) {
      httpParams = httpParams.set('maxPrice', params.maxPrice.toString());
    }
    if (params?.page !== undefined && params.page > 0) {
      httpParams = httpParams.set('page', params.page.toString());
    }
    if (params?.pageSize !== undefined && params.pageSize > 0) {
      httpParams = httpParams.set('pageSize', params.pageSize.toString());
    }
    if (params?.sort) {
      httpParams = httpParams.set('sort', params.sort);
    }

    return this.http.get<ProductApiResponse>(`${this.baseUrl}/product`, {
      params: httpParams
    });
  }

  getProductById(id: number): Observable<{ success: boolean; data: ProductDto; message?: string; error?: string }> {
    return this.http.get<{ success: boolean; data: ProductDto; message?: string; error?: string }>(
      `${this.baseUrl}/product/${id}`
    );
  }
}

