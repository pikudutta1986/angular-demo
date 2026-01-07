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
                        // Direct extraction - backend returns { success: true, data: [], pagination: {} }
                        let productsData: ProductDto[] = [];
                        
                        if (response) {
                            if (Array.isArray(response)) {
                                // Response is directly an array (unlikely but handle it)
                                productsData = response;
                            } else if (response.data && Array.isArray(response.data)) {
                                // Standard response structure
                                productsData = response.data;
                            } else if (response.data) {
                                // Data exists but might not be array
                                productsData = [];
                            } else {
                                productsData = [];
                            }
                        } else {
                            productsData = [];
                        }
                        
                        // Assign with new array reference to trigger change detection
                        this.products = productsData.length > 0 ? [...productsData] : [];
                        
                        // Handle pagination
                        if (response && response.pagination) {
                            this.totalPages = response.pagination.totalPages || 1;
                            this.total = response.pagination.total || 0;
                        } else if (response && response.totalPages) {
                            // Fallback to flat pagination fields
                            this.totalPages = response.totalPages || 1;
                            this.total = response.total || productsData.length;
                        } else {
                            this.totalPages = 1;
                            this.total = productsData.length;
                        }
                        
                        this.errorMessage = null;
                        
                        // Force change detection
                        setTimeout(() => {
                            this.cdr.detectChanges();
                        }, 0);
                        
                    } catch (parseError: any) {
                        this.products = [];
                        this.errorMessage = 'Error processing response data: ' + (parseError?.message || 'Unknown error');
                    } finally {
                        this.loading = false;
                        this.cdr.detectChanges();
                    }
                },
                error: (error) => {
                    this.products = [];
                    this.errorMessage = error.error?.message || error.message || 'Failed to load products. Please check your connection and try again.';
                    this.loading = false;
                    this.cdr.detectChanges();
                }
            });
        } catch (err) {
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

