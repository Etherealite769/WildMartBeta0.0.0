package com.ecommerce.WildMartV1.citccs.controller;

import com.ecommerce.WildMartV1.citccs.model.Voucher;
import com.ecommerce.WildMartV1.citccs.repository.VoucherRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vouchers")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
@Slf4j
public class VoucherController {

    private final VoucherRepository voucherRepository;

    @GetMapping
    public ResponseEntity<List<Voucher>> getAllActiveVouchers() {
        try {
            List<Voucher> vouchers = voucherRepository.findAll().stream()
                    .filter(Voucher::getIsActive)
                    .toList();
            return ResponseEntity.ok(vouchers);
        } catch (Exception e) {
            log.error("Error fetching vouchers", e);
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Voucher> getVoucherById(@PathVariable Integer id) {
        try {
            return voucherRepository.findById(id)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("Error fetching voucher with id: {}", id, e);
            return ResponseEntity.status(500).build();
        }
    }
}