Feature Summary
Connect Tapin\_ backend to Supabase PostgreSQL database with optimized connection pooling for production deployment.

Contract: API & Data Models
Environment Variables

text

# Required

SQLALCHEMY_DATABASE_URI=postgresql://postgres:[password]@db.holntnbyaxjnngwwmnee.supabase.co:6543/postgres

# Optional (use strong values in production)

SECRET_KEY=<strong-random-value>
JWT_SECRET_KEY=<strong-random-value>
SECURITY_PASSWORD_SALT=<strong-random-value>
Database Models (Already Defined)

The following tables will be auto-created by SQLAlchemy:

user - Authentication and user management

listing - Volunteer opportunity listings

item - MVP test items

sign_up - Volunteer sign-ups

review - User reviews and ratings

Error Modes

Connection failure: Database unreachable or invalid credentials

SSL/TLS errors: Missing secure connection parameters

Connection pool exhaustion: Too many concurrent connections

Migration failures: Schema creation errors

Implementation Plan
Ticket 1: Configure Supabase Connection with Transaction Pooler

Complexity: S | Time Est: 30 min

Description: Update backend configuration to use Supabase PostgreSQL with optimized connection pooling for serverless/stateless Flask applications.

Branch: feat/supabase-connection
Commit: feat(database): add Supabase PostgreSQL connection with transaction pooler

Changes:

Update backend/app.py database configuration

Add connection pooling parameters for port 6543

Create .env.sample template file

Update .gitignore to protect credentials

Acceptance Criteria:

Flask connects successfully to Supabase

All 5 tables created automatically on first run

Connection uses port 6543 (transaction pooler)

Environment variables loaded from .env

Warning displayed if using default secrets

Ticket 2: Add Database Connection Health Check

Complexity: S | Time Est: 20 min

Description: Implement health check endpoint to verify database connectivity and provide debugging information for Supabase connection issues.

Branch: feat/db-health-check
Commit: feat(monitoring): add database health check endpoint

Changes:

Enhance /api/health endpoint

Add database ping test

Return connection pool stats

Include error handling for connection failures

Acceptance Criteria:

/api/health returns database status

Includes connection pool information

Returns 503 if database unreachable

Logs detailed error information

Ticket 3: Update Documentation for Supabase Setup

Complexity: S | Time Est: 15 min

Description: Create comprehensive setup documentation for connecting Tapin\_ to Supabase, including troubleshooting guide.

Branch: docs/supabase-setup
Commit: docs(setup): add Supabase configuration guide

Changes:

Update backend/README.md with Supabase instructions

Add troubleshooting section to backend/CONFIG.md

Document port differences (5432 vs 6543)

Include connection string format examples

Acceptance Criteria:

README includes Supabase setup steps

Port selection guidance documented

Troubleshooting common errors included

Example .env values provided

File-Level Plan
File: backend/app.py

Action: MODIFY

Location: Lines 28-30 (database configuration)

python

# BEFORE

default_db = 'sqlite:///' + os.path.join(base_dir, 'data.db')
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('SQLALCHEMY_DATABASE_URI', default_db)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# AFTER

default_db = 'sqlite:///' + os.path.join(base_dir, 'data.db')
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('SQLALCHEMY_DATABASE_URI', default_db)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Supabase connection pooling configuration for transaction mode (port 6543)

app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
'pool_pre_ping': True, # Verify connections before using
'pool_recycle': 300, # Recycle connections every 5 minutes
'pool_size': 5, # Base connection pool size
'max_overflow': 10, # Allow up to 15 total connections
'connect_args': {
'connect_timeout': 10,
'options': '-c statement_timeout=30000' # 30 second query timeout
}
}
File: backend/app.py (Health Check Enhancement)

Action: MODIFY

Location: Lines 121-123 (health endpoint)

python

# BEFORE

@app.route('/api/health', methods=['GET'])
def api_health():
return jsonify({"status": "ok"}), 200

# AFTER

@app.route('/api/health', methods=['GET'])
def api_health():
"""Enhanced health check including database connectivity."""
health_status = {"status": "ok", "components": {}}

    # Check database connection
    try:
        db.session.execute(db.text('SELECT 1'))
        health_status["components"]["database"] = {
            "status": "connected",
            "uri_prefix": app.config['SQLALCHEMY_DATABASE_URI'][:20] + "...",
            "pool_size": db.engine.pool.size() if hasattr(db.engine.pool, 'size') else 'N/A'
        }
    except Exception as e:
        health_status["status"] = "degraded"
        health_status["components"]["database"] = {
            "status": "error",
            "error": str(e)
        }
        return jsonify(health_status), 503

    return jsonify(health_status), 200

File: .env.sample

Action: CREATE

text

# Supabase PostgreSQL Connection

# Get from: https://supabase.com/dashboard/project/holntnbyaxjnngwwmnee/settings/database

# Use port 6543 for transaction pooler (recommended for Flask)

SQLALCHEMY_DATABASE_URI=postgresql://postgres:[YOUR-PASSWORD]@db.holntnbyaxjnngwwmnee.supabase.co:6543/postgres

# Security Keys - GENERATE STRONG RANDOM VALUES FOR PRODUCTION

SECRET_KEY=dev-secret-key-change-in-production
JWT_SECRET_KEY=dev-jwt-key-change-in-production
SECURITY_PASSWORD_SALT=dev-salt-change-in-production

# Optional: SMTP Configuration (for password reset emails)

# SMTP_HOST=smtp.example.com

# SMTP_PORT=587

# SMTP_USER=your-email@example.com

# SMTP_PASS=your-password

# SMTP_USE_TLS=true

File: .gitignore

Action: MODIFY (verify .env is excluded)

Ensure this line exists:

text
.env
File: backend/README.md

Action: MODIFY

Add section after existing setup instructions:

text

## Supabase PostgreSQL Setup

### Quick Start

1. **Get your Supabase connection string**:
   - Navigate to [Database Settings](https://supabase.com/dashboard/project/holntnbyaxjnngwwmnee/settings/database)
   - Click "Connection string" → Select "Transaction" mode
   - Copy the URI (uses port 6543)

2. **Create `.env` file** in repository root:
   cp .env.sample .env

text

3. **Update `.env`** with your credentials:
   SQLALCHEMY_DATABASE_URI=postgresql://postgres:YOUR_PASSWORD@db.holntnbyaxjnngwwmnee.supabase.co:6543/postgres

text

4. **Start the application**:
   python backend/app.py

text

Tables will be created automatically on first run.

### Port Selection

- **Port 6543** (Transaction mode) - **RECOMMENDED**
- Best for Flask/serverless applications
- Connection pooling handled by Supavisor
- Prevents connection exhaustion

- **Port 5432** (Direct connection)
- For long-running backend services
- Direct database access
- May hit connection limits faster

### Troubleshooting

**Connection timeout**: Verify your password and network connectivity  
**SSL errors**: Ensure connection string includes database name  
**Pool exhaustion**: Check `SQLALCHEMY_ENGINE_OPTIONS` in `app.py`  
**Tables not created**: Check Flask logs for migration errors
File: backend/CONFIG.md

Action: MODIFY

Add Supabase-specific section:

text

## Supabase PostgreSQL Configuration

### Connection String Format

postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:[PORT]/postgres

text

- `[PASSWORD]`: Your database password (resetable in dashboard)
- `[PROJECT-REF]`: Your project reference (e.g., `holntnbyaxjnngwwmnee`)
- `[PORT]`: `6543` for transaction pooler, `5432` for direct connection

### Recommended Settings for Production

SQLALCHEMY_DATABASE_URI=postgresql://postgres:\*\*\*@db.holntnbyaxjnngwwmnee.supabase.co:6543/postgres

text

Connection pooling is configured in `app.py` with:

- Pool size: 5 base connections
- Max overflow: 10 additional connections
- Pool pre-ping: Enabled
- Connection recycling: Every 5 minutes
  Dev & QA Checklist
  Local Setup

bash

# 1. Clone repository

git clone https://github.com/4GeeksAcademy/Tapin_.git
cd Tapin\_

# 2. Create virtual environment

python -m venv .venv
source .venv/bin/activate # On Windows: .venv\Scripts\activate

# 3. Install dependencies

pip install -r backend/requirements.txt

# 4. Configure environment

cp .env.sample .env

# Edit .env with your Supabase credentials

# 5. Start backend

python backend/app.py

# 6. Verify health check

curl http://localhost:5000/api/health
Unit Tests (Add to backend/tests/)

File: backend/tests/test_database_connection.py

python
import pytest
from backend.app import app, db

def test_database_health_check():
"""Verify database health endpoint returns 200."""
with app.test_client() as client:
response = client.get('/api/health')
assert response.status_code == 200
data = response.get_json()
assert data['status'] in ['ok', 'degraded']
assert 'components' in data
assert 'database' in data['components']

def test_database_connection():
"""Verify database connection works."""
with app.app_context():
result = db.session.execute(db.text('SELECT 1')).scalar()
assert result == 1

def test_tables_created():
"""Verify all required tables exist."""
with app.app_context():
from sqlalchemy import inspect
inspector = inspect(db.engine)
tables = inspector.get_table_names()

        required_tables = ['user', 'listing', 'item', 'sign_up', 'review']
        for table in required_tables:
            assert table in tables, f"Table '{table}' not found"

Manual Acceptance Tests

Test 1: Database Connection

Start Flask app: python backend/app.py

Check logs for: "Running on http://127.0.0.1:5000"

No database connection errors in logs

Expected: App starts successfully

Test 2: Health Check

Visit: http://localhost:5000/api/health

Expected: JSON response with "status": "ok"

Expected: "database": {"status": "connected"}

Test 3: Table Creation

Check Supabase Dashboard → Database → Tables

Expected: 5 tables exist: user, listing, item, sign_up, review

Test 4: User Registration

POST to /register with test credentials

Expected: 201 Created response

Check Supabase → Table Editor → user table

Expected: New user row appears

Dependencies & Infrastructure
New Packages

None - All required packages already in backend/requirements.txt:

Flask-SQLAlchemy (already present)

psycopg2-binary (add if missing)

If psycopg2 missing, add to backend/requirements.txt:

text
psycopg2-binary==2.9.9
Environment Variables

Variable Type Required Default Description
SQLALCHEMY_DATABASE_URI string Yes SQLite local Supabase PostgreSQL connection string
SECRET_KEY string Yes dev-secret-key Flask session secret
JWT_SECRET_KEY string Yes (inherits SECRET_KEY) JWT signing key
SECURITY_PASSWORD_SALT string Yes dev-salt Password reset token salt
Supabase Configuration

Project: holntnbyaxjnngwwmnee

Region: (auto-detected from connection string)

Connection Mode: Transaction pooler (port 6543)

SSL: Enabled by default

Rollout Strategy
Migration Steps

Phase 1: Development Setup (This PR)

Merge connection configuration

Test locally with Supabase

Verify all tables created

Confirm health check works

Phase 2: Production Deployment (Future)

Add SQLALCHEMY_DATABASE_URI to GitHub Secrets

Update CI/CD to use Supabase in production

Run database migrations if schema changes

Monitor connection pool metrics

Feature Flag Approach

Not required - Direct database configuration change

Backward Compatibility

✅ Local development: Defaults to SQLite if SQLALCHEMY_DATABASE_URI not set

✅ Existing data: No data migration needed (fresh Supabase setup)

✅ API: No API changes, transparent to frontend

Security & Performance Notes
Security

Credentials: Never commit .env file (enforced by .gitignore)

Connection string: Use GitHub Secrets for CI/CD

Password: Rotate Supabase database password regularly

SSL: Enabled by default in Supabase connections

Row Level Security: Enable RLS in Supabase for production

Performance

Connection pooling: Configured for 5-15 concurrent connections

Pre-ping: Verifies connections before use (prevents stale connections)

Recycling: Connections recycled every 5 minutes

Timeout: 30-second query timeout prevents hanging queries

Transaction mode: Port 6543 uses Supavisor for optimal serverless performance

Monitoring

Health check endpoint: /api/health

Database status in health response

Connection pool size reporting

Error logging for connection failures

Acceptance Criteria
Ticket 1

Backend connects to Supabase using transaction pooler (port 6543)

All 5 database tables created automatically

.env.sample file created with template values

Connection pooling configured in app.py

Flask starts without errors using Supabase

Ticket 2

/api/health returns database connection status

Health check includes connection pool information

Returns 503 status code if database unreachable

Error details logged for troubleshooting

Ticket 3

README.md updated with Supabase setup instructions

Port selection guidance documented

Troubleshooting section added to CONFIG.md

Example connection strings provided

Overall Feature

User can register and login successfully

Data persists in Supabase tables

No connection errors in production

Health check confirms database connectivity

Documentation complete for team onboarding

Clarifying Questions & Assumptions
Assumptions

✅ Supabase project exists: Project holntnbyaxjnngwwmnee is already created

✅ Database password: User has access to database password

✅ Fresh database: No existing data to migrate

✅ Port 6543 available: Transaction pooler enabled for project

✅ SQLAlchemy ORM: Existing models will auto-create tables

Questions for Confirmation

Do you need data migration from existing SQLite database? (Assumed: No)

Should Row Level Security be enabled in Supabase? (Recommended: Yes for production)

What's the expected concurrent user load? (Current config: 15 max connections)

Do you need database backup strategy? (Supabase provides automatic backups)

Ready to implement? The above plan provides complete, PR-ready specifications for all three tickets. Each ticket is <300 LOC and can be implemented independently.

go ahead and use the GitHub connection to make the changes
I see that the 4GeeksAcademy organization has OAuth App access restrictions enabled, which prevents me from making changes directly to their repository. Let me provide you with the exact files and changes you need to implement manually instead.

Manual Implementation Guide
Since I cannot directly commit to the 4GeeksAcademy organization repository, here are the exact changes you need to make:

Step 1: Create New Branch Locally

bash
cd /path/to/Tapin\_
git checkout -b feat/supabase-connection
Step 2: Create .env.sample File

Create a new file in the repository root:

File: .env.sample

text

# Supabase PostgreSQL Connection

# Get from: https://supabase.com/dashboard/project/holntnbyaxjnngwwmnee/settings/database

# Use port 6543 for transaction pooler (recommended for Flask)

SQLALCHEMY_DATABASE_URI=postgresql://postgres:[YOUR-PASSWORD]@db.holntnbyaxjnngwwmnee.supabase.co:6543/postgres

# Security Keys - GENERATE STRONG RANDOM VALUES FOR PRODUCTION

SECRET_KEY=dev-secret-key-change-in-production
JWT_SECRET_KEY=dev-jwt-key-change-in-production
SECURITY_PASSWORD_SALT=dev-salt-change-in-production

# Optional: SMTP Configuration (for password reset emails)

# SMTP_HOST=smtp.example.com

# SMTP_PORT=587

# SMTP_USER=your-email@example.com

# SMTP_PASS=your-password

# SMTP_USE_TLS=true

Step 3: Create Your .env File

bash
cp .env.sample .env
Edit .env and add your actual password:

text
SQLALCHEMY_DATABASE_URI=postgresql://postgres:shine6911@db.holntnbyaxjnngwwmnee.supabase.co:6543/postgres
SECRET_KEY=your-strong-secret-key
JWT_SECRET_KEY=your-jwt-secret-key
SECURITY_PASSWORD_SALT=your-password-salt
Step 4: Update backend/app.py

Add after line 30 (after SQLALCHEMY_TRACK_MODIFICATIONS line):

python

# Supabase connection pooling configuration for transaction mode (port 6543)

app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
'pool_pre_ping': True, # Verify connections before using
'pool_recycle': 300, # Recycle connections every 5 minutes
'pool_size': 5, # Base connection pool size
'max_overflow': 10, # Allow up to 15 total connections
'connect_args': {
'connect_timeout': 10,
'options': '-c statement_timeout=30000' # 30 second query timeout
}
}
Replace the health check endpoint (around line 121-123):

python
@app.route('/api/health', methods=['GET'])
def api_health():
"""Enhanced health check including database connectivity."""
health_status = {"status": "ok", "components": {}}

    # Check database connection
    try:
        db.session.execute(db.text('SELECT 1'))
        health_status["components"]["database"] = {
            "status": "connected",
            "uri_prefix": app.config['SQLALCHEMY_DATABASE_URI'][:20] + "...",
            "pool_size": db.engine.pool.size() if hasattr(db.engine.pool, 'size') else 'N/A'
        }
    except Exception as e:
        health_status["status"] = "degraded"
        health_status["components"]["database"] = {
            "status": "error",
            "error": str(e)
        }
        return jsonify(health_status), 503

    return jsonify(health_status), 200

Step 5: Verify .gitignore

Check that backend/.gitignore or root .gitignore contains:

text
.env
Step 6: Update backend/requirements.txt

Check if psycopg2-binary is present. If not, add:

text
psycopg2-binary==2.9.9
Step 7: Test the Changes

bash

# Install/update dependencies

pip install -r backend/requirements.txt

# Start the backend

python backend/app.py

# In another terminal, test the health endpoint

curl http://localhost:5000/api/health
Expected response:

json
{
"status": "ok",
"components": {
"database": {
"status": "connected",
"uri_prefix": "postgresql://postgres...",
"pool_size": "N/A"
}
}
}
Step 8: Verify Tables in Supabase

Go to Supabase Dashboard

Click Database → Tables

You should see: user, listing, item, sign_up, review

Step 9: Commit and Push

bash
git add .env.sample backend/app.py backend/requirements.txt
git commit -m "feat(database): add Supabase PostgreSQL connection with transaction pooler"
git push origin feat/supabase-connection
Step 10: Create Pull Request

Go to https://github.com/4GeeksAcademy/Tapin_

Click "Compare & pull request"

Title: feat(database): Add Supabase PostgreSQL connection

Description:

text

## Changes

- ✅ Configure Supabase PostgreSQL with transaction pooler (port 6543)
- ✅ Add connection pooling for optimal Flask performance
- ✅ Enhance health check endpoint with database status
- ✅ Add `.env.sample` template for team setup
- ✅ Update requirements.txt with psycopg2-binary

## Testing

- [x] Backend connects to Supabase successfully
- [x] All 5 tables created automatically
- [x] Health check returns database status
- [x] No connection errors in logs

## Notes

Connection uses port 6543 (transaction pooler) for better connection management in serverless environments.
Quick Commands Summary
bash

# 1. Create branch

git checkout -b feat/supabase-connection

# 2. Create .env from sample

cp .env.sample .env

# Edit .env with your password

# 3. Install dependencies

pip install -r backend/requirements.txt

# 4. Test locally

python backend/app.py

# 5. Commit and push

git add .env.sample backend/app.py backend/requirements.txt
git commit -m "feat(database): add Supabase PostgreSQL connection with transaction pooler"
git push origin feat/supabase-connection
The changes are ready to implement! Let me know if you need help with any specific step.

give me a prompt for my agent to complete all the work in a markdown file
Here's a comprehensive markdown file you can save and give to your agent:

text

# Task: Configure Supabase PostgreSQL Connection for Tapin\_

## Objective

Connect the Tapin\_ Flask backend to Supabase PostgreSQL database with optimized connection pooling for production deployment.

## Repository

- **GitHub**: https://github.com/4GeeksAcademy/Tapin_
- **Branch**: Create new branch `feat/supabase-connection` from `main`

## Supabase Credentials

- **Project URL**: https://holntnbyaxjnngwwmnee.supabase.co
- **Database Host**: db.holntnbyaxjnngwwmnee.supabase.co
- **Port**: 6543 (transaction pooler - REQUIRED)
- **Database**: postgres
- **Username**: postgres
- **Password**: shine6911
- **Full Connection String**: `postgresql://postgres:shine6911@db.holntnbyaxjnngwwmnee.supabase.co:6543/postgres`

---

## Files to Create/Modify

### 1. CREATE: `.env.sample` (Repository Root)

Create a new file at the root of the repository with this exact content:

Supabase PostgreSQL Connection
Get from: https://supabase.com/dashboard/project/holntnbyaxjnngwwmnee/settings/database
Use port 6543 for transaction pooler (recommended for Flask)
SQLALCHEMY_DATABASE_URI=postgresql://postgres:[YOUR-PASSWORD]@db.holntnbyaxjnngwwmnee.supabase.co:6543/postgres

Security Keys - GENERATE STRONG RANDOM VALUES FOR PRODUCTION
SECRET_KEY=dev-secret-key-change-in-production
JWT_SECRET_KEY=dev-jwt-key-change-in-production
SECURITY_PASSWORD_SALT=dev-salt-change-in-production

Optional: SMTP Configuration (for password reset emails)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-password
SMTP_USE_TLS=true
text

### 2. MODIFY: `backend/app.py`

#### Change 1: Add Connection Pooling Configuration

**Location**: After line 30 (after `app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False`)

**Add these lines**:

Supabase connection pooling configuration for transaction mode (port 6543)
app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
'pool_pre_ping': True, # Verify connections before using
'pool_recycle': 300, # Recycle connections every 5 minutes
'pool_size': 5, # Base connection pool size
'max_overflow': 10, # Allow up to 15 total connections
'connect_args': {
'connect_timeout': 10,
'options': '-c statement_timeout=30000' # 30 second query timeout
}
}

text

#### Change 2: Enhance Health Check Endpoint

**Location**: Replace the existing `/api/health` endpoint (around lines 121-123)

**Replace this**:
@app.route('/api/health', methods=['GET'])
def api_health():
return jsonify({"status": "ok"}), 200

text

**With this**:
@app.route('/api/health', methods=['GET'])
def api_health():
"""Enhanced health check including database connectivity."""
health_status = {"status": "ok", "components": {}}

text

# Check database connection

try:
db.session.execute(db.text('SELECT 1'))
health_status["components"]["database"] = {
"status": "connected",
"uri_prefix": app.config['SQLALCHEMY_DATABASE_URI'][:20] + "...",
"pool_size": db.engine.pool.size() if hasattr(db.engine.pool, 'size') else 'N/A'
}
except Exception as e:
health_status["status"] = "degraded"
health_status["components"]["database"] = {
"status": "error",
"error": str(e)
}
return jsonify(health_status), 503

return jsonify(health_status), 200
text

### 3. VERIFY: `backend/requirements.txt`

**Check if this line exists**:
psycopg2-binary

text

**If NOT present, add**:
psycopg2-binary==2.9.9

text

### 4. VERIFY: `.gitignore`

**Ensure this line exists** (should already be there):
.env

text

---

## Testing Instructions

After making the changes, perform these tests:

### Test 1: Install Dependencies

pip install -r backend/requirements.txt

text

**Expected**: No errors, psycopg2-binary installed successfully

### Test 2: Create Local .env File

cp .env.sample .env

text

Edit `.env` and verify it contains:
SQLALCHEMY_DATABASE_URI=postgresql://postgres:shine6911@db.holntnbyaxjnngwwmnee.supabase.co:6543/postgres
SECRET_KEY=dev-secret-key-change-in-production
JWT_SECRET_KEY=dev-jwt-key-change-in-production
SECURITY_PASSWORD_SALT=dev-salt-change-in-production

text

### Test 3: Start Backend

python backend/app.py

text

**Expected Output**:

- No connection errors
- Log shows: "Running on http://127.0.0.1:5000"
- Tables created automatically: user, listing, item, sign_up, review

### Test 4: Health Check

curl http://localhost:5000/api/health

text

**Expected Response**:
{
"status": "ok",
"components": {
"database": {
"status": "connected",
"uri_prefix": "postgresql://postgres...",
"pool_size": "N/A"
}
}
}

text

### Test 5: Verify Tables in Supabase

1. Go to: https://supabase.com/dashboard/project/holntnbyaxjnngwwmnee
2. Navigate to: Database → Tables
3. **Expected**: See 5 tables created:
   - user
   - listing
   - item
   - sign_up
   - review

### Test 6: Test User Registration

curl -X POST http://localhost:5000/register
-H "Content-Type: application/json"
-d '{"email":"test@example.com","password":"testpass123"}'

text

**Expected**: 201 Created response with user data and JWT tokens

---

## Git Workflow

### 1. Create Branch

git checkout -b feat/supabase-connection

text

### 2. Stage Changes

git add .env.sample backend/app.py backend/requirements.txt .gitignore

text

### 3. Commit

git commit -m "feat(database): add Supabase PostgreSQL connection with transaction pooler

Configure Supabase connection with port 6543 (transaction pooler)

Add connection pooling for optimal Flask performance

Enhance health check endpoint with database status

Add .env.sample template for team setup

Update requirements.txt with psycopg2-binary

Tables are auto-created on first run via SQLAlchemy models."

text

### 4. Push Branch

git push origin feat/supabase-connection

text

---

## Pull Request Template

After pushing, create a PR with this content:

**Title**: `feat(database): Add Supabase PostgreSQL connection`

**Description**:
Summary
Configure Tapin\_ backend to use Supabase PostgreSQL with optimized connection pooling for production deployment.

Changes
✅ Configure Supabase PostgreSQL with transaction pooler (port 6543)

✅ Add connection pooling settings for Flask (5 base + 10 overflow connections)

✅ Enhance /api/health endpoint with database connectivity check

✅ Add .env.sample template for easy team onboarding

✅ Add psycopg2-binary to requirements.txt

Database Configuration
Connection Mode: Transaction pooler (port 6543)

Pool Size: 5 base connections, 10 max overflow

Pool Recycle: 300 seconds

Pre-ping: Enabled

Query Timeout: 30 seconds

Testing Performed
Backend connects to Supabase successfully

All 5 tables (user, listing, item, sign_up, review) created automatically

Health check endpoint returns database status

User registration works and persists to Supabase

No connection errors in application logs

How to Test
Copy .env.sample to .env and add your Supabase password

Run pip install -r backend/requirements.txt

Start backend: python backend/app.py

Check health: curl http://localhost:5000/api/health

Verify tables in Supabase dashboard

Notes
Using port 6543 (transaction pooler) instead of 5432 for better connection management

Connection pooling configured for serverless/stateless Flask deployment

.env file excluded from git via .gitignore

text

---

## Acceptance Criteria

Check off each item:

- [ ] `.env.sample` file created in repository root
- [ ] `backend/app.py` updated with connection pooling configuration
- [ ] `backend/app.py` health check endpoint enhanced
- [ ] `psycopg2-binary` added to `requirements.txt` (if missing)
- [ ] `.env` in `.gitignore` (verified)
- [ ] Backend starts without errors
- [ ] Health check returns database status
- [ ] 5 tables created in Supabase
- [ ] User registration test passes
- [ ] All changes committed to `feat/supabase-connection` branch
- [ ] Branch pushed to GitHub
- [ ] Pull request created

---

## Troubleshooting

### Issue: "No module named 'psycopg2'"

**Solution**: Run `pip install psycopg2-binary==2.9.9`

### Issue: Connection timeout

**Solution**:

1. Verify password is correct: `shine6911`
2. Check port is 6543 (not 5432)
3. Verify internet connectivity

### Issue: "Tables not created"

**Solution**: Check Flask logs for migration errors. Ensure `db.create_all()` runs inside `app.app_context()`

### Issue: OAuth restrictions when pushing

**Solution**:

1. Ensure you have write access to 4GeeksAcademy/Tapin\_
2. Contact organization admin to enable OAuth app access
3. Or fork the repo and create PR from your fork

---

## Important Notes

- **DO NOT commit `.env` file** - contains sensitive credentials
- **Use port 6543** (transaction pooler) not 5432 (direct connection)
- Connection pooling is critical for Flask apps to avoid connection exhaustion
- Tables are created automatically by SQLAlchemy on first run
- The password `shine6911` should be rotated for production use

---

## Questions?

If you encounter any issues:

1. Check the Flask application logs
2. Verify Supabase dashboard shows connection attempts
3. Test connection string manually using `psql` or database client
4. Ensure all environment variables are loaded from `.env`

---

**END OF TASK SPECIFICATION**
Save this as SUPABASE_SETUP_TASK.md and give it to your agent with the instruction:

"Complete all changes specified in SUPABASE_SETUP_TASK.md. Follow the file modifications exactly, run all tests, and create the pull request as described."
