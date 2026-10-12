import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import {
  OrderStoreService,
  SalesOrder
} from '../order-store.service';

@Component({
  selector: 'app-review-order',
  standalone: true,
  templateUrl: './review-order.component.html',
  styleUrl: './review-order.component.css'
})
export class ReviewOrderComponent implements OnInit {

  order: SalesOrder | null = null;
  saved = false;

  constructor(
    private router: Router,
    private store: OrderStoreService
  ) {}

  ngOnInit(): void {
    this.order = this.store.getCurrent();

    setTimeout(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'auto'
      });
    }, 0);
  }

  get subtotal(): number {
    if (!this.order) return 0;

    return this.order.items.reduce(
      (sum, item) => sum + item.qty * item.orderRate,
      0
    );
  }

  get vat(): number {
    return this.subtotal * 0.05;
  }

  get totalAmount(): number {
    return this.subtotal + this.vat;
  }

  getItemAmount(qty: number, orderRate: number): number {
    return qty * orderRate;
  }

  getStatus(): string {
    if (!this.order) return 'Pending';
    return this.order.authorized ? 'Approved' : 'Pending';
  }

  save(): void {
    if (!this.order) return;

    this.order = this.store.commit(this.order);
    this.router.navigate(['/new-order']);
  }

  back(): void {
    this.router.navigate(['/new-order']);
  }

  private async openCrystalReport(
    reportKey: string,
    filterOrder: boolean
  ): Promise<void> {
    if (!this.order) return;

    try {
      const response = await fetch(
        `http://localhost:3000/api/reports/${reportKey}/pdf`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/pdf'
          },
          body: JSON.stringify({
            parameters: filterOrder
              ? {
                  orderId: this.order.id,
                  voucherNumber: this.order.voucherNumber
                }
              : {}
          })
        }
      );

      if (!response.ok) {
        let message = `Crystal Reports failed (HTTP ${response.status}).`;

        try {
          const body = await response.json();
          if (body?.error) message = body.error;
        } catch {
          // The server may return a plain-text error.
        }

        window.alert(message);
        return;
      }

      const blob = await response.blob();

      if (!blob.type.toLowerCase().includes('application/pdf')) {
        window.alert('Crystal Reports backend did not return a PDF.');
        return;
      }

      const url = URL.createObjectURL(blob);
      const tab = window.open(url, '_blank');

      if (!tab) {
        window.alert('Allow pop-ups for this app to view the report.');
      }

      window.setTimeout(() => URL.revokeObjectURL(url), 60000);

    } catch {
      window.alert(
        'Cannot reach the ERP backend. Check that the backend and Crystal Reports bridge are running.'
      );
    }
  }

  openPrint(): Promise<void> {
    return this.openCrystalReport(
      'sales-order/SalesOrderPrint',
      true
    );
  }

  openReport(): Promise<void> {
    return this.openCrystalReport(
      'sales-order/SalesOrderReport',
      false
    );
  }
}