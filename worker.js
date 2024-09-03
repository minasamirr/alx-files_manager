// worker.js
const Bull = require('bull');
const fileQueue = new Bull('fileQueue');
const dbClient = require('./utils/db');
const imageThumbnail = require('image-thumbnail');
const fs = require('fs');
const path = require('path');

fileQueue.process(async (job) => {
  const { userId, fileId } = job.data;

  if (!fileId) throw new Error('Missing fileId');
  if (!userId) throw new Error('Missing userId');

  const file = await dbClient.db.collection('files').findOne({ _id: ObjectId(fileId), userId: ObjectId(userId) });
  
  if (!file) throw new Error('File not found');
  
  const filePath = file.localPath;
  if (!fs.existsSync(filePath)) throw new Error('File not found locally');

  const thumbnailSizes = [500, 250, 100];
  
  for (const size of thumbnailSizes) {
    const thumbnail = await imageThumbnail(filePath, { width: size });
    const thumbnailPath = `${filePath}_${size}`;
    fs.writeFileSync(thumbnailPath, thumbnail);
  }
});
