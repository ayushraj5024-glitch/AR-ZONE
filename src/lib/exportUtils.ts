import * as XLSX from 'xlsx';

export const exportToCSV = (data: any[], fileName: string) => {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  XLSX.writeFile(wb, `${fileName}.xlsx`);
};

export const exportToPDF = (data: any[], headers: string[], fileName: string) => {
  // Simple fallback since jsPDF text clipping is complex. Just convert to CSV for now or prompt
  // the user to print. Using window.print might be simpler for robust PDF formats.
  alert('For PDF export, please use the Print dialog (Ctrl+P) and select "Save as PDF".');
  window.print();
};

export const shareToWhatsApp = (text: string) => {
  const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
};
