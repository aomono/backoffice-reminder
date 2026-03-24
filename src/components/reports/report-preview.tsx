"use client";

interface ReportPreviewProps {
  companyName: string;
  clientName: string;
  period: string;
  workDescription: string;
  amount: number;
}

export function ReportPreview({
  companyName,
  clientName,
  period,
  workDescription,
  amount,
}: ReportPreviewProps) {
  const issueDate = new Date().toLocaleDateString("ja-JP");

  return (
    <div className="mx-auto max-w-[600px] border bg-white p-10 shadow-sm">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <p className="text-sm">{companyName}</p>
        <p className="text-xs text-gray-500">発行日: {issueDate}</p>
      </div>

      {/* Title */}
      <h2 className="mb-8 text-center text-xl font-bold">
        業務完了報告書
      </h2>

      {/* Recipient */}
      <p className="mb-6 text-base">{clientName} 御中</p>

      {/* Period */}
      <div className="mb-4">
        <p className="mb-1 text-xs text-gray-500">対象期間</p>
        <p className="border-b border-gray-200 pb-2 text-sm">{period}</p>
      </div>

      {/* Work Description */}
      <div className="mb-6">
        <p className="mb-1 text-xs text-gray-500">業務内容</p>
        <p className="whitespace-pre-wrap border-b border-gray-200 pb-2 text-sm">
          {workDescription}
        </p>
      </div>

      {/* Amount */}
      <div className="mb-8 border border-gray-300 bg-gray-50 p-4">
        <p className="mb-1 text-xs text-gray-500">請求金額（税込）</p>
        <p className="text-lg font-bold">¥{amount.toLocaleString()}</p>
      </div>

      {/* Footer */}
      <div className="text-right text-xs text-gray-500">{companyName}</div>
    </div>
  );
}
