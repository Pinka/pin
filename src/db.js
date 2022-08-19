import Dexie from 'dexie';

export const db = new Dexie('myDatabase');
db.version(2).stores({
  pins: '++id, name',
  records: '++id, pinName, dataUrl'
});

// db.pins.clear();