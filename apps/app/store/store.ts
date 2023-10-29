import * as sql from "./sql";

const run = async () => {
  await sql.ready();

  sql.execute(
    `CREATE TABLE IF NOT EXISTS testentries1 (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL
    );`
  );

  sql.execute(`INSERT INTO testentries1 VALUES (?, ?);`, [0, "hello"]);
  sql.execute(`INSERT INTO testentries1 VALUES (?, ?);`, [1, "world"]);
  sql.execute(`INSERT INTO testentries1 VALUES (?, ?);`, [2, "world2"]);

  const result = sql.execute("SELECT * FROM testentries1");
  console.log(result);
};

run();
