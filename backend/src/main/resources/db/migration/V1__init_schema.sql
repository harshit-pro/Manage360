
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================
-- ENUM TYPES
-- =========================
CREATE TYPE user_role AS ENUM ('OWNER', 'STAFF');
CREATE TYPE gender_enum AS ENUM ('MALE', 'FEMALE', 'OTHER');
CREATE TYPE membership_status AS ENUM ('ACTIVE', 'EXPIRED');
CREATE TYPE payment_type AS ENUM ('MEMBERSHIP_RENEWAL', 'SEASONAL_FEE', 'OTHER');
CREATE TYPE payment_method AS ENUM ('CASH', 'UPI', 'CARD');
CREATE TYPE alert_type AS ENUM ('EXPIRY_SOON', 'EXPIRED');
CREATE TYPE alert_channel AS ENUM ('LOG', 'EMAIL', 'WHATSAPP');

-- =========================
-- SEQUENCES
-- =========================
CREATE SEQUENCE reg_no_seq START 1;

-- =========================
-- LIBRARIES (TENANTS)
-- =========================
CREATE TABLE libraries (
                           id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                           name VARCHAR(150) NOT NULL,
                           address TEXT,
                           city VARCHAR(50),
                           total_seats INT,
                           created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- USERS (AUTH)
-- =========================
CREATE TABLE users (
                       id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                       library_id UUID REFERENCES libraries(id) ON DELETE CASCADE,
                       email VARCHAR(150) UNIQUE NOT NULL,
                       password_hash VARCHAR(255) NOT NULL,
                       role user_role NOT NULL,
                       enabled BOOLEAN DEFAULT TRUE,
                       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_library ON users(library_id);

-- =========================
-- STUDENTS
-- =========================
CREATE TABLE students (
                          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                          library_id UUID REFERENCES libraries(id) ON DELETE CASCADE,
                          reg_no VARCHAR(10) NOT NULL,
                          name VARCHAR(150) NOT NULL,
                          aadhar_no VARCHAR(12),
                          seat_no VARCHAR(10),
                          date_of_joining DATE,
                          mobile_no VARCHAR(15),
                          guardian_name VARCHAR(150),
                          guardian_mobile VARCHAR(15),
                          gender gender_enum,
                          address TEXT,
                          seasonal_fees INT NOT NULL,
                          fees_deposited INT DEFAULT 0,
                          is_enrolled BOOLEAN DEFAULT TRUE,
                          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                          UNIQUE (library_id, reg_no)
);

CREATE INDEX idx_students_library ON students(library_id);
CREATE INDEX idx_students_seat_no ON students(seat_no);
CREATE INDEX idx_students_enrolled ON students(is_enrolled);

-- =========================
-- MEMBERSHIPS
-- =========================
CREATE TABLE memberships (
                             id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                             library_id UUID REFERENCES libraries(id) ON DELETE CASCADE,
                             student_id UUID UNIQUE REFERENCES students(id) ON DELETE CASCADE,
                             active_until DATE NOT NULL,
                             status membership_status NOT NULL,
                             last_payment_method payment_method,
                             updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_membership_active_until ON memberships(active_until);

-- =========================
-- PAYMENTS
-- =========================
CREATE TABLE payments (
                          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                          library_id UUID REFERENCES libraries(id) ON DELETE CASCADE,
                          student_id UUID REFERENCES students(id) ON DELETE CASCADE,
                          type payment_type NOT NULL,
                          amount INT NOT NULL,
                          method payment_method NOT NULL,
                          paid_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                          note TEXT,
                          reference_id VARCHAR(100)
);

CREATE INDEX idx_payment_student_paid ON payments(student_id, paid_at);

-- =========================
-- ALERTS (OPTIONAL / DEMO)
-- =========================
CREATE TABLE alerts (
                        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                        library_id UUID REFERENCES libraries(id) ON DELETE CASCADE,
                        student_id UUID REFERENCES students(id),
                        type alert_type NOT NULL,
                        scheduled_for DATE,
                        sent_at TIMESTAMP,
                        channel alert_channel,
                        payload JSONB
);