import React, { useState } from 'react';
import { Button } from './ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from './ui/select';

type ReportType = 'AP' | 'GL';

interface ReportFormProps {
  onSubmit: (reportType: ReportType, year: number, month: number) => void;
}

const ReportForm: React.FC<ReportFormProps> = ({ onSubmit }) => {
  const [reportType, setReportType] = useState<ReportType>('AP');
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);

  const years = Array.from({ length: 5 }, (_, i) => year - i);
  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(reportType, year, month);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6 bg-card rounded-lg shadow-md">
      <div className="space-y-2">
        <label htmlFor="reportType" className="text-sm font-medium">
          Report Type
        </label>
        <Select
          value={reportType}
          onValueChange={(value) => setReportType(value as ReportType)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Report Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="AP">AP (Accounts Payable)</SelectItem>
            <SelectItem value="GL">GL (General Ledger)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label htmlFor="year" className="text-sm font-medium">
          Year
        </label>
        <Select
          value={year.toString()}
          onValueChange={(value) => setYear(parseInt(value))}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Year" />
          </SelectTrigger>
          <SelectContent>
            {years.map((y) => (
              <SelectItem key={y} value={y.toString()}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label htmlFor="month" className="text-sm font-medium">
          Month
        </label>
        <Select
          value={month.toString()}
          onValueChange={(value) => setMonth(parseInt(value))}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Month" />
          </SelectTrigger>
          <SelectContent>
            {months.map((m) => (
              <SelectItem key={m.value} value={m.value.toString()}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" className="w-full">
        Generate Report
      </Button>
    </form>
  );
};

export default ReportForm; 