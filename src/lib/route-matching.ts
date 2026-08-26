import type { Customer, DayOfWeek, User } from './firebase-types';

const WEEKDAYS: DayOfWeek[] = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
];

export const weekdayFromDate = (date: Date): DayOfWeek => WEEKDAYS[date.getDay()];

export const ALL_DAYS: DayOfWeek[] = [...WEEKDAYS];

export function frequencyInDays(serviceFrequency: unknown): number {
  if (typeof serviceFrequency === 'number' && Number.isFinite(serviceFrequency) && serviceFrequency > 0) {
    return serviceFrequency;
  }
  if (serviceFrequency === 'weekly') return 7;
  if (serviceFrequency === 'biweekly') return 14;
  if (serviceFrequency === 'monthly') return 30;
  if (serviceFrequency === 'one-time') return 1;
  return 7;
}

export function isUserAvailableOnDay(user: User, dayOfWeek: DayOfWeek): boolean {
  const daySchedule = user.schedule?.[dayOfWeek];
  if (!daySchedule) return false;
  if (daySchedule.available === false) return false;
  return Boolean(daySchedule.start && daySchedule.end);
}

export function customerPreferredDays(customer: Customer): DayOfWeek[] {
  const days = customer.servicePreferences?.preferredDays;
  if (Array.isArray(days) && days.length > 0) {
    return days;
  }
  // Empty/missing preferred days = any day (otherwise new customers never get routed)
  return ALL_DAYS;
}

export function customerNeedsServiceOnDate(customer: Customer, date: Date): boolean {
  if (customer.status !== 'active') return false;

  const preferred = customerPreferredDays(customer);
  const dayOfWeek = weekdayFromDate(date);
  if (!preferred.includes(dayOfWeek)) return false;

  const frequency = frequencyInDays(customer.servicePreferences?.serviceFrequency);
  if (!customer.lastServiceDate) return true;

  const last = customer.lastServiceDate.toDate();
  const daysSince = Math.floor((date.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
  return daysSince >= Math.min(frequency, 5) || daysSince >= 5;
}

export function customerServiceTypes(customer: Customer): string[] {
  return (customer.services || []).map((service) => service.type).filter(Boolean);
}

export function crewCanServiceCustomer(capabilities: string[], customer: Customer): boolean {
  const types = customerServiceTypes(customer);
  if (capabilities.length === 0) {
    return types.length > 0;
  }
  if (types.length === 0) {
    return false;
  }
  return types.some((type) => capabilities.includes(type));
}

export const weekdaySchedule = (
  availableWeekdays = true
): User['schedule'] => ({
  monday: { start: '08:00', end: '17:00', available: availableWeekdays },
  tuesday: { start: '08:00', end: '17:00', available: availableWeekdays },
  wednesday: { start: '08:00', end: '17:00', available: availableWeekdays },
  thursday: { start: '08:00', end: '17:00', available: availableWeekdays },
  friday: { start: '08:00', end: '17:00', available: availableWeekdays },
  saturday: { start: '08:00', end: '17:00', available: false },
  sunday: { start: '08:00', end: '17:00', available: false },
});
