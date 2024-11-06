import { Component,Inject,OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService } from '../../../services/order.service';
import { ProductService } from '../../../services/product.service';
import { CategoryService } from '../../../services/category.service';
    
import {CommonModule, DOCUMENT } from '@angular/common';
import { Location } from '@angular/common';
import { OrderResponse } from '../../../responses/order/order.response';
import { environment } from '../../../../environments/environment';
import { NgForm } from '@angular/forms';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-statistical-admin',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './statistical.admin.component.html',
  styleUrl: './statistical.admin.component.scss',
  
})
export class StatisticalAdminComponent implements OnInit {
  totalOrders: number = 0;
  totalUsers: number = 0;
  totalProducts: number = 0;
  totalCategories: number = 0;
  pendingOrders: number = 0;
  processingOrders: number = 0;
  shippedOrders: number = 0;
  deliveredOrders: number = 0;
  canceledOrders: number = 0;
  totalRevenue: number = 0;
  startDate: Date |null=null;
  endDate: Date |null=null;
  localStorage?:Storage;
  currentPage: number = 0;
  totalPages:number = 0;
  visiblePages: number[] = [];
  keyword:string = "";
  itemsPerPage: number = 10;
  orders: OrderResponse[] = [];
  pages: number[] = [];
  selectedCategoryId: number  = 0;

  constructor(
    private orderService: OrderService,
    private router: Router,
    private productService: ProductService,
    private categoryService: CategoryService,
    private userService: UserService,
    private route: ActivatedRoute,
    private location: Location,
    @Inject(DOCUMENT) private document: Document
  ) {
     this.localStorage = document.defaultView?.localStorage;
     
  }

    ngOnInit(): void {
      this.currentPage = Number(this.localStorage?.getItem('currentStatisticalAdminPage')) || 0;
      this.getAllOrders(this.keyword, this.currentPage, 1000);
      this.getAllCategories(this.currentPage,1000);
      this.getAllProducts(this.keyword,this.selectedCategoryId,this.currentPage,1000);
      this.getAllUser(this.keyword, this.currentPage, 1000);
    }

    getAllUser(keyword: string, page: number, limit: number) {
      this.userService.getAllUser(keyword, page, limit).subscribe({
        next: (response: any) => {
          debugger
          this.totalUsers = response.users.length; // Tính tổng số danh mục từ độ dài danh sách
          debugger
        },
        error: (error: any) => {
          console.error('Error fetching categories:', error);
        }
      });
    }

    getAllCategories(page: number, limit: number) {
      this.categoryService.getCategories( page, limit).subscribe({
        next: (response: any) => {
          debugger
          this.totalCategories = response.length; // Tính tổng số danh mục từ độ dài danh sách
          debugger
        },
        error: (error: any) => {
          console.error('Error fetching categories:', error);
        }
      });
    }
    
    getAllProducts(keyword: string, selectedCategoryId: number, page: number, limit: number) {
      debugger
      this.productService.getProducts(keyword, selectedCategoryId, page, limit).subscribe({
        next: (response: any) => {
          debugger
          this.totalProducts = response.products.length; // Tính tổng số sản phẩm từ độ dài danh sách
          debugger
        },
        error: (error: any) => {
          console.error('Error fetching products:', error);
        }
      });
    }

    getAllOrders(keyword: string, page: number, limit: number) {
      this.orderService.getAllOrders(keyword, page, limit).subscribe({
        next: (response: any) => {
          debugger
          this.orders = response.orders;
          this.updateStatistics(); // Cập nhật thống kê sau khi nhận dữ liệu
          this.totalPages = response.totalPages;
          this.visiblePages = this.generateVisiblePageArray(this.currentPage, this.totalPages);
          debugger
        },
        error: (error: any) => {
          console.error('Error fetching orders:', error);
        }
      });
    }
    
    updateStatistics() {
      const filteredOrders = this.filterOrdersByDate(this.orders);
      this.totalRevenue = this.calculateTotalRevenue(filteredOrders); // Tính tổng doanh thu
      this.calculateOrderStatistics(filteredOrders); // Cập nhật các thống kê khác
    }

    calculateOrderStatistics(orders: any[]) {
      debugger
      this.totalOrders = orders.length; // Tổng số đơn hàng
    
      // Khởi tạo các biến
      this.pendingOrders = 0;
      this.processingOrders = 0;
      this.shippedOrders = 0;
      this.deliveredOrders = 0;
      this.canceledOrders = 0;
    
      // Duyệt qua từng đơn hàng để phân loại
      orders.forEach(order => {
        switch (order.status) {
          case 'đang chờ xử lý':
            this.pendingOrders++;
            break;
          case 'đang xử lý':
            this.processingOrders++;
            break;
          case 'đang giao':
            this.shippedOrders++;
            break;
          case 'đã hoàn thành':
            this.deliveredOrders++;
            break;
          case 'hủy':
            this.canceledOrders++;
            break;
        }
      });
    }

    onPageChange(page: number) {
      debugger;
      this.currentPage = page < 0 ? 0 : page;
      this.localStorage?.setItem('currentStatisticalAdminPage', String(this.currentPage));         
      this.getAllOrders(this.keyword, this.currentPage, this.itemsPerPage);
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
    
    updateOrders() {
      const filteredOrders = this.filterOrdersByDate(this.orders); // Lấy danh sách đơn hàng đã lọc
      this.orders = filteredOrders; // Cập nhật danh sách đơn hàng hiển thị
      this.updateStatistics(); // Cập nhật thống kê
    }
    
    filterOrdersByDate(orders: OrderResponse[]): OrderResponse[] {
      if (!this.startDate && !this.endDate) {
        return orders;
      }
    
      return orders.filter(order => {
        const orderDate = new Date(order.order_date); // Giả sử order_date tồn tại
        const start = this.startDate ? new Date(this.startDate) : null;
        const end = this.endDate ? new Date(this.endDate) : null;
    
        return (!start || orderDate >= start) && (!end || orderDate <= end);
      });
    }
    calculateTotalRevenue(orders: OrderResponse[]): number {
      return orders.reduce((total, order) => {
        return total + (order.total_money || 0); // Giả sử total_money là thuộc tính chứa giá trị
      }, 0);
    }

    

    onDateChange() {
      this.currentPage = 0; // Reset về trang đầu tiên
      this.localStorage?.setItem('currentStatisticalAdminPage', String(this.currentPage));
      this.updateOrders();
      // this.getAllOrders(this.keyword, this.currentPage, this.itemsPerPage); // Lấy lại đơn hàng
    }

    deleteOrder(id:number) {
      const confirmation = window
        .confirm('Are you sure you want to delete this order?');
      if (confirmation) {
        debugger
        this.orderService.deleteOrder(id).subscribe({
          next: (response: any) => {
            debugger 
            location.reload();          
          },
          complete: () => {
            debugger;          
          },
          error: (error: any) => {
            debugger;
            console.error('Error fetching products:', error);
          }
        });    
      }
    }

    viewDetails(order:OrderResponse) {
      debugger
      this.router.navigate(['/admin/orders', order.id]);
    }

  }

