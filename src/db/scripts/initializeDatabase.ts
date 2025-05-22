export const initializeDatabase = `

-- Tabela Notes
CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT NOT NULL,
    conteudo TEXT,
    imagem TEXT,
    isFavorite INTEGER NOT NULL DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela Tasks
CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT NOT NULL,
    descricao TEXT,
    status TEXT CHECK(status IN ('TO_DO', 'DONE', 'IN_PROGRESS')) NOT NULL DEFAULT 'TO_DO',
    isFavorite INTEGER NOT NULL DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    taskGroupId INTEGER,
    FOREIGN KEY(taskGroupId) REFERENCES task_groups(id)
);

-- Tabela Task Groups
CREATE TABLE IF NOT EXISTS task_groups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT NOT NULL,
    descricao TEXT,
    status TEXT CHECK(status IN ('TO_DO', 'FINISHED', 'IN_PROGRESS')) NOT NULL DEFAULT 'TO_DO',
    isFavorite INTEGER NOT NULL DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela Goals
CREATE TABLE IF NOT EXISTS goals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT NOT NULL,
    descricao TEXT,
    valorInicial REAL NOT NULL,
    valorAtual REAL NOT NULL,
    valorFinal REAL NOT NULL,
    tipo TEXT CHECK(tipo IN ('inteiro', 'dinheiro')) NOT NULL,
    isFavorite INTEGER NOT NULL DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela Tags
CREATE TABLE IF NOT EXISTS tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT NOT NULL,
    color TEXT,
    descricao TEXT
);

-- Tabelas de relação N:N entre as entidades e tags

-- Notes <-> Tags
CREATE TABLE IF NOT EXISTS note_tags (
    note_id INTEGER,
    tag_id INTEGER,
    PRIMARY KEY (note_id, tag_id),
    FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- Tasks <-> Tags
CREATE TABLE IF NOT EXISTS task_tags (
    task_id INTEGER,
    tag_id INTEGER,
    PRIMARY KEY (task_id, tag_id),
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- TaskGroups <-> Tags
CREATE TABLE IF NOT EXISTS task_group_tags (
    task_group_id INTEGER,
    tag_id INTEGER,
    PRIMARY KEY (task_group_id, tag_id),
    FOREIGN KEY (task_group_id) REFERENCES task_groups(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- Goals <-> Tags
CREATE TABLE IF NOT EXISTS goal_tags (
    goal_id INTEGER,
    tag_id INTEGER,
    PRIMARY KEY (goal_id, tag_id),
    FOREIGN KEY (goal_id) REFERENCES goals(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);
`;