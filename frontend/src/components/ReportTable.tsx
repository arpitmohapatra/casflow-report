import React from 'react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { Button } from './ui/button';
import { Download } from 'lucide-react';
import * as XLSX from 'xlsx';

export interface CashflowItem {
  id: string;
  accountNumber: string;
  description: string;
  amount: number;
  date: string;
  category: string;
}

interface ReportTableProps {
  data: CashflowItem[];
  title: string;
  reportType: 'AP' | 'GL';
  year: number;
  month: number;
}

const ReportTable: React.FC<ReportTableProps> = ({ data, title, reportType, year, month }) => {
  const downloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Cashflow");
    
    // Format headers
    const headerStyle = {
      font: { bold: true },
      fill: { fgColor: { rgb: "EFEFEF" } }
    };
    
    // Get column headers
    const headers = Object.keys(data[0] || {});
    const headerRange = XLSX.utils.decode_range(worksheet['!ref'] || "A1:A1");
    
    // Apply header styling
    for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: headerRange.s.r, c: col });
      if (worksheet[cellAddress]) {
        worksheet[cellAddress].s = headerStyle;
      }
    }
    
    // Generate filename
    const filename = `${reportType}_Cashflow_${year}_${month}.xlsx`;
    
    XLSX.writeFile(workbook, filename);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Calculate totals
  const totalAmount = data.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="bg-card rounded-lg shadow-md h-full flex flex-col">
      <div className="p-4 flex justify-between items-center bg-muted/30 border-b shrink-0">
        <h2 className="text-xl font-semibold">{title}</h2>
        <Button variant="outline" size="sm" onClick={downloadExcel}>
          <Download className="h-4 w-4 mr-2" />
          Download Excel
        </Button>
      </div>
      
      <div className="flex-grow overflow-y-auto">
        <div className="min-w-full">
          <Table>
            <TableCaption>
              {reportType} Cash Flow Report for {new Date(year, month - 1).toLocaleString('default', { month: 'long' })} {year}
            </TableCaption>
            <TableHeader className="sticky top-0 bg-card z-10">
              <TableRow>
                <TableHead>Account #</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.accountNumber}</TableCell>
                  <TableCell>{item.description}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right font-mono">
                    {formatCurrency(item.amount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      
      <div className="p-4 border-t bg-muted/10 shrink-0">
        <div className="flex justify-end items-center">
          <div className="font-medium mr-4">Total:</div>
          <div className="text-right font-mono font-bold">
            {formatCurrency(totalAmount)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportTable; 