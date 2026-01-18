/**
 * Performance monitoring and analytics system
 * Tracks Core Web Vitals, user interactions, and system health metrics
 */

interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
}

interface UserEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
  timestamp: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private events: UserEvent[] = [];
  private observer: PerformanceObserver | null = null;

  initialize() {
    this.observeWebVitals();
    this.trackResourceTiming();
    this.setupErrorTracking();
  }

  private observeWebVitals() {
    // Largest Contentful Paint (LCP)
    try {
      this.observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as PerformanceEntry & { renderTime?: number; loadTime?: number };
        const value = lastEntry.renderTime || lastEntry.loadTime || 0;
        
        this.recordMetric('LCP', value, this.rateMetric('LCP', value));
      });
      this.observer.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      console.warn('[Performance] LCP observation not supported');
    }

    // First Input Delay (FID)
    try {
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          this.recordMetric('FID', entry.processingStart - entry.startTime, 
            this.rateMetric('FID', entry.processingStart - entry.startTime));
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
    } catch (e) {
      console.warn('[Performance] FID observation not supported');
    }

    // Cumulative Layout Shift (CLS)
    try {
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        this.recordMetric('CLS', clsValue, this.rateMetric('CLS', clsValue));
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    } catch (e) {
      console.warn('[Performance] CLS observation not supported');
    }
  }

  private rateMetric(metricName: string, value: number): 'good' | 'needs-improvement' | 'poor' {
    const thresholds: Record<string, [number, number]> = {
      'LCP': [2500, 4000],
      'FID': [100, 300],
      'CLS': [0.1, 0.25],
      'TTFB': [800, 1800],
      'INP': [200, 500]
    };

    const [good, poor] = thresholds[metricName] || [1000, 3000];
    
    if (value <= good) return 'good';
    if (value <= poor) return 'needs-improvement';
    return 'poor';
  }

  private recordMetric(name: string, value: number, rating: 'good' | 'needs-improvement' | 'poor') {
    const metric: PerformanceMetric = {
      name,
      value: Math.round(value),
      rating,
      timestamp: Date.now()
    };

    this.metrics.push(metric);
    
    // Log poor performance
    if (rating === 'poor') {
      console.warn(`[Performance] Poor ${name}: ${value}ms`);
    }

    // Keep only last 100 metrics
    if (this.metrics.length > 100) {
      this.metrics.shift();
    }
  }

  private trackResourceTiming() {
    if ('performance' in window && performance.getEntriesByType) {
      const resources = performance.getEntriesByType('resource');
      
      resources.forEach((resource: any) => {
        if (resource.duration > 1000) {
          console.warn(`[Performance] Slow resource: ${resource.name} (${resource.duration}ms)`);
        }
      });
    }
  }

  private setupErrorTracking() {
    window.addEventListener('error', (event) => {
      this.trackEvent({
        action: 'error',
        category: 'runtime',
        label: event.message,
        value: 1,
        timestamp: Date.now()
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.trackEvent({
        action: 'unhandled_promise_rejection',
        category: 'runtime',
        label: event.reason?.message || 'Unknown',
        value: 1,
        timestamp: Date.now()
      });
    });
  }

  trackEvent(event: UserEvent) {
    this.events.push(event);
    
    // Keep only last 500 events
    if (this.events.length > 500) {
      this.events.shift();
    }
  }

  trackUserAction(action: string, category: string, label?: string, value?: number) {
    this.trackEvent({
      action,
      category,
      label,
      value,
      timestamp: Date.now()
    });
  }

  async measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    try {
      const result = await fn();
      const duration = performance.now() - start;
      this.recordMetric(name, duration, this.rateMetric('custom', duration));
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.recordMetric(`${name}_error`, duration, 'poor');
      throw error;
    }
  }

  getReport() {
    const avgByMetric: Record<string, number> = {};
    const countByRating: Record<string, number> = { good: 0, 'needs-improvement': 0, poor: 0 };

    this.metrics.forEach(metric => {
      avgByMetric[metric.name] = (avgByMetric[metric.name] || 0) + metric.value;
      countByRating[metric.rating]++;
    });

    Object.keys(avgByMetric).forEach(key => {
      avgByMetric[key] = avgByMetric[key] / this.metrics.filter(m => m.name === key).length;
    });

    return {
      summary: {
        totalMetrics: this.metrics.length,
        totalEvents: this.events.length,
        ratings: countByRating
      },
      averages: avgByMetric,
      recentMetrics: this.metrics.slice(-10),
      recentEvents: this.events.slice(-20),
      timestamp: Date.now()
    };
  }

  reset() {
    this.metrics = [];
    this.events = [];
  }
}

export const performanceMonitor = new PerformanceMonitor();

// Auto-initialize on import
if (typeof window !== 'undefined') {
  performanceMonitor.initialize();
}
