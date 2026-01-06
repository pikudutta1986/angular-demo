import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService, ProductDto } from '../../services/product.service';
import { catchError, timeout } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
    selector: 'app-admin-products',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './products.html',
    styleUrl: './products.scss'
})
export class AdminProductsComponent implements OnInit {
    products: ProductDto[] = [];
    loading = false;
    currentPage = 1;
    pageSize = 10;
    totalPages = 1;
    total = 0;
    searchTerm = '';
    categoryFilter = '';
    selectedProduct: ProductDto | null = null;
    showEditModal = false;
    showAddModal = false;
    editForm: any = {};
    addForm: any = {
        name: '',
        code: '',
        category: 'Electronics',
        price: 0,
        specification: '',
        description: '',
        images: ''
    };
    errorMessage: string | null = null;
    categories = ['Electronics', 'Fashion', 'Living'];

    constructor(
        private productService: ProductService,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit() {
        this.loadProducts();
    }

    loadProducts() {
        this.loading = true;
        this.errorMessage = null;
        
        try {
            this.productService.getProducts({
                page: this.currentPage,
                pageSize: this.pageSize,
                category: this.categoryFilter || undefined
            })
            .pipe(
                timeout(30000), // 30 second timeout
                catchError((error) => {
                    console.error('Request error:', error);
                    this.products = [];
                    this.errorMessage = error.message || 'Request timed out or failed';
                    this.loading = false;
                    return of({ 
                        success: false, 
                        data: [], 
                        pagination: { page: 1, pageSize: 10, total: 0, totalPages: 1 },
                        message: error.message 
                    });
                })
            )
            .subscribe({
                next: (response: any) => {
                    try {
                        console.log('=== PRODUCTS RESPONSE DEBUG ===');
                        console.log('Full response:', response);
                        console.log('Response type:', typeof response);
                        console.log('Is array?', Array.isArray(response));
                        
                        if (response) {
                            console.log('Response keys:', Object.keys(response));
                            console.log('response.success:', response.success);
                            console.log('response.data:', response.data);
                            console.log('response.pagination:', response.pagination);
                        }
                        
                        // Direct extraction - backend returns { success: true, data: [], pagination: {} }
                        let productsData: ProductDto[] = [];
                        
                        if (response) {
                            if (Array.isArray(response)) {
                                // Response is directly an array (unlikely but handle it)
                                productsData = response;
                                console.log('Response is direct array, length:', productsData.length);
                            } else if (response.data && Array.isArray(response.data)) {
                                // Standard response structure
                                productsData = response.data;
                                console.log('Extracted from response.data, length:', productsData.length);
                            } else if (response.data) {
                                // Data exists but might not be array
                                console.warn('response.data exists but is not an array:', typeof response.data, response.data);
                                productsData = [];
                            } else {
                                console.warn('No data field in response');
                                productsData = [];
                            }
                        } else {
                            console.warn('Response is null or undefined');
                            productsData = [];
                        }
                        
                        console.log('=== FINAL PROCESSED DATA ===');
                        console.log('Products data:', productsData);
                        console.log('Products count:', productsData.length);
                        
                        // Assign with new array reference to trigger change detection
                        this.products = productsData.length > 0 ? [...productsData] : [];
                        
                        console.log('Component products assigned, length:', this.products.length);
                        
                        // Handle pagination
                        if (response && response.pagination) {
                            this.totalPages = response.pagination.totalPages || 1;
                            this.total = response.pagination.total || 0;
                            console.log('Pagination - totalPages:', this.totalPages, 'total:', this.total);
                        } else if (response && response.totalPages) {
                            // Fallback to flat pagination fields
                            this.totalPages = response.totalPages || 1;
                            this.total = response.total || productsData.length;
                            console.log('Using flat pagination fields - totalPages:', this.totalPages, 'total:', this.total);
                        } else {
                            this.totalPages = 1;
                            this.total = productsData.length;
                            console.log('No pagination, using data length:', this.total);
                        }
                        
                        this.errorMessage = null;
                        
                        // Force change detection
                        setTimeout(() => {
                            this.cdr.detectChanges();
                            console.log('Change detection triggered, products length:', this.products.length);
                        }, 0);
                        
                    } catch (parseError: any) {
                        console.error('Error parsing response:', parseError);
                        console.error('Parse error details:', parseError?.message, parseError?.stack);
                        this.products = [];
                        this.errorMessage = 'Error processing response data: ' + (parseError?.message || 'Unknown error');
                    } finally {
                        this.loading = false;
                        this.cdr.detectChanges();
                        console.log('Loading set to false, final products length:', this.products.length);
                    }
                },
                error: (error) => {
                    console.error('Error loading products:', error);
                    console.error('Error details:', {
                        status: error.status,
                        statusText: error.statusText,
                        message: error.message,
                        error: error.error
                    });
                    this.products = [];
                    this.errorMessage = error.error?.message || error.message || 'Failed to load products. Please check your connection and try again.';
                    this.loading = false;
                    this.cdr.detectChanges();
                }
            });
        } catch (err) {
            console.error('Error in loadProducts:', err);
            this.products = [];
            this.errorMessage = 'Failed to load products';
            this.loading = false;
            this.cdr.detectChanges();
        }
    }

    search() {
        this.currentPage = 1;
        this.loadProducts();
    }

    filterByCategory(category: string) {
        this.categoryFilter = category;
        this.currentPage = 1;
        this.loadProducts();
    }

    openAddModal() {
        this.addForm = {
            name: '',
            code: '',
            category: 'Electronics',
            price: 0,
            specification: '',
            description: '',
            images: ''
        };
        this.showAddModal = true;
    }

    addProduct() {
        if (!this.addForm.name || !this.addForm.code || !this.addForm.price) {
            alert('Please fill in all required fields');
            return;
        }

        this.loading = true;
        this.productService.createProduct(this.addForm).subscribe({
            next: (response) => {
                if (response.success) {
                    this.showAddModal = false;
                    this.loadProducts();
                } else {
                    alert(response.message || 'Failed to create product');
                }
                this.loading = false;
            },
            error: (error) => {
                console.error('Error creating product:', error);
                alert(error.error?.message || 'Failed to create product');
                this.loading = false;
            }
        });
    }

    editProduct(product: ProductDto) {
        this.selectedProduct = product;
        this.editForm = {
            name: product.name,
            code: product.code,
            category: product.category,
            price: product.price,
            specification: product.specification,
            description: product.description,
            images: product.images
        };
        this.showEditModal = true;
    }

    updateProduct() {
        if (!this.selectedProduct) return;

        this.loading = true;
        this.productService.updateProduct(this.selectedProduct.id, this.editForm).subscribe({
            next: (response) => {
                if (response.success) {
                    this.showEditModal = false;
                    this.loadProducts();
                } else {
                    alert(response.message || 'Failed to update product');
                }
                this.loading = false;
            },
            error: (error) => {
                console.error('Error updating product:', error);
                alert(error.error?.message || 'Failed to update product');
                this.loading = false;
            }
        });
    }

    deleteProduct(product: ProductDto) {
        if (!confirm(`Are you sure you want to delete product "${product.name}"?`)) {
            return;
        }

        this.loading = true;
        this.productService.deleteProduct(product.id).subscribe({
            next: (response) => {
                if (response.success) {
                    this.loadProducts();
                } else {
                    alert(response.message || 'Failed to delete product');
                }
                this.loading = false;
            },
            error: (error) => {
                console.error('Error deleting product:', error);
                alert(error.error?.message || 'Failed to delete product');
                this.loading = false;
            }
        });
    }

    goToPage(page: number) {
        if (page >= 1 && page <= this.totalPages) {
            this.currentPage = page;
            this.loadProducts();
        }
    }

    closeModal() {
        this.showEditModal = false;
        this.showAddModal = false;
        this.selectedProduct = null;
    }

    trackByProductId(index: number, product: ProductDto): any {
        return product ? product.id : index;
    }
}

