export interface Habit {
    id: string;
    title: string;
    description: string;
    startDate: string;
    duration: number; // Kaç gün süreceği
    dailyLogs: { date: string; hoursWorked: number }[]; // Her gün için saat kaydı
  }
  