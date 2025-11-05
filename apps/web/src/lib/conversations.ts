import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  type Firestore,
  type DocumentReference,
  type CollectionReference,
  type Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import type { Conversation, ChatMessage } from './types';

export function getConversationsCollection(): CollectionReference {
  return collection(db, 'conversations');
}

export function getConversationRef(id: string): DocumentReference {
  return doc(db, 'conversations', id);
}

export function getMessagesCollection(conversationId: string): CollectionReference {
  return collection(db, 'conversations', conversationId, 'messages');
}

export async function createConversation(
  userId: string, 
  title?: string
): Promise<string> {
  const conversationsRef = getConversationsCollection();
  const docRef = await addDoc(conversationsRef, {
    userId,
    title: title || 'New Conversation',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateConversationTitle(
  conversationId: string,
  title: string
): Promise<void> {
  const conversationRef = getConversationRef(conversationId);
  await updateDoc(conversationRef, {
    title,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteConversation(conversationId: string): Promise<void> {
  const conversationRef = getConversationRef(conversationId);
  await deleteDoc(conversationRef);
}

export async function getConversation(conversationId: string): Promise<Conversation | null> {
  const conversationRef = getConversationRef(conversationId);
  const snapshot = await getDoc(conversationRef);
  
  if (!snapshot.exists()) {
    return null;
  }
  
  const data = snapshot.data();
  return {
    id: snapshot.id,
    userId: data.userId,
    title: data.title,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  };
}

export async function getUserConversations(userId: string, maxResults: number = 50): Promise<Conversation[]> {
  const conversationsRef = getConversationsCollection();
  const q = query(
    conversationsRef,
    where('userId', '==', userId),
    orderBy('updatedAt', 'desc'),
    limit(maxResults)
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      userId: data.userId,
      title: data.title,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    };
  });
}

export async function addMessageToConversation(
  conversationId: string,
  message: Omit<ChatMessage, 'id' | 'createdAt'>
): Promise<string> {
  const messagesRef = getMessagesCollection(conversationId);
  const docRef = await addDoc(messagesRef, {
    role: message.role,
    content: message.content,
    sources: message.sources || [],
    createdAt: serverTimestamp(),
  });
  
  // Update conversation's updatedAt timestamp
  const conversationRef = getConversationRef(conversationId);
  await updateDoc(conversationRef, {
    updatedAt: serverTimestamp(),
  });
  
  return docRef.id;
}

export function generateConversationTitle(messageContent: string, maxLength: number = 50): string {
  const trimmed = messageContent.trim();
  if (trimmed.length <= maxLength) {
    return trimmed;
  }
  // Find the last space before maxLength to avoid cutting words
  const lastSpace = trimmed.lastIndexOf(' ', maxLength);
  const cutoff = lastSpace > 0 ? lastSpace : maxLength;
  return trimmed.slice(0, cutoff) + '...';
}
