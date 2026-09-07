export function pagination(page = 1, pageSize = 20) {
  const safePage = Math.max(1, Number(page) || 1);
  const safeSize = Math.min(100, Math.max(1, Number(pageSize) || 20));
  return { page: safePage, pageSize: safeSize, skip: (safePage - 1) * safeSize };
}

export function pageMeta(total, page, pageSize) {
  return { total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
}
