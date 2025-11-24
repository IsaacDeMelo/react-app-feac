import { Activity, AiConfig, Attachment } from '../types';

const ACTIVITIES_KEY = 'ufal_activities_v2';
const SETTINGS_KEY = 'ufal_settings_v2';

// Helper to check if date is past
const isExpired = (dateString: string): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const [year, month, day] = dateString.split('-').map(Number);
  const activityDate = new Date(year, month - 1, day);
  
  const expirationDate = new Date(activityDate);
  expirationDate.setDate(expirationDate.getDate() + 1); // Expire 1 day after
  
  return today > expirationDate;
};

// Helper: File to Base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

// -- Activities Service --

export const getActivities = async (): Promise<Activity[]> => {
  try {
    const data = localStorage.getItem(ACTIVITIES_KEY);
    if (!data) return [];
    
    const activities: Activity[] = JSON.parse(data);
    
    // Filter expired and sort by date
    return activities
      .filter(a => !isExpired(a.date))
      .sort((a, b) => a.date.localeCompare(b.date));
  } catch (error) {
    console.error("Error reading activities:", error);
    return [];
  }
};

export const addActivity = async (
  activityData: Omit<Activity, 'id' | 'createdAt' | 'attachment'>,
  file: File | null
): Promise<void> => {
  
  let attachment: Attachment | undefined = undefined;

  if (file) {
    try {
      const base64 = await fileToBase64(file);
      attachment = {
        name: file.name,
        type: file.type,
        data: base64
      };
    } catch (e) {
      console.error("Error converting file", e);
      throw new Error("Falha ao processar arquivo");
    }
  }

  const newActivity: Activity = {
    id: Date.now().toString() + Math.random().toString(36).substring(2),
    createdAt: Date.now(),
    title: activityData.title,
    subject: activityData.subject,
    date: activityData.date,
    type: activityData.type,
    description: activityData.description,
    attachment: attachment
  };

  const currentData = localStorage.getItem(ACTIVITIES_KEY);
  const activities: Activity[] = currentData ? JSON.parse(currentData) : [];
  
  activities.push(newActivity);
  localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(activities));
};

export const updateActivity = async (
  activity: Activity,
  newFile?: File | null
): Promise<void> => {
  
  const currentData = localStorage.getItem(ACTIVITIES_KEY);
  if (!currentData) return;

  let activities: Activity[] = JSON.parse(currentData);
  const index = activities.findIndex(a => a.id === activity.id);

  if (index === -1) return;

  let updatedAttachment = activities[index].attachment; // Keep existing by default

  if (newFile) {
    const base64 = await fileToBase64(newFile);
    updatedAttachment = {
      name: newFile.name,
      type: newFile.type,
      data: base64
    };
  } else if (newFile === null) {
    // Explicitly removed
    updatedAttachment = undefined;
  }

  activities[index] = {
    ...activities[index],
    title: activity.title,
    subject: activity.subject,
    date: activity.date,
    type: activity.type,
    description: activity.description,
    attachment: updatedAttachment
  };

  localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(activities));
};

export const deleteActivity = async (id: string): Promise<void> => {
  const currentData = localStorage.getItem(ACTIVITIES_KEY);
  if (!currentData) return;

  let activities: Activity[] = JSON.parse(currentData);
  activities = activities.filter(a => a.id !== id);
  
  localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(activities));
};

// -- AI Configuration Service --

export const getAiConfig = async (): Promise<AiConfig> => {
  const data = localStorage.getItem(SETTINGS_KEY);
  if (data) {
    return JSON.parse(data) as AiConfig;
  }

  // Default
  return {
    context: `Você é a Luna, uma monitora acadêmica auxiliar para o curso de Administração.

Fale de forma profissional e objetiva, mas mantenha um tom simpático e solícito.
IMPORTANTE: Fale sempre no SINGULAR, dirigindo-se ao usuário individualmente. 

Se você não sabe alguma coisa, apenas diga que não sabe.`
  };
};

export const saveAiConfig = async (config: AiConfig): Promise<void> => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(config));
};