CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY,
    library_id UUID NOT NULL,
    amount INTEGER NOT NULL,
    category VARCHAR(100) NOT NULL,
    note VARCHAR(255),
    spent_at DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_expenses_library FOREIGN KEY (library_id) REFERENCES libraries(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_expenses_library_id ON expenses(library_id);
CREATE INDEX IF NOT EXISTS idx_expenses_spent_at ON expenses(spent_at);
