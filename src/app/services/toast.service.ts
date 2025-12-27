import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface Toast {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
    duration?: number;
}

@Injectable({
    providedIn: 'root'
})
export class ToastService {
    private toastSubject = new Subject<Toast>();
    public toast$ = this.toastSubject.asObservable();

    show(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success', duration: number = 3000) {
        const id = this.generateId();
        const toast: Toast = { id, message, type, duration };
        this.toastSubject.next(toast);
    }

    success(message: string, duration?: number) {
        this.show(message, 'success', duration);
    }

    error(message: string, duration?: number) {
        this.show(message, 'error', duration);
    }

    info(message: string, duration?: number) {
        this.show(message, 'info', duration);
    }

    warning(message: string, duration?: number) {
        this.show(message, 'warning', duration);
    }

    private generateId(): string {
        return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
}
