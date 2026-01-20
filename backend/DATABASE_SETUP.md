# Database Setup Instructions

## Creating the Cleancart Database

You need to create the PostgreSQL database before running the backend server.

### Option 1: Using psql (Command Line)

1. Open Command Prompt or PowerShell
2. Navigate to PostgreSQL bin directory (usually `C:\Program Files\PostgreSQL\<version>\bin`)
3. Or if PostgreSQL is in your PATH, just run:
   ```bash
   psql -U postgres
   ```
4. Enter your password when prompted: `aagaman`
5. Run the SQL command:
   ```sql
   CREATE DATABASE cleancart;
   ```
6. Exit psql:
   ```sql
   \q
   ```

### Option 2: Using pgAdmin (GUI Tool - Recommended)

1. Open **pgAdmin** (usually installed with PostgreSQL)
2. Connect to your PostgreSQL server (double-click on it)
3. Enter password: `aagaman`
4. Right-click on "Databases" in the left sidebar
5. Select "Create" → "Database..."
6. Enter database name: `cleancart`
7. Click "Save"

### Option 3: Using psql from Command Line (If in PATH)

If PostgreSQL is in your system PATH, you can run:

```bash
psql -U postgres -c "CREATE DATABASE cleancart;"
```

Enter password when prompted: `aagaman`

### Option 4: Quick SQL Command

If you're already connected to PostgreSQL, just run:

```sql
CREATE DATABASE cleancart;
```

## Verify Database Creation

To verify the database was created:

```sql
\l
```

This will list all databases. You should see `cleancart` in the list.

## Database Configuration

The backend is configured to use:
- **Database name**: `cleancart`
- **Username**: `postgres`
- **Password**: `aagaman`
- **Host**: `localhost`
- **Port**: `5432` (default PostgreSQL port)

## After Database Creation

Once the database is created, you can start the backend server:

```bash
cd backend
npm start
```

The server will automatically create the necessary tables (like `users`) when it starts.
