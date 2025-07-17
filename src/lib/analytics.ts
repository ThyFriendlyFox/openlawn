import { analytics } from './firebase';
import { logEvent, Analytics } from 'firebase/analytics';

export interface AnalyticsEvent {
  eventName: string;
  parameters?: Record<string, string | number | boolean>;
}

export class AnalyticsService {
  // Track user authentication events
  static trackLogin(method: string = 'email') {
    this.logEvent('login', { method });
  }

  static trackSignUp(method: string = 'email') {
    this.logEvent('sign_up', { method });
  }

  static trackLogout() {
    this.logEvent('logout');
  }

  // Track customer management events
  static trackCustomerCreated(customerId: string) {
    this.logEvent('customer_created', { customer_id: customerId });
  }

  static trackCustomerUpdated(customerId: string) {
    this.logEvent('customer_updated', { customer_id: customerId });
  }

  static trackCustomerViewed(customerId: string) {
    this.logEvent('customer_viewed', { customer_id: customerId });
  }

  // Track route management events
  static trackRouteCreated(routeId: string, customerCount: number) {
    this.logEvent('route_created', { 
      route_id: routeId, 
      customer_count: customerCount 
    });
  }

  static trackRouteOptimized(routeId: string, optimizationType: string) {
    this.logEvent('route_optimized', { 
      route_id: routeId, 
      optimization_type: optimizationType 
    });
  }

  // Track service events
  static trackServiceScheduled(serviceType: string, customerId: string) {
    this.logEvent('service_scheduled', { 
      service_type: serviceType, 
      customer_id: customerId 
    });
  }

  static trackServiceCompleted(serviceType: string, customerId: string) {
    this.logEvent('service_completed', { 
      service_type: serviceType, 
      customer_id: customerId 
    });
  }

  // Track billing events
  static trackInvoiceCreated(invoiceId: string, amount: number) {
    this.logEvent('invoice_created', { 
      invoice_id: invoiceId, 
      amount: amount 
    });
  }

  static trackPaymentReceived(invoiceId: string, amount: number) {
    this.logEvent('payment_received', { 
      invoice_id: invoiceId, 
      amount: amount 
    });
  }

  // Track user behavior
  static trackPageView(pageName: string) {
    this.logEvent('page_view', { page_name: pageName });
  }

  static trackFeatureUsed(featureName: string) {
    this.logEvent('feature_used', { feature_name: featureName });
  }

  static trackError(errorType: string, errorMessage: string) {
    this.logEvent('error', { 
      error_type: errorType, 
      error_message: errorMessage 
    });
  }

  // Track performance metrics
  static trackRouteCalculationTime(duration: number, customerCount: number) {
    this.logEvent('route_calculation_time', { 
      duration_ms: duration, 
      customer_count: customerCount 
    });
  }

  static trackMapLoadTime(duration: number) {
    this.logEvent('map_load_time', { duration_ms: duration });
  }

  // Generic event logging
  static logEvent(eventName: string, parameters?: Record<string, string | number | boolean>) {
    if (analytics) {
      try {
        logEvent(analytics, eventName, parameters);
        console.log('Analytics event logged:', eventName, parameters);
      } catch (error) {
        console.error('Failed to log analytics event:', error);
      }
    }
  }

  // Set user properties
  static setUserProperty(propertyName: string, propertyValue: string) {
    if (analytics) {
      try {
        // Note: setUserProperty is deprecated, but we can use custom events
        this.logEvent('user_property_set', { 
          property_name: propertyName, 
          property_value: propertyValue 
        });
      } catch (error) {
        console.error('Failed to set user property:', error);
      }
    }
  }

  // Track user role for segmentation
  static trackUserRole(role: string) {
    this.setUserProperty('user_role', role);
  }

  // Track company size for business insights
  static trackCompanySize(customerCount: number) {
    this.setUserProperty('company_size', customerCount.toString());
  }
} 