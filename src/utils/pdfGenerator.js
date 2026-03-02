import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import QRCode from 'qrcode';
import { translations } from './translations';

// Helper for ArrayBuffer to Base64
function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

const createVehiclePDFDoc = async (vehicle, lang = 'en') => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    
    // Translation Helper
    const t = (key) => {
        return translations[lang]?.[key] || translations['en'][key] || key;
    };

    // Load Hindi Fonts (Regular + Bold)
    if (lang === 'hi') {
        try {
            const regularUrl = 'https://cdn.jsdelivr.net/gh/googlefonts/noto-fonts@master/hinted/ttf/NotoSansDevanagari/NotoSansDevanagari-Regular.ttf';
            const boldUrl = 'https://cdn.jsdelivr.net/gh/googlefonts/noto-fonts@master/hinted/ttf/NotoSansDevanagari/NotoSansDevanagari-Bold.ttf';
            
            const [regRes, boldRes] = await Promise.all([
                fetch(regularUrl),
                fetch(boldUrl)
            ]);

            if (regRes.ok && boldRes.ok) {
                const regBuf = await regRes.arrayBuffer();
                const boldBuf = await boldRes.arrayBuffer();
                
                const regB64 = arrayBufferToBase64(regBuf);
                const boldB64 = arrayBufferToBase64(boldBuf);

                doc.addFileToVFS('NotoSans-Regular.ttf', regB64);
                doc.addFileToVFS('NotoSans-Bold.ttf', boldB64);

                doc.addFont('NotoSans-Regular.ttf', 'NotoSans', 'normal');
                doc.addFont('NotoSans-Bold.ttf', 'NotoSans', 'bold');
                
                doc.setFont('NotoSans');
            }
        } catch (e) {
            console.error("Font loading failed", e);
        }
    }

    // Colors from Mobile App
    const TEAL_COLOR = [38, 166, 154]; 
    const YELLOW_COLOR = [243, 196, 101]; 
    
    // Constants 
    const margin = 10; 
    
    // Helper for table styles 
    const tableStyles = {
        cellPadding: 2.0, 
        fontSize: 9, 
        valign: 'middle',
        lineWidth: 0.1,
        lineColor: 0,
        font: lang === 'hi' ? 'NotoSans' : 'helvetica' 
    };

    // --- 1. Header ---
    const drawHeader = async () => {
        const ownerName = vehicle.inventoryOwner || t('defaultOwner');
        
        let qrUrl = '';
        try {
            const qrData = vehicle.rcNumber || vehicle.licensePlate || 'Unknown';
            qrUrl = await QRCode.toDataURL(qrData);
        } catch (e) {}
        
        // Revert to standard bold logic
        const fontStyle = 'bold'; 

        autoTable(doc, {
            startY: 8, 
            theme: 'grid',
            head: [],
            body: [[
                { 
                    content: ownerName, 
                    styles: { 
                        fontSize: 14, 
                        textColor: TEAL_COLOR, 
                        font: lang === 'hi' ? 'NotoSans' : 'helvetica',
                        fontStyle: 'bold',
                        halign: 'center', 
                        valign: 'middle',
                        minCellHeight: 18 
                    } 
                },
                { 
                    content: t('inventorySheet').toUpperCase(), 
                    styles: { 
                        fontSize: 16, 
                        textColor: 0,
                        font: lang === 'hi' ? 'NotoSans' : 'helvetica',
                        fontStyle: 'bold', 
                        halign: 'center',
                        valign: 'middle'
                    } 
                }
            ]],
            styles: {
                lineWidth: 0.1,
                lineColor: 0,
                cellPadding: 1.5,
                font: lang === 'hi' ? 'NotoSans' : 'helvetica' 
            },
            columnStyles: {
                0: { cellWidth: '50%' },
                1: { cellWidth: '50%' }
            },
            didDrawCell: (data) => {
                const doc = data.doc;
                const cell = data.cell;
                
                // Yellow Underline
                if (data.section === 'body' && data.column.index === 0) {
                     doc.setDrawColor(243, 196, 101); 
                     doc.setLineWidth(1.5);
                     const textWidth = doc.getTextWidth(cell.text[0]) || 40;
                     const lineLen = Math.max(textWidth + 10, 50);
                     const startX = cell.x + (cell.width - lineLen) / 2;
                     const y = cell.y + cell.height - 5; 
                     doc.line(startX, y, startX + lineLen, y);
                }
                // QR
                if (data.section === 'body' && data.column.index === 1 && qrUrl) {
                     const size = 16; 
                     doc.addImage(qrUrl, 'PNG', cell.x + cell.width - size - 5, cell.y + 1, size, size);
                }
            },
            margin: { left: margin, right: margin }
        });
        
        return doc.lastAutoTable.finalY - 0.1; 
    };

    // --- 2. Yard & Location Info ---
    const drawYardInfo = (startY) => {
        const yardText = `${t('yardName')}: ${vehicle.inventoryOwner || t('defaultOwner')}\n` +
                         `${t('yardAddress')}: ${t('addressValue')}\n` +
                         `${t('yardPhone')}: 9424633863\n` + 
                         `${t('yardEmail')}: jayantparkingsjr@gmail.com`;

        const dateStr = new Date(vehicle.entryDate).toLocaleDateString();
        
        autoTable(doc, {
            startY: startY,
            theme: 'grid',
            head: [],
            body: [
                [
                    { 
                        content: yardText, 
                        rowSpan: 2, 
                        styles: { halign: 'left', valign: 'top', cellPadding: 2 } 
                    },
                    { 
                        content: `${t('location')}: ${t('locationValue')}`, 
                        styles: { halign: 'left', valign: 'middle', minCellHeight: 8 } 
                    }
                ],
                [
                    { 
                        content: `${t('entryDate')}: ${dateStr}`, 
                        styles: { halign: 'left', valign: 'middle', minCellHeight: 8 }
                    }
                ]
            ],
            styles: {
                ...tableStyles,
            },
            columnStyles: {
                0: { cellWidth: '50%' },
                1: { cellWidth: '50%' }
            },
            didDrawCell: (data) => {
                if (data.section === 'body' && data.row.index === 1 && data.column.index === 1) {
                     const doc = data.doc;
                     const cell = data.cell;
                     // Give more space to Entry Date by moving separator right
                     // Previous: midX. Now: midX + 10
                     const splitX = cell.x + (cell.width * 0.60); 
                     
                     doc.setDrawColor(0);
                     doc.setLineWidth(0.1);
                     doc.line(splitX, cell.y, splitX, cell.y + cell.height);
                     
                     doc.setFontSize(9);
                     // Set font for GM ID (English numbers mostly, but keep safe)
                     if (lang === 'hi') doc.setFont('NotoSans', 'bold');
                     
                     doc.text(`${t('gmId')}: 10143779`, splitX + 3, cell.y + (cell.height / 2) + 3);
                }
            },
            margin: { left: margin, right: margin }
        });

        return doc.lastAutoTable.finalY - 0.1; 
    };

    // --- 3. Vehicle Details Table ---
    const drawVehicleDetails = (startY) => {
        const K = (k) => t(k).toUpperCase();
        const V = (v) => v || '-';

        const bodyData = [
            [`${K('regNo')}: ${V(vehicle.licensePlate)}`, `${K('brand')}: ${V(vehicle.make)}`, `${K('repoAgency')}: ${V(vehicle.repossessedBy)}`],
            [`${K('engineNo')}: ${V(vehicle.engineNumber)}`, `${K('model')}: ${V(vehicle.model)}`, `${K('repoAgent')}: ${V(vehicle.repoAgent)}`],
            [`${K('chassisNo')}: ${V(vehicle.chassisNumber)}`, `${K('color')}: ${V(vehicle.color)}`, `${K('vehicleState')}: ${V(vehicle.condition?.exterior)}`],
            [`${K('vehicleType')}: ${V(vehicle.repoType)}`, `${K('odometer')}: ${V(vehicle.condition?.odometer)}` , `${K('timeOfArrival')}: -`],
            [`${K('mfgYear')}: ${V(vehicle.manufacturingYear)}`, '', '']
        ];

        autoTable(doc, {
            startY: startY,
            head: [],
            body: bodyData,
            theme: 'grid', 
            styles: { 
                ...tableStyles,
                cellPadding: 3.5, // More padding for main details
                fontStyle: 'bold' 
            },
            margin: { left: margin, right: margin }
        });

        return doc.lastAutoTable.finalY - 0.1; // Overlap borders slightly
    };

    // --- 4. Customer Line ---
    const drawCustomerInfo = (startY) => {
        autoTable(doc, {
            startY: startY,
            theme: 'grid',
            head: [],
            body: [
                [`${t('customerLoanNo')}: ${vehicle.contractNumber || '-'}`, `${t('customerName')}: ${vehicle.borrowerName || '-'}`]
            ],
            styles: {
                 ...tableStyles,
                 cellPadding: 3.5,
                 fontStyle: 'bold'
            },
            columnStyles: {
                0: { cellWidth: '50%' },
                1: { cellWidth: '50%' }
            },
            margin: { left: margin, right: margin }
        });
        return doc.lastAutoTable.finalY - 0.1; // Remove gap
    };

    // --- 5. Inventory Table ---
    const drawInventoryTable = (startY) => {
        const acc = vehicle.accessories || {};
        const cond = vehicle.condition || {};
        const tyre = vehicle.tyreDetails || {};
        const yn = (val) => val ? t('yes') : t('no');

        // ... items ...
        const leftItems = [
            { id: 1, item: t('keysAvailability'), val: yn(acc.originalKeys || acc.duplicateKeys) },
            { id: 2, item: t('originalRc'), val: yn(acc.originalRC) },
            { id: 3, item: t('batteryAvailability'), val: yn(acc.battery) },
            { id: 4, item: t('jackToolKit'), val: yn(acc.jack && acc.toolKit) },
            { id: 5, item: t('acAvailability'), val: yn(acc.ac) },
            { id: 6, item: t('stereoRadio'), val: yn(acc.stereo) },
            { id: 7, item: t('speaker'), val: '-' },
            { id: 8, item: t('clock'), val: '-' },
            { id: 9, item: t('seatCover'), val: yn(acc.seatCovers) },
            { id: 10, item: t('leftMirror'), val: yn(acc.sideMirrors) },
            { id: 11, item: t('rightMirror'), val: yn(acc.sideMirrors) },
            { id: 12, item: t('frontMirror'), val: '-' },
            { id: 13, item: t('cargo'), val: '-' },
            { id: 14, item: t('spareTyreAvail'), val: yn(acc.spareWheel) },
        ];

         const rightItems = [
            { id: 1, item: t('exteriorCond'), val: cond.exterior || '-' },
            { id: 2, item: t('interiorCond'), val: cond.interior || '-' },
            { id: 3, item: t('workingCond'), val: cond.startingCondition || '-' },
            { id: 4, item: t('bonnetCond'), val: '-' },
            { id: 5, item: t('noOfAxels'), val: tyre.noOfAxles || '-' },
            { id: 6, item: t('noOfTyres'), val: tyre.noOfTyres || '-' },
            { id: 7, item: t('goodTyres'), val: tyre.goodTyresCount || '-' },
            { id: 8, item: t('badTyres'), val: tyre.badTyresCount || '-' },
            { id: 9, item: t('frontTyreLeft'), val: tyre.frontLeft || '-' },
            { id: 10, item: t('frontTyreRight'), val: tyre.frontRight || '-' },
            { id: 11, item: t('rearTyreRight'), val: tyre.rearRight || '-' },
            { id: 12, item: t('rearTyreLeft'), val: tyre.rearLeft || '-' },
            { id: 13, item: t('spareTyreCond'), val: tyre.stepneyCondition || '-' },
            { id: 14, item: t('batteryBrand'), val: `${cond.batteryBrandModel || ''} ${cond.batteryMake || ''}` },
            { id: 15, item: t('headLight'), val: '-' },
            { id: 16, item: t('tailLight'), val: '-' },
        ];

        const rows = [];
        const maxRows = Math.max(leftItems.length, rightItems.length);
        for (let i = 0; i < maxRows; i++) {
            const l = leftItems[i] || {};
            const r = rightItems[i] || {};
            rows.push([
                l.id || '', l.item || '', l.val === t('yes') ? t('yes') : '', l.val === t('no') ? t('no') : '', 
                r.id || '', r.item || '', r.val || ''
            ]);
        }

        autoTable(doc, {
            startY: startY,
            head: [[
                t('slNo'), t('item'), t('yes'), t('no'), 
                t('slNo'), t('item'), t('conditionHeader')
            ]],
            body: rows,
            theme: 'grid',
            styles: { 
                ...tableStyles,
                fontSize: 8.5, // Increased from 7.5
                cellPadding: 1.8 // Increased from 1.2
            },
            columnStyles: {
                0: { cellWidth: 8 }, 
                1: { title: 'Item', halign: 'left' },
                2: { cellWidth: 10 },
                3: { cellWidth: 10 },
                4: { cellWidth: 8 },
                5: { title: 'Item', halign: 'left' },
                6: { title: 'Condition' }
            },
            headStyles: { 
                fillColor: [230, 230, 230], 
                textColor: 0, 
                fontStyle: 'bold',
                lineWidth: 0.1,
                lineColor: 0,
                font: lang === 'hi' ? 'NotoSans' : 'helvetica'
            },
            margin: { left: margin, right: margin }
        });

        return doc.lastAutoTable.finalY; // No extra gap
    };

    // --- 6. Signatures (Replicating Flutter 'Expanded' to Bottom) ---
    const drawSignatures = (currentY) => {
        const signatureHeight = 35; // Reduced 40->35
        const bottomY = pageHeight - margin - signatureHeight;
        
        let startY = bottomY;
        
        // If content overlaps footer area, add new page
        if (currentY > bottomY) { // Removed the -5 buffer to allow tighter fit
            doc.addPage();
            startY = pageHeight - margin - signatureHeight;
        }

        // Draw Divider Line
        doc.setDrawColor(200);
        doc.line(margin, startY, pageWidth - margin, startY);
        
        const y = startY + 5;
        const boxWidth = 50; 
        const boxHeight = 18; // 20 -> 18

        // Repo Agent
        doc.setFontSize(8);
        if (lang === 'hi') {
            doc.setFont('NotoSans', 'normal');
        } else {
            doc.setFont('helvetica', 'bold');
        }

        // Box
        doc.setDrawColor(150);
        doc.rect(margin, y, boxWidth, boxHeight);
        
        if (vehicle.photos?.agentSignature) {
            try {
                doc.addImage(vehicle.photos.agentSignature, 'PNG', margin + 2, y + 2, boxWidth - 4, boxHeight - 4);
            } catch (e) {
                console.warn("Agent Signature Corrupted/Invalid", e);
                // Fallback to text if corrupted
                doc.setTextColor(200);
                doc.setFontSize(10);
                doc.text("Sign Here", margin + (boxWidth/2), y + (boxHeight/2) + 1, { align: 'center' });
            }
        } else {
            // Placeholder
            doc.setTextColor(200);
            doc.setFontSize(10);
            doc.text("Sign Here", margin + (boxWidth/2), y + (boxHeight/2) + 1, { align: 'center' });
        }
        
        doc.setTextColor(0);
        doc.setFontSize(8);
        doc.text(t('repoAgent'), margin + (boxWidth/2), y + boxHeight + 4, { align: 'center' });

        // Yard Staff
        const rightX = pageWidth - margin - boxWidth;
        doc.rect(rightX, y, boxWidth, boxHeight);
        
        if (vehicle.photos?.yardStaffSignature) {
            try {
                doc.addImage(vehicle.photos.yardStaffSignature, 'PNG', rightX + 2, y + 2, boxWidth - 4, boxHeight - 4);
            } catch (e) {
                console.warn("Yard Signature Corrupted/Invalid", e);
                // Fallback
                doc.setTextColor(200);
                doc.setFontSize(10);
                doc.text("Sign Here", rightX + (boxWidth/2), y + (boxHeight/2) + 1, { align: 'center' });
            }
        } else {
            // Placeholder
            doc.setTextColor(200);
            doc.setFontSize(10);
            doc.text("Sign Here", rightX + (boxWidth/2), y + (boxHeight/2) + 1, { align: 'center' });
        }
        
        doc.setTextColor(0);
        doc.setFontSize(8);
        doc.text(t('yardOperator'), rightX + (boxWidth/2), y + boxHeight + 4, { align: 'center' });
    };

    // --- EXECUTE ---
    let y = 10;
    y = await drawHeader();
    y = drawYardInfo(y);
    y = drawVehicleDetails(y);
    y = drawCustomerInfo(y);
    y = drawInventoryTable(y);
    drawSignatures(y);

    return doc;
};

export const generateVehiclePDF = async (vehicle, lang) => {
    const doc = await createVehiclePDFDoc(vehicle, lang);
    doc.save(`Inventory_${lang}_${vehicle.licensePlate || 'Vehicle'}.pdf`);
};

export const previewVehiclePDF = async (vehicle, lang) => {
    const doc = await createVehiclePDFDoc(vehicle, lang);
    const pdfBlob = doc.output('blob');
    const blobUrl = URL.createObjectURL(pdfBlob);
    window.open(blobUrl, '_blank');
};
