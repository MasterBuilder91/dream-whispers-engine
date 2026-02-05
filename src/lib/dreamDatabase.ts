import initSqlJs, { Database } from 'sql.js';

let ibnSirinDb: Database | null = null;
let nabulsiDb: Database | null = null;
let isInitialized = false;
let initPromise: Promise<void> | null = null;

export interface DreamEntry {
  id: number;
  title: string;
  content: string;
  source: 'ibn_sirin' | 'al_nabulsi';
}

export interface SearchResult {
  entries: DreamEntry[];
  totalCount: number;
}

// Initialize sql.js and load the databases
async function initDatabases(): Promise<void> {
  if (isInitialized) return;
  
  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    try {
      const SQL = await initSqlJs({
        locateFile: (file) => `https://sql.js.org/dist/${file}`,
      });

      // Load Ibn Sirin database
      const ibnSirinResponse = await fetch('/databases/ibn_sirin.db');
      if (ibnSirinResponse.ok) {
        const ibnSirinBuffer = await ibnSirinResponse.arrayBuffer();
        ibnSirinDb = new SQL.Database(new Uint8Array(ibnSirinBuffer));
        console.log('Ibn Sirin database loaded successfully');
      }

      // Load Al-Nabulsi database
      const nabulsiResponse = await fetch('/databases/al_nabulsi.db');
      if (nabulsiResponse.ok) {
        const nabulsiBuffer = await nabulsiResponse.arrayBuffer();
        nabulsiDb = new SQL.Database(new Uint8Array(nabulsiBuffer));
        console.log('Al-Nabulsi database loaded successfully');
      }

      isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize databases:', error);
      throw error;
    }
  })();

  return initPromise;
}

// Get the schema of a database
function getTableSchema(db: Database): string[] {
  try {
    const result = db.exec("SELECT name FROM sqlite_master WHERE type='table'");
    if (result.length > 0) {
      return result[0].values.map((row) => row[0] as string);
    }
    return [];
  } catch (error) {
    console.error('Error getting table schema:', error);
    return [];
  }
}

// Get columns of a table
function getTableColumns(db: Database, tableName: string): string[] {
  try {
    const result = db.exec(`PRAGMA table_info(${tableName})`);
    if (result.length > 0) {
      return result[0].values.map((row) => row[1] as string);
    }
    return [];
  } catch (error) {
    console.error(`Error getting columns for ${tableName}:`, error);
    return [];
  }
}

// Search for dream interpretation entries
export async function searchDreamEntries(keywords: string[]): Promise<SearchResult> {
  await initDatabases();

  const entries: DreamEntry[] = [];
  
  const searchTerms = keywords.map(k => k.toLowerCase().trim()).filter(k => k.length > 0);
  
  if (searchTerms.length === 0) {
    return { entries: [], totalCount: 0 };
  }

  // Search Ibn Sirin database
  if (ibnSirinDb) {
    try {
      const tables = getTableSchema(ibnSirinDb);
      console.log('Ibn Sirin tables:', tables);
      
      for (const table of tables) {
        if (table.startsWith('sqlite_')) continue;
        
        const columns = getTableColumns(ibnSirinDb, table);
        console.log(`Table ${table} columns:`, columns);
        
        // Find text columns to search
        const textColumns = columns.filter(col => 
          col.toLowerCase().includes('text') || 
          col.toLowerCase().includes('content') || 
          col.toLowerCase().includes('nass') ||
          col.toLowerCase().includes('title') ||
          col.toLowerCase().includes('name')
        );
        
        // If no obvious text columns, search all columns
        const columnsToSearch = textColumns.length > 0 ? textColumns : columns;
        
        for (const term of searchTerms) {
          for (const column of columnsToSearch) {
            try {
              const query = `SELECT * FROM ${table} WHERE ${column} LIKE ? LIMIT 20`;
              const result = ibnSirinDb.exec(query, [`%${term}%`]);
              
              if (result.length > 0) {
                const columnIndex = columns.indexOf(column);
                for (const row of result[0].values) {
                  const content = row[columnIndex] as string;
                  if (content && content.length > 10) {
                    entries.push({
                      id: entries.length,
                      title: `من تفسير ابن سيرين - ${term}`,
                      content: content.slice(0, 2000),
                      source: 'ibn_sirin',
                    });
                  }
                }
              }
            } catch (e) {
              // Continue to next column
            }
          }
        }
      }
    } catch (error) {
      console.error('Error searching Ibn Sirin database:', error);
    }
  }

  // Search Al-Nabulsi database
  if (nabulsiDb) {
    try {
      const tables = getTableSchema(nabulsiDb);
      console.log('Al-Nabulsi tables:', tables);
      
      for (const table of tables) {
        if (table.startsWith('sqlite_')) continue;
        
        const columns = getTableColumns(nabulsiDb, table);
        console.log(`Table ${table} columns:`, columns);
        
        const textColumns = columns.filter(col => 
          col.toLowerCase().includes('text') || 
          col.toLowerCase().includes('content') || 
          col.toLowerCase().includes('nass') ||
          col.toLowerCase().includes('title') ||
          col.toLowerCase().includes('name')
        );
        
        const columnsToSearch = textColumns.length > 0 ? textColumns : columns;
        
        for (const term of searchTerms) {
          for (const column of columnsToSearch) {
            try {
              const query = `SELECT * FROM ${table} WHERE ${column} LIKE ? LIMIT 20`;
              const result = nabulsiDb.exec(query, [`%${term}%`]);
              
              if (result.length > 0) {
                const columnIndex = columns.indexOf(column);
                for (const row of result[0].values) {
                  const content = row[columnIndex] as string;
                  if (content && content.length > 10) {
                    entries.push({
                      id: entries.length,
                      title: `من تفسير النابلسي - ${term}`,
                      content: content.slice(0, 2000),
                      source: 'al_nabulsi',
                    });
                  }
                }
              }
            } catch (e) {
              // Continue to next column
            }
          }
        }
      }
    } catch (error) {
      console.error('Error searching Al-Nabulsi database:', error);
    }
  }

  // Deduplicate entries by content similarity
  const uniqueEntries = entries.reduce((acc: DreamEntry[], entry) => {
    const isDuplicate = acc.some(e => 
      e.content.slice(0, 100) === entry.content.slice(0, 100)
    );
    if (!isDuplicate) {
      acc.push(entry);
    }
    return acc;
  }, []);

  return {
    entries: uniqueEntries.slice(0, 30),
    totalCount: uniqueEntries.length,
  };
}

// Get database information for debugging
export async function getDatabaseInfo(): Promise<{ ibnSirin: string[], nabulsi: string[] }> {
  await initDatabases();
  
  return {
    ibnSirin: ibnSirinDb ? getTableSchema(ibnSirinDb) : [],
    nabulsi: nabulsiDb ? getTableSchema(nabulsiDb) : [],
  };
}
