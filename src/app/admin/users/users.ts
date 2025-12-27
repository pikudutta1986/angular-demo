import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, User } from '../../services/admin.service';

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

    constructor(private adminService: AdminService) {}

    ngOnInit() {
        this.loadUsers();
    }

    loadUsers() {
        this.loading = true;
        this.adminService.getUsers(this.currentPage, this.pageSize, this.roleFilter || undefined, this.searchTerm || undefined)
            .subscribe({
                next: (response) => {
                    if (response.success) {
                        this.users = response.data;
                        if (response.pagination) {
                            this.totalPages = response.pagination.totalPages;
                            this.total = response.pagination.total;
                        }
                    }
                    this.loading = false;
                },
                error: (error) => {
                    console.error('Error loading users:', error);
                    this.loading = false;
                }
            });
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
}

