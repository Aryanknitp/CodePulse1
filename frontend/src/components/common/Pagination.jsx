import Button from './Button.jsx';

export default function Pagination({ page, totalPages, total, pageSize, onChange }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between py-3">
      <p className="text-xs text-[#6b7280]">
        Showing {Math.min((page - 1) * pageSize + 1, total)}–{Math.min(page * pageSize, total)} of {total}
      </p>
      <div className="flex items-center gap-2">
        <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => onChange(page - 1)}>
          Previous
        </Button>
        <span className="text-xs text-[#6b7280] px-2">{page} / {totalPages}</span>
        <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
          Next
        </Button>
      </div>
    </div>
  );
}
