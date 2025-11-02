module.exports = {
  development: {
    client: 'sqlite3',
    connection: {
      filename: './db/amunet.db'
    },
    useNullAsDefault: true,
    migrations: {
      directory: './db/migrations'
    },
    seeds: {
      directory: './db/seeds'
    }
  },
  production: {
    client: 'sqlite3',
    connection: {
      filename: './db/amunet.db'
    },
    useNullAsDefault: true,
    migrations: {
      directory: './db/migrations'
    }
  }
};
