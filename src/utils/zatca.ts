import crypto from "crypto";
import axios from "axios";
import QRCode from "qrcode";
import { randomUUID } from "crypto";

/* ======================================================
 * TYPES
 * ====================================================== */

export interface PreparedInvoice {
    uuid: string;
    xml: string;
    invoiceHash: string;
    qrCodeTLVBase64: string;
    qrCodeImageBase64: string;
}

export interface SubmitResult {
    status: "REPORTED" | "REJECTED";
    zatcaInvoiceId?: string;
    message?: string;
    error?: string;
    rawResponse?: any;
}



export class ZatcaUtil {


    private static escapeXml(value: string): string {
        return value
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&apos;");
    }

    private static encodeTLV(tag: number, value: string): Buffer {
        const buffer = Buffer.from(value, "utf8");
        return Buffer.concat([
            Buffer.from([tag]),
            Buffer.from([buffer.length]),
            buffer
        ]);
    }

    /* ==========================
     * QR TLV BASE64 (TAGS 1–5)
     * ========================== */
    private static generateTLVBase64(data: {
        sellerName: string;
        vatNumber: string;
        timestamp: Date;
        invoiceTotal: number;
        vatAmount: number;
    }): string {

        const buffers = [
            this.encodeTLV(1, data.sellerName),
            this.encodeTLV(2, data.vatNumber),
            this.encodeTLV(3, data.timestamp.toISOString()),
            this.encodeTLV(4, data.invoiceTotal.toFixed(2)),
            this.encodeTLV(5, data.vatAmount.toFixed(2))
        ];

        return Buffer.concat(buffers).toString("base64");
    }

    /* ==========================
     * QR IMAGE
     * ========================== */
    private static async generateQRCodeImage(
        tlvBase64: string
    ): Promise<string> {
        return QRCode.toDataURL(tlvBase64, {
            type: "image/png",
            errorCorrectionLevel: "M",
            margin: 2,
            width: 300
        });
    }

    /* ======================================================
     * LEVEL 1 — PREPARE SIMPLIFIED INVOICE
     * ====================================================== */
    static async prepareInvoice(data: {
        invoiceNumber: string;
        issueDate: Date;
        uuid?: string;
        items: {
            name: string;
            quantity: number;
            unitPrice: number;
        }[];
        seller: {
            name: string;
            vatNumber: string;
            address: object;
        },
        totalAmount: number;
        vatAmount: number;
        grandTotal: number;
        privateKey: string;

    }): Promise<PreparedInvoice> {

        const uuid = randomUUID();

        /* ---------- Totals ---------- */
        const totalAmount = data.items.reduce(
            (sum, i) => sum + i.quantity * i.unitPrice,
            0
        );

        const vatAmount = totalAmount * 0.15;
        const grandTotal = totalAmount + vatAmount;

        /* ---------- Invoice Lines ---------- */
        const invoiceLinesXml = data.items
            .map((item, index) => `
<cac:InvoiceLine>
  <cbc:ID>${index + 1}</cbc:ID>
  <cbc:InvoicedQuantity unitCode="EA">${item.quantity}</cbc:InvoicedQuantity>
  <cbc:LineExtensionAmount currencyID="SAR">${(
                    item.quantity * item.unitPrice
                ).toFixed(2)}</cbc:LineExtensionAmount>

  <cac:Item>
    <cbc:Name>${this.escapeXml(item.name)}</cbc:Name>
    <cac:ClassifiedTaxCategory>
      <cbc:ID>S</cbc:ID>
      <cbc:Percent>15</cbc:Percent>
      <cac:TaxScheme>
        <cbc:ID>VAT</cbc:ID>
      </cac:TaxScheme>
    </cac:ClassifiedTaxCategory>
  </cac:Item>

  <cac:Price>
    <cbc:PriceAmount currencyID="SAR">${item.unitPrice.toFixed(2)}</cbc:PriceAmount>
  </cac:Price>
</cac:InvoiceLine>
`).join("");

        /* ---------- XML ---------- */
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Invoice
 xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
 xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
 xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">

  <cbc:ProfileID>reporting:1.0</cbc:ProfileID>
  <cbc:ID>${data.invoiceNumber}</cbc:ID>
  <cbc:UUID>${uuid}</cbc:UUID>
  <cbc:IssueDate>${data.issueDate.toISOString().split("T")[0]}</cbc:IssueDate>
  <cbc:IssueTime>${data.issueDate.toISOString().split("T")[1].split(".")[0]}Z</cbc:IssueTime>

  <cbc:InvoiceTypeCode name="0100000">388</cbc:InvoiceTypeCode>
  <cbc:DocumentCurrencyCode>SAR</cbc:DocumentCurrencyCode>
  <cbc:TaxCurrencyCode>SAR</cbc:TaxCurrencyCode>

  <cac:AccountingSupplierParty>
    <cac:Party>
      <cac:PartyName>
        <cbc:Name>${this.escapeXml(data.seller.name)}</cbc:Name>
      </cac:PartyName>
      <cac:PartyTaxScheme>
        <cbc:CompanyID>${data.seller.vatNumber}</cbc:CompanyID>
        <cac:TaxScheme>
          <cbc:ID>VAT</cbc:ID>
        </cac:TaxScheme>
      </cac:PartyTaxScheme>
    </cac:Party>
  </cac:AccountingSupplierParty>

  <cac:TaxTotal>
    <cbc:TaxAmount currencyID="SAR">${vatAmount.toFixed(2)}</cbc:TaxAmount>
  </cac:TaxTotal>

  <cac:LegalMonetaryTotal>
    <cbc:LineExtensionAmount currencyID="SAR">${totalAmount.toFixed(2)}</cbc:LineExtensionAmount>
    <cbc:TaxExclusiveAmount currencyID="SAR">${totalAmount.toFixed(2)}</cbc:TaxExclusiveAmount>
    <cbc:TaxInclusiveAmount currencyID="SAR">${grandTotal.toFixed(2)}</cbc:TaxInclusiveAmount>
    <cbc:PayableAmount currencyID="SAR">${grandTotal.toFixed(2)}</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>

  ${invoiceLinesXml}

</Invoice>`.trim();

        /* ---------- Hash ---------- */
        const invoiceHash = crypto
            .createHash("sha256")
            .update(xml)
            .digest("base64");

        /* ---------- QR ---------- */
        const qrCodeTLVBase64 = this.generateTLVBase64({
            sellerName: data.seller.name,
            vatNumber: data.seller.vatNumber,
            timestamp: data.issueDate,
            invoiceTotal: grandTotal,
            vatAmount
        });

        const qrCodeImageBase64 = await this.generateQRCodeImage(
            qrCodeTLVBase64
        );

        return {
            uuid,
            xml,
            invoiceHash,
            qrCodeTLVBase64,
            qrCodeImageBase64
        };
    }

    /* ======================================================
     * LEVEL 2 — SUBMIT TO ZATCA (SIMPLIFIED)
     * ====================================================== */
    static async submitInvoice(params: {
        preparedInvoice: PreparedInvoice;
        token: string;
    }): Promise<SubmitResult> {

        const endpoint =
            "https://gw-fatoora.zatca.gov.sa/e-invoicing/simplified/reporting";

        const payload = {
            uuid: params.preparedInvoice.uuid,
            invoiceHash: params.preparedInvoice.invoiceHash,
            invoice: Buffer
                .from(params.preparedInvoice.xml)
                .toString("base64")
        };

        const response = await axios.post(endpoint, payload, {
            headers: {
                Authorization: `Bearer ${params.token}`,
                "Content-Type": "application/json"
            }
        });

        return {
            status: response.data?.reportingStatus || "REPORTED",
            zatcaInvoiceId: response.data?.invoiceId,
            rawResponse: response.data
        };
    }
}
