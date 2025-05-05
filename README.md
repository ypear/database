# <img src="https://github.com/benzmuircroft/temp/blob/main/Yjs.png" height="32" style="vertical-align:40px;"/>🍐@ypear/database 🗃️


### 💾 Installation
```bash
npm install @ypear/database
```

### 👀 Description
A robust CRDT-based database with LevelDB persistence, built on `@ypear/crdt`, featuring peer-to-peer synchronization and transactional operations.

### 🤯 Gotchas:

- If an error is caught externally or internally it is automatically logged to BUGS directory

- BUGS Include original error, call stack, and operation audit trail and a automatic rollback of failed operations

- Set `GUB.LOG_LEVEL = 1` for debug output and 2 to log the whole report at the end

- Temporary networks (`temp`) are automatically cleaned up

- It uses conflict-free replicated data types (CRDT) for automatic conflict resolution

- All changes are batched automatically into one transaction on success


### ✅ Usage
```javascript
(async function() {
  
  const table = 'btc';
  const key = 'balance';
  
  const peers = {};

  const router = await require('./router.js')(peers, {
    networkName: 'very-unique-4898n0aev7e7egigtr',
    seed: '1879fa235f0b0c9125822fe76e78c7e4',
    username: 'benz'
  });

  const { db, GUB } = await require('./database')(router, {
    topic: 'test',
    rules: {
      'rewards': { // Table with rules
        owner: 'publicKey', // table owner can delete items
        'benz': { negAlow: true, owner: 'publicKey' } }, // key owner overrides table owner
      'btc': {}, // Table with no rules
      'doge': {}, // Table with no rules
      'sol': {}, // Table with no rules
    },
    events: {
      forWho: (ev) => {}, // function for you to figure out who the event is for
      display: async (evArray) => {} // function for you to send the events to the client side
    }
  });

  let BUG = GUB.NEW('temp', {}, new Error().stack, { caller: 'testing database' });
  BUG.EXEC = async function (BUG) {
    try {
      
      db.mod(BUG, table, key, [], {is: 'new', 'a': { 'b': true, 'c': '0'}}, 'creating it from scratch');
      await db.can(BUG, t, k, note, async function(BUG) { // wait only for things that already exist
        console.log(db[BUG.NET][table][key]);
        db.cut(BUG, t, k, ['a', 'b'], 'removing nested item b');
        console.log(db[BUG.NET][t][k]);
        db.sum(BUG, t, k, ['a', 'bal'], 'add', '174', 'adding a balance of 174');
        console.log(db[BUG.NET][t][k]);
        GUB.END(BUG, null, function () {
          console.log('success');
          console.log(db['live'][t][k]);
          });
      });

    }
    catch (ERROR) {
      GUB.END(BUG, ERROR, function (BUG) {
        console.error(BUG);
      });
    }
  };
  BUG.EXEC(BUG);

})();
```
### 🧰 Methods
- `db.can(BUG, table, key, note, callback)` - Access-controlled context
- `db.mod(BUG, table, key, path, value, note)` - Modify or create data
- `db.cut(BUG, table, key, path, note)` - Remove data
- `db.sum(BUG, table, key, path, op, value, note)` - Numeric operations
- `db.del(BUG, table, key, note)` - Delete an item
- `db.isLocked(BUG, table, key)` - Check if item is locked
- `db.iveLocked(BUG, table, key)` - Check if you have locked an item
- `GUB.NEW(env, args, trace, options)` - Create new transaction
- `GUB.END(BUG, error, callback)` - Complete transaction
- `GUB.LOG_LEVEL` - Control logging verbosity (0-2)
- `GUB.PAINTER` - Track last successful transaction


### 📜 License
MIT