/**
 * Utility for exporting report data to CSV/Excel
 */

/**
 * Downloads data as a CSV file (compatible with Excel)
 * @param {string} title - The title of the report
 * @param {Array} columns - Column headers
 * @param {Array} data - The row data objects
 */
export const downloadCSV = (title, columns, data) => {
    if (!data || data.length === 0) return;

    // Create CSV header
    const header = columns.join(',');
    
    // Create CSV rows
    const rows = data.map(row => {
        return Object.values(row)
            .map(val => {
                // Escape quotes and handle commas
                const escaped = ('' + (val || '')).replace(/"/g, '""');
                return `"${escaped}"`;
            })
            .join(',');
    });

    const csvContent = [header, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${title.replace(/\s+/g, '_')}_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export const downloadExcel = (title, columns, data) => {
    // For now, we reuse downloadCSV as it's the standard way to export for Excel without heavy libraries
    // We just change the extension hint if needed, but CSV is more robust
    downloadCSV(title, columns, data);
};
