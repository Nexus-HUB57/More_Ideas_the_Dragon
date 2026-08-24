'use client';

import {
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  CollectionReference,
  DocumentReference,
  SetOptions,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/**
 * Removes undefined properties and handles non-plain objects to prevent Firestore assertion errors.
 */
function sanitizeData(data: any): any {
  if (data === null || typeof data !== 'object') {
    return data;
  }

  if (data instanceof Date) {
    return data.toISOString();
  }

  if (Array.isArray(data)) {
    return data.map(sanitizeData);
  }

  const sanitized: any = {};
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      const value = data[key];
      if (value !== undefined) {
        sanitized[key] = sanitizeData(value);
      }
    }
  }
  return sanitized;
}

/**
 * Initiates a setDoc operation for a document reference.
 */
export function setDocumentNonBlocking(docRef: DocumentReference, data: any, options?: SetOptions) {
  const cleanData = sanitizeData(data);

  if (!docRef) {
    console.error('[FIREBASE_UPDATE]: Attempted to set document with null reference.');
    return;
  }

  setDoc(docRef, cleanData, options || {}).catch(error => {
    if (error.code === 'permission-denied') {
      const permissionError = new FirestorePermissionError({
        path: docRef.path,
        operation: options && 'merge' in options ? 'update' : 'create',
        requestResourceData: cleanData,
      });
      errorEmitter.emit('permission-error', permissionError);
    } else {
      console.warn('[NEXUS_DB_UPDATE]: Writing failure.', error.message);
    }
  });
}

/**
 * Initiates an addDoc operation for a collection reference.
 */
export function addDocumentNonBlocking(colRef: CollectionReference, data: any) {
  const cleanData = sanitizeData(data);

  if (!colRef) {
    console.error('[FIREBASE_UPDATE]: Attempted to add document to null collection.');
    return;
  }

  addDoc(colRef, cleanData).catch(error => {
    if (error.code === 'permission-denied') {
      const permissionError = new FirestorePermissionError({
        path: colRef.path,
        operation: 'create',
        requestResourceData: cleanData,
      });
      errorEmitter.emit('permission-error', permissionError);
    } else {
      console.warn('[NEXUS_DB_ADD]: Addition failure.', error.message);
    }
  });
}

/**
 * Initiates an updateDoc operation for a document reference.
 */
export function updateDocumentNonBlocking(docRef: DocumentReference, data: any) {
  const cleanData = sanitizeData(data);

  if (!docRef) {
    console.error('[FIREBASE_UPDATE]: Attempted to update document with null reference.');
    return;
  }

  updateDoc(docRef, cleanData).catch(error => {
    if (error.code === 'permission-denied') {
      const permissionError = new FirestorePermissionError({
        path: docRef.path,
        operation: 'update',
        requestResourceData: cleanData,
      });
      errorEmitter.emit('permission-error', permissionError);
    } else {
      console.warn('[NEXUS_DB_UPDATE]: Update failure.', error.message);
    }
  });
}

/**
 * Initiates a deleteDoc operation for a document reference.
 */
export function deleteDocumentNonBlocking(docRef: DocumentReference) {
  if (!docRef) {
    console.error('[FIREBASE_UPDATE]: Attempted to delete document with null reference.');
    return;
  }

  deleteDoc(docRef).catch(error => {
    if (error.code === 'permission-denied') {
      const permissionError = new FirestorePermissionError({
        path: docRef.path,
        operation: 'delete',
      });
      errorEmitter.emit('permission-error', permissionError);
    } else {
      console.warn('[NEXUS_DB_DELETE]: Deletion failure.', error.message);
    }
  });
}
