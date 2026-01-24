export { renderInjectionReminder, getInjectionReminderSubject } from './injection-reminder'
export { renderWeighInReminder, getWeighInReminderSubject } from './weigh-in-reminder'
export { renderHabitReminder, getHabitReminderSubject } from './habit-reminder'

export type EmailType = 'injection-reminder' | 'weigh-in-reminder' | 'habit-reminder'

export function getEmailSubject(type: EmailType, medication?: string): string {
  switch (type) {
    case 'injection-reminder':
      return medication ? `${medication} injection day - don't forget!` : "Injection day - don't forget!"
    case 'weigh-in-reminder':
      return 'Time for your weekly weigh-in'
    case 'habit-reminder':
      return 'Have you logged your habits today?'
  }
}
