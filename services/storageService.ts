import { Activity, AiConfig, Attachment } from '../types';

// --- CONFIGURAÇÃO DO MODO DE DADOS ---
// TRUE para usar o servidor Node.js com MongoDB
const USE_API = true; 

// Alterado para caminho relativo. 
// Em produção (Render), o front e o back estão na mesma origem.
// Em dev local, você deve configurar um proxy no vite ou rodar tudo junto.
const API_URL = '/api/activities';

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

// ==========================================
// MÉTODOS LOCAL STORAGE (Fallback)
// ==========================================

const getActivitiesLocal = async (): Promise<Activity[]> => {
  try {
    const data = localStorage.getItem(ACTIVITIES_KEY);
    if (!data) return [];
    
    const activities: Activity[] = JSON.parse(data);
    
    return activities
      .filter(a => !isExpired(a.date))
      .sort((a, b) => a.date.localeCompare(b.date));
  } catch (error) {
    console.error("Error reading activities:", error);
    return [];
  }
};

const addActivityLocal = async (
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

const updateActivityLocal = async (
  activity: Activity,
  newFile?: File | null
): Promise<void> => {
  const currentData = localStorage.getItem(ACTIVITIES_KEY);
  if (!currentData) return;

  let activities: Activity[] = JSON.parse(currentData);
  const index = activities.findIndex(a => a.id === activity.id);

  if (index === -1) return;

  let updatedAttachment = activities[index].attachment; 

  if (newFile) {
    const base64 = await fileToBase64(newFile);
    updatedAttachment = {
      name: newFile.name,
      type: newFile.type,
      data: base64
    };
  } else if (newFile === null) {
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

const deleteActivityLocal = async (id: string): Promise<void> => {
  const currentData = localStorage.getItem(ACTIVITIES_KEY);
  if (!currentData) return;

  let activities: Activity[] = JSON.parse(currentData);
  activities = activities.filter(a => a.id !== id);
  localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(activities));
};

// ==========================================
// MÉTODOS API (Node + MongoDB)
// ==========================================

const getActivitiesAPI = async (): Promise<Activity[]> => {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
       console.warn(`API retornou erro ${response.status}:`, await response.text());
       return [];
    }
    const activities: Activity[] = await response.json();
    
    return activities
      .filter(a => !isExpired(a.date))
      .sort((a, b) => a.date.localeCompare(b.date));
  } catch (error) {
    console.error("Falha ao buscar da API. Verifique se o backend está rodando.", error);
    return [];
  }
};

const addActivityAPI = async (
  activityData: Omit<Activity, 'id' | 'createdAt' | 'attachment'>,
  file: File | null
): Promise<void> => {
  let attachment: Attachment | undefined = undefined;

  if (file) {
    const base64 = await fileToBase64(file);
    attachment = {
      name: file.name,
      type: file.type,
      data: base64
    };
  }

  const payload = {
    ...activityData,
    attachment
  };

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Erro API (${response.status}): ${errText}`);
  }
};

const updateActivityAPI = async (
  activity: Activity,
  newFile?: File | null
): Promise<void> => {
  let updatedAttachment = activity.attachment;

  if (newFile) {
    const base64 = await fileToBase64(newFile);
    updatedAttachment = {
      name: newFile.name,
      type: newFile.type,
      data: base64
    };
  } else if (newFile === null) {
    updatedAttachment = undefined;
  }

  const payload = {
    title: activity.title,
    subject: activity.subject,
    date: activity.date,
    type: activity.type,
    description: activity.description,
    attachment: updatedAttachment
  };

  const response = await fetch(`${API_URL}/${activity.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
     throw new Error("Falha ao atualizar na API");
  }
};

const deleteActivityAPI = async (id: string): Promise<void> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE'
  });
  
  if (!response.ok) {
     throw new Error("Falha ao excluir na API");
  }
};

// ==========================================
// EXPORTAÇÃO DINÂMICA
// ==========================================

export const getActivities = USE_API ? getActivitiesAPI : getActivitiesLocal;
export const addActivity = USE_API ? addActivityAPI : addActivityLocal;
export const updateActivity = USE_API ? updateActivityAPI : updateActivityLocal;
export const deleteActivity = USE_API ? deleteActivityAPI : deleteActivityLocal;

// Configuração da IA continua LocalStorage por simplicidade
export const getAiConfig = async (): Promise<AiConfig> => {
  const data = localStorage.getItem(SETTINGS_KEY);
  if (data) return JSON.parse(data) as AiConfig;
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
