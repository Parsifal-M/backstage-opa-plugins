import { format } from 'date-fns';

export function formatDate(dateString: string | number | Date) {
  const date = new Date(dateString);
  return format(date, 'dd/MM/yyyy HH:mm:ss');
}
