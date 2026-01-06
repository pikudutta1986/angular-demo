import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BlogService, BlogPostDto } from '../../services/blog.service';
import { AdminService } from '../../services/admin.service';
import { catchError, timeout } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
    selector: 'app-admin-blogs',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './blogs.html',
    styleUrl: './blogs.scss'
})
export class AdminBlogsComponent implements OnInit {
    blogs: BlogPostDto[] = [];
    loading = false;
    currentPage = 1;
    pageSize = 10;
    totalPages = 1;
    total = 0;
    searchTerm = '';
    categoryFilter = '';
    selectedBlog: BlogPostDto | null = null;
    showEditModal = false;
    showAddModal = false;
    editForm: any = {};
    addForm: any = {
        title: '',
        slug: '',
        content: '',
        image_url: '',
        tags: '',
        category: ''
    };
    errorMessage: string | null = null;
    categories = ['Technology', 'Lifestyle', 'Business', 'Health', 'Travel'];

    constructor(
        private blogService: BlogService,
        private adminService: AdminService,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit() {
        this.loadBlogs();
    }

    loadBlogs() {
        this.loading = true;
        this.errorMessage = null;
        
        try {
            // Use admin service for paginated blogs
            this.adminService.getBlogs(this.currentPage, this.pageSize, this.categoryFilter || undefined, this.searchTerm || undefined)
                .pipe(
                    timeout(30000), // 30 second timeout
                    catchError((error) => {
                        console.error('Request error:', error);
                        this.blogs = [];
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
                            console.log('=== BLOGS RESPONSE DEBUG ===');
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
                            let blogsData: BlogPostDto[] = [];
                            
                            if (response) {
                                if (Array.isArray(response)) {
                                    // Response is directly an array (unlikely but handle it)
                                    blogsData = response;
                                    console.log('Response is direct array, length:', blogsData.length);
                                } else if (response.data && Array.isArray(response.data)) {
                                    // Standard response structure
                                    blogsData = response.data;
                                    console.log('Extracted from response.data, length:', blogsData.length);
                                } else if (response.data) {
                                    // Data exists but might not be array
                                    console.warn('response.data exists but is not an array:', typeof response.data, response.data);
                                    blogsData = [];
                                } else {
                                    console.warn('No data field in response');
                                    blogsData = [];
                                }
                            } else {
                                console.warn('Response is null or undefined');
                                blogsData = [];
                            }
                            
                            console.log('=== FINAL PROCESSED DATA ===');
                            console.log('Blogs data:', blogsData);
                            console.log('Blogs count:', blogsData.length);
                            
                            // Assign with new array reference to trigger change detection
                            this.blogs = blogsData.length > 0 ? [...blogsData] : [];
                            
                            console.log('Component blogs assigned, length:', this.blogs.length);
                            
                            // Handle pagination
                            if (response && response.pagination) {
                                this.totalPages = response.pagination.totalPages || 1;
                                this.total = response.pagination.total || 0;
                                console.log('Pagination - totalPages:', this.totalPages, 'total:', this.total);
                            } else {
                                // Fallback: client-side pagination if no server pagination
                                this.total = blogsData.length;
                                this.totalPages = Math.ceil(this.total / this.pageSize);
                                console.log('No pagination, using client-side - totalPages:', this.totalPages, 'total:', this.total);
                            }
                            
                            this.errorMessage = null;
                            
                            // Force change detection
                            setTimeout(() => {
                                this.cdr.detectChanges();
                                console.log('Change detection triggered, blogs length:', this.blogs.length);
                            }, 0);
                            
                        } catch (parseError: any) {
                            console.error('Error parsing response:', parseError);
                            console.error('Parse error details:', parseError?.message, parseError?.stack);
                            this.blogs = [];
                            this.errorMessage = 'Error processing response data: ' + (parseError?.message || 'Unknown error');
                        } finally {
                            this.loading = false;
                            this.cdr.detectChanges();
                            console.log('Loading set to false, final blogs length:', this.blogs.length);
                        }
                    },
                    error: (error) => {
                        console.error('Error loading blogs:', error);
                        console.error('Error details:', {
                            status: error.status,
                            statusText: error.statusText,
                            message: error.message,
                            error: error.error
                        });
                        this.blogs = [];
                        this.errorMessage = error.error?.message || error.message || 'Failed to load blogs. Please check your connection and try again.';
                        this.loading = false;
                        this.cdr.detectChanges();
                    }
                });
        } catch (err) {
            console.error('Error in loadBlogs:', err);
            this.blogs = [];
            this.errorMessage = 'Failed to load blogs';
            this.loading = false;
            this.cdr.detectChanges();
        }
    }

    search() {
        this.currentPage = 1;
        this.loadBlogs();
    }

    filterByCategory(category: string) {
        this.categoryFilter = category;
        this.currentPage = 1;
        this.loadBlogs();
    }

    generateSlug(title: string): string {
        return title.toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }

    onTitleChange() {
        if (this.addForm.title && !this.addForm.slug) {
            this.addForm.slug = this.generateSlug(this.addForm.title);
        }
    }

    openAddModal() {
        this.addForm = {
            title: '',
            slug: '',
            content: '',
            image_url: '',
            tags: '',
            category: ''
        };
        this.showAddModal = true;
    }

    addBlog() {
        if (!this.addForm.title || !this.addForm.content || !this.addForm.category) {
            alert('Please fill in all required fields');
            return;
        }

        const blogData = {
            title: this.addForm.title,
            slug: this.addForm.slug || this.generateSlug(this.addForm.title),
            content: this.addForm.content,
            image_url: this.addForm.image_url || '',
            tags: this.addForm.tags ? this.addForm.tags.split(',').map((t: string) => t.trim()) : [],
            category: this.addForm.category
        };

        this.loading = true;
        this.blogService.createBlog(blogData).subscribe({
            next: (response) => {
                if (response.success) {
                    this.showAddModal = false;
                    this.loadBlogs();
                } else {
                    alert(response.message || 'Failed to create blog');
                }
                this.loading = false;
            },
            error: (error) => {
                console.error('Error creating blog:', error);
                alert(error.error?.message || 'Failed to create blog');
                this.loading = false;
            }
        });
    }

    editBlog(blog: BlogPostDto) {
        this.selectedBlog = blog;
        this.editForm = {
            title: blog.title,
            slug: blog.slug,
            content: blog.content,
            image_url: blog.image_url,
            tags: blog.tags ? blog.tags.join(', ') : '',
            category: blog.category
        };
        this.showEditModal = true;
    }

    updateBlog() {
        if (!this.selectedBlog) return;

        const blogData: any = {
            title: this.editForm.title,
            slug: this.editForm.slug || this.generateSlug(this.editForm.title),
            content: this.editForm.content,
            image_url: this.editForm.image_url,
            tags: this.editForm.tags ? this.editForm.tags.split(',').map((t: string) => t.trim()) : [],
            category: this.editForm.category
        };

        this.loading = true;
        this.blogService.updateBlog(this.selectedBlog._id, blogData).subscribe({
            next: (response) => {
                if (response.success) {
                    this.showEditModal = false;
                    this.loadBlogs();
                } else {
                    alert(response.message || 'Failed to update blog');
                }
                this.loading = false;
            },
            error: (error) => {
                console.error('Error updating blog:', error);
                alert(error.error?.message || 'Failed to update blog');
                this.loading = false;
            }
        });
    }

    deleteBlog(blog: BlogPostDto) {
        if (!confirm(`Are you sure you want to delete blog "${blog.title}"?`)) {
            return;
        }

        this.loading = true;
        this.blogService.deleteBlog(blog._id).subscribe({
            next: (response) => {
                if (response.success) {
                    this.loadBlogs();
                } else {
                    alert(response.message || 'Failed to delete blog');
                }
                this.loading = false;
            },
            error: (error) => {
                console.error('Error deleting blog:', error);
                alert(error.error?.message || 'Failed to delete blog');
                this.loading = false;
            }
        });
    }

    goToPage(page: number) {
        if (page >= 1 && page <= this.totalPages) {
            this.currentPage = page;
            this.loadBlogs();
        }
    }

    closeModal() {
        this.showEditModal = false;
        this.showAddModal = false;
        this.selectedBlog = null;
    }

    trackByBlogId(index: number, blog: BlogPostDto): any {
        return blog ? blog._id : index;
    }
}

