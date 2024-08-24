import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { collection, query, where, getDocs, deleteDoc, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../pages/firebase';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import SalesComparisonChart from '../Chart/SalesComparisonChart';
import Grid from '../Grid/Grid';
import './HomePage.css';  
import RevenueProgress from '../Revenue/RevenueProgress';
import AssortedChart from '../Assorted Chart/AssortedChat';
import AssortedProgress from '../AssortedRevenueProgress/AssortedProgress';

const Homepage = () => {
  const [customerName, setCustomerName] = useState('');
  const [customerState, setCustomerState] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [invoiceNumbers, setInvoiceNumbers] = useState('');
  const [customerGSTIN, setCustomerGSTIN] = useState('');
  const [customerPAN, setCustomerPAN] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [manualInvoiceNumber, setManualInvoiceNumber] = useState('');
  const [businessState, setBusinessState] = useState('YourBusinessState');
  const [searchTerm, setSearchTerm] = useState('');
  const [taxOption, setTaxOption] = useState('cgst_sgst');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [customerDetails, setCustomerDetails] = useState([]);
  const [billingDetails, setBillingDetails] = useState([]); 
  const [assortedDetails, setAssortedDetails] = useState([]); 
  const [details, setDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingDetail, setEditingDetail] = useState(null); // Track currently editing detail


  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      const startTimestamp = Timestamp.fromDate(startOfDay);
      const endTimestamp = Timestamp.fromDate(endOfDay);

      const customerQuery = query(
        collection(db, 'customerBilling'),
        where('date', '>=', startTimestamp),
        where('date', '<=', endTimestamp)
      );

      const billingQuery = query(
        collection(db, 'billing'),
        where('date', '>=', startTimestamp),
        where('date', '<=', endTimestamp)
      );

      try {
        const customerSnapshot = await getDocs(customerQuery);
        const customerData = customerSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const billingSnapshot = await getDocs(billingQuery);
        const billingData = billingSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        setCustomerDetails(customerData);
        setBillingDetails(billingData);
      } catch (error) {
        console.error('Error fetching details: ', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [selectedDate]);

  // Reuse existing functions (handleDelete, handleEdit, handleSave, handleDownloadPDF, handleGeneratePDF)


  const handleDelete = async (id, collectionName) => {
    console.log(`Deleting id: ${id} from ${collectionName}`);

    try {
      const docRef = doc(db, collectionName, id);
      await deleteDoc(docRef); // Delete the document from Firestore

      if (collectionName === 'customerBilling') {
        const updatedCustomerDetails = customerDetails.filter(detail => detail.id !== id);
        setCustomerDetails(updatedCustomerDetails);
      } else if (collectionName === 'billing') {
        const updatedBillingDetails = billingDetails.filter(detail => detail.id !== id);
        setBillingDetails(updatedBillingDetails);
      } else {
        console.error(`Unknown collection: ${collectionName}`);
      }
    } catch (error) {
      console.error(`Failed to delete id: ${id} from ${collectionName}`, error);
    }
  };
  
  
  
  
  
  const handleEdit = (detail) => {
    setEditingDetail({ ...detail });
  };

  const handleSave = () => {
    const updatedDetails = customerDetails.map(detail =>
      detail.id === editingDetail.id ? editingDetail : detail
    );
    setCustomerDetails(updatedDetails);
    setEditingDetail(null);
  };

  const handleDownloadPDF = (data, fileName) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.rect(10, 10, pageWidth - 20, pageHeight - 20); 
    const tableColumn = ['Customer Name', 'Phone No', 'Email ID', 'Purchase Details', 'CGST', 'SGST', 'IGST', 'Grand Total'];
    const tableRows = [];

    data.forEach((detail) => {
      const detailData = [
        detail.customerName,
        detail.customerPhone || 'N/A',
        detail.customerEmail || 'N/A',
        `Rs.${detail.totalAmount ? detail.totalAmount.toFixed(0) : 'N/A'}`,
        `Rs.${detail.cgstAmount ? detail.cgstAmount.toFixed(0) : 'N/A'}`,
        `Rs.${detail.sgstAmount ? detail.sgstAmount.toFixed(0) : 'N/A'}`,
        `Rs.${detail.igstAmount ? detail.igstAmount.toFixed(0) : 'N/A'}`,
        `Rs.${detail.grandTotal ? detail.grandTotal.toFixed(0) : 'N/A'}`,
      ];
      tableRows.push(detailData);
    });

    doc.autoTable(tableColumn, tableRows, { startY: 20 });
    doc.text('Details by Date', 14, 15);
    doc.save(`${fileName}.pdf`);
  };
  const handleChange = (e) => {
    setEditingDetail({ ...editingDetail, totalAmount: e.target.value });
  };
  const handleCancelEdit = () => {
    setEditingDetail(null); // Clear editing state
  };

  const handleGeneratePDF = (detail) => {
    const generatePDF = (copyType) => {
    const doc = new jsPDF();
    const currentDate = new Date();   
     
    // Add a page border
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const borderMargin = 10; // Adjust the margin as needed
  
    // Draw the page border
    doc.rect(borderMargin, borderMargin, pageWidth - 2 * borderMargin, pageHeight - 2 * borderMargin);
    doc.rect(borderMargin, borderMargin, pageWidth - 2 * borderMargin, pageHeight - 2 * borderMargin);

  const {
    customerName,
    customerAddress,
    customerState,
    customerPhone,
    customerGSTIN,
    customerPAN
  } = detail;
  
  
      
  doc.setFontSize(10);
  doc.setTextColor(255, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text('SKS CRACKERS', 24, 21);
  doc.text('VIGNESHWARA TRADERS', 24, 27);
  doc.setTextColor(0, 0, 0);
  // Reset font to normal
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  // Add the rest of the text
  doc.text('676/1b2,virudhunagar Main Road, opposite kalishwari college, Sivakasi', 24, 33);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Phone number:', 24, 39); // Regular text
 doc.setFont('helvetica', 'normal');
 doc.text('+91 9943019251, +91 9629565298', 48, 39); // Bold text
  doc.setFont('helvetica', 'bold');
  doc.text('Email:', 24, 45);
  doc.setFont('helvetica', 'normal');
  doc.text('hariprakashtex@gmail.com', 35, 45);
  doc.setFont('helvetica', 'bold');
  doc.text('State:', 24, 52);
  doc.setFont('helvetica', 'normal');
  doc.text('33-Tamil Nadu', 34, 52);
doc.setFontSize(10);
doc.setTextColor(255, 0, 0);  
doc.setFont('helvetica', 'bold');
doc.text(`INVOICE`, 138, 22);
doc.text(copyType.toUpperCase()+" COPY", 138, 29);
doc.text(`Invoice Number: SKSC-${detail.invoiceNumber}-24`, 138, 43);
doc.setTextColor(0, 0, 0);
doc.setFont('helvetica', 'normal');
doc.setFontSize(9);
doc.text(`Date: ${currentDate.toLocaleDateString()}`, 138, 36);
doc.setFont('helvetica', 'bold');
doc.text('GSTIN: 33ERWPD0202C1ZE', 138, 49);


  doc.rect(14, 15, 182, 40);

  doc.setFontSize(12);
  doc.setTextColor(170, 51, 106);
  doc.setFont('helvetica', 'bold');
  doc.text('BILLED TO', 19, 65);
  doc.setTextColor(0, 0, 0);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);

  const startX = 21;
  let startY = 72;
  const lineHeight = 8;

    const labels = [
      'Name',
      'Address',
      'State',
      'Phone',
      'GSTIN',
      'AADHAR'
    ];

    const values = [
      customerName,
      customerAddress,
      customerState,
      customerPhone,
      customerGSTIN,
      customerPAN
    ];

    const maxLabelWidth = Math.max(...labels.map(label => doc.getTextWidth(label)));

    const colonOffset = 2;
    const maxLineWidth = 160;
    const maxTextWidth = 104;

    labels.forEach((label, index) => {
      const labelText = label;
      const colonText = ':';
      const valueText = values[index];

      const colonX = startX + maxLabelWidth + colonOffset;
      const valueX = colonX + doc.getTextWidth(colonText) + colonOffset;

      const splitValueText = doc.splitTextToSize(valueText, maxTextWidth - valueX);

      doc.text(labelText, startX, startY);
      doc.text(colonText, colonX, startY);

      splitValueText.forEach((line, lineIndex) => {
        doc.text(line, valueX, startY + (lineIndex * lineHeight));
      });

      startY += lineHeight * splitValueText.length;
    });

    doc.setFontSize(12);
    doc.setTextColor(170, 51, 106);

    doc.setFont('helvetica', 'bold');
    doc.text('SHIPPED TO', 107, 65);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    const initialX = 110;
    let initialY = 72;
    const lineSpacing = 8;
    const spacingBetweenLabelAndValue = 3;
    const maxValueWidth = 65;
    const labelTexts = [
      'Name',
      'Address',
      'State',
      'Phone',
      'GSTIN',
      'AADHAR'
    ];

    const valuesTexts = [
      customerName,
      customerAddress,
      customerState,
      customerPhone,
      customerGSTIN,
      customerPAN
    ];

  const maxLabelTextWidth = Math.max(...labelTexts.map(label => doc.getTextWidth(label)));

  const colonWidth = doc.getTextWidth(':');

  labelTexts.forEach((labelText, index) => {
    const valueText = valuesTexts[index];

    const labelWidth = doc.getTextWidth(labelText);
    const colonX = initialX + maxLabelTextWidth + (colonWidth / 2);

    const valueX = colonX + colonWidth + spacingBetweenLabelAndValue;

    const splitValueText = doc.splitTextToSize(valueText, maxValueWidth);

    doc.text(labelText, initialX, initialY);
    doc.text(':', colonX, initialY);

    splitValueText.forEach((line, lineIndex) => {
      doc.text(line, valueX, initialY + (lineIndex * lineSpacing));
    });

    initialY += lineSpacing * splitValueText.length;
  });

  const rectX = 14;
  const rectY = 58;
  const rectWidth = 182;
  const rectHeight = 75;

  doc.rect(rectX, rectY, rectWidth, rectHeight);

  const centerX = rectX + rectWidth / 2;

  doc.line(centerX, rectY, centerX, rectY + rectHeight);

  const tableBody = detail.productsDetails.map(item => [
    item.name || 'N/A',
    '36041000',
    item.quantity || 'N/A',
    `Rs.${item.saleprice ? item.saleprice.toFixed(2) : 'N/A'}`,
    `Rs.${item.quantity && item.saleprice ? (item.quantity * item.saleprice).toFixed(2) : 'N/A'}`
  ]);

  const totalAmount = detail.totalAmount ? `Rs.${detail.totalAmount.toFixed(2)}` : 'N/A';
  const discountedAmount = detail.discountedTotal ? `Rs.${detail.discountedTotal.toFixed(2)}` : 'N/A';
  const grandTotal = detail.grandTotal ? `Rs.${detail.grandTotal.toFixed(2)}` : 'N/A';

  doc.autoTable({
    head: [['Product Name','HSN CODE', 'Quantity', 'Price', 'Total Amount']],
    body: tableBody,
    startY: 150,
    theme: 'grid',
    styles: {
      cellPadding: 2,
      fontSize: 10,
      valign: 'middle',
      halign: 'center'
    },
    columnStyles: {
      0: { halign: 'left' },
      1: { halign: 'center' },
      2: { halign: 'right' },
      3: { halign: 'right' }
    },
    headStyles: {
      fillColor: [204, 204, 204],
      textColor: [0, 0, 0],
      fontSize: 12,
      fontStyle: 'bold',
      halign: 'center',
      valign: 'middle'
    },
    bodyStyles: {
      textColor: [0, 0, 0],
      halign: 'right',
      valign: 'middle'
    }
  });

  doc.autoTable({
    body: [
      ['Total Amount', totalAmount],
      ['Discounted Amount', discountedAmount],
      ['Grand Total', grandTotal]
    ],
    startY: doc.autoTable.previous.finalY + 10,
    theme: 'grid',
    styles: {
      cellPadding: 2,
      fontSize: 10,
      valign: 'middle',
      halign: 'center'
    },
    headStyles: {
      fillColor: [204, 204, 204],
      textColor: [0, 0, 0],
      fontSize: 12,
      fontStyle: 'bold',
      halign: 'center',
      valign: 'middle'
    },
    bodyStyles: {
      textColor: [0, 0, 0],
      halign: 'right',
      valign: 'middle'
    }
  });
  const convertNumberToWords = (num) => {
    const numberToWords = require('number-to-words');
    return numberToWords.toWords(num);
};

const grandTotalInWords = `Rupees: ${convertNumberToWords(detail.grandTotal || 0)}`;

// Position for Grand Total in Words
const grandTotalY = pageHeight - 60; // Adjust Y coordinate as needed
doc.setFont('helvetica', 'bold');
doc.setFontSize(10);
doc.text(grandTotalInWords, 15, grandTotalY);

  const termsAndConditions = [
    'Terms & Conditions',
    '1. Goods once sold will not be taken back.',
    '2. All matters subject to "Sivakasi" jurisdiction only.'
];

// Set font and position for the terms
doc.setFont('helvetica', 'bold');
doc.setFontSize(10);
const pdfPageHeight = doc.internal.pageSize.getHeight();
const termsStartY = pdfPageHeight - 30; // Adjust as needed

termsAndConditions.forEach((line, index) => {
    doc.text(line, 15, termsStartY + (index * 7)); // Adjust X and Y coordinates as needed
});
  
const signatureText = 'Authorised Signature';
const signatureMargin = 18; // Margin from the right edge
const signatureWidth = doc.getTextWidth(signatureText);
const signatureX = pageWidth - signatureWidth - signatureMargin;
const signatureY = pageHeight - 15; // Adjust Y coordinate as needed

doc.setFontSize(10);
doc.setFont('helvetica', 'bold');
doc.text(signatureText, signatureX, signatureY);
  doc.save(`invoice_${detail.invoiceNumber}_${copyType}.pdf`);
  };
  const copyTypes = ['transport', 'sales', 'office', 'customer'];
    copyTypes.forEach(generatePDF);
};



return (
  <div className="homepage-container">
    <Grid/>
    <div className="grid-container">
      <div className="sales-comparison-chart">
        <SalesComparisonChart />
      </div>
      <div className="revenue-progress">
        <RevenueProgress />
      </div>
    </div>
    <div className="grid-container">
      <div className="sales-comparison-chart">
        <AssortedChart />
      </div>
      <div className="revenue-progress">
        <AssortedProgress />
      </div>
    </div>
    <h2 className="dateTitle">Details By Date</h2>
    <div className="date-button-container">
      <DatePicker
        selected={selectedDate}
        onChange={(date) => setSelectedDate(date)}
        dateFormat="dd/MM/yyyy"
        className="custom-date"
      />
      <button
        onClick={() => handleDownloadPDF([...customerDetails, ...billingDetails], 'Todays Data')}
        className="download-button"
      >
        Download Today's Data
      </button>
    </div>
    {loading ? (
  <p>Loading...</p>
) : (
  <div className="table-container">
  {customerDetails.length === 0 && billingDetails.length === 0 ? (
    <p>No details recorded on this date.</p>
  ) : (
    <table className="details-table">
      <thead>
        <tr>
          <th>Invoice Number</th> {/* Added Invoice Number header */}
          <th>Bill</th>
          <th>Customer Name</th>
          <th>Discount Amount</th>
          <th>CGST Amount</th>
          <th>SGST Amount</th>
          <th>IGST Amount</th>
          <th>Total Amount</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {/* Render customerBilling collection details */}
        {customerDetails.map((detail) => (
          <tr key={detail.id}>
            <td>{detail.invoiceNumber}</td> {/* Invoice Number */}
            <td>Customer Bill</td> {/* Collection Name */}
            <td>{detail.customerName}</td>
            <td>₹{detail.discountedTotal ? detail.discountedTotal.toFixed(2) : 'N/A'}</td>
            <td>₹{detail.cgstAmount ? detail.cgstAmount.toFixed(2) : 'N/A'}</td>
            <td>₹{detail.sgstAmount ? detail.sgstAmount.toFixed(2) : 'N/A'}</td>
            <td>₹{detail.igstAmount ? detail.igstAmount.toFixed(2) : 'N/A'}</td>
            <td>₹{detail.totalAmount ? detail.totalAmount.toFixed(2) : '0.00'}</td>
            <td>
              <button onClick={() => handleGeneratePDF(detail)} className="action-button">
                <i className="fa fa-download" aria-hidden="true"></i>
              </button>
              <button onClick={() => handleDelete(detail.id, 'customerBilling')} className="action-button">
                  <i className="fa fa-trash" aria-hidden="true"></i>
                </button>
            </td>
          </tr>
        ))}
        {/* Render billing collection details */}
        {billingDetails.map((detail) => (
          <tr key={detail.id}>
            <td>{detail.invoiceNumber}</td> {/* Invoice Number */}
            <td>Assorted bill</td> {/* Collection Name */}
            <td>{detail.customerName}</td>
            <td>₹{detail.discountedTotal ? detail.discountedTotal.toFixed(2) : 'N/A'}</td>
            <td>₹{detail.cgstAmount ? detail.cgstAmount.toFixed(2) : 'N/A'}</td>
            <td>₹{detail.sgstAmount ? detail.sgstAmount.toFixed(2) : 'N/A'}</td>
            <td>₹{detail.igstAmount ? detail.igstAmount.toFixed(2) : 'N/A'}</td>
            <td>₹{detail.totalAmount ? detail.totalAmount.toFixed(2) : '0.00'}</td>
            <td>
              <button onClick={() => handleGeneratePDF(detail)} className="action-button">
                <i className="fa fa-download" aria-hidden="true"></i>
              </button>
           
<button onClick={() => handleDelete(detail.id, 'billing')} className="action-button">
                  <i className="fa fa-trash" aria-hidden="true"></i>
                </button>




            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )}
</div>

)}

  </div>
);
};

export default Homepage;