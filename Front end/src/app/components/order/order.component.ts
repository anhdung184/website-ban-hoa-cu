import { Component, Inject, OnInit } from '@angular/core';
import { Product } from '../../models/product';
import { CartService } from '../../services/cart.service';
import { ProductService } from '../../services/product.service';
import { OrderService } from '../../services/order.service';
import { TokenService } from '../../services/token.service';
import { environment } from '../../../environments/environment';
import { OrderDTO } from '../../dtos/order/order.dto';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Order } from '../../models/order';
import { CommonModule,Location,DOCUMENT } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { inject } from '@angular/core';
import { CouponService } from '../../services/coupon.service';

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss'],
  standalone: true,
  imports: [
    FooterComponent,
    HeaderComponent,
    CommonModule,
    FormsModule,    
    ReactiveFormsModule,
  ]
})
export class OrderComponent implements OnInit{
  private couponService = inject(CouponService);
  private cartService = inject(CartService);
  private productService = inject(ProductService);
  private orderService = inject(OrderService);
  private tokenService = inject(TokenService);
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);

  orderForm: FormGroup; // Đối tượng FormGroup để quản lý dữ liệu của form
  cartItems: { product: Product, quantity: number }[] = [];
  totalAmount: number = 0; // Tổng tiền
  couponDiscount: number = 0; //số tiền được discount từ coupon
  couponApplied: boolean = false;
  cart: Map<number, number> = new Map();
  localStorage?:Storage;
  orderData: OrderDTO = {
    user_id: 0, // Thay bằng user_id thích hợp
    fullname: '', // Khởi tạo rỗng, sẽ được điền từ form
    email: '', // Khởi tạo rỗng, sẽ được điền từ form    
    phone_number: '', // Khởi tạo rỗng, sẽ được điền từ form
    address: '', // Khởi tạo rỗng, sẽ được điền từ form
    status: 'đang chờ xử lý',
    note: '', // Có thể thêm trường ghi chú nếu cần
    total_money: 0, // Sẽ được tính toán dựa trên giỏ hàng và mã giảm giá
    payment_method: 'cod', // Mặc định là thanh toán khi nhận hàng (COD)
    shipping_method: 'normal', // Mặc định là vận chuyển thường (normal)
    coupon_code: '', // Sẽ được điền từ form khi áp dụng mã giảm giá
    cart_items: []
  };
  changeDetectorRef: any;

  constructor(
    @Inject(DOCUMENT) private document: Document
  ) {
    this.localStorage = document.defaultView?.localStorage;
    // Tạo FormGroup và các FormControl tương ứng
    this.orderForm = this.formBuilder.group({
      fullname: ['', Validators.required], // fullname là FormControl bắt buộc      
      email: ['', [Validators.email]], // Sử dụng Validators.email cho kiểm tra định dạng email
      phone_number: ['', [Validators.required, Validators.minLength(6)]], // phone_number bắt buộc và ít nhất 6 ký tự
      address: ['', [Validators.required, Validators.minLength(5)]], // address bắt buộc và ít nhất 5 ký tự
      note: [''],
      couponCode: [''],
      shipping_method: ['express'],
      payment_method: ['cod']
    });
  }
  
  ngOnInit(): void {  
    debugger
    const userIdString = this.localStorage?.getItem('user');
    
    if (userIdString) {
      const userInfo = JSON.parse(userIdString); // Phân tích chuỗi JSON thành đối tượng
      this.orderForm.patchValue({
          fullname: userInfo.fullname || '',
          email: userInfo.email || '',
          phone_number: userInfo.phone_number || '',
          address: userInfo.address || ''
      });
      
  }
    //this.cartService.clearCart();
    this.orderData.user_id = this.tokenService.getUserId();    
    
    // Lấy danh sách sản phẩm từ giỏ hàng
    debugger
    this.cart = this.cartService.getCart();
    const productIds = Array.from(this.cart.keys()); // Chuyển danh sách ID từ Map giỏ hàng    

    // Gọi service để lấy thông tin sản phẩm dựa trên danh sách ID
    debugger    
    if(productIds.length === 0) {
      return;
    }    
    this.productService.getProductsByIds(productIds).subscribe({
      next: (products) => {            
        debugger
        // Lấy thông tin sản phẩm và số lượng từ danh sách sản phẩm và giỏ hàng
        this.cartItems = productIds.map((productId) => {
          debugger

          const product = products.find((p) => p.id === productId);
          if (product) {
            product.thumbnail = `${environment.apiBaseUrl}/products/images/${product.thumbnail}`;
          }          
          return {
            product: product!,
            quantity: this.cart.get(productId)!
          };
        });
        this.changeDetectorRef.detectChanges();
      },
      complete: () => {
        debugger;
        
        this.calculateTotal()
      },
      error: (error: any) => {
        debugger;
        console.error('Error fetching detail:', error);
      }
    });        
  }
  placeOrder() {
    debugger
    if (this.orderForm.valid && this.cartItems.length > 0) {
      this.orderData = {
          ...this.orderData,
          ...this.orderForm.value
      };
      this.orderData.cart_items = this.cartItems.map(cartItem => ({
          product_id: cartItem.product.id,
          quantity: cartItem.quantity
      }));
      this.orderData.total_money = this.totalAmount;
      debugger;
      
      this.orderService.placeOrder(this.orderData).subscribe({
          next: (response: Order) => {
              debugger;          
              alert('Đặt hàng thành công');
              this.cartService.clearCart();
              this.router.navigate(['/']);
          },
          complete: () => {
              debugger;
              this.calculateTotal();
          },
          error: (error: any) => {
              debugger;
              alert(`Lỗi khi đặt hàng: ${error}`);
          },
      });
  } else {
      // Hiển thị thông báo lỗi nếu form không hợp lệ hoặc giỏ hàng rỗng
      if (this.cartItems.length === 0) {
          alert('Giỏ hàng hiện đang trống. Vui lòng thêm sản phẩm vào giỏ hàng.');
      } else {
          alert('Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.');
      }
  }              
  }
    
  decreaseQuantity(index: number): void {
    if (this.cartItems[index].quantity > 1) {
        this.cartItems[index].quantity--;
    }
    this.calculateTotal();
}

increaseQuantity(index: number): void {
    this.cartItems[index].quantity++;
    this.calculateTotal();
}

onQuantityChange(event: Event,index: number): void {
  const target = event.target as HTMLInputElement; // Định nghĩa kiểu cho target
  const newValue = parseInt(target.value, 10);
  
  if (!isNaN(newValue) && newValue >= 1) {
    this.cartItems[index].quantity = newValue;
  } else {
    this.cartItems[index].quantity = 1; // Reset về 1 nếu nhập không hợp lệ
      target.value = '1'; // Cập nhật giá trị trong input
  }
   this.calculateTotal();
}
allowOnlyNumbers(event: KeyboardEvent): void {
  const char = String.fromCharCode(event.which);
  if (!/[0-9]/.test(char)) {
      event.preventDefault(); // Ngăn chặn nhập ký tự không hợp lệ
  }
}
  // Hàm tính tổng tiền
  calculateTotal(): void {
    const shippingCost = this.orderForm.get('shipping_method')?.value === 'express' ? 30000 : 0;

      this.totalAmount = this.cartItems.reduce(
          (total, item) => total + item.product.price * item.quantity,
          0
      ) + shippingCost;
  }

  confirmDelete(index: number): void {
    if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      // Xóa sản phẩm khỏi danh sách cartItems
      this.cartItems.splice(index, 1);
      // Cập nhật lại this.cart từ this.cartItems
      this.updateCartFromCartItems();
      // Tính toán lại tổng tiền
      this.calculateTotal();
    }
  }
  // Hàm xử lý việc áp dụng mã giảm giá
  applyCoupon(): void {
    debugger
    const couponCode = this.orderForm.get('couponCode')!.value;
    if (!this.couponApplied && couponCode) {
      this.calculateTotal();
      this.couponService.calculateCouponValue(couponCode, this.totalAmount)
        .subscribe({
          next: (response) => {
            this.totalAmount = response;
            this.couponApplied = true;
          }
        });
    }
  }
  private updateCartFromCartItems(): void {
    this.cart.clear();
    this.cartItems.forEach((item) => {
      this.cart.set(item.product.id, item.quantity);
    });
    this.cartService.setCart(this.cart);
  }
}
