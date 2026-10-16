'use strict';

function documentRef(ref) {
 return {
  get: () => ref.get(),
  set: ({data}) => ref.set(data),
  update: ({data}) => ref.update(data),
  remove: () => ref.remove()
 };
}

function adaptDatabase(db) {
 return new Proxy(db, {
  get(target, key) {
   if (key === 'collection') return name => {
    const collection = target.collection(name.replace(/^mw_/, 'dy_'));
    return new Proxy(collection, {
     get(source, member) {
      if (member === 'doc') return id => documentRef(source.doc(id));
      const value = source[member];
      return typeof value === 'function' ? value.bind(source) : value;
     }
    });
   };
   if (key === 'runTransaction') return fn => target.runTransaction(tx => fn(adaptDatabase(tx)));
   const value = target[key];
   return typeof value === 'function' ? value.bind(target) : value;
  }
 });
}

module.exports = {adaptDatabase};
