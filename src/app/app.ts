import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared-component/header/header';
import { FooterComponent } from './shared-component/footer/footer';
import { ToastComponent } from './shared-component/toast/toast.component';
import { SettingsService } from './services/settings.service';
import { Title, Meta } from '@angular/platform-browser';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastComponent, HeaderComponent, FooterComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  constructor(
    private settingsService: SettingsService,
    private titleService: Title,
    private metaService: Meta
  ) {}

  ngOnInit() {
    // Load settings and update meta tags
    this.settingsService.settings$
      .pipe(takeUntil(this.destroy$))
      .subscribe(settings => {
        if (Object.keys(settings).length > 0) {
          const siteName = this.settingsService.getSiteName();
          const metaTitle = this.settingsService.getMetaTitle();
          const metaDescription = this.settingsService.getMetaDescription();
          const metaKeywords = this.settingsService.getMetaKeywords();

          // Update page title
          this.titleService.setTitle(metaTitle || siteName);

          // Update meta tags
          this.metaService.updateTag({ name: 'description', content: metaDescription });
          this.metaService.updateTag({ name: 'keywords', content: metaKeywords });
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
