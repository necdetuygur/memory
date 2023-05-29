const db = openDatabase("db", "1.0", "Database", 1024 * 1024 * 1024);

db.transaction((tx) => {
  tx.executeSql("CREATE TABLE IF NOT EXISTS Memory(id TEXT, val TEXT)", []);
});

const set = (key, value) => {
  typeof value == "number" && (value = value.toString());
  typeof value == "object" && (value = JSON.stringify(value));
  db.transaction((tx) => {
    tx.executeSql("DELETE FROM Memory WHERE id = ?", [key]);
    tx.executeSql("INSERT INTO Memory VALUES (?, ?)", [key, value]);
  });
};

const get = async (key) => {
  return await new Promise((resolve) => {
    db.transaction((tx) =>
      tx.executeSql("SELECT * FROM Memory WHERE id = ?", [key], (tx, res) => {
        for (let i = 0; i < res.rows.length; i++) {
          const row = res.rows.item(i);
          resolve(row.val);
        }
      })
    );
    setTimeout(() => {
      resolve("");
    }, 100);
  });
};

const Memory = new Proxy(
  {},
  {
    set(obj, prop, value) {
      set(prop, value);
    },
    async get(obj, prop) {
      return await get(prop);
    },
  }
);

Memory.test = "test";
console.log(await Memory.test);
