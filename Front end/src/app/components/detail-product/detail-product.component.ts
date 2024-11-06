import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Product } from '../../models/product';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { environment } from '../../../environments/environment';
import { ProductImage } from '../../models/product.image';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-detail-product',
  templateUrl: './detail-product.component.html',
  styleUrls: ['./detail-product.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    FooterComponent,
    HeaderComponent,
    CommonModule,
    NgbModule
  ]
})

export class DetailProductComponent implements OnInit {
  product?: Product;
  productId: number = 0;
  currentImageIndex: number = 0;
  quantity: number = 1;
  isPressedAddToCart:boolean = false;
  constructor(
    private productService: ProductService,
    private cartService: CartService,
    // private categoryService: CategoryService,
    // private router: Router,
      private activatedRoute: ActivatedRoute,
      private router: Router,
    ) {
      
    }
    ngOnInit() {
      // Lấy productId từ URL      
      const idParam = this.activatedRoute.snapshot.paramMap.get('id');
      debugger
      //this.cartService.clearCart();
      //const idParam = 9 //fake tạm 1 giá trị
      if (idParam !== null) {
        this.productId = +idParam;
      }
      if (!isNaN(this.productId)) {
        this.productService.getDetailProduct(this.productId).subscribe({
          next: (response: any) => {            
            // Lấy danh sách ảnh sản phẩm và thay đổi URL
            debugger
            if (response.product_images && response.product_images.length > 0) {
              response.product_images.forEach((product_image:ProductImage) => {
                // validate url
                if (!product_image.image_url || !product_image.image_url.includes(environment.apiBaseUrl)) {
                  product_image.image_url = `${environment.apiBaseUrl}/products/images/${product_image.image_url}`;
                }
                // product_image.image_url = `${environment.apiBaseUrl}/products/images/${product_image.image_url}`;
              });
            }            
            debugger
            this.product = response 
            // Bắt đầu với ảnh đầu tiên
            this.showImage(0);
          },
          complete: () => {
            debugger;
          },
          error: (error: any) => {
            debugger;
            console.error('Error fetching detail:', error);
          }
        });    
      } else {
        console.error('Invalid productId:', idParam);
      }      
    }
    showImage(index: number): void {
      debugger
      if (this.product && this.product.product_images && 
          this.product.product_images.length > 0) {
        // Đảm bảo index nằm trong khoảng hợp lệ        
        if (index < 0) {
          index = 0;
        } else if (index >= this.product.product_images.length) {
          index = this.product.product_images.length - 1;
        }        
        // Gán index hiện tại và cập nhật ảnh hiển thị
        this.currentImageIndex = index;
      }
    }
    thumbnailClick(index: number) {
      debugger
      // Gọi khi một thumbnail được bấm
      this.currentImageIndex = index; // Cập nhật currentImageIndex
    }  
    nextImage(): void {
      debugger
      this.showImage(this.currentImageIndex + 1);
    }
  
    previousImage(): void {
      debugger
      this.showImage(this.currentImageIndex - 1);
    }      
    addToCart(): void {
      const confirmation = window
      .confirm('Bạn muốn thêm sản phầm này vào giỏ hàng?');
      if(confirmation)
      {
        this.isPressedAddToCart = true;
        if (this.product) {
          this.cartService.addToCart(this.product.id, this.quantity);
          alert('Thêm thành công')
        } else {
          // Xử lý khi product là null
          console.error('Không thể thêm sản phẩm vào giỏ hàng vì product là null.');
        }
      }
      
    }    
        
    increaseQuantity(): void {
      debugger
      this.quantity++;
    }
    
    decreaseQuantity(): void {
      if (this.quantity > 1) {
        this.quantity--;
      }
    }
    onQuantityChange(event: Event): void {
      const target = event.target as HTMLInputElement; // Định nghĩa kiểu cho target
      const newValue = parseInt(target.value, 10);
      
      if (!isNaN(newValue) && newValue >= 1) {
          this.quantity = newValue;
      } else {
          this.quantity = 1; // Reset về 1 nếu nhập không hợp lệ
          target.value = '1'; // Cập nhật giá trị trong input
      }
  }
  
  allowOnlyNumbers(event: KeyboardEvent): void {
    const char = String.fromCharCode(event.which);
    if (!/[0-9]/.test(char)) {
        event.preventDefault(); // Ngăn chặn nhập ký tự không hợp lệ
    }
}
    getTotalPrice(): number {
      if (this.product) {
        return this.product.price * this.quantity;
      }
      return 0;
    }
    buyNow(): void {      
      if(this.isPressedAddToCart == false) {
        this.addToCart();
      }
      this.router.navigate(['/orders']);
    }    
}
