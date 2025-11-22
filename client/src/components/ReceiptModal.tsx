// client/src/components/ReceiptModal.tsx
import React from "react";
import html2canvas from "html2canvas";

interface ReceiptModalProps {
  transaction: any;
  onClose: () => void;
}

const ReceiptModal: React.FC<ReceiptModalProps> = ({
  transaction,
  onClose,
}) => {
  if (!transaction) return null;

  const formattedDate = new Date(transaction.transaction_time).toLocaleString(
    "id-ID"
  );

  // Fungsi Print
  const handlePrint = () => {
    window.print();
  };

  // Fungsi Download Gambar
  const handleDownload = async () => {
    const receiptElement = document.getElementById("receipt-content");
    if (receiptElement) {
      const canvas = await html2canvas(receiptElement, {
        backgroundColor: "#ffffff", // Pastikan background putih
        scale: 2, // Tingkatkan resolusi gambar
      });
      const link = document.createElement("a");
      link.download = `Struk-${transaction.transaction_id}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    }
  };

  return (
    <div
      className="modal-overlay"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <style>
        {`
                    @media print {
                        body * {
                            visibility: hidden;
                        }
                        #receipt-content, #receipt-content * {
                            visibility: visible;
                        }
                        #receipt-content {
                            position: absolute;
                            left: 0;
                            top: 0;
                            width: 100%;
                            margin: 0;
                            padding: 0;
                            box-shadow: none;
                        }
                        .modal-overlay {
                            background: none !important;
                            position: static !important;
                        }
                        .no-print {
                            display: none !important;
                        }
                    }
                `}
      </style>

      <div
        style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "8px",
          width: "350px",
          fontFamily: "monospace",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        {/* Area Struk yang akan di-Print/Download */}
        <div
          id="receipt-content"
          style={{ padding: "20px", backgroundColor: "white", color: "#000" }}
        >
          <h3 style={{ marginBottom: "20px", textAlign: "center" }}>
            {transaction.store_name || "Toko Kita"}
          </h3>
          <div style={{ textAlign: "left", marginBottom: "10px" }}>
            {transaction.customer_name || "Pelanggan Umum"}
          </div>

          <div
            style={{ borderBottom: "1px dashed #000", marginBottom: "10px" }}
          ></div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "12px",
            }}
          >
            <span>Pembayaran</span> <span>{transaction.payment_method}</span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "12px",
            }}
          >
            <span>Tanggal</span> <span>{formattedDate}</span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "12px",
            }}
          >
            <span>No Struk</span> <span>SR{transaction.transaction_id}</span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "12px",
              marginBottom: "10px",
            }}
          >
            <span>Kasir</span> <span>{transaction.cashier_name}</span>
          </div>

          <div
            style={{ borderBottom: "1px dashed #000", marginBottom: "10px" }}
          ></div>

          {/* Items */}
          <div style={{ textAlign: "left", marginBottom: "10px" }}>
            {transaction.items?.map((item: any) => (
              <div key={item.detail_id} style={{ marginBottom: "5px" }}>
                <div style={{ fontSize: "12px" }}>{item.product_name}</div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "12px",
                  }}
                >
                  <span>
                    {parseFloat(item.price_per_unit).toLocaleString("id-ID")} x{" "}
                    {item.quantity}
                  </span>
                  <span>
                    {parseFloat(item.total_price).toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div
            style={{ borderBottom: "1px dashed #000", marginBottom: "10px" }}
          ></div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontWeight: "bold",
              fontSize: "14px",
            }}
          >
            <span>TOTAL</span>{" "}
            <span>
              {parseFloat(transaction.total_price).toLocaleString("id-ID")}
            </span>
          </div>

          <div
            style={{ borderBottom: "1px dashed #000", margin: "20px 0" }}
          ></div>
          <div style={{ textAlign: "center", fontSize: "12px" }}>
            Terima Kasih
          </div>
        </div>

        {/* Area Tombol (Tidak ikut diprint) */}
        <div
          className="no-print"
          style={{
            marginTop: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={handlePrint}
              style={{
                flex: 1,
                padding: "10px",
                backgroundColor: "#0277bd",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              🖨️ Print
            </button>
            <button
              onClick={handleDownload}
              style={{
                flex: 1,
                padding: "10px",
                backgroundColor: "#00acc1",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              ⬇️ Download
            </button>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: "10px",
              backgroundColor: "#e0e0e0",
              color: "#333",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              width: "100%",
            }}
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptModal;
