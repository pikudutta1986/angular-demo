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
                            // Direct extraction - backend returns { success: true, data: [], pagination: {} }
                            let usersData: User[] = [];
                            
                            if (response) {
                                if (Array.isArray(response)) {
                                    // Response is directly an array (unlikely but handle it)
                                    usersData = response;
                                } else if (response.data && Array.isArray(response.data)) {
                                    // Standard response structure
                                    usersData = response.data;
                                } else if (response.data) {
                                    // Data exists but might not be array
                                    usersData = [];
                                } else {
                                    usersData = [];
                                }
                            } else {
                                usersData = [];
                            }
                            
                            // Assign with new array reference to trigger change detection
                            this.users = usersData.length > 0 ? [...usersData] : [];
                            
                            // Handle pagination
                            if (response && response.pagination) {
                                this.totalPages = response.pagination.totalPages || 1;
                                this.total = response.pagination.total || 0;
                            } else {
                                this.totalPages = 1;
                                this.total = usersData.length;
                            }
                            
                            this.errorMessage = null;
                            
                            // Force change detection
                            setTimeout(() => {
                                this.cdr.detectChanges();
                            }, 0);
                            
                        } catch (parseError: any) {
                            this.users = [];
                            this.errorMessage = 'Error processing response data: ' + (parseError?.message || 'Unknown error');
                        } finally {
                            this.loading = false;
                            this.cdr.detectChanges();
                        }
                    },
                    error: (error) => {
                        this.users = [];
                        this.errorMessage = error.error?.message || error.message || 'Failed to load users. Please check your connection and try again.';
                        this.loading = false;
                    }
                });
        } catch (err) {
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

