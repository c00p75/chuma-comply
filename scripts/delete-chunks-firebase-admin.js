#!/usr/bin/env node
/**
 * Script to delete all vector chunks from Firestore using Firebase Admin SDK
 * Run: node scripts/delete-chunks-firebase-admin.js
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'chumacomply',
  });
}

const db = admin.firestore();

async function deleteAllChunks() {
  console.log('🗑️  Deleting all vector chunks from Firestore...\n');

  const chunksRef = db.collection('vectorChunks');
  let deletedCount = 0;
  let batch = db.batch();
  let batchCount = 0;

  try {
    const snapshot = await chunksRef.get();
    
    if (snapshot.empty) {
      console.log('✅ No vector chunks found. Collection is already empty.\n');
      return;
    }

    console.log(`Found ${snapshot.size} documents to delete\n`);

    for (const doc of snapshot.docs) {
      batch.delete(doc.ref);
      batchCount++;
      deletedCount++;

      // Firestore batch limit is 500
      if (batchCount >= 500) {
        await batch.commit();
        console.log(`  Deleted ${deletedCount} chunks so far...`);
        batch = db.batch();
        batchCount = 0;
      }
    }

    // Commit remaining
    if (batchCount > 0) {
      await batch.commit();
    }

    console.log(`\n✅ Successfully deleted ${deletedCount} vector chunks\n`);

    // Also delete vectorDB metadata
    try {
      await db.collection('vectorDB').doc('metadata').delete();
      console.log('✅ Deleted vectorDB metadata\n');
    } catch (e) {
      console.log(`⚠️  Could not delete metadata: ${e.message}\n`);
    }

    console.log('🎯 Ready for re-ingestion!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

deleteAllChunks();

