package com.project.shopapp.controllers;


import com.project.shopapp.models.ProductImage;
import com.project.shopapp.services.IProductImageService;
import com.project.shopapp.services.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("${api.prefix}/product_images")
@RequiredArgsConstructor
public class ProductImageController {
    private final IProductImageService productImageService;
    private final ProductService productService;
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> delete(
            @PathVariable Long id
    ) {
        try {
            ProductImage productImage = productImageService.deleteProductImage(id);
            if(productImage != null){
                productService.deleteFile(productImage.getImageUrl());
            }
            return ResponseEntity.ok(productImage);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.toString());
        }
    }
}
