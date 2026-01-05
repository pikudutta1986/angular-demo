import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, User } from '../../services/admin.service';
import { catchError, timeout } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
    selector: 'app-admin-users',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './users.html',
    styleUrl: './users.scss'
})
export class AdminUsersComponent implements OnInit {
    users: User[] = [];
    loading = false;
    currentPage = 1;
    pageSize = 10;
    totalPages = 1;
    total = 0;
    searchTerm = '';
    roleFilter = '';
    selectedUser: User | null = null;
    showEditModal = false;
    editForm: any = {};
    errorMessage: string | null = null;

    constructor(
        private adminService: AdminService,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit() {
        this.loadUsers();
    }

    loadUsers() {
        this.loading = true;
        this.errorMessage = null;
        
        try {
            this.adminService.getUsers(this.currentPage, this.pageSize, this.roleFilter || undefined, this.searchTerm || undefined)
                .pipe(
                    timeout(30000), // 30 second timeout
                    catchError((error) => {
                        console.error('Request error:', error);
                        this.users = [];
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
                            console.log('=== USERS RESPONSE DEBUG ===');
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
                            let usersData: User[] = [];
                            
                            if (response) {
                                if (Array.isArray(response)) {
                                    // Response is directly an array (unlikely but handle it)
                                    usersData = response;
                                    console.log('Response is direct array, length:', usersData.length);
                                } else if (response.data && Array.isArray(response.data)) {
                                    // Standard response structure
                                    usersData = response.data;
                                    console.log('Extracted from response.data, length:', usersData.length);
                                } else if (response.data) {
                                    // Data exists but might not be array
                                    console.warn('response.data exists but is not an array:', typeof response.data, response.data);
                                    usersData = [];
                                } else {
                                    console.warn('No data field in response');
                                    usersData = [];
                                }
                            } else {
                                console.warn('Response is null or undefined');
                                usersData = [];
                            }
                            
                            console.log('=== FINAL PROCESSED DATA ===');
                            console.log('Users data:', usersData);
                            console.log('Users count:', usersData.length);
                            
                            // Assign with new array reference to trigger change detection
                            this.users = usersData.length > 0 ? [...usersData] : [];
                            
                            console.log('Component users assigned, length:', this.users.length);
                            
                            // Handle pagination
                            if (response && response.pagination) {
                                this.totalPages = response.pagination.totalPages || 1;
                                this.total = response.pagination.total || 0;
                                console.log('Pagination - totalPages:', this.totalPages, 'total:', this.total);
                            } else {
                                this.totalPages = 1;
                                this.total = usersData.length;
                                console.log('No pagination, using data length:', this.total);
                            }
                            
                            this.errorMessage = null;
                            
                            // Force change detection
                            setTimeout(() => {
                                this.cdr.detectChanges();
                                console.log('Change detection triggered, users length:', this.users.length);
                            }, 0);
                            
                        } catch (parseError: any) {
                            console.error('Error parsing response:', parseError);
                            console.error('Parse error details:', parseError?.message, parseError?.stack);
                            this.users = [];
                            this.errorMessage = 'Error processing response data: ' + (parseError?.message || 'Unknown error');
                        } finally {
                            this.loading = false;
                            this.cdr.detectChanges();
                            console.log('Loading set to false, final users length:', this.users.length);
                        }
                    },
                    error: (error) => {
                        console.error('Error loading users:', error);
                        console.error('Error details:', {
                            status: error.status,
                            statusText: error.statusText,
                            message: error.message,
                            error: error.error
                        });
                        this.users = [];
                        this.errorMessage = error.error?.message || error.message || 'Failed to load users. Please check your connection and try again.';
                        this.loading = false;
                    }
                });
        } catch (err) {
            console.error('Error in loadUsers:', err);
            this.users = [];
            this.errorMessage = 'Failed to load users';
            this.loading = false;
        }
    }

    search() {
        this.currentPage = 1;
        this.loadUsers();
    }

    filterByRole(role: string) {
        this.roleFilter = role;
        this.currentPage = 1;
        this.loadUsers();
    }

    editUser(user: User) {
        this.selectedUser = user;
        this.editForm = {
            name: user.name,
            email: user.email,
            role: user.role,
            password: ''
        };
        this.showEditModal = true;
    }

    updateUser() {
        if (!this.selectedUser) return;

        const updateData: any = {
            name: this.editForm.name,
            email: this.editForm.email,
            role: this.editForm.role
        };

        if (this.editForm.password && this.editForm.password.trim() !== '') {
            updateData.password = this.editForm.password;
        }

        this.loading = true;
        this.adminService.updateUser(this.selectedUser.id, updateData).subscribe({
            next: (response) => {
                if (response.success) {
                    this.showEditModal = false;
                    this.loadUsers();
                }
                this.loading = false;
            },
            error: (error) => {
                console.error('Error updating user:', error);
                this.loading = false;
            }
        });
    }

    deleteUser(user: User) {
        if (!confirm(`Are you sure you want to delete user ${user.name}?`)) {
            return;
        }

        this.loading = true;
        this.adminService.deleteUser(user.id).subscribe({
            next: (response) => {
                if (response.success) {
                    this.loadUsers();
                }
                this.loading = false;
            },
            error: (error) => {
                console.error('Error deleting user:', error);
                this.loading = false;
            }
        });
    }

    goToPage(page: number) {
        if (page >= 1 && page <= this.totalPages) {
            this.currentPage = page;
            this.loadUsers();
        }
    }

    closeModal() {
        this.showEditModal = false;
        this.selectedUser = null;
    }

    trackByUserId(index: number, user: User): any {
        return user ? user.id : index;
    }
}

