function ts() {
  const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
  const now = new Date(+new Date());
  const date = [now.getDate(), months[now.getMonth()], now.getFullYear()];
  let time = [now.getHours(), now.getMinutes(), now.getSeconds()];
  const suffix = (time[0] < 12) ? "am" : "pm";
  time[0] = (time[0] < 12) ? time[0] : time[0] - 12;
  time[0] = time[0] || 12;
  for (let i = 1; i < 3; i++) {
    if (time[i] < 10) {
      time[i] = "0" + time[i];
    }
  }
  return date.join("") + "-" + time.join(":") + suffix;
}
const fs = require('fs').promises;
const SAFE = { stringify: require('json-stringify-safe') };
const shell = undefined;
const path = require('path');
let EVENT;
// todo: if left open this error may happen
/*
/home/benz/Desktop/node_modules/hyperswarm/index.js:402
      conn.sendKeepAlive()
            ^

TypeError: conn.sendKeepAlive is not a function
    at Hyperswarm._handleNetworkChange (/home/benz/Desktop/node_modules/hyperswarm/index.js:402:12)
    at HyperDHT.emit (node:events:526:35)
    at HyperDHT._onnetworkchange (/home/benz/Desktop/node_modules/dht-rpc/index.js:422:10)
    at NetworkInterfaces.<anonymous> (/home/benz/Desktop/node_modules/dht-rpc/index.js:67:65)
    at NetworkInterfaces.emit (node:events:514:28)
    at NetworkInterfaces._onevent (/home/benz/Desktop/node_modules/udx-native/lib/network-interfaces.js:28:10)


    it is more than likely from using a wrong version of hyperswarm!
    it will probably be the same thing that prevented userbase from replicating ...
*/


const benz = { // todo: use so you can easily clean littered logs (aftermath of loosing your mind ...)
  log: console.log,
  dir: console.dir,
  trace: console.trace
};



/* eslint-disable no-inner-declarations */
/* eslint-disable no-undef */
// IMPORTANT
// A bug with the end commented out will never be in live mode unless it is a live bug to begin with, also remember that things like the db don't save in tests

/*  EXAMPLE PAINTER:
if (!db.block[F.order]['events']) { // store the last sucessful BUG to pass through here
  BUG.PAINTER = copy(BUG.FILENAME);
}
*/
let bugsPath;
try {
  const { app } = require('electron');
  bugsPath = path.join(path.dirname(app.getPath('exe')), 'BUGS');
} catch (e) {
  // Fallback for Node.js testing
  bugsPath = path.join(process.cwd(), 'BUGS');
}


async function ensureBugsPath() {
  try {
    await fs.access(bugsPath);
  } catch {
    await fs.mkdir(bugsPath, { recursive: true });
  }
}

(async () => await ensureBugsPath());


// const controller = new AbortController;
// const signal = controller.signal // put in BUG
// controller.abort() // do when error instead of bug end cb


const EMPTY = { NET: 'live' };
const GUB = /*module.exports = */{
  LOG_LEVEL:          2, // 0: is silent, 1: console.logs, 2: also prints the bug
  HAS_HISTORY_FOLDER: false,
  PAINTER:            undefined, // alows to track which BUG was last succesful to pass through a db.can
  LAST: {
    info:             'to use this you need the opt "onqueue:name" in the new bug. then the db will copy the last bug through if wait fails into the current bug if it is being stored. you must store it manually after wait like G.BUG.LAST[name] = BUG'
  },
  NEW: function (env, ARG, trace, options) {
    if (options !== undefined && typeof options !== 'object') GUB.db.log(BUG, 'BUG options are malformed', options, trace);
    let BUG = {
      CALLER:     options.caller || '',
      LIVE:       'live', // shows developer intent to pay special consideration to things that must be taken/copied from the main network (dispite a test env)
      NET:        env == 'temp' ? GUB.db.router.tag.en()[0] : 'live', // or test/live
      STEPS:      undefined,
      ARGUMENTS:  ARG || {},
      LOCKLIST:   {},
      AUDIT:      [],
      EVENTS:     [], // todo: these need to be handled like hyperdown
      INDEX:      { live: {} },
      BEFORE:     { live: {} },
      ORIGIN:     trace.replace('Error', 'Started At').split(/\n/g),
      EXITED:     '... happens at bug end',
      HISTORY:    options.hist ? (ARG.o?.key || false) : false,
      TEST_ONLY:  options.test_only,
      FILENAME:   path.join(ts() + '.json'),
      START:      +new Date(),
      OPTS:       options,
      ACTIVE:     true,
      TIME:       {
        SELF: [(+new Date()) + (60000 * 5)] // bug is alowed to last this long ...
      },
      TIMERS: (BUG) => {
        for (const [dir, v] of Object.entries(BUG.TIME)) {
          if (dir == 'SELF') {
            if ((+new Date()) > v[0]) {
              BUG.WARNING = { stack: 'BUG LASTED TOO LONG!' };
              clearInterval(BUG.timeout);
              delete BUG.timeout;
              if (!BUG.EXIT) { 
                GUB.END(BUG, { stack: 'timeout' }, function () {
                  throw false;
                  // dev needs to fix (or to do: shutdown)
                });
              }
            }
          }
          else if ((+new Date()) > v[0]) {
            const [table, key] = dir.split('/');
            GUB.db.log(BUG, `${v[1]} ${GUB.db.isLocked(BUG, table, key)}?)`);
          }
        }
      },
      ADDTIME: (more) => {
        for (const dir of Object.keys(BUG.TIME)) {
          BUG.TIME[dir][0] += more;
        }
      },
      PUSH: function (audit) {
        if (global.TESTING) console.log(audit);
        else if (GUB.LOG_LEVEL) console.log(audit);
        BUG.AUDIT.push(audit);
      },
      EV: function (ev) {
        if (BUG.NET == 'live') {
          BUG.EVENTS = BUG.EVENTS.concat([ev]);
        }
      }
    };
    GUB.db.createTempNetwork(BUG.NET);
    BUG.BEFORE[BUG.NET] = {};
    BUG.STEPS = ({ temp: [BUG.NET, 'live'], live: ['live'] })[env]; // ##sessionId
    if (!BUG.STEPS) {
      BUG.STEPS = [env + 1, 'stop']; // i intentionally pass an already running temptest (wanting to only perform one cycle)
    }
    if (BUG.ARGUMENTS) { BUG.ARGUMENTS.cb = 'cb'; }
    BUG.timeout = setInterval(BUG.TIMERS, 10000, BUG);
    return BUG;
  },
  END: function (BUG, ERROR, cb, INSPECT) {
    if (BUG.ERROR) return;
    if ((BUG.STEPS || []).length > 1 && BUG.STEPS[0] !== 'live') {
      GUB.db.removeTempNetwork(BUG.STEPS[0]);
    }
    clearInterval(BUG.timeout);
    delete BUG.timeout;
    const EXIT = new Error().stack.replace('Error', 'Exited At').split(/\n/g);
    if (!BUG) {
      if (ERROR) {
        fs.writeFile(
          path.join(path.join(__dirname, '..', 'BUGS'), (+new Date()) + '.NOBUG'), 
          ERROR.stack, 
          'utf-8'
        ).then(() => {
          if (typeof cb == 'function') {
            benz.log('end yes bug');
            cb();
          }
        });
      }
      else if (typeof cb == 'function') {
        benz.log('end no bug');
        cb();
      }
    }
    else if (BUG.ACTIVE) {
      if (BUG.ONCE) {
        if (typeof cb == 'function') {
          benz.log('end once');
          cb(BUG);
        }
      }
      else {
        if (BUG.NET == 'live') { BUG.ONCE = true; }
        BUG.EXITED = EXIT;
        if (BUG.NET !== 'live') {
          BUG.AUDIT.push('[TEST END]');
        }
        else if (BUG.NET == 'live') {
          let compare = JSON.parse(JSON.stringify(BUG.AUDIT));
          compare = [compare.slice(0, compare.indexOf(';')), compare.slice(compare.indexOf(';') + 1)];
          if (compare[0].length > compare[1].length) {
            compare = 'BUG TEST WAS LONGER THAN LIVE (IS TEST ALTERING SOMETHING?)';
            GUB.db.log(BUG, compare);
            BUG.AUDIT.push(compare);
          }
        }
        if (INSPECT) GUB.db.log(BUG, 'BUG.END ' + BUG.NET);
        if (BUG.TEST_ONLY) {
          if (!BUG.ERROR) { BUG.ERROR = 'TEST ONLY'; }
          else { BUG.ERROR += '... (was) TEST ONLY'; }
        }
        if (BUG.FILENAME == undefined) GUB.db.log(BUG, 'BUG BECOMES EMPTY!');
        if (ERROR) {
          BUG.ERROR = (typeof ERROR.stack == 'string') ? ERROR.stack.split(/\n/g) : ERROR;
        }
        if ((BUG.STEPS || ['live'])[0] !== 'live' && BUG.NET !== 'live' && !BUG.ERROR && BUG.STEPS.indexOf('stop') == -1) {
          if (INSPECT) GUB.db.log(BUG, 'BUG.END switching to live');
          BUG.timeout = setInterval(BUG.TIMERS, 10000, BUG);
          BUG.NET = 'live';
          BUG.EXEC(BUG);
        }
        //
        // error ....
        //
        else {
          BUG.ACTIVE = 'ending';
          if (INSPECT) GUB.db.log(BUG, 'BUG.END ending live');
          function before_cb(BUG) {
            before_cb = null;
            if (INSPECT) GUB.db.log(BUG, 'BUG.END before_cb');
            if (GUB.PAINTER == BUG.FILENAME) {
              if (INSPECT) GUB.db.log(BUG, 'BUG.END painter');
              if (INSPECT) GUB.db.log(BUG, 'BUG.END (on success)');
              (async () => { await fs.writeFile(path.join(__dirname, '..', 'BUGS', 'PAINTED.json'), SAFE.stringify(BUG, undefined, '\t'), 'utf-8'); })();
            }
            if (INSPECT) GUB.db.log(BUG, 'cb?');
            delete BUG.ACTIVE;
            if (BUG.ERROR && GUB.LOG_LEVEL == 2) {
              console.log({ ...BUG, where: '##GUB LOG_LEVEL 2' });
              // throw ''; // <--- fatal boom
            }
            if (typeof cb == 'function') cb(BUG);
          } // before_cb
          if (BUG.ARGUMENTS?.pw) { BUG.ARGUMENTS.pw = 'xxx'; }
          if (BUG.ARGUMENTS?.password) { BUG.ARGUMENTS.password = 'xxx'; }
          if (BUG.ARGUMENTS?.['0']) {
            if (BUG.ARGUMENTS['0'].password) BUG.ARGUMENTS['0'].password = 'xxx';
            if (BUG.ARGUMENTS['0'].pw) BUG.ARGUMENTS['0'].pw = 'xxx';
          }
          BUG = {
            ['🐞']:           'GUB REPORT', // NET: [ 'úÌo=◊zÇH¤ûŠ£P', '1744932202694' ] todo: wtf why are there 2 nets?
            CALLER:       BUG.CALLER || '',
            NET:          BUG.NET,
            ARGUMENTS:    BUG.ARGUMENTS || {},
            LOCKLIST:     BUG.LOCKLIST || {},
            AUDIT:        BUG.AUDIT || [],
            EVENTS:       BUG.EVENTS || [],
            ERROR:        BUG.ERROR || undefined,
            WARNING:      BUG.WARNING,
            ORIGIN:       BUG.ORIGIN || '', // dont split this it will cause error
            EXITED:       BUG.EXITED,
            BEFORE:       BUG.BEFORE,
            BEFORE_ERROR: undefined,
            RESULT:       { [(BUG.STEPS || [])[0]]: {}, live: {} },
            FILENAME:     BUG.FILENAME || (ts() + '.json'),
            ONCE:         true,
            DURATION:     (+new Date()) - BUG.START,
            DATE:         +new Date(),
            OPTS:         BUG.OPTS,
            LAST:         GUB.LAST[BUG.OPTS.last],
            ACTIVE:       BUG.ACTIVE,
            SILENT:       BUG.SILENT, // don't log to cockpit?
            // EX_LOG:       BUG.EX_LOG || [], // non-standard value for exchange reversal
            // MN_SUMTOTAL:  BUG.MN_SUMTOTAL || [], // non-standard value for mn on_tx reversal of funds added
            INNER_BUG:    BUG.INNER_BUG,
            OUTER_BUG:    BUG.OUTER_BUG,
            PUSH:         BUG.PUSH
          };
          if (INSPECT) GUB.db.log(BUG, 'BUG.END object rebuilt');
          if (!BUG.INNER_BUG) {
            delete BUG.INNER_BUG;
          }
          else {
            BUG.INNER_BUG.ERROR = BUG.INNER_BUG.ERROR.split(/\n/g);
            BUG.INNER_BUG.ORIGIN = BUG.INNER_BUG.ORIGIN.split(/\n/g);
          }
          if (INSPECT) GUB.db.log(BUG, 'BUG.END error origin');
          if (!BUG.OUTER_BUG) {
            delete BUG.OUTER_BUG;
          }
          else {
            BUG.OUTER_BUG.ERROR = BUG.OUTER_BUG.ERROR.split(/\n/g);
            BUG.OUTER_BUG.ORIGIN = BUG.OUTER_BUG.ORIGIN.split(/\n/g);
          }
          if (INSPECT) GUB.db.log(BUG, 'BUG.END inner outer');
          //
          //
          //
          if (BUG.ERROR) { // fail
            if (INSPECT) GUB.db.log(BUG, 'BUG.END (on fail)');
            GUB.db.log(BUG, 'BUG FOUND: Reverting ... ');
            benz.log('benz errr:', BUG.ERROR, new Error(BUG.ERROR).stack); // todo: wtf 'benz'
            try {
              const dirs = Object.keys(BUG.LOCKLIST);
              (function ___for(i) {
                if (dirs[i]) {
                  const [table, key] = dirs[i].split('/');
                  delete GUB.db['cache'][table][key];
                  GUB.db.unlock(BUG, table, key)
                  .then(() => {
                    GUB.db.execBatch(BUG.ERROR)
                    .then(() => {
                      setTimeout(___for, 0, i + 1);
                    });
                  });
                }
                else { // end
                  ___for = null;
                  return true;
                }
              })(0);
            }
            catch (RECOVER_ERROR) {
              if (INSPECT) GUB.db.log(BUG, 'BUG.END (on fail) catch');
              if (RECOVER_ERROR.stack.indexOf('::SUCCESS;;') == -1) { BUG.RECOVER_ERROR = (typeof RECOVER_ERROR.stack == 'string') ? RECOVER_ERROR.stack.split(/\n/g) : RECOVER_ERROR; }
            }
            finally {
              if (INSPECT) GUB.db.log(BUG, 'BUG.END (on fail) finally');
              function finish() {
                finish = null;
                if (INSPECT) { GUB.db.log(BUG, 'BUG.END finish (on fail)'); }
                ensureBugsPath().then(() => {
                  if (BUG.RECOVER_ERROR) {
                    BUG.RECOVER_ERROR = BUG.RECOVER_ERROR.concat([
                      'NOTE: look at BEFORE and RESULT to see what was changed and try to manually fix'
                      , 'NOTE: other changes may have happened since this error so you cannot simply replace the whole object from BEFORE!'
                    ]);
                    // console.log('this:', this, GUB);
                    GUB.db.log(BUG, 'BUG REVERT FAILED (full report in: ' + BUG.FILENAME + ')');
                    fs.writeFile(path.join(bugsPath, BUG.FILENAME), SAFE.stringify(BUG, undefined, '\t'), 'utf-8').then(() => { // in the same dir as the executable
                      before_cb(BUG);
                    });
                  }
                  else { // write file for dev to pick up
                    BUG.RECOVER_ERROR = 'NO ERROR (SUCCESSFULLY REVERSED)';
                    GUB.db.log(BUG, 'BUG REVERT SUCCESS (full report in: ' + BUG.FILENAME + ')');
                    fs.writeFile(path.join(bugsPath, BUG.FILENAME), SAFE.stringify(BUG, undefined, '\t'), 'utf-8').then(() => { // in the same dir as the executable
                      before_cb(BUG);
                    });
                  }
                });
              } // finish
              if (INSPECT) GUB.db.log(BUG, 'BUG.END update hist? (on fail)');
              if (BUG.ARGUMENTS.remove_from_history_on_fail) shell.exec(BUG.ARGUMENTS.remove_from_history_on_fail);
              if (BUG.ARGUMENTS.remove_from_sent_on_fail) shell.exec(BUG.ARGUMENTS.remove_from_sent_on_fail);
              finish();
            }
          }
          else { // success
            const dirs = Object.keys(BUG.LOCKLIST);
            benz.log('dirs', dirs);
            (function ___for(i) {
              if (dirs[i]) {
                const [table, key] = dirs[i].split('/');
                if (GUB.db.iveLocked(BUG, table, key)) {
                  // Save from cache to CRDT
                  if (GUB.db['cache'][table]?.[key]) { // Update CRDT with data from cache
                    if (GUB.db['cache'][table][key] == 'deleted') {
                      if (db['live'][table][key]) { // only if exists otherwise this is a destruction loop
                        GUB.db.crdt.del(table, key, 'batch').then(() => {
                          GUB.db.deleteLock(BUG, table, key).the(() => { // handles the db batch
                            delete GUB.db['cache'][table][key]; // stop growth
                            setTimeout(___for, 0, i + 1); 
                          });
                        });
                      }
                      else {
                        delete GUB.db['cache'][table][key]; // stop growth
                        setTimeout(___for, 0, i + 1); 
                      }
                    }
                    else {
                      benz.log('happens?', SAFE.stringify(GUB.db['cache'][table][key]), '!=', SAFE.stringify(BUG.BEFORE[dirs[i]]));
                      if (SAFE.stringify(GUB.db['cache'][table][key]) != SAFE.stringify(BUG.BEFORE[dirs[i]])) { // only update the crdt if changed
                        benz.log('happens!');
                        GUB.db.crdt.set(table, key, GUB.db['cache'][table][key], 'batch').then(() => {
                          benz.log('happens!!');
                          GUB.db.unlock(BUG, table, key).then(() => { // handles the db batch
                            delete GUB.db['cache'][table][key]; // stop growth
                            setTimeout(___for, 0, i + 1); 
                          });
                        });
                      }
                      else {
                        GUB.db.unlock(BUG, table, key).then(() => { // handles the db batch
                          delete GUB.db['cache'][table][key]; // stop growth
                          setTimeout(___for, 0, i + 1); 
                        });
                      }
                    }
                  }
                }
                else setTimeout(___for, 0, i + 1); 
              }
              else { // end
                ___for = null;
                GUB.db.execBatch().then(() => {
                  (function ___evs(i) {
                    if (BUG.EVENTS[i]) {
                      EVENT({ NET: 'live' }, BUG.EVENTS[i]);
                      setTimeout(___evs, 0, i + 1);
                    }
                    else { // end
                      ___evs = null;
                      before_cb(BUG);
                    }
                  })(0);
                });
              }
            })(0);
          }
        }
      }
    }
  }
};





function randomTime(max) {
  return (+new Date()) + Math.floor(Math.random() * (max - max * 0.5) + max * 0.5); // milliseconds ahead of now of a random value within that time frame window!
};




async function _ypearDatabase(router, options, resolve) {
  const cc = require('@ypear/currency');
  const timing = require('@ypear/timing');
  router.updateOptions({ Y: require('yjs') });
  const Y = router.options.Y;
  const doc = new Y.Doc();
  const publicKey = router.options.publicKey;
  const races = doc.getMap('races');
  const locks = doc.getMap('locks');
  // about: ##queIndexes these stop the db from being jammed and alow peers to find crashed users locks and active races and delete them
  const queueIndexs = doc.getMap('enqueued');
  let enqueued = queueIndexs.get(publicKey);
  if (!enqueued) {
    enqueued = new Y.Array();
    queueIndexs.set(publicKey, enqueued);
  }
  let db;
  const temp = {
    cache: {}
  };
  let cancel = { publicKey: 'timeout' }; // peerClose handlers (to recover when a peer disconnects early) this times you out of random into concensus
  let userbase = false;
  if (router.options?._userbase) userbase = router.options._userbase;
  // the rules should be ether hardcoded into the apps code or softcoded in the seed user's hypercore with the location hard coded
  let rules = false;
  // todo: userbase got not get!
  if (typeof options.rules == 'string' && userbase) {
    JSON.parse(await userbase.get('seed', options.rules)); // load from a hypercore via userbase `${options.topic}#rules` coin/unspent#rules
  }
  else if (!options.rules) throw new Error('options rules is required to create the tables'); // object

  // inject this db as part of the router
  router.updateOptionsCache({
    [options.topic]: {
      synced: false,
      sync: async (forPeers, topic) => { // Add this function to the createSwarm function
        console.log(router.options.username, 'syncing ...');
        await forPeers({ meta: 'ready', publicKey, stateVector: Y.encodeStateVector(doc) });
        return new Promise((resolve) => {
          if (router.options.cache[topic].synced) { // If already synced, resolve immediately
            resolve();
            return;
          }
          const checkSync = () => { // Otherwise, create a function to check sync status periodically
            if (router.options.cache[topic].synced) {
              console.log(router.options.username, 'is synced!');
              resolve();
            } else {
              setTimeout(checkSync, 50); // Check again after a short delay
            }
          };
          checkSync(); // Start checking
        });
      },
      peerStateVectors: {},
      updateStateVector: (publicKey, topic) => {
        const vector = Y.encodeStateVector(doc);
        router.options.cache[topic].peerStateVectors[publicKey] = vector;
        return Y.encodeStateAsUpdateV2(doc, vector);
      },
      setPeerStateVector(publicKey, vector, topic) { 
        if (!router.options.cache?.[topic].peerStateVectors) router.options.cache[topic].peerStateVectors = {};
        router.options.cache[topic].peerStateVectors[publicKey] = vector; 
      },
      // peerClose (if not got by a propagation then 64 peers will see the close and propagate the peer cleanup)
      // this is done automatically by the router
      // and canceled by receiving the propagation 'cleanup:done-no-action-required'
      peerClose: async function(peersPublicKey) { // is ether triggered by the router connection.onClose or by a propagate meta: cleanup for remote public key
        if (router.options.cache[options.topic].peerStateVectors[peersPublicKey]) { // task is to make sure the first person who sees it cleans it up for everyone
          delete router.options.cache[options.topic].peerStateVectors[peersPublicKey];
          let queueIndex = queueIndexs.get(peersPublicKey);
          if (queueIndex) {
            timing.every('nextSecond', async() => { // consensus first
              cancel[peersPublicKey] = setTimeout(async () => { // initial wait
                clearTimeout(cancel[peersPublicKey]);
                cancel[peersPublicKey] = setTimeout(async () => { // quick-wait, maybe all cleaned up by now ???
                  clearTimeout(cancel[peersPublicKey]);
                  queueIndex = queueIndexs.get(peersPublicKey); // check again after delay
                  if (queueIndex) { // should all be cleaned up by ether the peer or the first who sees them go (and gets here!)
                    const enqueued = queueIndex.toArray();
                    doc.transact(() => {
                      if (enqueued.length) {
                        const races = doc.getMap('races');
                        for (const dir of enqueued) {
                          const ix = enqueued.toArray().indexOf(dir);
                          if (ix !== -1) enqueued.delete(ix, 1);
                          const [table, key] = dir.split('/');
                          const $table = races.get(table);
                          const race = $table.get(key);
                          const a = race.toArray();
                          const i = a.findIndex(val => val.publicKey === peersPublicKey);
                          if (i !== -1) race.delete(i, 1);
                        }
                      } 
                      queueIndexs.delete(peersPublicKey); // see: ##queIndexes
                      const locks = doc.getMap('locks');
                      const matchingKeys = [...locks.keys()].filter(key => key.endsWith('#' + peersPublicKey));
                      for (const lock of matchingKeys) {
                        locks.delete(lock);
                      }
                    }); // end of doc.transact
                    const update = Y.encodeStateAsUpdateV2(doc);
                    await broadcast({ update, publicKey: peersPublicKey, meta: 'cleanup:done-no-action-required' });
                  }
                }, randomTime(369)); // enough of a random pause to ensure that only the first that sees it cleans it up
              }, randomTime(9630));
            }); // timing end
          } else clearTimeout(cancel[peersPublicKey]);
        } else clearTimeout(cancel[peersPublicKey]);
      },
      // selfClose happens in the router ##selfClose
      selfClose: async function(publicKey) { // the hope is that you will complete this task before you leave (if not someone else will do it for you)
        doc.transact(() => {
          if (enqueued.length) {
            const races = doc.getMap('races');
            for (const dir of enqueued) {
              const ix = enqueued.toArray().indexOf(dir);
              if (ix !== -1) enqueued.delete(ix, 1);
              const [table, key] = dir.split('/');
              const $table = races.get(table);
              const race = $table.get(key);
              const a = race.toArray();
              const i = a.findIndex(val => val.publicKey === publicKey);
              if (i !== -1) race.delete(i, 1);
              
            }
          } 
          queueIndexs.delete(publicKey); // see: ##queIndexes
          const locks = doc.getMap('locks');
          const matchingKeys = [...locks.keys()].filter(key => key.endsWith('#' + publicKey));
          for (const lock of matchingKeys) {
            locks.delete(lock);
          }
        }); // end of doc.transact
        const update = Y.encodeStateAsUpdateV2(doc);
        await broadcast({ update, publicKey, meta: 'cleanup:done-no-action-required' }); // leaving quick so set propagate in motion but don't wait for it to complete ...
      }
    }
  });

  
  if (!router.started) await router.start(router.options.networkName);
  console.log(`${router.options.username} joined`);

  EVENT = await require('@ypear/events.js')(router, {
    topic: options.topic + '-ev',
    forWho: options.events.forWho,
    display: options.events.display
  });
  

  
  const [propagate, broadcast,, toPeer] = await router.alow(options.topic, async function handler(d) { // deal with the update ...
    console.log(`${router.options.username} got updated`, d.meta);
    if (d.update) Y.applyUpdateV2(doc, d.update); // also handles cleanup on users end
    if (d.crdt) await crdt.onData(d.crdt); // pass a bulk update to the crdt in same propagation
    else if (d.meta == 'sync' && !router.options.cache[options.topic].synced) router.options.cache[options.topic].synced = true;
    else if (d.meta == 'cleanup') await router.options.cache[options.topic].peerClose(d.publicKey); // you might become the propagator if they havent cleaned up already 
    else if (d.meta == 'cleanup:done-no-action-required') clearTimeout(cancel[d.publicKey]); // cancel you being the fallover update propagator because someone else beat you to it and saw it first!
    else if (d.meta == 'ready' && router.options.cache[options.topic].synced) {
      console.log(`${router.options.username} is the syncer`);
      const update = Y.encodeStateAsUpdateV2(doc, d.stateVector);
      router.options.cache[options.topic].setPeerStateVector(d.publicKey, Y.encodeStateVector(doc), options.topic);
      await toPeer(d.publicKey, { update, meta: 'sync' });
    }
    else console.log(router.options.username, 'nothing meta to do.'); // tdo: for debugging only
  });







  // Wait for database to be synced before loading CRDT
  await new Promise((resolve) => {
    const checkSync = () => {
      if (router.options.cache[options.topic].synced) {
        console.log(`${router.options.username} database is synced, loading CRDT...`);
        resolve();
      } else {
        setTimeout(checkSync, 100);
      }
    };
    checkSync();
  });


  const ypearCRDT = require('@ypear/crdt.js');
  const crdt = await ypearCRDT(router, {
     topic: `${options.topic}-db`,
     leveldb: `./${options.topic}-db`
   });


  // Wait for CRDT to be synced as well
  await new Promise((resolve) => {
    const checkCRDTSync = () => {
      if (router.options.cache[`${options.topic}-db`]?.synced) {
        console.log(`${router.options.username} CRDT is synced!`);
        resolve();
      } else {
        setTimeout(checkCRDTSync, 100);
      }
    };
    checkCRDTSync();
  });


  // initial table creation:
  rules = doc.getMap('rules');
  doc.transact(() => {
    for (const [tableOrDir, rule] of Object.entries(options.rules)) { // can be 'table' or dir 'table/key'
      if (!rules.has(tableOrDir)) rules.set(tableOrDir, rule);
      if (!tableOrDir.includes('/')) {
        const table = tableOrDir;
        if (!races.has(table)) races.set(table, new Y.Map());
      }
    }
  });
  


  // ..........................................
  // database is ready so lets add our methods:




  // Create a Y.doc.transaction queue
  const batched = [];

  // Function to execute all queued transactions in a single transaction
  async function execBatch(gubFail) {
    benz.log('execBatch?');
    if (batched.length === 0) return;
    benz.log('execBatch!');
    doc.transact(async () => {
      for await (const operation of batched) await operation();
    });
    batched.length = 0; // Clear the queue after execution
    const update = Y.encodeStateAsUpdateV2(doc);
    if (gubFail) await propagate({ update, meta: 'batch' });
    else {
      const crdtUpdate = await crdt.execBatch(true);
      benz.log('afterward?');
      await propagate({ update, meta: 'batch', crdt: crdtUpdate });
    }
  }





  // utility function to deep clone objects (not circular)        
  function copy(obj) {
    benz.log(obj, typeof obj);
    // todo: these should always be {}
    if (!obj) return {};
    return JSON.parse(SAFE.stringify(obj));
  }



  // this is for checking if a key is locked by any peer
  function isLocked(BUG, table, key) { // its generally blocked (maybe by you, maybe by someone else)
    const dir = `${table}/${key}`;
    const $table = races.get(table);
    if (iveLocked(BUG, table, key)) return false; // because it's not blocked, its unlocked by you!
    else if (!$table?.has(key)) { // if !race (deleted or new) and !bug.before so say it is not locked!
      return !!BUG.BEFORE[dir]; // return false if BUG.BEFORE[dir] doesn't exist (this is case: new) bug.before would be { deleted: 'error' }
    }
    else {
      const race = $table.get(key);
      const a = race.toArray();
      if (!a[0]) return false;
      return locks.get(table + '|' + key + '#' + a[0].publicKey); // false or locks[races[0]locksKey]: `db.can[${BUG.NET}][${table}][${key}] at ${caller} ${date()}` returns string
      // because you lock things at BUG.NET != 'live' the lock will reveal your random session id matching your temp network
    }
  }


  



  // this is for checking if a key is locked by you
  function iveLocked(BUG, table, key) {
    const dir = `${table}/${key}`;
    const $table = races.get(table);
    if (!$table?.has(key)) { // if !race (deleted or new) and !bug.before says you have locked
      return !BUG.BEFORE[dir]; // return true if BUG.BEFORE[dir] doesn't exist (this is case: new) bug.before would be { deleted: 'error' }
    }
    else { // if race exists
      const race = $table.get(key);
      const a = race.toArray();
      if (!a.length) return false;
      return a[0].publicKey === publicKey; // boolean and it's you!
    }
  }






  // this is used for deleting a lock when a key is deleted. 
  async function deleteLock(BUG, table, key) {
    const mine = db.iveLocked(BUG, table, key);
    if (!mine) {
      GUB.END(BUG, 'cant delete someone elses lock');
      throw false;
    }
    else {
      const dir = `${table}/${key}`;
      const $table = races.get(table);
      if ($table.has(key)) {
        batched.push(async () => { // batching
          const ix = enqueued.toArray().indexOf(dir);
          if (ix !== -1) enqueued.delete(ix, 1);
          $table.delete(key);
          locks.delete(dir + '#' + publicKey);
        });
      }
    }
  }





  // this is used for internally for unlocking a key (also is drained when a key is deleted)
  async function unlock(BUG, table, key) { // unlock an item
    const dir = `${table}/${key}`;
    const $table = races.get(table);
    if (!$table?.has(key)) { // race got deleted
      batched.push(async () => { // batching
        const ix = enqueued.toArray().indexOf(dir);
        benz.log('ix', ix, dir);
        if (ix !== -1) enqueued.delete(ix, 1);
        locks.delete(dir + '#' + publicKey);
      });
    }
    else { // race exists
      const race = $table.get(key);
      const a = race.toArray();
      const mine = db.iveLocked(BUG, table, key);
      if (!mine) {
        GUB.END(BUG, 'cant unlock someone elses lock');
        throw false;
      }
      else { // you have the lock (race[0])
        batched.push(async () => { // batching
          const ix = enqueued.toArray().indexOf(dir);
          if (ix !== -1) enqueued.delete(ix, 1);
          const pos = a.findIndex(event => event.publicKey === publicKey);
          if (pos !== -1) race.delete(pos, 1);
          locks.delete(dir + '#' + publicKey);
        });
      }
    }
  }






  // the db.can lock is used for locking a key that exists first (dont db.can on things that exist!)
  async function lock(BUG, table, key, caller, cb) { // fww
    caller = new Error().stack.replace('Error', router.options.username); // todo: why is caller an arg if its always reset?
    if (!races.has(table)) races.set(table, new Y.Map()); // new table
    const $table = races.get(table);
    if (!$table.has(key)) $table.set(key, new Y.Array()); // new key
    const race = $table.get(key); // the race
    const dir = `${table}/${key}`; // generalize 
    const matchingKeys = [...locks.keys()].filter(key => key.startsWith(dir + '#')); // are locks blocking?
    doc.transact(() => {
      race.push([{ id: router.options.username, publicKey, timestamp: Date.now() }]);
      if (!enqueued.toArray().includes(dir)) enqueued.push([dir]);
      locks.set(dir + '#' + publicKey, `db.can[${BUG.NET}][${table}][${key}] at ${caller} ${date()}`);
    });
    const update = Y.encodeStateAsUpdateV2(doc);
    await propagate({ update }); // with propagation ... (is only on this level of the network so it's ok!)
    timing.checkEvery('nextSecond', 100, async (timestamp) => { // force wait incase of array timestamp reorg
      const a = race.toArray();
      console.log(router.options.username, '... checking now', a);
      if (a.some(entry => entry.publicKey === publicKey)) { // check if you are actually in the queue
        if (a[0]?.publicKey === publicKey && !matchingKeys.length) { // you are first and no one is blocking
          console.log(router.options.username, 'clicked', matchingKeys.length);
          db.log(BUG, `db.can[${BUG.NET}][${table}][${key}] GO! >#>${caller}<#<`);
          await job(BUG, table, key, caller, race, cb); // do your job and then unlock it
        }
        else { // you are not first, so queue!
          console.log(router.options.username, 'queuing', matchingKeys.length);
          await enqueue(BUG, table, key, caller, race, cb);
        }
      } // you're not in the race queue at all!
      else { // your push was superseedded by someone else on the exact millisecond
        console.log(router.options.username, 'superseedded', matchingKeys.length);
        await lock(BUG, table, key, caller, cb);
      }
    });
  }
  




  // the db.can enqueue is used for when you are forced to queue yourself on a key until it is available
  async function enqueue(BUG, table, key, caller, race, cb) {
    let deleted = !db['live'][table][key];
    if (deleted || race.toArray()[0]?.id === router.options.username) await job(BUG, table, key, caller, (deleted? undefined : race), cb); // check first if it got altered before your observer
    else {
      const dir = `${table}/${key}`;
      BUG.TIME[dir] = [(+new Date()) + 46368, `db.can[${BUG.NET}][${table}][${key}] (QUEUED) THIS IS STILL BLOCKED, DID THE JOB LAST TOO LONG? >#>${caller}<#< (¿Blocked by `];
      const change = race.toArray();
      if (BUG.OPTS && typeof BUG.OPTS.call == 'string') BUG.ADDTIME(change.length * 2000); // can be done externally
      db.log(BUG, `db.can[${BUG.NET}][${table}][${key}] ... QUEUED [${change.length}] >#>${caller}<#< (Blocked by ${db.isLocked(BUG, table, key)}?)`);
      // test: what happens if the race is deleted while observing
      const observer = async () => {
        console.log(router.options.username, 'saw queue changed ...');
        deleted = !db['live'][table][key];
        if (change[0]?.id == router.options.username || deleted) { // 1-by-1 or drain whole queue if key gets deleted 
          race.unobserve(observer);
          await job(BUG, table, key, caller, (deleted? undefined : race), cb);
        }
      }
      race.observe(observer);
    }
  };



  function before(BUG, table, key) {
    const dir = `${table}/${key}`;
    if (BUG.NET == 'live') BUG.LOCKLIST[dir] = true;
    if (BUG.BEFORE && Object.keys(BUG.BEFORE[BUG.NET]).indexOf(dir) == -1) { // not seen (need to snapshot)
      benz.log('befored?', dir);
      BUG.BEFORE[BUG.NET][dir] = copy(db['cache'][table][key]); // temp uses session's cache
    }
  }
  

  // this happens if:
  // 1: there is noone in the race queue
  // 2: you were next in line
  // 3: the item got deleted when you were queued so it is { deleted }
  // 5: you created it in the current session
  // 6: error: you asked to lock it with db.can but it never existed first! :error
  async function job(BUG, table, key, caller, race, cb) { // todo it's like the cache is nolonger being created (not the table!)
    if (BUG.NET !== 'live') { // note: only happens at bug start!
      const CACHE = (BUG.NET == 'live') ? 'cache' : BUG.NET;
      if (db[CACHE][table]?.[key]) {
        db.log(BUG, `db[${CACHE}][${table}][${key}] alowed to modify because, you have modified this new item previously!`);
      }
      else if (!db['live'][table]?.[key]) { // this is something that is deleted and will only happen if you try to lock it with db.can
        const deleted = 'YpearDatabase error: altering deleted/no-exist item - bug thrown because db.can was used';
        benz.log('temp:', temp);
        temp['cache'][table][key] = { deleted }; // todo wtf?
        temp[BUG.NET][table][key] = { deleted };
      }
      else { // this is an old item that was here before you started
        if (!temp['cache'][table][key]) {
          temp['cache'][table][key] = copy(db['live'][table][key]); // this will grow ...
        }
        temp[BUG.NET][table][key] = (temp['cache'][table][key] ? copy(temp['cache'][table][key]) : copy(db['live'][table][key]));
      }
    }
    const dir = `${table}/${key}`;
    BUG.TIME[dir] = [(+new Date()) + 46368, `db.can[${BUG.NET}][${table}][${key}] NEVER UNBLOCKED, DID THE JOB LAST TOO LONG? >#>${caller}<#< (¿Blocked by self `];
    before(BUG, table, key);
    console.log(router.options.username, 'doing job and removing self from queue ...', (!race ? [] : race.toArray()));
    await cb(BUG); // the db.can job may entail locking other things so the nested function may gather other nested functions
  };

  

  



  function log(BUG, d) {
    /*
    if (typeof d == 'string' && d.indexOf('(Too Long To Log)') !== -1) {
      d = d.split(']=');
      d[1] = d[1].split('>#>')[1];
      d = d[0] + ']=(Too Long To Log) >#>' + d[1];
    }
      */
    d = d.replace(/>#>/g, ' > ').replace(/<#</g, '');
    if (BUG?.AUDIT) { BUG.PUSH(d); }
    else console.log(d);
  }



  


  // this is used for when you force yourself to queue on a key until it is available
  // use this when you want to do a job that requires a lock (ie: you have proven the item exists!)
  // if it exists: GUB will throw a bug if you try to modify it!
  // if it does not exist, you can still do your job!
  async function can(BUG, table, key, caller /* todo: why is this an object in testing.js? */, cb) {
    db.log(BUG, `db.can[${BUG.NET}][${table}][${key}] ... >#>${caller}<#<`);
    if (typeof table !== 'string' || typeof key !== 'string' || typeof caller !== 'string' || typeof cb !== 'function') {
      GUB.END(`malformed params: table=${(typeof table)} key=${(typeof key)} caller=${(typeof caller)} cb=${(typeof cb)}`);
      throw false;
    }
    const $table = races.get(table) || { has: () => undefined }; // todo: detect or more likly prevent is undefined
    if (!$table?.has(key)) await job(BUG, table, key, caller, undefined, cb); // deleted! can do job but will throw bug if they alter no-exist/deleted key
    else {
      const race = $table.get(key);
      const blocker = db.isLocked(BUG, table, key); // who has lock
      const mine = db.iveLocked(BUG, table, key);
      if (BUG.NET !== 'live') {
        if (blocker) await db.enqueue(BUG, table, key, caller, race, cb); // enqueue because you don't have the lock
        else await db.lock(BUG, table, key, caller, cb);
      }
      else if (BUG.NET == 'live' && mine && blocker?.includes(BUG.STEPS[0])) { // was locked on your temp net
        await job(BUG, table, key, caller, race, cb);
      }
      else {
        GUB.END(BUG, `YpearDatabase warning: db.can BUG.NET=${BUG.NET} BUG.STEPS=${BUG.STEPS.join(',')} blocker=${blocker} blocker is not yours`);
        throw false;
      }
    }
  }





  // allows for security
  // this has expectations
  // and it also works with rules to be applied as a db template
  // in-other-words; rules should be defined on network creation (you should know the structure you want to enforce before hand!)
  // rules are optional but the expectations here are default
  function protected(BUG, table, key, settings) {
    const dir = `${table}/${key}`;
    let rule; // = { owner: 'publicKey', 'reward/benz': { negAlow: true, owner: 'publicKey' } };
    if (rules.has(dir)) rule = rules.get(dir);
    else if (rules.has(table)) rule = rules.get(table);
    else rule = {};
    if (settings.mode == 'del') {
      if ([undefined, publicKey].includes(rule.owner)) return true;
      else {
        GUB.END(BUG, `deletiontion prevented for db[${table}][${key}]`);
        throw false;
      }
    }
    else if (settings.mode == 'sum') {
      const x = copy(settings.x);
      const before = settings.before || '0';
      const after = copy(settings.after);
      const oftype = typeof after;
      if (typeof before == 'string' && /^-?\d+(\.\d+)?$/.test(before)) {
        if (oftype != 'string') {
          GUB.END(BUG, `cc sum prevented for db[${table}][${key}] (answer: ${after} typeof: ${oftype})`);
          throw false;
        }
        else if (rule[x.join('/')]?.negAlow && /^-?\d+(\.\d+)?$/.test(after)) return true;
        else if (/^\d+(\.\d+)?$/.test(after)) {
          if ([undefined, publicKey].includes(/*rule.owner || */rule[x.join('/')]?.owner)) return true;
          else {
            GUB.END(BUG, `cc sum prevented for db[${table}][${key}] (answer: ${after} typeof: ${oftype} why: !owner)`);
            throw false;
          }
        }
        else {
          GUB.END(BUG, `cc sum prevented for db[${table}][${key}] (answer: ${after} typeof: ${oftype})`);
          throw false;
        }
      }
      else {
        GUB.END(BUG, `cc sum prevented for db[${table}][${key}] (answer: ${after} typeof: ${oftype} why: tried sum on NaN type)`);
        throw false;
      }
    }
    else if (settings.mode == 'mod') {
      const x = copy(settings.x);
      const before = settings.before || '0';
      const answer = copy(settings.answer);
      if (![undefined, typeof before].includes(typeof answer)) {
        GUB.END(BUG, `mod prevented for db[${table}][${key}] why: tried to switch existing type`);
        throw false;
      }
      else if (/^-?\d+(\.\d+)?$/.test(answer)) {
        GUB.END(BUG, `mod prevented for db[${table}][${key}] why: use db.sum not db.mod`);
        throw false;
      }
      else if ([undefined, publicKey].includes(/*rule.owner || */rule[x.join('/')]?.owner)) return true;
      else {
        GUB.END(BUG, `mod prevented for db[${table}][${key}] (why: !owner)`);
        throw false;
      }
    }
    else if (settings.mode == 'cut') {
      const x = copy(settings.x);
      if ([undefined, publicKey].includes(/*rule.owner || */rule[x.join('/')]?.owner)) return true;
      else {
        GUB.END(BUG, `cut prevented for db[${table}][${key}] (why: !owner)`);
        throw false;
      }
    }
    else {
      GUB.END(BUG, `protection bounced for db[${table}][${key}] (why: missing { mode: 'del|sum|mod|cut' } for protected call)`);
      throw false;
    }
  }








  // free up something changed back to it's original state (undo all session actions) and reset it to before you created or used it
  function fre(BUG, t, k, note) {
    const CACHE = (BUG.NET == 'live') ? 'cache' : BUG.NET;
    // todo: this should let you use something in your cache net then drop it
    // todo: it should reset to bug before
    // todo: GUB.END should not need to change this even if successful
  }








  // this is used for deleting an item
  function del(BUG, t, k, note) { // t: table, k: key
    before(BUG, t, k);
    const CACHE = (BUG.NET == 'live') ? 'cache' : BUG.NET;
    const unlocked = db.iveLocked(BUG, t, k);
    if (!unlocked) {
      GUB.END(BUG, `YpearDatabase warning: db.del unlocked=${unlocked} blocker is not yours`);
      throw false;
    }
    else if (db[CACHE][t]?.[k]?.deleted) {
      GUB.END(BUG, db[CACHE][t][k].deleted); // it is aware the db.can happened or didn't
      throw false;
    }
    else if (typeof t !== 'string' || typeof k !== 'string' || !['string', 'undefined'].includes(typeof note)) {
      GUB.END(BUG, `malformed params: table=${(typeof t)} key=${(typeof k)} note=${(typeof note)} ${note}`);
      throw false;
    }
    else if (!db[CACHE][t]) { // if the item does not exist, an error is logged and the db.mode function is called.
      GUB.END(BUG, `db.del[${BUG.NET}][${t}] table NO EXIST >#>${note}<#< ${(new Error().stack.replace('Error', ':'))}`);
      throw false;
    }
    else if (!db[CACHE][t][k]) {
      db.log(BUG, `db.del[${BUG.NET}][${t}][${k}] _id NO EXIST >#>${note}<#< ${(new Error().stack.replace('Error', ':'))}`);
      return false; // todo: should this throw instead?
    }
    else {
      protected(BUG, t, k, { mode: 'del' });
      db[CACHE][t][k] = `deleted`; // mark to delete
      db.log(BUG, `db[${CACHE}][${t}][${k}] del${(note && ' ' + note)}`);
      return true;
    }
  }


  

  
  
  
  // this is used for adding or subtracting a value from an item
  function sum(BUG, t, k, x, operator, input, note) { // t: table, k: key
    before(BUG, t, k);
    const CACHE = (BUG.NET == 'live') ? 'cache' : BUG.NET;
    const unlocked = db.iveLocked(BUG, t, k);
    if (!unlocked) {
      GUB.END(BUG, `YpearDatabase warning: db.sum unlocked=${unlocked} blocker is not yours`);
      throw false;
    }
    else if (typeof t !== 'string' || typeof k !== 'string' || !Array.isArray(x) || typeof operator !== 'string' || typeof input !== 'string' || !['string', 'undefined'].includes(typeof note)) {
      GUB.END(BUG, `malformed params: table=${(typeof t)} key=${(typeof k)} x=${(typeof x)} operator=${(typeof operator)} input=${(typeof input)} note=${(typeof note)} ${note}`);
      throw false;
    }
    else if (db[CACHE][t]?.[k]?.deleted) {
      GUB.END(BUG, db[CACHE][t][k].deleted); // it is aware the db.can happened or didn't
      throw false;
    }
    else if (!['add', 'sub'].includes(operator)) {
      GUB.END(BUG, `db.sum operator must be 'add' or 'sub'`);
      throw false;
    }
    else {
      let before, after;
      if (x[4] !== undefined) {
        before = copy(db[CACHE][t][k][x[0]][x[1]][x[2]][x[3]][x[4]] || '0');
        db[CACHE][t][k][x[0]][x[1]][x[2]][x[3]][x[4]] = cc[operator](before, input);
        after = copy(db[CACHE][t][k][x[0]][x[1]][x[2]][x[3]][x[4]]);
      }
      else if (x[3] !== undefined) {
        before = copy(db[CACHE][t][k][x[0]][x[1]][x[2]][x[3]] || '0');
        db[CACHE][t][k][x[0]][x[1]][x[2]][x[3]] = cc[operator](before, input);
        after = copy(db[CACHE][t][k][x[0]][x[1]][x[2]][x[3]]);
      }
      else if (x[2] !== undefined) {
        before = copy(db[CACHE][t][k][x[0]][x[1]][x[2]] || '0');
        db[CACHE][t][k][x[0]][x[1]][x[2]] = cc[operator](before, input);
        after = copy(db[CACHE][t][k][x[0]][x[1]][x[2]]);
      }
      else if (x[1] !== undefined) {
        before = copy(db[CACHE][t][k][x[0]][x[1]] || '0');
        db[CACHE][t][k][x[0]][x[1]] = cc[operator](before, input);
        after = copy(db[CACHE][t][k][x[0]][x[1]]);
      }
      else if (x[0] !== undefined) {
        before = copy(db[CACHE][t][k][x[0]]);
        db[CACHE][t][k][x[0]] = cc[operator](before, input);
        after = copy(db[CACHE][t][k][x[0]]);
      }
      else {
        before = copy(db[CACHE][t][k] || '0');
        db[CACHE][t][k] = cc[operator](before, input);
        after = copy(db[CACHE][t][k]);
      }
      benz.log('cc', { mode: 'sum', x, before, after });
      protected(BUG, t, k, { mode: 'sum', x, before, after });
      db.log(BUG, `db[${CACHE}][${t}][${k}][${x.toString().replace(/,/g, '][')}] ${(operator == 'add' ? '+' : '-')} (before: ${before} + input: ${input} = ${after} :after) sum${(note ? ' ' + note : '')} `);
      return after;
    }
  }
  
  
  

  // this is used for modifying an item
  // this is also the only way of creating an item (dont wait for db.can if you want to create)
  // if it exists it will modify
  // if it does not exist it will create
  function mod(BUG, t, k, x, answer, note) { // t: table, k: key
    before(BUG, t, k);
    const CACHE = (BUG.NET == 'live') ? 'cache' : BUG.NET;
    benz.log('db[CACHE]', db[CACHE]);
    const unlocked = db.iveLocked(BUG, t, k);
    if (!unlocked) {
      GUB.END(BUG, `YpearDatabase warning: db.mod unlocked=${unlocked} blocker is not yours`);
      throw false;
    }
    else if (typeof t !== 'string' || typeof k !== 'string' || !Array.isArray(x) || !['number', 'string', 'boolean', 'object'].includes(typeof answer) || !['string', 'undefined'].includes(typeof note)) {
      GUB.END(BUG, `malformed params: table=${(typeof t)} key=${(typeof k)} x=${(typeof x)} answer=${(typeof answer)} note=${(typeof note)} ${note}`);
      throw false;
    }
    else if (db[CACHE][t]?.[k]?.deleted) {
      GUB.END(BUG, db[CACHE][t][k].deleted); // it is aware the db.can happened or didn't
      throw false;
    }
    else {
      let before;
      if (x[4] !== undefined) {
        before = copy(db[CACHE][t][k][x[0]][x[1]][x[2]][x[3]][x[4]]);
        db[CACHE][t][k][x[0]][x[1]][x[2]][x[3]][x[4]] = answer;
      }
      else if (x[3] !== undefined) {
        before = copy(db[CACHE][t][k][x[0]][x[1]][x[2]][x[3]]);
        db[CACHE][t][k][x[0]][x[1]][x[2]][x[3]] = answer;
      }
      else if (x[2] !== undefined) {
        before = copy(db[CACHE][t][k][x[0]][x[1]][x[2]]);
        db[CACHE][t][k][x[0]][x[1]][x[2]] = answer;
      }
      else if (x[1] !== undefined) {
        before = copy(db[CACHE][t][k][x[0]][x[1]]);
        db[CACHE][t][k][x[0]][x[1]] = answer;
      }
      else if (x[0] !== undefined) {
        before = copy(db[CACHE][t][k][x[0]]);
        db[CACHE][t][k][x[0]] = answer;
      }
      else {
        before = copy(db[CACHE][t][k]);
        db[CACHE][t][k] = answer;
      }
      protected(BUG, t, k, { mode: 'mod', x, before, answer });
      db.log(BUG, `db[${CACHE}][${t}][${k}][${x.toString().replace(/,/g, '][')}] (answer: ${JSON.stringify(answer)}) mod${(note ? ' ' + note : '')}`);
      return true;
    }
  }
  
  



  // this is used for deleting an item object by key
  // todo: it will not delete the item if it does not exist
  function cut(BUG, t, k, x, note) { // t: table, k: key
    before(BUG, t, k);
    const CACHE = (BUG.NET == 'live') ? 'cache' : BUG.NET;
    const unlocked = db.iveLocked(BUG, t, k);
    let key;
    if (!unlocked) {
      GUB.END(BUG, `YpearDatabase warning: db.cut unlocked=${unlocked} blocker is not yours`);
      throw false;
    }
    else if (typeof t !== 'string' || typeof k !== 'string' || !Array.isArray(x) || !['string', 'undefined'].includes(typeof note)) {
      GUB.END(BUG, `malformed params: table=${(typeof t)} key=${(typeof k)} x=${(typeof x)} note=${(typeof note)} ${note}`);
      throw false;
    }
    else if (db[CACHE][t]?.[k]?.deleted) {
      GUB.END(BUG, db[CACHE][t][k].deleted); // it is aware the db.can happened or didn't
      throw false;
    }
    else {
      if (x[4] !== undefined) {
        key = copy(db[CACHE][t][k][x[0]][x[1]][x[2]][x[3]][x[4]]);
        delete db[CACHE][t][k][x[0]][x[1]][x[2]][x[3]][x[4]];
      }
      else if (x[3] !== undefined) {
        key = copy(db[CACHE][t][k][x[0]][x[1]][x[2]][x[3]]);
        delete db[CACHE][t][k][x[0]][x[1]][x[2]][x[3]];
      }
      else if (x[2] !== undefined) {
        key = copy(db[CACHE][t][k][x[0]][x[1]][x[2]]);
        delete db[CACHE][t][k][x[0]][x[1]][x[2]];
      }
      else if (x[1] !== undefined) {
        key = copy(db[CACHE][t][k][x[0]][x[1]]);
        delete db[CACHE][t][k][x[0]][x[1]];
      }
      else if (x[0] !== undefined) {
        key = copy(db[CACHE][t][k][x[0]]);
        delete db[CACHE][t][k][x[0]];
      }
      else key = false;
    }
    protected(BUG, t, k, { mode: 'cut', x });
    db.log(BUG, `db[${CACHE}][${t}][${k}][${x.toString().replace(/,/g, '][')}] cut${(note ? ' ' + note : '')}`);
    return key;
  }












  // Create the API object with no prototype inheritance
  const internalApi = Object.create(null, {
    isYpearDatabase: { value: true },
    topic: { value: options.topic },
    enqueue: { value: enqueue },
    job: { value: job },
    isLocked: { value: isLocked },
    iveLocked: { value: iveLocked },
    lock: { value: lock },
    unlock: { value: unlock },
    deleteLock: { value: deleteLock },
    log: { value: log },
    can: { value: can },
    del: { value: del },
    sum: { value: sum },
    mod: { value: mod },
    cut: { value: cut },
    crdt: { value: crdt },
    temp: { value: temp },
    router
  });

  // Create the internal proxy with full access
  const internalProxy = new Proxy(internalApi, {
    get(target, prop) {
      if (prop === 'live') return target.crdt.c; // Special case for 'live' to match your database structure
      // Handle temporary networks (random identifiers)
      if (temp[prop]) {
        // Return a proxy for the temporary network to handle nested access
        return new Proxy(temp[prop], {
          get(networkObj, tableProp) {
            // Handle access to tables within the temporary network
            if (networkObj[tableProp]) {
              // Return a proxy for the table to handle key access
              return new Proxy(networkObj[tableProp], {
                get(tableObj, keyProp) {
                  return tableObj[keyProp];
                },
                set(tableObj, keyProp, value) {
                  tableObj[keyProp] = value;
                  return true;
                }
              });
            }
            return undefined;
          },
          set(networkObj, tableProp, value) {
            networkObj[tableProp] = value;
            return true;
          }
        });
      }
      if (prop in target) return target[prop]; // For all other properties, just return them from the API if they exist
      return undefined; // If not found anywhere, return undefined
    }
  });

  // Assign to db for internal use
  db = internalProxy;




  // Create a limited external API
  const externalApi = Object.create(null, {
    isYpearDatabase: { value: true },
    topic: { value: options.topic }, 
    router: {
      value: router,
      enumerable: false
    },
    //; Only expose selected methods for external use:
    // methods:
    log: { value: log },
    can: { value: can },
    del: { value: del },
    sum: { value: sum },
    mod: { value: mod },
    cut: { value: cut },
    isLocked: { value: isLocked },
    iveLocked: { value: iveLocked },
    // hidden things:
    unlock: { 
      value: unlock, 
      enumerable: false
    },
    deleteLock: {
      value: deleteLock,
      enumerable: false
    },
    crdt: { // Reference to the CRDT so that gub can creat/remove tempoary networks
      value: crdt, 
      enumerable: false
    },
    execBatch: {
      value: execBatch,
      enumerable: false
    },
    temp: { value: temp, enumerable: false },
    createTempNetwork: {
      value: function(networkId) {
        temp['cache'] = {};
        temp[networkId] = {};
        for (let table in races.toJSON()) {
          temp['cache'][table] = {}; // Clone structure from live network
          temp[networkId][table] = {}; // Clone structure from live network
        }
      },
      enumerable: false
    },
    removeTempNetwork: {
      value: function(networkId) {
        if (temp[networkId]) {
          delete temp[networkId];
          return true;
        }
        return false;
      },
      enumerable: false
    },
    [Symbol.for('nodejs.util.inspect.custom')]: {
      value: function() {
        return {
          isYpearDatabase: this.isYpearDatabase,
          topic: this.topic,
          methods: ['can', 'del', 'sum', 'mod', 'cut']
        };
      }
    }
  });

  // Create the external proxy with limited access
  const externalProxy = new Proxy(externalApi, {
    get(target, prop) {
      // todo: group up all of the things to create a session cache + random into one object and then distribute using and exposing it all over internal+external
      // ^^^^: this will make understanding it easy rather than scrolling all over the place!
      // todo: handle and exit early on these things vvvv not down there at the bottom!
      // benz.log('##8', { target, prop }); // todo: why is prop things like: 'router', 'temp', 'createTempNetwork', 'can', 'removeTempNetwork', 'log', 'log' ?? in that order?!
      // benz.log('-', temp, '-');
      // ensure that BUG.NET can return session based updated objects db[BUG.NET][table][key]
      // this means that db.live[table][key] will actually be from the cache if you've altered 
      // it durring the db.can session. otherwise you wouldn't see your own updates because
      // you'd be looking at the crdt which gets saved at BUG.END
      if (prop === 'live') {
        // Just return a read-only proxy that checks cache first, then falls back to CRDT
        return new Proxy({}, {
          get(_, tableProp) {
            benz.log('here???', crdt.c);
            // Check if the table exists in cache
            if (temp['cache']?.[tableProp]) {
              // Return a proxy for the table that only handles reading
              return new Proxy({}, {
                get(_, keyProp) {
                  // Check if the key exists in cache
                  if (temp['cache'][tableProp][keyProp] !== undefined) {
                    return temp['cache'][tableProp][keyProp];
                  }
                  // If not in cache, get from CRDT
                  return target.crdt.c[tableProp]?.[keyProp];
                }
              });
            }
            // If table doesn't exist in cache, return from CRDT
            return target.crdt.c[tableProp];
          }
        });
      }

      // Handle temporary networks (random identifiers)
      if (temp[prop]) {
        // Return a proxy for the temporary network to handle nested access
        return new Proxy(temp[prop], {
          get(networkObj, tableProp) {
            // Handle access to tables within the temporary network
            if (networkObj[tableProp]) {
              // Return a proxy for the table to handle key access
              return new Proxy(networkObj[tableProp], {
                get(tableObj, keyProp) {
                  return tableObj[keyProp];
                },
                set(tableObj, keyProp, value) {
                  tableObj[keyProp] = value;
                  return true;
                }
              });
            }
            return undefined;
          },
          set(networkObj, tableProp, value) {
            networkObj[tableProp] = value;
            return true;
          }
        });
      }
      if (prop in target) return target[prop]; // For all other properties, just return them from the API if they exist
      return undefined; // If not found anywhere, return undefined
    }
  });

  // Resolve with the external proxy
  GUB.db = externalProxy;
  resolve({ db: externalProxy, GUB, EMPTY }); // ##resolved
}

module.exports = async function ypearDatabase(router, options) {
  return new Promise((resolve) => {
    let idle = setInterval(async function() {
      if (router.options.seed) { // wait for your seed key to attach your publicKey to your personal connection the underlying router to appear ...
        clearInterval(idle);
        await _ypearDatabase(router, options, resolve); // see: ##resolved
      }
    }, 100);
  });
};