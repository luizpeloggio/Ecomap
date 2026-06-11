import * as SQLite from "expo-sqlite";

export interface Report {
  id?: number;
  latitude: number;
  longitude: number;
  category: string;
  description: string;
  imageUri?: string;
  timestamp: number;
}

const dbName = "reports.db";

export async function initDB() {
  const db = await SQLite.openDatabaseAsync(dbName);
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      category TEXT NOT NULL,
      description TEXT,
      imageUri TEXT,
      timestamp INTEGER NOT NULL
    );
  `);
}

export async function addReport(report: Omit<Report, "id" | "timestamp">) {
  const db = await SQLite.openDatabaseAsync(dbName);
  const result = await db.runAsync(
    `INSERT INTO reports (latitude, longitude, category, description, imageUri, timestamp) VALUES (?, ?, ?, ?, ?, ?)`,
    [
      report.latitude,
      report.longitude,
      report.category,
      report.description || "",
      report.imageUri || "",
      Date.now(),
    ]
  );
  return result.lastInsertRowId;
}

export async function getReports(): Promise<Report[]> {
  const db = await SQLite.openDatabaseAsync(dbName);
  const allRows = await db.getAllAsync<Report>(
    "SELECT * FROM reports ORDER BY timestamp DESC"
  );
  return allRows;
}

export async function deleteReport(id: number) {
  const db = await SQLite.openDatabaseAsync(dbName);
  await db.runAsync("DELETE FROM reports WHERE id = ?", [id]);
}
