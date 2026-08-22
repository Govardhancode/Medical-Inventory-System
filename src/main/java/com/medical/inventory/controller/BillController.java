package com.medical.inventory.controller;

import com.medical.inventory.entity.Bill;
import com.medical.inventory.service.BillService;
import com.medical.inventory.service.PdfService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bills")
@CrossOrigin(origins = "*")
public class BillController {

    private final BillService billService;
    private final PdfService pdfService;

    public BillController(
            BillService billService,
            PdfService pdfService) {

        this.billService = billService;
        this.pdfService = pdfService;
    }

    // Create bill
    @PostMapping("/customer/{customerId}")
    public Bill createBill(
            @PathVariable Long customerId,
            @RequestBody Bill bill) {

        return billService.createBill(
                customerId,
                bill);
    }

    // Get all bills
    @GetMapping
    public List<Bill> getAllBills() {
        return billService.getAllBills();
    }

    // Get bill by ID
    @GetMapping("/{id}")
    public ResponseEntity<Bill> getBillById(
            @PathVariable Long id) {

        try {

            return ResponseEntity.ok(
                    billService.getBillById(id));

        } catch (RuntimeException e) {

            return ResponseEntity
                    .notFound()
                    .build();
        }
    }

    // Delete bill
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteBill(
            @PathVariable Long id) {

        billService.deleteBill(id);

        return ResponseEntity.ok(
                "Bill deleted successfully");
    }

    // Generate PDF invoice
    @GetMapping("/{id}/pdf")
    public ResponseEntity<byte[]> generatePdf(
            @PathVariable Long id) {

        Bill bill = billService.getBillById(id);

        byte[] pdf =
                pdfService.generateInvoice(bill);

        return ResponseEntity.ok()
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=invoice-" +
                                bill.getBillNumber() +
                                ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }
}