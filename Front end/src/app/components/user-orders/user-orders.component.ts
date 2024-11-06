import { Component,ViewChild, OnInit, Inject  } from '@angular/core';
import { FooterComponent } from '../footer/footer.component';
import { HeaderComponent } from '../header/header.component';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule,Location,DOCUMENT } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OrderResponse } from '../../responses/order/order.response';
import { OrderService } from '../../services/order.service';
import { link } from 'fs';

@Component({
  selector: 'user-orders',
  standalone: true,
  imports: [
    FooterComponent,
    HeaderComponent,
    CommonModule,
    FormsModule, 
    ReactiveFormsModule, 
  ],
  templateUrl: './user-orders.component.html',
  styleUrl: './user-orders.component.scss'
})
export class UserOrdersComponent implements OnInit{
  // orders: OrderResponse[] = [];
  // currentPage: number = 0;
  // itemsPerPage: number = 10;
  // pages: number[] = [];
  // totalPages:number = 0;
  // keyword:string = "";
  // visiblePages: number[] = [];
  // localStorage?:Storage;

  orders: OrderResponse[] = [];
  totalPages: number = 0;
  currentPage: number = 0;
  itemsPerPage: number = 10;
  keyword: string = '';

  pages: number[] = [];
  visiblePages: number[] = [];
  localStorage?:Storage;
  userId :number =0;

  constructor(
    private orderService: OrderService,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.localStorage = document.defaultView?.localStorage;
  }

  ngOnInit(): void {
    debugger
    const userIdString = this.localStorage?.getItem('user');
    this.userId = userIdString ? JSON.parse(userIdString).id : null;
    this.currentPage = Number(this.localStorage?.getItem('currentOrderUserPage')) || 0; 
    debugger
    if (this.userId) {
      this.getUserOrders(this.userId, this.currentPage, this.itemsPerPage,this.keyword);
    } else {
      console.error('User ID not found in localStorage');
    }
  }
  searchOrders() {
    this.currentPage = 0;
    this.itemsPerPage = 10;
    debugger
    this.getUserOrders(this.userId, this.currentPage, this.itemsPerPage,this.keyword.trim());
  }

  getUserOrders(userId: number, page: number, limit: number,keyword: string) {
    debugger
    this.orderService.getUserOrders(userId,page, limit, keyword).subscribe({
      next: (response: any) => {
        debugger
        this.orders = response.orders;
        this.totalPages = response.totalPages;
        this.visiblePages = this.generateVisiblePageArray(this.currentPage, this.totalPages);
      },
      complete: () => {
        debugger;
      },
      error: (error:any) => {
        console.error('Error fetching orders:', error);
      }
    }
    );
  }

  onPageChange(page: number): void {
    this.currentPage = page < 0 ? 0 : page;
    const userId = Number(localStorage.getItem('userId'));
    if (userId) {
      this.localStorage?.setItem('currentOrderUserPage', String(this.currentPage));     
      this.getUserOrders(userId, this.currentPage, this.itemsPerPage,this.keyword);
    }
  }
  generateVisiblePageArray(currentPage: number, totalPages: number): number[] {
    const maxVisiblePages = 5;
    const halfVisiblePages = Math.floor(maxVisiblePages / 2);

    let startPage = Math.max(currentPage - halfVisiblePages, 1);
    let endPage = Math.min(startPage + maxVisiblePages - 1, totalPages);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(endPage - maxVisiblePages + 1, 1);
    }

    return new Array(endPage - startPage + 1).fill(0)
        .map((_, index) => startPage + index);
  }
  viewDetails(order:OrderResponse) {
    debugger
    this.router.navigate(['/user-detail-orders', order.id]);
  }
}
