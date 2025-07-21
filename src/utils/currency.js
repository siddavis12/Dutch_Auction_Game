// Currency formatting utilities
export const formatPrice = (price) => {
  if (price === null || price === undefined) return '₩0';
  return `₩${parseInt(price).toLocaleString('ko-KR')}`;
};

export const formatPriceNumber = (price) => {
  if (price === null || price === undefined) return 0;
  return parseInt(price).toLocaleString('ko-KR');
};