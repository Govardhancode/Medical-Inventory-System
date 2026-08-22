package com.medical.inventory.service;

import com.medical.inventory.entity.Bill;
import com.medical.inventory.entity.BillItem;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;

@Service
public class PdfService {

    public byte[] generateInvoice(Bill bill) {

        try {

            PDDocument document = new PDDocument();

            PDPage page = new PDPage();
            document.addPage(page);

            PDPageContentStream content =
                    new PDPageContentStream(document, page);

            // Title
            content.beginText();
            content.setFont(
                    new PDType1Font(
                            Standard14Fonts.FontName.HELVETICA_BOLD),
                    20);
            content.newLineAtOffset(200, 750);
            content.showText("MEDICAL INVENTORY");
            content.endText();

            // Invoice title
            content.beginText();
            content.setFont(
                    new PDType1Font(
                            Standard14Fonts.FontName.HELVETICA_BOLD),
                    16);
            content.newLineAtOffset(250, 720);
            content.showText("INVOICE");
            content.endText();

            // Bill details
            int y = 680;

            content.beginText();
            content.setFont(
                    new PDType1Font(
                            Standard14Fonts.FontName.HELVETICA),
                    12);
            content.newLineAtOffset(50, y);
            content.showText(
                    "Bill Number: " + bill.getBillNumber());
            content.endText();

            y -= 20;

            content.beginText();
            content.newLineAtOffset(50, y);
            content.showText(
                    "Date: " + bill.getBillDate());
            content.endText();

            y -= 20;

            content.beginText();
            content.newLineAtOffset(50, y);
            content.showText(
                    "Customer: " +
                    bill.getCustomer().getName());
            content.endText();

            y -= 40;

            // Items heading
            content.beginText();
            content.setFont(
                    new PDType1Font(
                            Standard14Fonts.FontName.HELVETICA_BOLD),
                    12);
            content.newLineAtOffset(50, y);
            content.showText(
                    "Medicine        Qty       Price       Total");
            content.endText();

            y -= 20;

            // Items
            content.setFont(
                    new PDType1Font(
                            Standard14Fonts.FontName.HELVETICA),
                    12);

            for (BillItem item : bill.getItems()) {

                content.beginText();
                content.newLineAtOffset(50, y);

                String medicineName =
                        item.getMedicine().getName();

                String line =
                        medicineName +
                        "     " +
                        item.getQuantity() +
                        "     " +
                        item.getPrice() +
                        "     " +
                        item.getTotal();

                content.showText(line);

                content.endText();

                y -= 20;
            }

            y -= 20;

            // Subtotal
            content.beginText();
            content.newLineAtOffset(350, y);
            content.showText(
                    "Subtotal: " + bill.getSubtotal());
            content.endText();

            y -= 20;

            // Discount
            content.beginText();
            content.newLineAtOffset(350, y);
            content.showText(
                    "Discount: " + bill.getDiscount());
            content.endText();

            y -= 20;

            // GST
            content.beginText();
            content.newLineAtOffset(350, y);
            content.showText(
                    "GST: " + bill.getGst());
            content.endText();

            y -= 25;

            // Total
            content.beginText();
            content.setFont(
                    new PDType1Font(
                            Standard14Fonts.FontName.HELVETICA_BOLD),
                    14);
            content.newLineAtOffset(350, y);
            content.showText(
                    "TOTAL: " + bill.getTotalAmount());
            content.endText();

            content.close();

            ByteArrayOutputStream output =
                    new ByteArrayOutputStream();

            document.save(output);
            document.close();

            return output.toByteArray();

        } catch (Exception e) {

            throw new RuntimeException(
                    "Error generating PDF: " + e.getMessage());
        }
    }
}