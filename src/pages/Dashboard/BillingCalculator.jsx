      import React, { useState, useEffect } from 'react';
      import { db } from '../firebase'; // Import the initialized firebase instance
      import { collection, getDocs, addDoc, Timestamp, setDoc, getDoc, doc } from 'firebase/firestore';
      import jsPDF from 'jspdf';
      import 'jspdf-autotable';
      import './BillingCalculator.css'; // Import the CSS file

      const BillingCalculator = () => {
        const [products, setProducts] = useState([]);
        const [filteredProducts, setFilteredProducts] = useState([]);
        const [cart, setCart] = useState([]);
        const [category, setCategory] = useState('');
        let invoiceNumber = ''; 
        const [billingDetails, setBillingDetails] = useState({
          totalAmount: 0,
          discountPercentage: '',
          discountedTotal: 0,
          cgstAmount: 0,
          sgstAmount: 0,
          igstAmount: 0,
          grandTotal: 0,
        });
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
        const [currentDate, setCurrentDate] = useState(new Date()); // State for current date
        const [showCustomerDetails, setShowCustomerDetails] = useState(false); // State for toggling customer details
        const handleInvoiceNumberChange = (event) => {
          setManualInvoiceNumber(event.target.value);
        };
        useEffect(() => {
          const fetchProducts = async () => {
            const productsCollectionRef = collection(db, 'products');
            try {
              const querySnapshot = await getDocs(productsCollectionRef);
              const fetchedProducts = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
              }));
              setProducts(fetchedProducts);
            } catch (error) {
              console.error('Error fetching products: ', error);
            }
          };

          fetchProducts();
        }, []);
        useEffect(() => {
          const filterProducts = () => {
            let filtered = products;
      
            if (searchTerm) {
              filtered = filtered.filter(product => {
                const productName = product.name ? product.name.toLowerCase() : '';
                
                return productName.includes(searchTerm);
              });
            }
      
            if (category) {
              filtered = filtered.filter(product => product.category === category);
            }
      
            setFilteredProducts(filtered);
          };
      
          filterProducts();
        }, [searchTerm, category, products]);
        const handleCategoryChange = (event) => {
          setCategory(event.target.value);
        };
        const handleQuantityChange = (productId, quantity) => {
          const updatedCart = cart.map(item =>
            item.productId === productId ? { ...item, quantity: parseInt(quantity, 10) } : item
          );
          setCart(updatedCart);
          updateBillingDetails(updatedCart);
        };

        const updateBillingDetails = (updatedCart) => {
          const totalAmount = updatedCart.reduce((total, item) => {
            return total + (item.saleprice * item.quantity);
          }, 0);

          const discountPercentage = parseFloat(billingDetails.discountPercentage) || 0;
          const discountedTotal = totalAmount * (1 - discountPercentage / 100);

          let cgstAmount = 0;
          let sgstAmount = 0;
          let igstAmount = 0;

          if (taxOption === 'cgst_sgst') {
            if (customerState === businessState) {
              cgstAmount = discountedTotal * 0.09;
              sgstAmount = discountedTotal * 0.09;
            } else {
              cgstAmount = discountedTotal * 0.09;
              sgstAmount = discountedTotal * 0.09;
            }
          } else if (taxOption === 'igst') {
            igstAmount = discountedTotal * 0.18;
          }

          const grandTotal = discountedTotal + cgstAmount + sgstAmount + igstAmount;

          setBillingDetails(prevState => ({
            ...prevState,
            totalAmount,
            discountedTotal,
            cgstAmount,
            sgstAmount,
            igstAmount,
            grandTotal,
          }));
        };
        
        const handleDiscountChange = (event) => {
          const discountPercentage = event.target.value;
          setBillingDetails(prevState => ({
            ...prevState,
            discountPercentage,
          }));
        };
        const ClearAllData =() => {
          window.location.reload();
        };

        useEffect(() => {
          updateBillingDetails(cart);
        }, [billingDetails.discountPercentage, customerState, taxOption]);
        function numberToWords(num) {
          const ones = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
          const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
          const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
          const thousands = ['', 'Thousand', 'Million', 'Billion', 'Trillion'];
      
          function convertHundreds(num) {
              let str = '';
              if (num > 99) {
                  str += ones[Math.floor(num / 100)] + ' Hundred ';
                  num %= 100;
              }
              if (num > 19) {
                  str += tens[Math.floor(num / 10)] + ' ';
                  num %= 10;
              }
              if (num > 9) {
                  str += teens[num - 10] + ' ';
              } else if (num > 0) {
                  str += ones[num] + ' ';
              }
              return str.trim();
          }
      
          function convertToWords(n) {
              if (n === 0) return 'Zero';
      
              let words = '';
      
              let i = 0;
              while (n > 0) {
                  let rem = n % 1000;
                  if (rem !== 0) {
                      words = convertHundreds(rem) + ' ' + thousands[i] + ' ' + words;
                  }
                  n = Math.floor(n / 1000);
                  i++;
              }
              return words.trim();
          }
      
          // Split the number into rupees and paise
          const rupees = Math.floor(num);
          // const paise = Math.round((num - rupees) * 100); // Not used as paise are ignored
      
          return convertToWords(rupees);
      }
      
      
  
      
      // const generateSequentialInvoiceNumber = async () => {
      //   const invoiceDocRef = doc(db, 'invoices', 'lastInvoiceNumber');
      //   const invoiceDoc = await getDoc(invoiceDocRef);
    
      //   let lastInvoiceNumber = '000'; // Default starting point
      //   if (invoiceDoc.exists()) {
      //     lastInvoiceNumber = invoiceDoc.data().lastInvoiceNumber;
      //   }
    
      //   // Increment the invoice number
      //   let newInvoiceNumber = (parseInt(lastInvoiceNumber, 10) + 1).toString();
      //   // Format the new invoice number with leading zeros (3 digits)
      //   newInvoiceNumber = newInvoiceNumber.padStart(3, '0');
    
      //   // Save the new invoice number back to Firestore
      //   await setDoc(invoiceDocRef, { lastInvoiceNumber: newInvoiceNumber });
    
      //   // Return the new invoice number
      //   return newInvoiceNumber;
      // };
      function formatGrandTotal(amount) {
        return `${Math.floor(amount).toString()}.00`;
    }
    const saveBillingDetails = async (newInvoiceNumber) => {
      const billingDocRef = collection(db, 'billing');
      try {
          await addDoc(billingDocRef, {
              ...billingDetails,
              customerName,
              customerAddress,
              customerState,
              customerPhone,
              customerEmail,
              customerGSTIN,
              customerPAN,
              date: Timestamp.fromDate(currentDate),
              productsDetails: cart.map(item => ({
                  productId: item.productId,
                  name: item.name,
                  saleprice: item.saleprice,
                  quantity: item.quantity
              })),
              createdAt: Timestamp.now(),
              invoiceNumber: newInvoiceNumber, // Ensure the correct invoice number is used
          });
          console.log('Billing details saved successfully in Firestore');
      } catch (error) {
          console.error('Error saving billing details: ', error);
      }
  };
  
    
      const generatePDF = (copyType, invoiceNumber) => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        doc.rect(10, 10, pageWidth - 20, pageHeight - 20); // Draw border
          
      // doc.addImage(imgData, 'JPEG', 17, 22, 22, 22);
          // doc.addImage(imgData, 'JPEG', 17, 22, 22, 22);
          doc.setFontSize(10);
          doc.setTextColor(255, 0, 0);  
          // Set font to bold and add the text
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
          doc.text('skscrackers937@gmail.com', 35, 45);
          doc.setFont('helvetica', 'bold');
          doc.text('State:', 24, 52);
          doc.setFont('helvetica', 'normal');
          doc.text('33-Tamil Nadu', 34, 52);
          doc.setFontSize(10);
          doc.setTextColor(255, 0, 0);  
          doc.setFont('helvetica', 'bold');
           doc.text(`INVOICE`, 138, 22);
           doc.text(`${copyType}`,138, 29);
           doc.text(`Invoice Number: SKSC-${invoiceNumber}-24`, 138, 43);
           doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`Date: ${currentDate.toLocaleDateString()}`, 138, 36);
    doc.setFont('helvetica', 'bold');
    doc.text('GSTIN: 33ERWPD0202C1ZE', 138, 49);
     
   
    doc.rect(14, 15, 182, 40  );
   
    doc.setFontSize(12);
    doc.setTextColor(170, 51, 106);  
    // Set font to bold and add the text
    doc.setFont('helvetica', 'bold');
    doc.text('BILLED TO', 19, 65);
    doc.setTextColor(0, 0, 0);
   
    
     doc.setFont('helvetica', 'normal');
     doc.rect(14, 15, 182, 40);
     doc.setFontSize(9);
             doc.setTextColor(170, 51, 106);  
     
             
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
             
               // Calculate positions
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
           customerPAN,
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
   
             const tableBody = cart
               .filter(item => item.quantity > 0)
               .map(item => [
                 item.name,
                 '36041000',
                 item.quantity.toString(),
                 `Rs. ${item.saleprice.toFixed(2)}`,
                 `Rs. ${(item.saleprice * item.quantity).toFixed(2)}`
               ]);
   
             tableBody.push(
               [
                 { content: 'Total Amount:', colSpan: 4, styles: { halign: 'right', fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' } },
                 { content:  `${Math.round(billingDetails.totalAmount)}.00`, styles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' } }
               ],
               [
                 { content: `Discount (${billingDetails.discountPercentage}%):`, colSpan: 4, styles: { halign: 'right', fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' } },
                 { content: `${Math.round(billingDetails.totalAmount * (parseFloat(billingDetails.discountPercentage) / 100) || 0).toFixed(2)}`, styles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' } }
               ],
               [
                 { content: 'Sub Total:', colSpan: 4, styles: { halign: 'right', fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' } },
                 { content:  `${Math.round(billingDetails.discountedTotal)}.00`, styles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' } }
               ]
             );
           
             if (taxOption === 'cgst_sgst') {
               tableBody.push(
                 [
                   { content: 'CGST (9%):', colSpan: 4, styles: { halign: 'right', fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' } },
                   { content:  `${Math.round(billingDetails.cgstAmount)}.00`, styles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' } }
                 ],
                 [
                   { content: 'SGST (9%):', colSpan: 4, styles: { halign: 'right', fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' } },
                   { content:  `${Math.round(billingDetails.sgstAmount)}.00`, styles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' } }
                 ]
               );
             } else if (taxOption === 'igst') {
               tableBody.push(
                 [
                   { content: 'IGST (18%):', colSpan: 4, styles: { halign: 'right', fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' } },
                   {
                     content: formatGrandTotal(grandTotal),
                     styles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' }
                   }
                 ]
               );
             }
             const grandTotal = billingDetails.grandTotal;
             tableBody.push(
               [
                 {
                   content: 'Grand Total:',
                   colSpan: 4,
                   styles: { halign: 'right', fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' }
                 },
                 {
                   content: `${Math.round(billingDetails.grandTotal)}.00`,
                   styles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' }
                 }
               ]
             );
    
             doc.autoTable({
               head: [['Product Name','HSN Code', 'Quantity', 'Rate per price', 'Total']],
               body: tableBody,
               startY: 150,
               theme: 'grid',
               headStyles: { fillColor: [255, 182, 193], textColor: [0, 0, 139], lineWidth: 0.2, lineColor: [0, 0, 0] }, // Reduced lineWidth
               bodyStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], lineWidth: 0.2, lineColor: [0, 0, 0] }, // Reduced lineWidth
               alternateRowStyles: { fillColor: [245, 245, 245] },
             });
             const totalAmount = cart.reduce((total, item) => total + item.quantity * item.saleprice, 0);
   const pageSizeWidth = doc.internal.pageSize.getWidth();
   const pageSizeHeight = doc.internal.pageSize.getHeight();
   
   const borderMargin = 10;
   const borderWidth = 0.2; 
   const additionalTopPadding = 30; 
   let currentPage = 1;
   
   // Draw page border
   const drawPageBorder = () => {
     doc.setDrawColor(0, 0, 0); // Border color (black)
     doc.setLineWidth(borderWidth);
     doc.rect(borderMargin, borderMargin, pageSizeWidth - borderMargin * 2, pageSizeHeight - borderMargin * 2);
   };
   
   // Check if content will fit on the current page
   const checkPageEnd = (currentY, additionalHeight, resetY = true) => {
     if (currentY + additionalHeight > pageSizeHeight - borderMargin) { // Ensure it fits within the page
       doc.addPage();
       drawPageBorder();
       currentPage++; // Increment the page number
       // Apply additional top padding on the new page if it's the second page or later
       return resetY ? (currentPage === 2 ? borderMargin + additionalTopPadding : borderMargin) : currentY; // Apply margin for new page or keep currentY
     }
     return currentY;
   };
   
   // Initialize the y position after auto table
   let y = doc.autoTable.previous.finalY + borderMargin; // Start Y position after the auto table
   
   // Grand total in words
   doc.setFont('helvetica', 'bold');
   doc.setFontSize(10);
   const grandTotalInWords = numberToWords(billingDetails.grandTotal); 
   const backgroundColor = [255, 182, 193]; // RGB for light pink
   const textColor = [0, 0, 139]; // RGB for dark blue
   const marginLeft = borderMargin + 7; // Adjusted to be within margins
   const padding = 5;
   const backgroundWidth = 186; // Fixed width for the background rectangle
   const text = `Rupees: ${grandTotalInWords}`;
   const textDimensions = doc.getTextDimensions(text);
   const textWidth = textDimensions.w;
   const textHeight = textDimensions.h;
   
   const backgroundX = marginLeft - padding;
   const backgroundY = y - textHeight - padding;
   const backgroundHeight = textHeight + padding * 2; // Height including padding
   
   // Check if there’s enough space for the content; if not, create a new page
   y = checkPageEnd(y, backgroundHeight);
   
   doc.setTextColor(...textColor);
   
   // Add text on top of the background
   doc.text(text, marginLeft, y);
   
   // Continue with "Terms & Conditions" and other content
   const rectFX = borderMargin + 4; // Adjusted to be within margins
   const rectFWidth = pageSizeWidth - 2 * rectFX; // Adjust width to fit within page
   const rectPadding = 4; // Padding inside the rectangle
   // const lineHeight = 8; // Line height for text
   const rectFHeight = 6 + lineHeight * 2 + rectPadding * 2; // Header height + 2 lines of text + padding
   
   // Ensure there's enough space for the rectangle and text
   y = checkPageEnd(y + backgroundHeight + 8, rectFHeight);
   
   doc.setFont('helvetica', 'normal');
   doc.rect(rectFX, y, rectFWidth, rectFHeight);
   
   // Drawing the "Terms & Conditions" text inside the rectangle
   doc.setFont('helvetica', 'bold');
   doc.setTextColor(0, 0, 0);
   doc.setFontSize(10);
   
   let textY = y + rectPadding + 6; // Adjust as needed for vertical alignment
   doc.text('Terms & Conditions', rectFX + rectPadding, textY);
   
   // Adjust vertical position for the following text
   textY = checkPageEnd(textY + lineHeight, lineHeight, false);
   doc.setFont('helvetica', 'normal');
   doc.text('1. Goods once sold will not be taken back.', rectFX + rectPadding, textY);
   
   textY = checkPageEnd(textY + lineHeight, lineHeight, false);
   doc.text('2. All matters Subject to "Sivakasi" jurisdiction only.', rectFX + rectPadding, textY);
   
   // Add "Authorised Signature" inside the rectangle at the bottom right corner
   const authSigX = rectFX + rectFWidth - rectPadding - doc.getTextWidth('Authorised Signature');
   const authSigY = y + rectFHeight - rectPadding;
   doc.setFont('helvetica', 'bold');
   doc.text('Authorised Signature', authSigX, authSigY);
   
   // Continue with additional content
   y = checkPageEnd(y + rectFHeight + 8, 40, false);
   
   // Reset font and color for additional text
   doc.setFontSize(12);
   doc.setTextColor(170, 51, 106);
   
   // More content with additional checks
   y = checkPageEnd(y + 45, 10, false);
   doc.setFontSize(9);
   doc.setTextColor(0, 0, 0);
   
   y = checkPageEnd(y + 5, 20, false);
   doc.setFont('helvetica', 'bold');
   
   y = checkPageEnd(y + 7, 23, false);
   doc.setFont('helvetica', 'normal');
   doc.setTextColor(0, 0, 0);
   doc.setFontSize(10);
   
   // Draw the page border at the end
   drawPageBorder();
   
   
   


        
doc.save(`invoice_${invoiceNumber}_${copyType}.pdf`);
      };
      const handleGenerateAllCopies = async () => {
        await saveBillingDetails(manualInvoiceNumber);
        transportCopy(manualInvoiceNumber);
        salesCopy(manualInvoiceNumber);
        OfficeCopy(manualInvoiceNumber);
        // CustomerCopy(manualInvoiceNumber)
      };
    
      const transportCopy = (invoiceNumber) => {
        generatePDF('TRANSPORT COPY', invoiceNumber);
      };
      
      const salesCopy = (invoiceNumber) => {
        generatePDF('SALES COPY', invoiceNumber);
      };
      
      const OfficeCopy = (invoiceNumber) => {
        generatePDF('OFFICE COPY', invoiceNumber);
      };
      const CustomerCopy = async () => {
        if (cart.length === 0) {
          alert('The cart is empty. Please add items to the cart before saving.');
          return; // Exit the function if the cart is empty
        }
      
        // Validate the invoice number
        const invoiceNumber = manualInvoiceNumber.trim();
        if (!invoiceNumber) {
          alert('Please enter a valid invoice number.');
          return; // Exit the function if the invoice number is empty
        }
        const billingDocRef = collection(db, 'customerBilling');
        
        try {
          
          await addDoc(billingDocRef, {
            ...billingDetails,
            customerName,
            customerAddress,
            customerState,
            customerPhone,
            customerEmail,
            customerGSTIN,
            date: Timestamp.fromDate(currentDate),
            productsDetails: cart.map(item => ({
              productId: item.productId,
              name: item.name,
              saleprice: item.saleprice,
              quantity: item.quantity
            })),
            createdAt: Timestamp.now(),
            invoiceNumber, // Use the same invoice number
          });
          console.log('Billing details saved successfully in Firestore');
        } catch (error) {
          console.error('Error saving billing details: ', error);
        }
      
        // Generate and save PDF invoice
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        doc.rect(10, 10, pageWidth - 20, pageHeight - 20); // Draw border
       
      
       doc.setFontSize(10);
       doc.setTextColor(255, 0, 0);  
       // Set font to bold and add the text
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
          doc.text('skscrackers937@gmail.com', 35, 45);
          doc.setFont('helvetica', 'bold');
          doc.text('State:', 24, 52);
          doc.setFont('helvetica', 'normal');
          doc.text('33-Tamil Nadu', 34, 52);
       doc.setFontSize(10);
       doc.setTextColor(255, 0, 0);  
       doc.setFont('helvetica', 'bold');
        doc.text(`INVOICE`, 138, 22);
        doc.text(`CUSTOMER COPY`,138, 29);
        doc.text(`Invoice Number: SKSC-${invoiceNumber}-24`, 138, 43);
        doc.setTextColor(0, 0, 0);
 doc.setFont('helvetica', 'normal');
 doc.setFontSize(9);
 doc.text(`Date: ${currentDate.toLocaleDateString()}`, 138, 36);
 doc.setFont('helvetica', 'bold');
 doc.text('GSTIN: 33ERWPD0202C1ZE', 138, 49);
  

 doc.rect(14, 15, 182, 40  );

 doc.setFontSize(12);
 doc.setTextColor(170, 51, 106);  
 // Set font to bold and add the text
 doc.setFont('helvetica', 'bold');
 doc.text('BILLED TO', 19, 65);
 doc.setTextColor(0, 0, 0);

 
  doc.setFont('helvetica', 'normal');
  doc.rect(14, 15, 182, 40);
  doc.setFontSize(9);
          doc.setTextColor(170, 51, 106);  
  
          
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
          
            // Calculate positions
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
        customerPAN,
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

          const tableBody = cart
            .filter(item => item.quantity > 0)
            .map(item => [
              item.name,
              '36041000',
              item.quantity.toString(),
              `Rs. ${item.saleprice.toFixed(2)}`,
              `Rs. ${(item.saleprice * item.quantity).toFixed(2)}`
            ]);

          tableBody.push(
            [
              { content: 'Total Amount:', colSpan: 4, styles: { halign: 'right', fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' } },
              { content:  `${Math.round(billingDetails.totalAmount)}.00`, styles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' } }
            ],
            [
              { content: `Discount (${billingDetails.discountPercentage}%):`, colSpan: 4, styles: { halign: 'right', fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' } },
              { content: `${Math.round(billingDetails.totalAmount * (parseFloat(billingDetails.discountPercentage) / 100) || 0).toFixed(2)}`, styles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' } }
            ],
            [
              { content: 'Sub Total:', colSpan: 4, styles: { halign: 'right', fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' } },
              { content:  `${Math.round(billingDetails.discountedTotal)}.00`, styles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' } }
            ]
          );
        
          if (taxOption === 'cgst_sgst') {
            tableBody.push(
              [
                { content: 'CGST (9%):', colSpan: 4, styles: { halign: 'right', fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' } },
                { content:  `${Math.round(billingDetails.cgstAmount)}.00`, styles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' } }
              ],
              [
                { content: 'SGST (9%):', colSpan: 4, styles: { halign: 'right', fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' } },
                { content:  `${Math.round(billingDetails.sgstAmount)}.00`, styles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' } }
              ]
            );
          } else if (taxOption === 'igst') {
            tableBody.push(
              [
                { content: 'IGST (18%):', colSpan: 4, styles: { halign: 'right', fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' } },
                {
                  content: formatGrandTotal(grandTotal),
                  styles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' }
                }
              ]
            );
          }
          const grandTotal = billingDetails.grandTotal;
          tableBody.push(
            [
              {
                content: 'Grand Total:',
                colSpan: 4,
                styles: { halign: 'right', fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' }
              },
              {
                content: `${Math.round(billingDetails.grandTotal)}.00`,
                styles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' }
              }
            ]
          );
 
          doc.autoTable({
            head: [['Product Name','HSN Code', 'Quantity', 'Rate per price', 'Total']],
            body: tableBody,
            startY: 150,
            theme: 'grid',
            headStyles: { fillColor: [255, 182, 193], textColor: [0, 0, 139], lineWidth: 0.2, lineColor: [0, 0, 0] }, // Reduced lineWidth
            bodyStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], lineWidth: 0.2, lineColor: [0, 0, 0] }, // Reduced lineWidth
            alternateRowStyles: { fillColor: [245, 245, 245] },
          });
          const totalAmount = cart.reduce((total, item) => total + item.quantity * item.saleprice, 0);
const pageSizeWidth = doc.internal.pageSize.getWidth();
const pageSizeHeight = doc.internal.pageSize.getHeight();

const borderMargin = 10;
const borderWidth = 0.2; 
const additionalTopPadding = 30; 
let currentPage = 1;

// Draw page border
const drawPageBorder = () => {
  doc.setDrawColor(0, 0, 0); // Border color (black)
  doc.setLineWidth(borderWidth);
  doc.rect(borderMargin, borderMargin, pageSizeWidth - borderMargin * 2, pageSizeHeight - borderMargin * 2);
};

// Check if content will fit on the current page
const checkPageEnd = (currentY, additionalHeight, resetY = true) => {
  if (currentY + additionalHeight > pageSizeHeight - borderMargin) { // Ensure it fits within the page
    doc.addPage();
    drawPageBorder();
    currentPage++; // Increment the page number
    // Apply additional top padding on the new page if it's the second page or later
    return resetY ? (currentPage === 2 ? borderMargin + additionalTopPadding : borderMargin) : currentY; // Apply margin for new page or keep currentY
  }
  return currentY;
};

// Initialize the y position after auto table
let y = doc.autoTable.previous.finalY + borderMargin; // Start Y position after the auto table

// Grand total in words
doc.setFont('helvetica', 'bold');
doc.setFontSize(10);
const grandTotalInWords = numberToWords(billingDetails.grandTotal); 
const backgroundColor = [255, 182, 193]; // RGB for light pink
const textColor = [0, 0, 139]; // RGB for dark blue
const marginLeft = borderMargin + 7; // Adjusted to be within margins
const padding = 5;
const backgroundWidth = 186; // Fixed width for the background rectangle
const text = `Rupees: ${grandTotalInWords}`;
const textDimensions = doc.getTextDimensions(text);
const textWidth = textDimensions.w;
const textHeight = textDimensions.h;

const backgroundX = marginLeft - padding;
const backgroundY = y - textHeight - padding;
const backgroundHeight = textHeight + padding * 2; // Height including padding

// Check if there’s enough space for the content; if not, create a new page
y = checkPageEnd(y, backgroundHeight);

doc.setTextColor(...textColor);

// Add text on top of the background
doc.text(text, marginLeft, y);

// Continue with "Terms & Conditions" and other content
const rectFX = borderMargin + 4; // Adjusted to be within margins
const rectFWidth = pageSizeWidth - 2 * rectFX; // Adjust width to fit within page
const rectPadding = 4; // Padding inside the rectangle
// const lineHeight = 8; // Line height for text
const rectFHeight = 6 + lineHeight * 2 + rectPadding * 2; // Header height + 2 lines of text + padding

// Ensure there's enough space for the rectangle and text
y = checkPageEnd(y + backgroundHeight + 8, rectFHeight);

doc.setFont('helvetica', 'normal');
doc.rect(rectFX, y, rectFWidth, rectFHeight);

// Drawing the "Terms & Conditions" text inside the rectangle
doc.setFont('helvetica', 'bold');
doc.setTextColor(0, 0, 0);
doc.setFontSize(10);

let textY = y + rectPadding + 6; // Adjust as needed for vertical alignment
doc.text('Terms & Conditions', rectFX + rectPadding, textY);

// Adjust vertical position for the following text
textY = checkPageEnd(textY + lineHeight, lineHeight, false);
doc.setFont('helvetica', 'normal');
doc.text('1. Goods once sold will not be taken back.', rectFX + rectPadding, textY);

textY = checkPageEnd(textY + lineHeight, lineHeight, false);
doc.text('2. All matters Subject to "Sivakasi" jurisdiction only.', rectFX + rectPadding, textY);

// Add "Authorised Signature" inside the rectangle at the bottom right corner
const authSigX = rectFX + rectFWidth - rectPadding - doc.getTextWidth('Authorised Signature');
const authSigY = y + rectFHeight - rectPadding;
doc.setFont('helvetica', 'bold');
doc.text('Authorised Signature', authSigX, authSigY);

// Continue with additional content
y = checkPageEnd(y + rectFHeight + 8, 40, false);

// Reset font and color for additional text
doc.setFontSize(12);
doc.setTextColor(170, 51, 106);

// More content with additional checks
y = checkPageEnd(y + 45, 10, false);
doc.setFontSize(9);
doc.setTextColor(0, 0, 0);

y = checkPageEnd(y + 5, 20, false);
doc.setFont('helvetica', 'bold');

y = checkPageEnd(y + 7, 23, false);
doc.setFont('helvetica', 'normal');
doc.setTextColor(0, 0, 0);
doc.setFontSize(10);

// Draw the page border at the end
drawPageBorder();



        doc.save(`invoice_${invoiceNumber}_CUSTOMERCOPY.pdf`);
      };
      
      

      const handleSearch = (e) => {
        setSearchTerm(e.target.value);
      };
      
      
       
        const addToCart = (product) => {
          let productName = product.name;
          let price = product.saleprice;
        
          // If the product is 'Assorted Crackers', prompt the user for a new product name and price
          if (product.name === 'Assorted Crackers') {
            productName = prompt("Enter product name:");
            if (!productName) {
              alert("Product name is required.");
              return;
            }
        
            price = prompt(`Enter price for ${productName}:`);
            if (!price) {
              alert("Price is required.");
              return;
            }
            price = parseFloat(price); // Convert the input to a float number
            if (isNaN(price)) {
              alert("Please enter a valid price.");
              return;
            }
          }
        
          // Add the product as a new entry in the cart, even if the product ID is the same
          const newItem = {
            productId: product.id,
            name: productName,
            saleprice: price,
            quantity: 1,  // Each entry starts with a quantity of 1
          };
        
          const updatedCart = [...cart, newItem];
          setCart(updatedCart);
          updateBillingDetails(updatedCart);
        };
        
        const handleRemoveFromCart = (productId) => {
          // Find the index of the first item with the matching productId
          const itemIndex = cart.findIndex(item => item.productId === productId);
        
          if (itemIndex !== -1) {
            // Create a new cart array without the item at itemIndex
            const updatedCart = [...cart];
            updatedCart.splice(itemIndex, 1); // Remove one item at the found index
        
            setCart(updatedCart);
            updateBillingDetails(updatedCart);
          }
        };
        

        const handleDateChange = (event) => {
          const selectedDate = new Date(event.target.value);
          setCurrentDate(selectedDate);
        };

        return (
          <div className="billing-calculator">
            <div className="product-list">
              <input
                type="text"
                placeholder="Search Products"
                value={searchTerm}
                onChange={handleSearch}
                className="search-input"
              />
                 <select  className="custom-select1" onChange={handleCategoryChange} value={category}>
                 <option value="">All Products</option>
                 <option value="SINGLE SOUND CRACKERS">SINGLE SOUND CRACKERS</option>
              <option value="SPARKLERS">SPARKLERS</option>
              <option value="GROUND CHAKKARS">GROUND CHAKKARS</option>
              <option value="FLOWER POTS">FLOWER POTS</option>
              <option value="KIDS SPECIAL">KIDS SPECIALI</option>
              <option value="BOMB'S">BOMBS</option>
              <option value="ROCKETS">ROCKETS</option>
              <option value="FANCY CRACKERS">FANCY CRACKERS</option>
              <option value="MULTIPLE SHOTS">MULTIPLE SHOTS</option>
              <option value="MAGICAL KIDS FOUNTAINS">MAGICAL KIDS FOUNTAINS</option>
              <option value="KIDS HAND FOUNTAINS">KIDS HAND FOUNTAINS</option>
              <option value="MAGICAL VERAITTIS">MAGICAL VERAITTIS</option>
              <option value="MATCH BOX">MATCH BOX</option>
              <option value="GIFT BOX">GIFT BOX</option>
      </select>
              {/* <ul>
                {filteredProducts.map(product => (
                  <li key={product.id}>
                    <div className="product-details">
                      <span>{product.name}</span>
                      
                      <span> {`(Sales Rs. ${product.saleprice ? product.saleprice.toFixed(2) : '0.00'})`}</span>
                    </div>
                    <button onClick={() => addToCart(product)}>Add to Cart</button>
                  </li>
                ))}
              </ul> */}
<ul>
  {filteredProducts
    .sort((a, b) => Number(a.sno) - Number(b.sno)) // Convert `sno` to number for sorting
    .map(product => (
      <li key={product.id}>
        <div className="product-details">
          <span>{product.name}</span>
          <span>{` (Sales Rs. ${product.saleprice ? product.saleprice.toFixed(2) : '0.00'})`}</span>
        </div>
        <button onClick={() => addToCart(product)}>Add to Cart</button>
      </li>
    ))}
</ul>



            </div>
            <div className="cart">
              <h2>Cart</h2>
              <button className="remove-button" style={{display:"flex",position:"relative",left:"540px",bottom:"34px"}} onClick={() => ClearAllData()}>Clear cart</button>
              <ul>
                {cart.map(item => (
                  <li key={item.productId}>
                    <div className="cart-item">
                      <span>{item.name}</span>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(item.productId, e.target.value)}
                      />
                      <span>Rs. {item.saleprice ? (item.saleprice * item.quantity).toFixed(2) : '0.00'}</span>
                      <button className="remove-button" onClick={() => handleRemoveFromCart(item.productId)}>Remove</button>
                    </div>
                  </li>
                ))}
              </ul>
              
              <div className="billing-summary">
                <div className="billing-details">
                <label>Invoice Number</label>
                <input
                  type="text"
                  placeholder="Enter Invoice Number"
                  value={manualInvoiceNumber}
                  onChange={(e) => setManualInvoiceNumber(e.target.value)}
                  required
                 />
                  <label>Discount (%)</label>
                  <input
                    type="number"
                    value={billingDetails.discountPercentage}
                    onChange={handleDiscountChange}
                    min="0"
                    max="100"
                  />
                  <label>Date</label>
                  <input
                    type="date"
                    className="custom-datepicker"
                    value={currentDate.toISOString().substr(0, 10)} 
                    onChange={handleDateChange}
                  />
                  <br />
                  <br />
                  <label>Tax Option</label>
                <select value={taxOption} onChange={(e) => setTaxOption(e.target.value)}>
                  <option value="cgst_sgst">CGST + SGST</option>
                  <option value="igst">IGST</option>            
                  <option value="no_tax">No Tax</option>
                </select>
                </div>
                <div className="billing-amounts">
                <table>
                  <tbody>
                    <tr>
                      <td>Total Amount:</td>
                      <td>Rs. {billingDetails.totalAmount.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td>Discounted Total:</td>
                      <td>Rs. {billingDetails.discountedTotal.toFixed(2)}</td>
                    </tr>
                    {taxOption === 'cgst_sgst' && (
                      <>
                        <tr>
                          <td>CGST (9%):</td>
                          <td>Rs. {billingDetails.cgstAmount.toFixed(2)}</td>
                        </tr>
                        <tr>
                          <td>SGST (9%):</td>
                          <td>Rs. {billingDetails.sgstAmount.toFixed(2)}</td>
                        </tr>
                      </>
                    )}
                    {taxOption === 'igst' && (
                      <tr>
                        <td>IGST (18%):</td>
                        <td>Rs. {billingDetails.igstAmount.toFixed(2)}</td>
                      </tr>
                    )}
                    <tr className="grand-total-row">
                      <td>Grand Total:</td>
                      <td>Rs. {billingDetails.grandTotal.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              </div>
              <div className="customer-details-toggle">
                <button onClick={() => setShowCustomerDetails(!showCustomerDetails)}>
                  {showCustomerDetails ? 'Hide Customer Details' : 'Show Customer Details'}
                </button>
              </div>
              {showCustomerDetails && (
                <div className="customer-details">
                  <div>
                    <label>Customer Name</label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label>Customer Address</label>
                    <input
                      type="text"
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                    />
                  </div>
                  <div>
                    <label>Customer State</label>
                    <input
                      type="text"
                      value={customerState}
                      onChange={(e) => setCustomerState(e.target.value)}
                    />
                  </div>
                  <div>
                    <label>Customer Phone</label>
                    <input
                      type="text"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                    />
                  </div>
                  <div>
                    <label>Customer GSTIN</label>
                    <input
                      type="text"
                      value={customerGSTIN}
                      onChange={(e) => setCustomerGSTIN(e.target.value)}
                    />
                  </div>
                  <div>
                    <label>{`Customer AAHDR(OPTIONAL)`}</label>
                    <input
                      type="text"
                      value={customerPAN}
                      onChange={(e) => setCustomerPAN(e.target.value)}
                    />
                  </div>
                  <div>
                    <label>Customer Email</label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                    />
                   </div>
                </div>
              )}
               <button onClick={() => addToCart({ id: 1, name: 'Assorted Crackers', saleprice: null })}>
        Assorted crackers
      </button><br></br>
             <button onClick={handleGenerateAllCopies}>Download All Copies</button><br></br>
             <button style={{display:"none"}} onClick={() => transportCopy(invoiceNumber)}>Transport Copy</button>
             <button style={{display:"none"}} onClick={() => salesCopy(invoiceNumber)}>Sales Copy</button>
             <button style={{display:"none"}} onClick={() => OfficeCopy(invoiceNumber)}>Office Copy</button>
              <button  onClick={() => CustomerCopy(invoiceNumber)}>Customer Copy</button>
            </div>
          </div>
        );
      };

      export default BillingCalculator;
