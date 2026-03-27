import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import axios from 'axios';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

export const generateBill = async (orderId, downloadType = 'pdf') => {
  try {
    // Fetch the unified computed bill from the backend
    const token = Cookies.get('adminToken');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/orders/${orderId}/bill`, { headers });
    const { order, billDetails } = res.data;
    const settings = billDetails;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let startY = 20;

    // Helper functions
    const centerText = (text, y, size = 12, isBold = false) => {
      doc.setFontSize(size);
      doc.setFont('helvetica', isBold ? 'bold' : 'normal');
      const textWidth = doc.getStringUnitWidth(text) * doc.internal.getFontSize() / doc.internal.scaleFactor;
      doc.text(text, (pageWidth - textWidth) / 2, y);
    };

    // Header
    centerText(settings.restaurantName || 'Restaurant', startY, 20, true);
    startY += 8;
    
    if (settings.address) {
      const addressLines = doc.splitTextToSize(settings.address, pageWidth - 40);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      addressLines.forEach(line => {
        const textWidth = doc.getStringUnitWidth(line) * doc.internal.getFontSize() / doc.internal.scaleFactor;
        doc.text(line, (pageWidth - textWidth) / 2, startY);
        startY += 5;
      });
    }

    if (settings.showGst && settings.gstNumber) {
      centerText(`GSTIN: ${settings.gstNumber}`, startY, 10, true);
      startY += 8;
    }

    doc.setLineWidth(0.5);
    doc.line(20, startY, pageWidth - 20, startY);
    startY += 8;

    // Order Info
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Order ID: ${order._id.slice(-6).toUpperCase()}`, 20, startY);
    doc.text(`Date & Time: ${new Date(order.createdAt || Date.now()).toLocaleString()}`, pageWidth - 20, startY, { align: 'right' });
    startY += 6;
    doc.text(`Table: ${order.tableId?.name || 'Unknown'}`, 20, startY);
    startY += 8;

    // Items Table
    const tableColumn = ["Item", "Qty", "Price", "Total"];
    const tableRows = [];

    order.items.forEach(item => {
      const itemData = [
        item.title,
        item.quantity.toString(),
        `${settings.currency} ${(item.price).toFixed(2)}`,
        `${settings.currency} ${(item.price * item.quantity).toFixed(2)}`
      ];
      tableRows.push(itemData);
    });

    autoTable(doc, {
      startY: startY,
      head: [tableColumn],
      body: tableRows,
      theme: 'plain',
      headStyles: { fontStyle: 'bold', fillColor: [240, 240, 240] },
      styles: { fontSize: 10, cellPadding: 3 },
      columnStyles: {
        1: { halign: 'center' },
        2: { halign: 'right' },
        3: { halign: 'right' }
      }
    });

    let finalY = doc.lastAutoTable.finalY + 10;
    
    // Summary using backend computed totals
    const summaryX = pageWidth - 60;
    const valueX = pageWidth - 20;

    doc.setFont('helvetica', 'normal');
    doc.text('Subtotal:', summaryX, finalY);
    doc.text(`${settings.currency} ${settings.subtotal.toFixed(2)}`, valueX, finalY, { align: 'right' });
    finalY += 6;

    if (settings.serviceCharge > 0) {
      doc.text('Service Charge:', summaryX, finalY);
      doc.text(`${settings.currency} ${settings.serviceCharge.toFixed(2)}`, valueX, finalY, { align: 'right' });
      finalY += 6;
    }

    if (settings.showGst && settings.gstAmount > 0) {
      if (settings.showBreakdown) {
        let halfPct = settings.gstPercentage / 2;
        doc.text(`CGST (${halfPct}%):`, summaryX, finalY);
        doc.text(`${settings.currency} ${settings.cgst.toFixed(2)}`, valueX, finalY, { align: 'right' });
        finalY += 6;
        doc.text(`SGST (${halfPct}%):`, summaryX, finalY);
        doc.text(`${settings.currency} ${settings.sgst.toFixed(2)}`, valueX, finalY, { align: 'right' });
        finalY += 6;
      } else {
        doc.text(`GST (${settings.gstPercentage}%):`, summaryX, finalY);
        doc.text(`${settings.currency} ${settings.gstAmount.toFixed(2)}`, valueX, finalY, { align: 'right' });
        finalY += 6;
      }
    }

    doc.setLineWidth(0.5);
    doc.line(summaryX, finalY - 4, pageWidth - 20, finalY - 4);

    doc.setFont('helvetica', 'bold');
    doc.text('GRAND TOTAL:', summaryX, finalY+2);
    doc.text(`${settings.currency} ${settings.grandTotal.toFixed(2)}`, valueX, finalY+2, { align: 'right' });
    finalY += 15;

    // Footer
    centerText('Thank You! Visit Again', finalY, 12, true);

    // Download logic
    if (downloadType === 'pdf') {
      doc.save(`Bill_${order._id.slice(-6)}.pdf`);
    } else if (downloadType === 'image') {
      window.open(doc.output('bloburl'), '_blank');
    }
  } catch (err) {
    console.error('Failed to generate bill', err);
    toast.error(`PDF Error: ${err.response?.data?.message || err.message || 'Unknown error'}`);
  }
};
