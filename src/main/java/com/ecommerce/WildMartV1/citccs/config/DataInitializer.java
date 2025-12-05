package com.ecommerce.WildMartV1.citccs.config;

import com.ecommerce.WildMartV1.citccs.model.Category;
import com.ecommerce.WildMartV1.citccs.model.Voucher;
import com.ecommerce.WildMartV1.citccs.repository.CategoryRepository;
import com.ecommerce.WildMartV1.citccs.repository.VoucherRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private CategoryRepository categoryRepository;
    
    @Autowired
    private VoucherRepository voucherRepository;

    @Override
    public void run(String... args) throws Exception {
        // Check if categories already exist
        if (categoryRepository.count() == 0) {
            // Create default categories
            List<String> categoryNames = Arrays.asList(
                    "electronics",
                    "clothing",
                    "books",
                    "home",
                    "accessories",
                    "sports",
                    "other");

            for (String categoryName : categoryNames) {
                Category category = new Category();
                category.setCategoryName(categoryName);
                category.setActive(true);
                categoryRepository.save(category);
                System.out.println("Created category: " + categoryName);
            }
        } else {
            System.out.println("Categories already exist, skipping initialization");
        }
        
        // Check if vouchers already exist
        if (voucherRepository.count() == 0) {
            // Create sample vouchers
            createSampleVouchers();
        } else {
            System.out.println("Vouchers already exist, skipping initialization");
        }
    }
    
    private void createSampleVouchers() {
        // 1. Percentage discount voucher (10% off)
        Voucher percentageVoucher = new Voucher();
        percentageVoucher.setDiscountCode("SAVE10");
        percentageVoucher.setDiscountType(Voucher.DiscountType.PERCENTAGE);
        percentageVoucher.setDiscountValue(new BigDecimal("10"));
        percentageVoucher.setMinimumOrderAmount(new BigDecimal("200"));
        percentageVoucher.setValidFrom(LocalDateTime.now().minusDays(1));
        percentageVoucher.setValidUntil(LocalDateTime.now().plusMonths(3));
        percentageVoucher.setUsageLimit(100);
        percentageVoucher.setIsActive(true);
        voucherRepository.save(percentageVoucher);
        System.out.println("Created percentage voucher: SAVE10");
        
        // 2. Fixed amount discount voucher (₱100 off)
        Voucher fixedVoucher = new Voucher();
        fixedVoucher.setDiscountCode("SAVE100");
        fixedVoucher.setDiscountType(Voucher.DiscountType.FIXED_AMOUNT);
        fixedVoucher.setDiscountValue(new BigDecimal("100"));
        fixedVoucher.setMinimumOrderAmount(new BigDecimal("500"));
        fixedVoucher.setValidFrom(LocalDateTime.now().minusDays(1));
        fixedVoucher.setValidUntil(LocalDateTime.now().plusMonths(2));
        fixedVoucher.setUsageLimit(50);
        fixedVoucher.setIsActive(true);
        voucherRepository.save(fixedVoucher);
        System.out.println("Created fixed amount voucher: SAVE100");
        
        // 3. Shipping discount voucher
        Voucher shippingVoucher = new Voucher();
        shippingVoucher.setDiscountCode("FREESHIP");
        shippingVoucher.setDiscountType(Voucher.DiscountType.SHIPPING);
        shippingVoucher.setDiscountValue(BigDecimal.ZERO); // Not used for shipping type
        shippingVoucher.setMinimumOrderAmount(new BigDecimal("300"));
        shippingVoucher.setValidFrom(LocalDateTime.now().minusDays(1));
        shippingVoucher.setValidUntil(LocalDateTime.now().plusMonths(1));
        shippingVoucher.setUsageLimit(30);
        shippingVoucher.setIsActive(true);
        voucherRepository.save(shippingVoucher);
        System.out.println("Created shipping voucher: FREESHIP");
    }
}