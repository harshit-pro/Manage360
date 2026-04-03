CREATE TABLE IF NOT EXISTS student_drafts (
    id UUID PRIMARY KEY,
    library_id UUID NOT NULL,
    name VARCHAR(255),
    mobile_no VARCHAR(20),
    seat_no VARCHAR(50),
    date_of_visit DATE,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (library_id) REFERENCES libraries(id)
);

CREATE INDEX IF NOT EXISTS idx_student_drafts_library_id ON student_drafts(library_id);
CREATE INDEX IF NOT EXISTS idx_student_drafts_created_at ON student_drafts(created_at);

