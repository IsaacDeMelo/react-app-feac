import { Activity, AiConfig } from '../types';

const STORAGE_KEY = 'portal_adm_activities_v2';
const AI_CONFIG_KEY = 'portal_adm_ai_config';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// Helper to check if date is past
const isExpired = (dateString: string): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Parse the activity date (YYYY-MM-DD)
  const [year, month, day] = dateString.split('-').map(Number);
  const activityDate = new Date(year, month - 1, day);
  
  // Logic update: Activity expires only if date is STRICTLY less than yesterday.
  // This keeps today's activities visible.
  // Actually, let's keep them visible for 24h after.
  const expirationDate = new Date(activityDate);
  expirationDate.setDate(expirationDate.getDate() + 1);
  
  return today > expirationDate;
};

export const getActivities = async (): Promise<Activity[]> => {
  await delay(50); // Reduced delay for snappier feel
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  
  try {
    let activities: Activity[] = JSON.parse(data);
    
    // Filter out expired activities and update storage
    const validActivities = activities.filter(a => !isExpired(a.date));
    
    // If we filtered anything out, save the clean list
    if (validActivities.length !== activities.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(validActivities));
    }

    // Sort by date (ascending - closest deadlines first)
    return validActivities.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  } catch (e) {
    console.error("Error parsing activities", e);
    return [];
  }
};

export const addActivity = async (activity: Omit<Activity, 'id' | 'createdAt'>): Promise<Activity> => {
  await delay(200);
  const current = await getActivities();
  
  const newActivity: Activity = {
    ...activity,
    id: Math.random().toString(36).substr(2, 9),
    createdAt: Date.now()
  };

  // Persist
  const updated = [...current, newActivity];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  
  return newActivity;
};

export const deleteActivity = async (id: string): Promise<void> => {
  await delay(100);
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return;
  
  const activities: Activity[] = JSON.parse(data);
  const updated = activities.filter(a => a.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};

// -- AI Configuration Service --

export const getAiConfig = (): AiConfig => {
  const data = localStorage.getItem(AI_CONFIG_KEY);
  if (data) {
    return JSON.parse(data);
  }
  return {
    context: "Você é um monitor acadêmico auxiliar. Responda com formalidade acadêmica, mas de forma acessível."
  };
};

export const saveAiConfig = (config: AiConfig): void => {
  localStorage.setItem(AI_CONFIG_KEY, JSON.stringify(config));
};