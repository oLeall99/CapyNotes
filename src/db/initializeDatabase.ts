import {  type SQLiteDatabase } from "expo-sqlite"; // Importando a tipagem SQLiteDatabse
import { initializeDatabase } from "./scripts/initializeDatabase";

export async function initializeDatabse(db: SQLiteDatabase) {
    await db.execAsync(initializeDatabase);
}