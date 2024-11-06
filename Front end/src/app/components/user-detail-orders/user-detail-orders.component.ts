import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OrderResponse } from '../../responses/order/order.response';
import { OrderService } from '../../services/order.service';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { OrderDTO } from '../../dtos/order/order.dto';
import { FooterComponent } from "../footer/footer.component";
import { HeaderComponent } from "../header/header.component";

@Component({
  selector: 'app-user-detail-orders',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FooterComponent,
    HeaderComponent
],
  templateUrl: './user-detail-orders.component.html',
  styleUrl: './user-detail-orders.component.scss'
})
export class UserDetailOrdersComponent implements OnInit {
  orderId:number = 0;
  orderResponse: OrderResponse = {
    id: 0, // Hoặc bất kỳ giá trị số nào bạn muốn
    user_id: 0,
    fullname: '',
    phone_number: '',
    email: '',
    address: '',
    note: '',
    order_date: new Date(),
    status: '',
    total_money: 0, 
    shipping_method: '',
    shipping_address: '',
    shipping_date: new Date(),
    payment_method: '',
    order_details: [],
    
  };  
  private orderService = inject(OrderService);
  constructor(    
    private route: ActivatedRoute,
    private router: Router
    ) {}

  ngOnInit(): void {
    this.getOrderDetails();
  }
  getOrderDetails(): void {
    debugger
    this.orderId = Number(this.route.snapshot.paramMap.get('id'));
    this.orderService.getOrderById(this.orderId).subscribe({
      next: (response: any) => {        
        debugger;       
        this.orderResponse.id = response.id;
        this.orderResponse.user_id = response.user_id;
        this.orderResponse.fullname = response.fullname;
        this.orderResponse.email = response.email;
        this.orderResponse.phone_number = response.phone_number;
        this.orderResponse.address = response.address; 
        this.orderResponse.note = response.note;
        this.orderResponse.total_money = response.total_money;
        if (response.order_date) {
          this.orderResponse.order_date = new Date(
            response.order_date[0], 
            response.order_date[1] - 1, 
            response.order_date[2]
          );        
        }        
        this.orderResponse.order_details = response.order_details
          .map((order_detail:any) => {
          order_detail.product.thumbnail = `${environment.apiBaseUrl}/products/images/${order_detail.product.thumbnail}`;
          order_detail.number_of_products = order_detail.numberOfProducts
          //order_detail.total_money = order_detail.totalMoney
          return order_detail;
        });        
        this.orderResponse.payment_method = response.payment_method;
        if (response.shipping_date) {
          this.orderResponse.shipping_date = new Date(
            response.shipping_date[0],
            response.shipping_date[1] - 1,
            response.shipping_date[2]
          );
        }         
        this.orderResponse.shipping_method = response.shipping_method;        
        this.orderResponse.status = response.status;     
        debugger   
      },      
      complete: () => {
        debugger;        
      },
      error: (error: any) => {
        debugger;
        console.error('Error fetching detail:', error);
      },
    });
  }    
  
  saveOrder(): void {    
    debugger
    const updatedOrder = {
      ...this.orderResponse,
      order_date: this.orderResponse.order_date
          ? [
              this.orderResponse.order_date.getFullYear(),
              this.orderResponse.order_date.getMonth() + 1, // Tháng bắt đầu từ 0
              this.orderResponse.order_date.getDate()
            ]
          : null, // Giữ nguyên null nếu không có giá trị
  };        
    this.orderService
      .updateOrder(this.orderId, new OrderDTO(this.orderResponse))
      .subscribe({
      next: (response: Object) => {
        debugger  
        this.router.navigate(['/user-orders']);
      },
      complete: () => {
        debugger;        
      },
      error: (error: any) => {
        // Handle the error
        debugger
        console.error('Error updating order:', error);
        this.router.navigate(['/user-orders'], { relativeTo: this.route });
      }
    });   
  }
}
