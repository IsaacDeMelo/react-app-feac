import { Activity, AiConfig } from '../types';
import { db, storage } from './firebase';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  setDoc,
  getDoc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

const ACTIVITIES_COLLECTION = 'activities';
const SETTINGS_COLLECTION = 'settings';
const AI_CONFIG_DOC = 'ai_config';

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

// -- Activities Service --

export const getActivities = async (): Promise<Activity[]> => {
  try {
    const q = query(collection(db, ACTIVITIES_COLLECTION), orderBy('date', 'asc'));
    const querySnapshot = await getDocs(q);
    
    const activities: Activity[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data() as Omit<Activity, 'id'>;
      // Filter client-side for expired to keep DB simple, or use a complex query
      if (!isExpired(data.date)) {
        activities.push({ id: doc.id, ...data });
      }
    });

    return activities;
  } catch (error) {
    console.error("Error fetching activities form Firebase:", error);
    return [];
  }
};

export const addActivity = async (
  activity: Omit<Activity, 'id' | 'createdAt' | 'attachment'>,
  file: File | null
): Promise<void> => {
  
  let attachmentData = undefined;

  // Upload file if exists
  if (file) {
    try {
      const storageRef = ref(storage, `attachments/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      attachmentData = {
        name: file.name,
        type: file.type,
        data: downloadURL // In Firebase version, 'data' stores the URL
      };
    } catch (e) {
      console.error("Error uploading file:", e);
      throw new Error("Falha no upload do arquivo");
    }
  }

  await addDoc(collection(db, ACTIVITIES_COLLECTION), {
    ...activity,
    createdAt: Date.now(),
    attachment: attachmentData
  });
};

export const updateActivity = async (
  activity: Activity,
  newFile?: File | null
): Promise<void> => {
  
  const activityRef = doc(db, ACTIVITIES_COLLECTION, activity.id);
  let updatedAttachment = activity.attachment;

  if (newFile) {
    // 1. Delete old file if exists and is a firebase URL
    if (activity.attachment?.data?.includes('firebasestorage')) {
       // Logic to extract ref from URL could go here, strictly speaking we should store the path
       // For simplicity, we just upload the new one for now.
    }

    // 2. Upload new
    const storageRef = ref(storage, `attachments/${Date.now()}_${newFile.name}`);
    const snapshot = await uploadBytes(storageRef, newFile);
    const downloadURL = await getDownloadURL(snapshot.ref);

    updatedAttachment = {
      name: newFile.name,
      type: newFile.type,
      data: downloadURL
    };
  } else if (newFile === null) {
    // Explicitly removed
    updatedAttachment = undefined;
  }

  await updateDoc(activityRef, {
    title: activity.title,
    subject: activity.subject,
    date: activity.date,
    type: activity.type,
    description: activity.description,
    attachment: updatedAttachment
  });
};

export const deleteActivity = async (id: string): Promise<void> => {
  // Note: To be perfectly clean, we should delete the file from Storage too.
  // We'd need to store the storageRefPath in the document to do this easily.
  await deleteDoc(doc(db, ACTIVITIES_COLLECTION, id));
};

// -- AI Configuration Service --

export const getAiConfig = async (): Promise<AiConfig> => {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, AI_CONFIG_DOC);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as AiConfig;
    }
  } catch (e) {
    console.error("Error fetching AI config", e);
  }

  // Default fallback
  return {
    context: `Você é a Luna, uma monitora acadêmica auxiliar para o curso de Administração.

Fale de forma profissional e objetiva, mas mantenha um tom simpático e solícito.
IMPORTANTE: Fale sempre no SINGULAR, dirigindo-se ao usuário individualmente. 

Se você não sabe alguma coisa, apenas diga que não sabe.`
  };
};

export const saveAiConfig = async (config: AiConfig): Promise<void> => {
  await setDoc(doc(db, SETTINGS_COLLECTION, AI_CONFIG_DOC), config);
};