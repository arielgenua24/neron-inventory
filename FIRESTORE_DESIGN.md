# Firestore Migration Design Document

## Current Architecture Summary

### Data Storage
- **Storage**: Browser localStorage with key `'neron-inventory-db'`
- **Structure**: `{clients: Client[], lastUpdated: string}`
- **Pattern**: Read entire DB → Modify → Save entire DB

### Data Types
```typescript
Client {
  id: string
  name: string
  cuit: string
  arcaPassword: string
  contact?: string
  tasks?: string
  createdAt: string
  updatedAt: string
  monthlyRecords: MonthlyRecords
  employees: Employee[]
}

Employee {
  id: string
  name: string
  cuit: string
  arcaPassword: string
  tasks?: string
  createdAt: string
  updatedAt: string
  monthlyRecords: MonthlyRecords
}

MonthlyRecords {
  [year: number]: {
    [month: MonthKey]?: {
      amount: number
      paid: boolean
    }
  }
}
```

### Key Usage Patterns
1. **Full Load on Mount**: `useClients` hook loads all data into React state
2. **Gemini Integration**: Entire clients array sent as JSON in system instruction (src/app/api/chat/route.ts:32)
3. **Fee Propagation**: Looks back through historical records to find last recorded amount
4. **No Authentication**: Single-user application (no user/tenant isolation)

---

## Firestore Schema Design

### Chosen Approach: Hybrid (Document per Client with Nested Data)

```
Firestore Database: neron-inventory

Collection: clients
├── Document: {clientId}
│   ├── id: string
│   ├── name: string
│   ├── cuit: string
│   ├── arcaPassword: string
│   ├── contact: string | null
│   ├── tasks: string | null
│   ├── createdAt: Timestamp
│   ├── updatedAt: Timestamp
│   ├── monthlyRecords: Map<year, Map<month, {amount, paid}>>
│   └── employees: Array<Employee> (as nested objects)

Collection: metadata
└── Document: database
    └── lastUpdated: Timestamp
```

### Why This Design?

**Pros:**
1. **Minimal Code Changes**: Structure exactly matches localStorage
2. **Single Query Efficiency**: Fetch all clients with one `getDocs()` call
3. **Gemini Compatible**: Data already in correct JSON format
4. **Fee Propagation Works**: All historical data available in-memory
5. **Simple Migration**: Direct translation from localStorage to Firestore

**Cons:**
1. **Limited Query Capabilities**: Can't easily query across monthly records
2. **Document Size Limits**: Max 1MB per document (sufficient for ~10+ years of monthly data)
3. **No Subcollection Benefits**: Not leveraging Firestore's hierarchical queries

**Future Optimization Path:**
If needed, can refactor to flattened collections for better querying:
- `/clients/{id}` - Client metadata only
- `/employees/{id}` - Employee metadata with clientId
- `/monthlyRecords/{recordId}` - Individual records with clientId/employeeId

---

## Implementation Components

### 1. Firebase Configuration
**File**: `src/lib/firebase.ts`
- Initialize Firebase app
- Export Firestore instance
- Environment variable: `NEXT_PUBLIC_FIREBASE_CONFIG` (JSON)

### 2. Firestore Storage Adapter
**File**: `src/lib/storage-firestore.ts`
- Implements same interface as `storage.ts`
- Functions: `getDatabase()`, `saveDatabase()`, `getAllClients()`, etc.
- Client-side caching for performance
- Real-time sync optional (can be added later)

### 3. Migration Utility
**File**: `src/lib/migrate-to-firestore.ts`
- One-time migration function
- Reads from localStorage
- Writes to Firestore
- Validates data integrity
- Can be triggered from UI or console

### 4. Updated Hook
**File**: `src/hooks/useClients.ts`
- Import from `storage-firestore` instead of `storage`
- Minimal changes (same function signatures)
- Add loading states for async operations

### 5. Environment Variables
```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

---

## Migration Steps

### Phase 1: Setup (This PR)
1. Install Firebase SDK: `npm install firebase`
2. Create Firebase config file
3. Implement Firestore storage adapter
4. Create migration utility

### Phase 2: Testing (Next PR)
1. Test all CRUD operations with Firestore
2. Verify Gemini integration works
3. Validate fee propagation logic
4. Test migration from localStorage

### Phase 3: Deployment
1. Create Firebase project
2. Set up Firestore database
3. Configure environment variables
4. Run migration for existing data
5. Switch storage adapter in production

---

## Data Migration Strategy

### One-Time Migration Function
```typescript
async function migrateLocalStorageToFirestore() {
  // 1. Read from localStorage
  const localData = localStorage.getItem('neron-inventory-db')

  // 2. Parse and validate
  const database = JSON.parse(localData)

  // 3. Batch write to Firestore
  const batch = writeBatch(db)
  database.clients.forEach(client => {
    const ref = doc(collection(db, 'clients'), client.id)
    batch.set(ref, client)
  })

  // 4. Commit
  await batch.commit()

  // 5. Verify
  const migratedClients = await getAllClients()
  console.log(`Migrated ${migratedClients.length} clients`)
}
```

### Backup Strategy
- Before migration, export localStorage data to JSON file
- Keep localStorage intact as backup
- Add feature flag to switch between storage backends

---

## Security Considerations

### Firestore Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // For now: open access (single user)
    // TODO: Add authentication and user-based rules
    match /clients/{clientId} {
      allow read, write: if true;
    }
    match /metadata/{docId} {
      allow read, write: if true;
    }
  }
}
```

**Note**: Since this is currently a single-user app without authentication, we'll use open rules initially. Future improvement: Add Firebase Auth and user-specific security rules.

---

## Performance Considerations

### Client-Side Caching
- Cache all clients in memory after first fetch
- Optimistic updates: Update cache immediately, sync to Firestore async
- Invalidate cache on errors or conflicts

### Query Optimization
- Fetch all clients on app load (same as current behavior)
- Use Firestore transactions for concurrent updates
- Add indexes if querying patterns change

### Cost Optimization
- Batch writes for multiple operations
- Use offline persistence to reduce reads
- Monitor Firestore usage in Firebase Console

---

## Testing Checklist

- [ ] Create client
- [ ] Update client
- [ ] Delete client
- [ ] Add employee to client
- [ ] Update employee
- [ ] Delete employee
- [ ] Update client honorario
- [ ] Update client paid status
- [ ] Update employee honorario
- [ ] Update employee paid status
- [ ] Update client tasks
- [ ] Fee propagation logic works correctly
- [ ] Gemini chat receives correct data
- [ ] Migration from localStorage works
- [ ] Concurrent updates don't cause conflicts

---

## Rollback Plan

If issues arise:
1. Switch storage import back to `storage.ts`
2. Data remains in localStorage (untouched during migration)
3. Firestore data persists for future retry
4. No data loss (both sources available)

---

## Future Enhancements

### Authentication & Multi-User Support
- Add Firebase Auth
- Implement user-specific data isolation
- Update security rules per user

### Real-Time Sync
- Use `onSnapshot()` for live updates
- Sync across multiple devices/tabs
- Show connected users

### Advanced Querying
- Refactor to flattened collections
- Add composite indexes
- Enable advanced filters (e.g., "all unpaid in 2025")

### Offline Support
- Enable Firestore offline persistence
- Queue mutations while offline
- Sync when back online

---

## Conclusion

This design maintains the current application architecture while gaining cloud persistence benefits. The hybrid approach minimizes code changes and risk while setting up for future enhancements.
