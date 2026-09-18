import {studentProfile} from './students.js';

// A page binds to one profile, so pending writes cannot change students.
// Fernando keeps his original database and all existing saved work.
export function createStudentStore(studentId='fernando',factory=globalThis.indexedDB) {
  studentProfile(studentId);
  let database;
  function openDatabase() {
    if (database) return database;
    database = new Promise((resolve, reject) => {
      if (!factory) return reject(new Error('Este navegador no permite guardar el trabajo. Usa una ventana normal de un navegador actualizado.'));
      const request = factory.open(`${studentId}-aula-github-v1`, 1);
      request.onupgradeneeded = () => {
        for (const name of ['drafts', 'files', 'tasks', 'reviews', 'settings']) request.result.createObjectStore(name, {keyPath: 'id'});
      };
      request.onsuccess = () => { request.result.onversionchange = () => request.result.close(); resolve(request.result); };
      request.onerror = () => reject(request.error);
      request.onblocked = () => reject(new Error('Cierra las otras pestañas del aula y vuelve a intentarlo.'));
    });
    return database;
  }
  async function all(name) {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(name, 'readonly');
      const request = tx.objectStore(name).getAll();
      tx.oncomplete = () => resolve(request.result);
      tx.onabort = () => reject(tx.error);
    });
  }
  async function write(operations) {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([...new Set(operations.map(o => o.store))], 'readwrite');
      for (const operation of operations) {
        const store = tx.objectStore(operation.store);
        operation.remove ? store.delete(operation.id) : store.put(operation.value);
      }
      tx.oncomplete = () => resolve();
      tx.onabort = () => reject(tx.error || new Error('No se pudo guardar.'));
    });
  }
  const put = (store, value) => write([{store, value}]);
  // Read and change progress in one transaction, including across browser tabs.
  // The callback is synchronous; network requests must happen outside it.
  async function update(names, change) {
    const db=await openDatabase();
    return new Promise((resolve,reject)=>{
      const tx=db.transaction(names,'readwrite'),snapshot={};
      let remaining=names.length,result,failure;
      for(const name of names){
        const request=tx.objectStore(name).getAll();
        request.onsuccess=()=>{
          snapshot[name]=request.result;
          if(--remaining)return;
          try{
            const changed=change(snapshot);result=changed.result;
            for(const operation of changed.operations){
              const target=tx.objectStore(operation.store);
              operation.remove?target.delete(operation.id):target.put(operation.value);
            }
          }catch(error){failure=error;tx.abort();}
        };
      }
      tx.oncomplete=()=>resolve(result);
      tx.onabort=()=>reject(failure||tx.error||new Error('No se pudo guardar el avance.'));
    });
  }
  return {openDatabase,all,write,put,update};
}
